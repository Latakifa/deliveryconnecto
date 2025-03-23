
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedButton from '@/components/AnimatedButton';
import JobCard from '@/components/JobCard';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Truck, 
  User, 
  Bell, 
  LogOut, 
  Search, 
  Plus, 
  BarChart, 
  MessageCircle,
  Settings,
  Filter,
  Calendar,
  Clock,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

// Type definition for carrier names
interface CarrierNames {
  [key: string]: string;
}

// For new job modal
interface NewJobForm {
  title: string;
  description: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  price: string;
  packageSize: string;
}

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('available');
  const [userType, setUserType] = useState<'business' | 'carrier'>('carrier');
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJob, setNewJob] = useState<NewJobForm>({
    title: '',
    description: '',
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    price: '',
    packageSize: 'Small (under 5lbs)',
  });
  const [carrierNames, setCarrierNames] = useState<CarrierNames>({});
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
      [jobId]: "John Smith"
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden">
            <div className="absolute inset-0 bg-primary rounded-md opacity-20"></div>
            <Package className="absolute inset-0 m-auto h-5 w-5 text-primary" />
          </div>
          <div className="font-semibold text-lg tracking-tight">DeliveryConnect</div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveView('available')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              activeView === 'available'
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Package className="h-5 w-5" />
            <span>Available Jobs</span>
          </button>
          
          <button
            onClick={() => setActiveView('active')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              activeView === 'active'
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Truck className="h-5 w-5" />
            <span>Active Jobs</span>
          </button>
          
          <button
            onClick={() => setActiveView('completed')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              activeView === 'completed'
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Clock className="h-5 w-5" />
            <span>Completed Jobs</span>
          </button>
          
          <button
            onClick={() => setActiveView('analytics')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              activeView === 'analytics'
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <BarChart className="h-5 w-5" />
            <span>Analytics</span>
          </button>
          
          <button
            onClick={() => setActiveView('messages')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              activeView === 'messages'
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <MessageCircle className="h-5 w-5" />
            <span>Messages</span>
          </button>
          
          <button
            onClick={() => setActiveView('profile')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              activeView === 'profile'
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </button>
          
          <button
            onClick={() => setActiveView('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              activeView === 'settings'
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </nav>
        
        {/* User info and logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">John Smith</p>
              <p className="text-xs text-muted-foreground capitalize">{userType}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <AnimatedButton
              variant="outline"
              size="sm"
              className="w-full"
              onClick={toggleUserType}
            >
              Switch View
            </AnimatedButton>
            
            <AnimatedButton
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={handleLogout}
              icon={<LogOut className="h-4 w-4" />}
              aria-label="Log out"
            />
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          {/* Mobile menu & logo */}
          <div className="flex items-center gap-4 md:hidden">
            <div className="relative h-8 w-8 overflow-hidden">
              <div className="absolute inset-0 bg-primary rounded-md opacity-20"></div>
              <Package className="absolute inset-0 m-auto h-5 w-5 text-primary" />
            </div>
            <div className="font-semibold text-lg tracking-tight">DeliveryConnect</div>
          </div>
          
          {/* Title */}
          <h1 className="text-xl font-semibold hidden md:block">
            {activeView === 'available' && 'Available Jobs'}
            {activeView === 'active' && 'Active Jobs'}
            {activeView === 'completed' && 'Completed Jobs'}
            {activeView === 'analytics' && 'Analytics'}
            {activeView === 'messages' && 'Messages'}
            {activeView === 'profile' && 'Profile'}
            {activeView === 'settings' && 'Settings'}
          </h1>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="h-9 w-9 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
              </button>
            </div>
            
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center md:hidden">
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Search and filter bar */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2"
              />
            </div>
            
            <div className="flex gap-3">
              <AnimatedButton
                variant="outline"
                size="sm"
                icon={<Filter className="h-4 w-4" />}
                iconPosition="left"
              >
                Filter
              </AnimatedButton>
              
              {userType === 'business' && (
                <AnimatedButton
                  variant="primary"
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                  iconPosition="left"
                  onClick={() => setShowNewJobModal(true)}
                >
                  Create Job
                </AnimatedButton>
              )}
            </div>
          </div>
          
          {/* Jobs grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onAccept={() => handleAcceptJob(job.id)}
                  onView={() => handleViewJob(job.id)}
                  type={userType}
                  carrierName={carrierNames[job.id]}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  {activeView === 'available' && <Package className="h-8 w-8 text-muted-foreground" />}
                  {activeView === 'active' && <Truck className="h-8 w-8 text-muted-foreground" />}
                  {activeView === 'completed' && <Clock className="h-8 w-8 text-muted-foreground" />}
                </div>
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground max-w-md">
                  {activeView === 'available' 
                    ? "There are no available jobs at the moment. Check back later or adjust your filters."
                    : activeView === 'active'
                    ? "You don't have any active jobs right now. Start by accepting available jobs."
                    : "You haven't completed any jobs yet. Jobs will appear here once they're finished."}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-medium">Create New Delivery Job</h3>
              <button
                onClick={() => setShowNewJobModal(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateJob} className="p-4 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Job Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={newJob.title}
                  onChange={handleNewJobChange}
                  placeholder="e.g., Office Supply Delivery"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newJob.description}
                  onChange={handleNewJobChange}
                  placeholder="Describe the delivery requirements..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none min-h-[80px]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="pickup" className="block text-sm font-medium mb-1">
                  Pickup Address
                </label>
                <Input
                  id="pickup"
                  name="pickup"
                  value={newJob.pickup}
                  onChange={handleNewJobChange}
                  placeholder="Full pickup address"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="dropoff" className="block text-sm font-medium mb-1">
                  Dropoff Address
                </label>
                <Input
                  id="dropoff"
                  name="dropoff"
                  value={newJob.dropoff}
                  onChange={handleNewJobChange}
                  placeholder="Full delivery address"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-1">
                    Delivery Date
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newJob.date}
                    onChange={handleNewJobChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium mb-1">
                    Delivery Time
                  </label>
                  <Input
                    id="time"
                    name="time"
                    value={newJob.time}
                    onChange={handleNewJobChange}
                    placeholder="e.g., 2:00 PM - 4:00 PM"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1">
                    Price ($)
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newJob.price}
                    onChange={handleNewJobChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="packageSize" className="block text-sm font-medium mb-1">
                    Package Size
                  </label>
                  <select
                    id="packageSize"
                    name="packageSize"
                    value={newJob.packageSize}
                    onChange={handleNewJobChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Small (under 5lbs)">Small (under 5lbs)</option>
                    <option value="Medium (5-15lbs)">Medium (5-15lbs)</option>
                    <option value="Large (15-30lbs)">Large (15-30lbs)</option>
                    <option value="Extra Large (30+ lbs)">Extra Large (30+ lbs)</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <AnimatedButton
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewJobModal(false)}
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  type="submit"
                  variant="primary"
                >
                  Create Job
                </AnimatedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
