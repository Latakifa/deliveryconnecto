
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedButton from '@/components/AnimatedButton';
import JobCard from '@/components/JobCard';
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
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Sample job data
const sampleJobs = [
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
    status: 'available',
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
    status: 'available',
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
    status: 'in-progress',
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
    status: 'assigned',
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
    status: 'completed',
  },
];

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('available');
  const [userType, setUserType] = useState<'business' | 'carrier'>('carrier');
  const navigate = useNavigate();
  
  // Filter jobs based on active view
  const filteredJobs = sampleJobs.filter(job => {
    if (activeView === 'available') return job.status === 'available';
    if (activeView === 'active') return job.status === 'assigned' || job.status === 'in-progress';
    if (activeView === 'completed') return job.status === 'completed';
    return true;
  });
  
  const handleAcceptJob = (jobId: string) => {
    toast.success('Job accepted successfully! Check your active jobs.');
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
    setUserType(userType === 'carrier' ? 'business' : 'carrier');
    toast.info(`Switched to ${userType === 'carrier' ? 'Business' : 'Carrier'} view`);
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
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
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
    </div>
  );
};

export default Dashboard;
