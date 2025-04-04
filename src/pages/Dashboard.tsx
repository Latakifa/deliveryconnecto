import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import JobList from '@/components/JobList';
import NewJobForm from '@/components/NewJobForm';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Check, Truck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MessageList, { Message } from '@/components/MessageList';
import DeliveryAnalytics from '@/components/DeliveryAnalytics';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type JobStatus = 'available' | 'assigned' | 'in-progress' | 'completed';

interface Job {
  id: string;
  title: string;
  description: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  price: number;
  package_size: string;
  status: JobStatus;
  business_id?: string;
  carrier_id?: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  user_type: 'business' | 'carrier' | null;
  avatar_url: string | null;
  location: string | null;
  phone: string | null;
  company: string | null;
  vehicle_type: string | null;
  license_number: string | null;
  founded: string | null;
  created_at?: string;
  updated_at?: string;
}

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('available');
  const [userType, setUserType] = useState<'business' | 'carrier'>('carrier');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    price: '',
    packageSize: 'Small (under 5lbs)',
  });
  const [userName, setUserName] = useState('John Smith');
  const [carrierNames, setCarrierNames] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [formUpdate, setFormUpdate] = useState<Profile>({} as Profile);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  
  const fetchJobs = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      let query = supabase.from('jobs').select('*');
      
      if (userType === 'business') {
        query = query.eq('business_id', user.id);
      } 
      else if (userType === 'carrier') {
        if (activeView === 'available') {
          query = query.eq('status', 'available').is('carrier_id', null);
        } else if (activeView === 'active') {
          query = query.or(`and(status.eq.assigned,carrier_id.eq.${user.id}),and(status.eq.in-progress,carrier_id.eq.${user.id})`);
        } else if (activeView === 'completed') {
          query = query.eq('status', 'completed').eq('carrier_id', user.id);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedJobs: Job[] = data.map(job => ({
          id: job.id,
          title: job.title,
          description: job.description,
          pickup: job.pickup,
          dropoff: job.dropoff,
          date: job.date,
          time: job.time,
          price: Number(job.price),
          package_size: job.package_size,
          status: job.status as JobStatus,
          business_id: job.business_id,
          carrier_id: job.carrier_id
        }));
        
        setJobs(formattedJobs);
        
        const carrierIds = formattedJobs
          .filter(job => job.carrier_id)
          .map(job => job.carrier_id as string);
        
        if (carrierIds.length > 0) {
          const { data: carrierData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', carrierIds);
          
          if (carrierData) {
            const names: Record<string, string> = {};
            carrierData.forEach(carrier => {
              if (carrier.full_name) {
                formattedJobs.forEach(job => {
                  if (job.carrier_id === carrier.id) {
                    names[job.id] = carrier.full_name || 'Unknown Carrier';
                  }
                });
              }
            });
            
            setCarrierNames(names);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const handleJobAccepted = (event: CustomEvent) => {
      const { jobId, carrierId } = event.detail;
      
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'assigned' as JobStatus, carrier_id: carrierId } 
          : job
      ));
      
      setActiveView('active');
    };

    window.addEventListener('jobAccepted', handleJobAccepted as EventListener);
    
    return () => {
      window.removeEventListener('jobAccepted', handleJobAccepted as EventListener);
    };
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [user, activeView, userType]);
  
  const fetchMessages = async () => {
    if (!user) return;
    
    setMessagesLoading(true);
    
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
    
      if (userType === 'carrier') {
        query = query.eq('recipient_id', user.id);
      } else if (userType === 'business') {
        query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const messageData = data as Message[];
        
        const unreadCount = messageData.filter(msg => 
          msg.recipient_id === user.id && msg.status === 'unread'
        ).length;
        setUnreadMessageCount(unreadCount);
        
        const senderIds = messageData.map(msg => msg.sender_id);
        
        if (senderIds.length > 0) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', senderIds);
          
          if (profileError) throw profileError;
          
          if (profileData) {
            const messagesWithNames = messageData.map(msg => {
              const senderProfile = profileData.find(profile => profile.id === msg.sender_id);
              return {
                ...msg,
                sender_name: senderProfile?.full_name || 'Unknown Sender'
              };
            });
            
            setMessages(messagesWithNames);
          } else {
            setMessages(messageData);
          }
        } else {
          setMessages(messageData);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };
  
  useEffect(() => {
    if (activeView === 'messages' || unreadMessageCount === 0) {
      fetchMessages();
    }
  }, [user, activeView, userType]);
  
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.dropoff.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleAcceptJob = async (jobId: string) => {
    if (!user) {
      toast.error('You must be logged in to accept jobs');
      return;
    }
    
    try {
      const { data: jobCheck, error: checkError } = await supabase
        .from('jobs')
        .select('status, carrier_id, business_id')
        .eq('id', jobId)
        .single();
      
      if (checkError) {
        console.error('Error checking job status:', checkError);
        throw checkError;
      }
      
      if (jobCheck.status !== 'available' || jobCheck.carrier_id) {
        toast.error('This job is no longer available');
        const activeViewBackup = activeView;
        setActiveView('available');
        setTimeout(() => fetchJobs(), 500);
        return;
      }
      
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: 'assigned',
          carrier_id: user.id
        })
        .eq('id', jobId)
        .eq('status', 'available')
        .is('carrier_id', null);
      
      if (error) {
        console.error('Error accepting job:', error);
        throw error;
      }
      
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          job_id: jobId,
          sender_id: user.id,
          recipient_id: jobCheck.business_id,
          content: `I have accepted your job and will begin delivery soon.`,
          status: 'unread'
        });
      
      if (messageError) {
        console.error('Error sending acceptance message:', messageError);
      }
      
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'assigned' as JobStatus, carrier_id: user.id } 
          : job
      ));
      
      setCarrierNames(prev => ({
        ...prev,
        [jobId]: userName
      }));
      
      toast.success('Job accepted successfully! Check your active jobs.');
      setActiveView('active');
      
      setTimeout(() => {
        fetchJobs();
      }, 500);
    } catch (error) {
      console.error('Error in job acceptance process:', error);
      toast.error('Failed to accept job. Please try again.');
    }
  };
  
  const handleViewJob = (jobId: string) => {
    navigate(`/delivery/${jobId}`);
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleNewJobChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewJob(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create jobs');
      return;
    }
    
    if (!newJob.title || !newJob.description || !newJob.pickup || !newJob.dropoff || !newJob.date || !newJob.time || !newJob.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const jobData = {
        title: newJob.title,
        description: newJob.description,
        pickup: newJob.pickup,
        dropoff: newJob.dropoff,
        date: newJob.date,
        time: newJob.time,
        price: parseFloat(newJob.price),
        package_size: newJob.packageSize,
        status: 'available',
        business_id: user.id
      };
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newJobData: Job = {
          id: data.id,
          title: data.title,
          description: data.description,
          pickup: data.pickup,
          dropoff: data.dropoff,
          date: data.date,
          time: data.time,
          price: Number(data.price),
          package_size: data.package_size,
          status: data.status as JobStatus,
          business_id: data.business_id,
          carrier_id: data.carrier_id
        };
        
        setJobs(prev => [newJobData, ...prev]);
      }
      
      setShowNewJobModal(false);
      
      setNewJob({
        title: '',
        description: '',
        pickup: '',
        dropoff: '',
        date: '',
        time: '',
        price: '',
        packageSize: 'Small (under 5lbs)',
      });
      
      toast.success('Job created successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('id', messageId);
      
      if (error) throw error;
      
      setMessages(prev => 
        prev.map(message => 
          message.id === messageId 
            ? { ...message, status: 'read' } 
            : message
        )
      );
      
      setUnreadMessageCount(prev => prev > 0 ? prev - 1 : 0);
      
      toast.success('Message marked as read');
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Failed to update message status');
    }
  };

  const generateAnalyticsData = () => {
    const statusCounts: Record<JobStatus, number> = {
      'available': 0,
      'assigned': 0,
      'in-progress': 0,
      'completed': 0
    };
    
    const relevantJobs = userType === 'business' 
      ? jobs 
      : jobs.filter(job => job.carrier_id === user?.id);
    
    relevantJobs.forEach(job => {
      statusCounts[job.status]++;
    });
    
    const totalEarnings = relevantJobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => sum + job.price, 0);
    
    const activeJobsCount = statusCounts['assigned'] + statusCounts['in-progress'];
    const completedJobsCount = statusCounts['completed'];
    const totalJobsCount = activeJobsCount + completedJobsCount + statusCounts['available'];
    
    const statusChartData = [
      { name: 'Available', value: statusCounts['available'], color: '#3b82f6' },
      { name: 'Assigned', value: statusCounts['assigned'], color: '#f59e0b' },
      { name: 'In Progress', value: statusCounts['in-progress'], color: '#8b5cf6' },
      { name: 'Completed', value: statusCounts['completed'], color: '#10b981' }
    ];
    
    const activeVsCompletedData = [
      { name: 'Active Jobs', value: activeJobsCount, color: '#8b5cf6' },
      { name: 'Completed Jobs', value: completedJobsCount, color: '#10b981' }
    ];
    
    return {
      statusChartData,
      activeVsCompletedData,
      totalJobsCount,
      activeJobsCount,
      completedJobsCount,
      totalEarnings
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormUpdate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      const updates = {
        id: user.id,
        full_name: formUpdate.full_name || profile?.full_name || userName,
        user_type: userType,
        location: formUpdate.location || profile?.location,
        phone: formUpdate.phone || profile?.phone,
        company: formUpdate.company || profile?.company,
        vehicle_type: formUpdate.vehicle_type || profile?.vehicle_type,
        license_number: formUpdate.license_number || profile?.license_number,
        founded: formUpdate.founded || profile?.founded,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setProfile(prev => ({
        ...(prev || {} as Profile),
        ...updates
      }));
      
      setUserName(updates.full_name || userName);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings updated successfully!');
  };

  const toggleUserType = () => {
    setUserType(prevType => (prevType === 'carrier' ? 'business' : 'carrier'));
    setTimeout(() => {
      fetchJobs();
    }, 100);
  };

  const { 
    statusChartData, 
    activeVsCompletedData, 
    totalJobsCount,
    activeJobsCount,
    completedJobsCount,
    totalEarnings 
  } = generateAnalyticsData();

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar 
          activeView={activeView}
          setActiveView={setActiveView}
          userType={userType}
          handleLogout={handleLogout}
          userName={userName}
          notificationCounts={{ messages: unreadMessageCount }}
        />
        <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
          <DashboardHeader activeView={activeView} userName={userName} />
          <main className="flex-1 overflow-auto p-4 md:p-6 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        userType={userType}
        handleLogout={handleLogout}
        userName={userName}
        notificationCounts={{ messages: unreadMessageCount }}
      />
      
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        <DashboardHeader activeView={activeView} userName={userName} />
        
        <div className="bg-muted/50 px-4 py-2 flex items-center justify-end border-b border-border">
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${userType === 'carrier' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Carrier
            </span>
            <Switch 
              checked={userType === 'business'} 
              onCheckedChange={toggleUserType}
              aria-label="Toggle user type"
            />
            <span className={`text-sm ${userType === 'business' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Business
            </span>
          </div>
        </div>
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {(activeView === 'available' || activeView === 'active' || activeView === 'completed') && (
            <SearchFilterBar
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              userType={userType}
              setShowNewJobModal={setShowNewJobModal}
            />
          )}
          
          {(activeView === 'available' || activeView === 'active' || activeView === 'completed') && (
            <JobList
              filteredJobs={filteredJobs}
              handleAcceptJob={handleAcceptJob}
              handleViewJob={handleViewJob}
              userType={userType}
              carrierNames={carrierNames}
              activeView={activeView}
              currentUserId={user?.id}
            />
          )}

          {activeView === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Delivery Analytics</h2>
              <p className="text-muted-foreground">
                Overview of your {userType === 'business' ? 'business' : 'carrier'} delivery activities
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center">
                  <p className="text-muted-foreground text-sm">Total Jobs</p>
                  <p className="text-3xl font-semibold mt-2">{totalJobsCount}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center">
                  <p className="text-muted-foreground text-sm">Active Jobs</p>
                  <p className="text-3xl font-semibold mt-2 text-purple-500">{activeJobsCount}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center">
                  <p className="text-muted-foreground text-sm">Completed Jobs</p>
                  <p className="text-3xl font-semibold mt-2 text-green-500">{completedJobsCount}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center">
                  <p className="text-muted-foreground text-sm">
                    {userType === 'business' ? 'Total Spent' : 'Total Earned'}
                  </p>
                  <p className="text-3xl font-semibold mt-2 text-amber-500">
                    ${totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <DeliveryAnalytics 
                  title="Job Status Distribution"
                  description="Breakdown of jobs by current status"
                  data={statusChartData}
                  chartType="pie"
                />
                
                <DeliveryAnalytics 
                  title="Active vs. Completed Jobs"
                  description="Comparison of active and completed jobs"
                  data={activeVsCompletedData}
                  chartType="bar"
                />
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background p-4 rounded-md border border-border">
                    <p className="text-muted-foreground text-sm">Completion Rate</p>
                    <p className="text-2xl font-semibold">
                      {totalJobsCount > 0 
                        ? `${Math.round((completedJobsCount / totalJobsCount) * 100)}%` 
                        : '0%'}
                    </p>
                  </div>
                  <div className="bg-background p-4 rounded-md border border-border">
                    <p className="text-muted-foreground text-sm">Average Job Value</p>
                    <p className="text-2xl font-semibold">
                      {completedJobsCount > 0 
                        ? `$${(totalEarnings / completedJobsCount).toFixed(2)}` 
                        : '$0.00'}
                    </p>
                  </div>
                  <div className="bg-background p-4 rounded-md border border-border">
                    <p className="text-muted-foreground text-sm">Customer Rating</p>
                    <p className="text-2xl font-semibold">4.8/5</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'messages' && (
            <div className="space-y-6">
              {messagesLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading messages...</p>
                </div>
              ) : (
                <MessageList 
                  messages={messages} 
                  onMarkAsRead={handleMarkAsRead}
                  userType={userType}
                  currentUserId={user?.id}
                  refreshMessages={fetchMessages}
                />
              )}
            </div>
          )}

          {activeView === 'profile' && (
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="h-16 w-16 text-primary" />
                  </div>
                  <h2 className="text-xl font-medium">{profile?.full_name || userName}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{userType}</p>
                </div>
                
                <div className="flex-1">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="full_name" className="text-sm font-medium">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="full_name" 
                            name="full_name"
                            value={formUpdate.full_name || profile?.full_name || ''} 
                            onChange={handleInputChange}
                            className="pl-10" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="email" 
                            name="email"
                            value={user?.email || ""} 
                            readOnly
                            className="pl-10 bg-muted cursor-not-allowed" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="phone" 
                            name="phone"
                            value={formUpdate.phone || profile?.phone || ''} 
                            onChange={handleInputChange}
                            className="pl-10" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="location" className="text-sm font-medium">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="location" 
                            name="location"
                            value={formUpdate.location || profile?.location || ''} 
                            onChange={handleInputChange}
                            className="pl-10" 
                          />
                        </div>
                      </div>
                      
                      {userType === 'carrier' && (
                        <>
                          <div className="space-y-2">
                            <label htmlFor="vehicle_type" className="text-sm font-medium">Vehicle Type</label>
                            <div className="relative">
                              <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                id="vehicle_type" 
                                name="vehicle_type"
                                value={formUpdate.vehicle_type || profile?.vehicle_type || ''} 
                                onChange={handleInputChange}
                                className="pl-10" 
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="license_number" className="text-sm font-medium">License Number</label>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                id="license_number" 
                                name="license_number"
                                value={formUpdate.license_number || profile?.license_number || ''} 
                                onChange={handleInputChange}
                                className="pl-10" 
                              />
                            </div>
                          </div>
                        </>
                      )}
                      
                      {userType === 'business' && (
                        <>
                          <div className="space-y-2">
                            <label htmlFor="company" className="text-sm font-medium">Company Name</label>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                id="company" 
                                name="company"
                                value={formUpdate.company || profile?.company || ''} 
                                onChange={handleInputChange}
                                className="pl-10" 
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="founded" className="text-sm font-medium">Founded</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                id="founded" 
                                name="founded"
                                value={formUpdate.founded || profile?.founded || ''} 
                                onChange={handleInputChange}
                                className="pl-10" 
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      <Button type="submit" className="w-full">
                        Update Profile
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-medium mb-4">Account Settings</h2>
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notification Preferences</label>
                    <div className="flex gap-2 flex-wrap">
                      <div className="flex items-center bg-background p-2 rounded-md border border-border">
                        <input type="checkbox" id="notify-email" className="mr-2" defaultChecked />
                        <label htmlFor="notify-email">Email Notifications</label>
                      </div>
                      <div className="flex items-center bg-background p-2 rounded-md border border-border">
                        <input type="checkbox" id="notify-app" className="mr-2" defaultChecked />
                        <label htmlFor="notify-app">In-App Notifications</label>
                      </div>
                    </div>
                  </div>
                  <Button type="submit">Save Settings</Button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {showNewJobModal && (
        <NewJobForm
          showNewJobModal={showNewJobModal}
          setShowNewJobModal={setShowNewJobModal}
          newJob={newJob}
          handleNewJobChange={handleNewJobChange}
          handleCreateJob={handleCreateJob}
          onClose={() => setShowNewJobModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
