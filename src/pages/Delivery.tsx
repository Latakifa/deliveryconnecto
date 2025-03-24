
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Map, Package, MapPin, Navigation, Clock, DollarSign, User, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import MapComponent from '@/components/Map';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  lng: number;
  lat: number;
  address: string;
}

interface DeliveryJob {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
  pickup: Location;
  dropoff: Location;
  price: number;
  created_at: string;
  estimated_duration: string;
  customer_id: string;
  carrier_id?: string;
}

const Delivery: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<DeliveryJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [carrierLocation, setCarrierLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Placeholder function to get job data
  // In a real app, this would fetch from your Supabase database
  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      
      // This is placeholder data - in a real app, fetch from Supabase
      setTimeout(() => {
        setJob({
          id: id || '1',
          title: 'Office Supply Delivery',
          description: 'Deliver office supplies from the warehouse to downtown office',
          status: 'in-progress',
          pickup: {
            lng: -122.4214,
            lat: 37.7749,
            address: '123 Main St, San Francisco, CA'
          },
          dropoff: {
            lng: -122.4094,
            lat: 37.7884,
            address: '456 Market St, San Francisco, CA'
          },
          price: 25.99,
          created_at: new Date().toISOString(),
          estimated_duration: '30 minutes',
          customer_id: 'user-123',
          carrier_id: user?.id
        });
        setLoading(false);
      }, 1000);
    };
    
    fetchJob();
  }, [id, user?.id]);

  // Simulate carrier movement for demo purposes
  useEffect(() => {
    if (!isTracking || !job) return;
    
    // Start with pickup location
    setCarrierLocation(job.pickup);
    
    // Simulate movement along route
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
      
      // Calculate position along route
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

  const handleStartDelivery = () => {
    setIsTracking(true);
    toast.success('Delivery started! Tracking is now active.');
  };

  const handleCompleteDelivery = () => {
    toast.success('Delivery marked as completed!');
    navigate('/dashboard');
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
          </div>
        </div>
        
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
                  <p className="font-medium">John Doe</p>
                </div>
                
                {job.carrier_id && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span>Carrier</span>
                    </div>
                    <p className="font-medium">Sarah Smith</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-border">
                {job.status === 'assigned' && (
                  <Button className="w-full" onClick={handleStartDelivery}>
                    Start Delivery
                  </Button>
                )}
                
                {job.status === 'in-progress' && (
                  <Button className="w-full" onClick={handleCompleteDelivery}>
                    Complete Delivery
                  </Button>
                )}
                
                {job.status === 'completed' && (
                  <div className="bg-primary/10 text-primary p-2 rounded-md text-center">
                    Delivery completed successfully
                  </div>
                )}
                
                {job.status === 'pending' && (
                  <Button className="w-full" onClick={() => toast.success('Delivery accepted!')}>
                    Accept Delivery
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
