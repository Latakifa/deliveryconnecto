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
  
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          const profileData: Profile = {
            id: data.id,
            full_name: data.full_name,
            user_type: data.user_type as 'business' | 'carrier' | null,
            avatar_url: data.avatar_url
          };
          
          setProfile(profileData);
          if (data.full_name) setUserName(data.full_name);
          if (data.user_type) setUserType(data.user_type as 'business' | 'carrier');
        }
      }
    };
    
    fetchProfile();
  }, [user]);

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
    
    fetchJobs();
  }, [user, activeView, userType]);
  
  useEffect(() => {
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
    
    fetchMessages();
  }, [user, activeView, userType]);
  
  useEffect(() => {
    if (activeView === 'messages') {
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
      
      if (checkError) throw checkError;
      
      if (jobCheck.status !== 'available' || jobCheck.carrier_id) {
        toast.error('This job is no longer available');
        setActiveView('available');
        return;
      }
      
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: 'assigned',
          carrier_id: user.id
        })
        .eq('id', jobId);
      
      if (error) throw error;
      
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
    } catch (error) {
      console.error('Error accepting job:', error);
      toast.error('Failed to accept job');
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
  
  const toggleUserType = () => {
    setUserType(prevType => prevType === 'carrier' ? 'business' : 'carrier');
    toast.info(`Switched to ${userType === 'carrier' ? 'Business' : 'Carrier'} view`);
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
      
      toast.success('Message marked as read');
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Failed to update message status');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      const updates = {
        id: user.id,
        full_name: userName,
        user_type: userType,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) {
        toast.error('Failed to update profile: ' + error.message);
      } else {
        toast.success('Profile updated successfully!');
      }
    }
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings updated successfully!');
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar 
          activeView={activeView}
          setActiveView={setActiveView}
          userType={userType}
          toggleUserType={toggleUserType}
          handleLogout={handleLogout}
          userName={userName}
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
        toggleUserType={toggleUserType}
        handleLogout={handleLogout}
        userName={userName}
      />
      
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        <DashboardHeader activeView={activeView} userName={userName} />
        
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
                  <h2 className="text-xl font-medium">{userName}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{userType}</p>
                </div>
                
                <div className="flex-1">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="name" defaultValue={userName} className="pl-10" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="email" defaultValue="john.smith@example.com" className="pl-10" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="phone" defaultValue="(555) 123-4567" className="pl-10" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="location" className="text-sm font-medium">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="location" defaultValue="San Francisco, CA" className="pl-10" />
                        </div>
                      </div>
                      
                      {userType === 'carrier' && (
                        <>
                          <div className="space-y-2">
                            <label htmlFor="vehicle" className="text-sm font-medium">Vehicle Type</label>
                            <div className="relative">
                              <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="vehicle" defaultValue="Sedan" className="pl-10" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="license" className="text-sm font-medium">License Number</label>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="license" defaultValue="CA-123456" className="pl-10" />
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
                              <Input id="company" defaultValue="Acme Inc." className="pl-10" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="founded" className="text-sm font-medium">Founded</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="founded" defaultValue="2015" className="pl-10" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 inline-flex items-center"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Account Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background p-4 rounded-md border border-border">
                    <p className="text-muted-foreground text-sm">Total Jobs</p>
                    <p className="text-2xl font-semibold">
                      {userType === 'carrier' 
                        ? jobs.filter(job => job.status !== 'available' && carrierNames[job.id] === userName).length
                        : jobs.length}
                    </p>
                  </div>
                  <div className="bg-background p-4 rounded-md border border-border">
                    <p className="text-muted-foreground text-sm">Completed</p>
                    <p className="text-2xl font-semibold">
                      {userType === 'carrier'
                        ? jobs.filter(job => job.status === 'completed' && carrierNames[job.id] === userName).length
                        : jobs.filter(job => job.status === 'completed').length}
                    </p>
                  </div>
                  <div className="bg-background p-4 rounded-md border border-border">
                    <p className="text-muted-foreground text-sm">Rating</p>
                    <p className="text-2xl font-semibold">4.8/5</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleUpdateSettings} className="space-y-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive job updates via email</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive push notifications in-app</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Privacy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Location Sharing</p>
                        <p className="text-sm text-muted-foreground">Share your location during active deliveries</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Account</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="current-password" className="text-sm font-medium">Current Password</label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 inline-flex items-center"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
      
      <NewJobForm
        showNewJobModal={showNewJobModal}
        setShowNewJobModal={setShowNewJobModal}
        newJob={newJob}
        handleNewJobChange={handleNewJobChange}
        handleCreateJob={handleCreateJob}
      />
    </div>
  );
};

export default Dashboard;
