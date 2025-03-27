import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Map, Package, MapPin, Navigation, Clock, DollarSign, User, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import MapComponent from '@/components/Map';
import { supabase } from '@/integrations/supabase/client';
import MessageCarrier from '@/components/MessageCarrier';
import DeliveryAnalytics from '@/components/DeliveryAnalytics';

interface Location {
  lng: number;
  lat: number;
  address: string;
}

interface DeliveryJob {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'assigned' | 'in-progress' | 'completed';
  pickup: Location;
  dropoff: Location;
  price: number;
  created_at: string;
  estimated_duration: string;
  customer_id: string;
  carrier_id?: string;
  customer_name?: string;
  carrier_name?: string;
}

const Delivery: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<DeliveryJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [carrierLocation, setCarrierLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      if (!id || !user) return;
      
      setLoading(true);
      
      try {
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();
        
        if (jobError) throw jobError;
        
        if (!jobData) {
          throw new Error('Job not found');
        }
        
        const isBusinessOwner = jobData.business_id === user.id;
        const isAssignedCarrier = jobData.carrier_id === user.id;
        const isAvailable = jobData.status === 'available';
        
        if (!isBusinessOwner && !isAssignedCarrier && !isAvailable) {
          toast.error('You do not have permission to view this job');
          navigate('/dashboard');
          return;
        }
        
        const parseLocation = (address: string): Location => {
          const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const offset = (hash % 10) * 0.01;
          
          return {
            lng: -122.4194 + offset,
            lat: 37.7749 + offset,
            address
          };
        };
        
        const { data: customerData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', jobData.business_id)
          .single();
        
        let carrierData = null;
        if (jobData.carrier_id) {
          const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', jobData.carrier_id)
            .single();
          
          carrierData = data;
        }
        
        const jobStatus = jobData.status as 'available' | 'assigned' | 'in-progress' | 'completed';
        
        const formattedJob: DeliveryJob = {
          id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          status: jobStatus,
          pickup: parseLocation(jobData.pickup),
          dropoff: parseLocation(jobData.dropoff),
          price: Number(jobData.price),
          created_at: jobData.created_at,
          estimated_duration: '30 minutes',
          customer_id: jobData.business_id,
          carrier_id: jobData.carrier_id,
          customer_name: customerData?.full_name || 'Unknown Customer',
          carrier_name: carrierData?.full_name || undefined
        };
        
        setJob(formattedJob);
        
        if (formattedJob.status === 'in-progress') {
          setCarrierLocation(formattedJob.pickup);
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load delivery information');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [id, user, navigate]);

  useEffect(() => {
    if (!isTracking || !job) return;
    
    setCarrierLocation(job.pickup);
    
    const steps = 10;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setCarrierLocation(job.dropoff);
        toast.success('Delivery completed!');
        setIsTracking(false);
        return;
      }
      
      const progress = currentStep / steps;
      const newLng = job.pickup.lng + (job.dropoff.lng - job.pickup.lng) * progress;
      const newLat = job.pickup.lat + (job.dropoff.lat - job.pickup.lat) * progress;
      
      setCarrierLocation({
        lng: newLng,
        lat: newLat,
        address: 'En route'
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isTracking, job]);

  const handleStartDelivery = async () => {
    if (!job || !user) return;
    
    if (job.carrier_id !== user.id) {
      toast.error('Only the assigned carrier can start this delivery');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'in-progress' })
        .eq('id', job.id)
        .eq('carrier_id', user.id);
      
      if (error) throw error;
      
      setJob(prev => prev ? { ...prev, status: 'in-progress' } : null);
      setIsTracking(true);
      toast.success('Delivery started! Tracking is now active.');
    } catch (error) {
      console.error('Error starting delivery:', error);
      toast.error('Failed to start delivery');
    }
  };

  const handleCompleteDelivery = async () => {
    if (!job || !user) return;
    
    if (job.carrier_id !== user.id) {
      toast.error('Only the assigned carrier can complete this delivery');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', job.id)
        .eq('carrier_id', user.id);
      
      if (error) throw error;
      
      toast.success('Delivery marked as completed!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error('Failed to complete delivery');
    }
  };

  const handleAcceptDelivery = async () => {
    if (!job || !user) return;
    
    if (job?.status !== 'available' || job?.carrier_id) {
      toast.error('This job is no longer available');
      navigate('/dashboard');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: 'assigned',
          carrier_id: user.id
        })
        .eq('id', job.id)
        .is('carrier_id', null);
      
      if (error) throw error;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
        
      setJob(prev => prev ? { 
        ...prev, 
        status: 'assigned',
        carrier_id: user.id,
        carrier_name: profileData?.full_name || 'Unknown Carrier'
      } : null);
      
      toast.success('Delivery accepted!');
    } catch (error) {
      console.error('Error accepting delivery:', error);
      toast.error('Failed to accept delivery');
    }
  };

  const generateAnalyticsData = () => {
    if (!job) return [];
    
    const deliveryProgress = job.status === 'completed' ? 100 : 
      job.status === 'in-progress' ? 65 : 
      job.status === 'assigned' ? 30 : 0;
    
    const timeRemaining = job.status === 'completed' ? 0 : 
      job.status === 'in-progress' ? 15 : 
      job.status === 'assigned' ? 30 : 45;
    
    return [
      { name: 'Progress', value: deliveryProgress, color: '#4169E1' },
      { name: 'Efficiency', value: 85, color: '#32CD32' },
      { name: 'Time (min)', value: timeRemaining, color: '#FF5349' }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Delivery Not Found</h1>
        <p className="text-muted-foreground mb-4">The delivery you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  const isBusinessOwner = job?.customer_id === user?.id;
  const isCarrier = job?.carrier_id === user?.id;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground">{job.description}</p>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
            <p className="text-2xl font-bold">${job.price.toFixed(2)}</p>
            
            {isBusinessOwner && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </Button>
            )}
          </div>
        </div>
        
        {showAnalytics && isBusinessOwner && (
          <div className="mb-8">
            <DeliveryAnalytics 
              data={generateAnalyticsData()}
              title="Delivery Metrics"
              description="Real-time delivery performance indicators"
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  <span>Delivery Map</span>
                </h2>
                
                {job.status === 'in-progress' && (
                  <Button 
                    size="sm" 
                    variant={isTracking ? "outline" : "default"}
                    onClick={() => setIsTracking(!isTracking)}
                  >
                    {isTracking ? 'Pause Tracking' : 'Track Carrier'}
                  </Button>
                )}
              </div>
              
              <MapComponent
                pickupLocation={job.pickup}
                dropoffLocation={job.dropoff}
                trackingMode={isTracking}
                carrierLocation={carrierLocation}
                readOnly={true}
                showRoute={job.status === 'in-progress' || job.status === 'completed'}
              />
            </div>
          </div>
          
          <div>
            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-medium">Delivery Details</h2>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Pickup Location</span>
                  </div>
                  <p className="font-medium">{job.pickup.address}</p>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    <span>Dropoff Location</span>
                  </div>
                  <p className="font-medium">{job.dropoff.address}</p>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Estimated Time</span>
                  </div>
                  <p className="font-medium">{job.estimated_duration}</p>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Payment</span>
                  </div>
                  <p className="font-medium">${job.price.toFixed(2)}</p>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Customer</span>
                  </div>
                  <p className="font-medium">{job.customer_name}</p>
                </div>
                
                {job.carrier_id && job.carrier_name && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span>Carrier</span>
                    </div>
                    <p className="font-medium">{job.carrier_name}</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-border">
                {job?.status === 'assigned' && job?.carrier_id === user?.id && (
                  <Button className="w-full" onClick={handleStartDelivery}>
                    Start Delivery
                  </Button>
                )}
                
                {job?.status === 'in-progress' && job?.carrier_id === user?.id && (
                  <Button className="w-full" onClick={handleCompleteDelivery}>
                    Complete Delivery
                  </Button>
                )}
                
                {job?.status === 'completed' && (
                  <div className="bg-primary/10 text-primary p-2 rounded-md text-center">
                    Delivery completed successfully
                  </div>
                )}
                
                {job?.status === 'available' && (
                  <Button className="w-full" onClick={handleAcceptDelivery}>
                    Accept Delivery
                  </Button>
                )}
                
                {(job?.status === 'assigned' || job?.status === 'in-progress') && job?.carrier_id !== user?.id && (
                  <div className="bg-amber-100 text-amber-800 p-2 rounded-md text-center">
                    This delivery has been assigned to another carrier
                  </div>
                )}
              </div>
            </div>
            
            {isBusinessOwner && job.carrier_id && job.status !== 'completed' && (
              <div className="mt-6">
                <MessageCarrier 
                  carrierId={job.carrier_id}
                  carrierName={job.carrier_name || 'Carrier'}
                  jobId={job.id}
                  businessId={user?.id || ''}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
