import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import JobList from '@/components/JobList';
import NewJobForm from '@/components/NewJobForm';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Check, Truck } from 'lucide-react';

// Sample job data
const initialJobs = [
  {
    id: '1',
    title: 'Bakery Delivery to Downtown Office',
    description: 'Deliver fresh pastries from Sweet Treats Bakery to Skyline Tower',
    pickup: '123 Baker Street, San Francisco, CA',
    dropoff: '456 Market Street, San Francisco, CA',
    date: 'June 15, 2023',
    time: '9:00 AM - 10:00 AM',
    price: 18.50,
    packageSize: 'Small (under 5lbs)',
    status: 'available' as const,
  },
  {
    id: '2',
    title: 'Grocery Package Delivery',
    description: 'Deliver grocery order from Whole Foods Market to residential address',
    pickup: '845 Market St, San Francisco, CA',
    dropoff: '1288 Howard St, San Francisco, CA',
    date: 'June 15, 2023',
    time: '11:00 AM - 12:00 PM',
    price: 22.75,
    packageSize: 'Medium (5-15lbs)',
    status: 'available' as const,
  },
  {
    id: '3',
    title: 'Electronics Store to Customer',
    description: 'Deliver new laptop from TechWorld to customer',
    pickup: '400 Sutter St, San Francisco, CA',
    dropoff: '1155 Mission St, San Francisco, CA',
    date: 'June 15, 2023',
    time: '2:00 PM - 3:00 PM',
    price: 25.00,
    packageSize: 'Medium (5-15lbs)',
    status: 'in-progress' as const,
  },
  {
    id: '4',
    title: 'Restaurant to Residential Delivery',
    description: 'Deliver meal order from Pasta Paradise to customer',
    pickup: '500 Grove St, San Francisco, CA',
    dropoff: '775 Valencia St, San Francisco, CA',
    date: 'June 15, 2023',
    time: '6:00 PM - 7:00 PM',
    price: 15.25,
    packageSize: 'Small (under 5lbs)',
    status: 'assigned' as const,
  },
  {
    id: '5',
    title: 'Gift Shop Package to Hotel',
    description: 'Deliver gift basket from Enchanted Gifts to Grand Hotel',
    pickup: '220 Montgomery St, San Francisco, CA',
    dropoff: '335 Powell St, San Francisco, CA',
    date: 'June 16, 2023',
    time: '10:00 AM - 11:00 AM',
    price: 19.75,
    packageSize: 'Small (under 5lbs)',
    status: 'completed' as const,
  },
];

// Type definition for a job
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
  packageSize: string;
  status: JobStatus;
}

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('available');
  const [userType, setUserType] = useState<'business' | 'carrier'>('carrier');
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
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
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Support Team', content: 'Welcome to DeliveryConnect! Let us know if you need any help.', time: '2 days ago', unread: false },
    { id: 2, sender: 'System', content: 'Your account has been successfully verified.', time: '1 day ago', unread: false },
    { id: 3, sender: 'Sarah Johnson', content: 'Thanks for the quick delivery yesterday!', time: '5 hours ago', unread: true },
    { id: 4, sender: 'Tech Support', content: 'The app will undergo maintenance tonight from 2-3 AM.', time: '1 hour ago', unread: true },
  ]);
  const navigate = useNavigate();
  
  // Filter jobs based on active view and search query
  const filteredJobs = jobs.filter(job => {
    // First filter by view
    const matchesView = 
      activeView === 'available' ? job.status === 'available' :
      activeView === 'active' ? (job.status === 'assigned' || job.status === 'in-progress') :
      activeView === 'completed' ? job.status === 'completed' :
      true;
    
    // Then filter by search query if one exists
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.dropoff.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesView && matchesSearch;
  });
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleAcceptJob = (jobId: string) => {
    setJobs(prevJobs => prevJobs.map(job => 
      job.id === jobId 
        ? { ...job, status: 'assigned' as JobStatus } 
        : job
    ));
    
    // Set the carrier name for this job
    setCarrierNames(prev => ({
      ...prev,
      [jobId]: userName
    }));
    
    toast.success('Job accepted successfully! Check your active jobs.');
    // Switch to active view to show the accepted job
    setActiveView('active');
  };
  
  const handleViewJob = (jobId: string) => {
    toast.info(`Viewing details for job #${jobId}`);
  };
  
  const handleLogout = () => {
    toast.info('Logging out...');
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };
  
  // Toggle user type for demo purposes
  const toggleUserType = () => {
    setUserType(prevType => prevType === 'carrier' ? 'business' : 'carrier');
    toast.info(`Switched to ${userType === 'carrier' ? 'Business' : 'Carrier'} view`);
  };
  
  // Handle new job input changes
  const handleNewJobChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewJob(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle new job submission
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newJob.title || !newJob.description || !newJob.pickup || !newJob.dropoff || !newJob.date || !newJob.time || !newJob.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Create new job
    const jobId = (jobs.length + 1).toString();
    const createdJob: Job = {
      id: jobId,
      title: newJob.title,
      description: newJob.description,
      pickup: newJob.pickup,
      dropoff: newJob.dropoff,
      date: newJob.date,
      time: newJob.time,
      price: parseFloat(newJob.price),
      packageSize: newJob.packageSize,
      status: 'available'
    };
    
    setJobs(prev => [...prev, createdJob]);
    setShowNewJobModal(false);
    
    // Reset form
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
  };

  // Mark a message as read
  const handleMarkAsRead = (messageId: number) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, unread: false } 
          : message
      )
    );
  };

  // Update user profile
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  // Update settings
  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings updated successfully!');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Component */}
      <DashboardSidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        userType={userType}
        toggleUserType={toggleUserType}
        handleLogout={handleLogout}
        userName={userName}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Header Component */}
        <DashboardHeader activeView={activeView} userName={userName} />
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Only show search and filter for job-related views */}
          {(activeView === 'available' || activeView === 'active' || activeView === 'completed') && (
            <SearchFilterBar
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              userType={userType}
              setShowNewJobModal={setShowNewJobModal}
            />
          )}
          
          {/* Job list for job-related views */}
          {(activeView === 'available' || activeView === 'active' || activeView === 'completed') && (
            <JobList
              filteredJobs={filteredJobs}
              handleAcceptJob={handleAcceptJob}
              handleViewJob={handleViewJob}
              userType={userType}
              carrierNames={carrierNames}
              activeView={activeView}
            />
          )}

          {/* Messages View */}
          {activeView === 'messages' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`p-4 rounded-lg border ${message.unread ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}
                    onClick={() => handleMarkAsRead(message.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        {message.sender}
                        {message.unread && (
                          <span className="h-2 w-2 rounded-full bg-primary"></span>
                        )}
                      </h3>
                      <span className="text-xs text-muted-foreground">{message.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{message.content}</p>
                  </div>
                ))}
              </div>
              
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No messages yet</h3>
                  <p className="text-muted-foreground">You don't have any messages in your inbox.</p>
                </div>
              )}
            </div>
          )}

          {/* Profile View */}
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

          {/* Settings View */}
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
      
      {/* New Job Modal Component */}
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
