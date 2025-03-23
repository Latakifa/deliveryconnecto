
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import JobList from '@/components/JobList';
import NewJobForm from '@/components/NewJobForm';

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
  const [carrierNames, setCarrierNames] = useState<Record<string, string>>({});
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
      {/* Sidebar Component */}
      <DashboardSidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        userType={userType}
        toggleUserType={toggleUserType}
        handleLogout={handleLogout}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Header Component */}
        <DashboardHeader activeView={activeView} />
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Search and filter bar Component */}
          <SearchFilterBar
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
            userType={userType}
            setShowNewJobModal={setShowNewJobModal}
          />
          
          {/* Jobs grid Component */}
          <JobList
            filteredJobs={filteredJobs}
            handleAcceptJob={handleAcceptJob}
            handleViewJob={handleViewJob}
            userType={userType}
            carrierNames={carrierNames}
            activeView={activeView}
          />
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
