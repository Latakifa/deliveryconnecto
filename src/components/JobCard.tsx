
import React from 'react';
import { cn } from '@/lib/utils';
import AnimatedButton from './AnimatedButton';
import { MapPin, Package, Calendar, Clock, DollarSign, User } from 'lucide-react';
import { formatCurrency, formatPackageWeight } from '@/utils/formatters';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    pickup: string;
    dropoff: string;
    date: string;
    time: string;
    price: number;
    packageSize: string;
    status: 'available' | 'assigned' | 'in-progress' | 'completed';
    business_id?: string;
    carrier_id?: string;
  };
  onAccept?: () => void;
  onView?: () => void;
  type?: 'business' | 'carrier';
  carrierName?: string;
  className?: string;
  currentUserId?: string;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onAccept, 
  onView, 
  type = 'carrier',
  carrierName,
  className,
  currentUserId
}) => {
  // Status badge styling
  const statusStyles = {
    'available': 'bg-blue-100 text-blue-800',
    'assigned': 'bg-amber-100 text-amber-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800',
  };

  const isJobAssigned = job.status === 'assigned' || job.status === 'in-progress';
  
  // Only show accept button if:
  // 1. The job is available (not assigned, in-progress, or completed)
  // 2. The user is a carrier
  // 3. The job doesn't already have a carrier assigned
  const showAcceptButton = type === 'carrier' && 
                          job.status === 'available' && 
                          !job.carrier_id;
  
  // Check if this job is assigned to the current user
  const isAssignedToCurrentUser = job.carrier_id === currentUserId;

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md animate-fade-in",
        className
      )}
    >
      {/* Status Badge */}
      <div className={cn(
        "absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusStyles[job.status]
      )}>
        {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('-', ' ')}
      </div>
      
      <div className="p-6">
        {/* Job Title and Description */}
        <h3 className="text-lg font-medium mb-2 pr-24">{job.title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{job.description}</p>
        
        <div className="space-y-3 mb-6">
          {/* Pickup Location */}
          <div className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pickup Location</p>
              <p className="text-sm font-medium">{job.pickup}</p>
            </div>
          </div>
          
          {/* Dropoff Location */}
          <div className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
              <MapPin className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dropoff Location</p>
              <p className="text-sm font-medium">{job.dropoff}</p>
            </div>
          </div>
          
          {/* Carrier Assignment (only shown when job is assigned/in-progress) */}
          {isJobAssigned && carrierName && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned Carrier</p>
                <p className="text-sm font-medium">{carrierName}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="flex items-center mb-1">
              <Package className="h-4 w-4 text-muted-foreground mr-1.5" />
              <p className="text-xs text-muted-foreground">Package Size</p>
            </div>
            <p className="text-sm font-medium">{formatPackageWeight(job.packageSize)}</p>
          </div>
          
          <div>
            <div className="flex items-center mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-1.5" />
              <p className="text-xs text-muted-foreground">Price</p>
            </div>
            <p className="text-sm font-medium">{formatCurrency(job.price)}</p>
          </div>
          
          <div>
            <div className="flex items-center mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground mr-1.5" />
              <p className="text-xs text-muted-foreground">Date</p>
            </div>
            <p className="text-sm font-medium">{job.date}</p>
          </div>
          
          <div>
            <div className="flex items-center mb-1">
              <Clock className="h-4 w-4 text-muted-foreground mr-1.5" />
              <p className="text-xs text-muted-foreground">Time</p>
            </div>
            <p className="text-sm font-medium">{job.time}</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {showAcceptButton && onAccept && (
            <AnimatedButton
              onClick={onAccept}
              variant="primary"
              className="w-full sm:w-auto"
            >
              Accept Job
            </AnimatedButton>
          )}
          
          {onView && (
            <AnimatedButton
              onClick={onView}
              variant={showAcceptButton ? "outline" : "primary"}
              className="w-full sm:w-auto"
            >
              View Details
            </AnimatedButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
