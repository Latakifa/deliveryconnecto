
import React from 'react';
import JobCard from '@/components/JobCard';
import { Package, Truck, Clock } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  price: number;
  package_size: string; // Changed from packageSize to package_size to match DB schema
  status: 'available' | 'assigned' | 'in-progress' | 'completed';
  business_id?: string;
  carrier_id?: string;
}

interface JobListProps {
  filteredJobs: Job[];
  handleAcceptJob: (jobId: string) => void;
  handleViewJob: (jobId: string) => void;
  userType: 'business' | 'carrier';
  carrierNames: Record<string, string>;
  activeView: string;
  currentUserId?: string;
}

const JobList: React.FC<JobListProps> = ({
  filteredJobs,
  handleAcceptJob,
  handleViewJob,
  userType,
  carrierNames,
  activeView,
  currentUserId
}) => {
  return (
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
            currentUserId={currentUserId}
          />
        ))
      ) : (
        <EmptyJobsState activeView={activeView} />
      )}
    </div>
  );
};

// Extracted the empty state component to reduce the main component's complexity
const EmptyJobsState: React.FC<{ activeView: string }> = ({ activeView }) => {
  return (
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
  );
};

export default JobList;
