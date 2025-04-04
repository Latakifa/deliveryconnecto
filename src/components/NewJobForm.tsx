
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AnimatedButton from '@/components/AnimatedButton';
import LocationSelector from './map/LocationSelector';
import { Location } from '@/types/location';

interface NewJobFormProps {
  showNewJobModal: boolean;
  setShowNewJobModal: (show: boolean) => void;
  newJob: {
    title: string;
    description: string;
    pickup: string;
    dropoff: string;
    date: string;
    time: string;
    price: string;
    packageSize: string;
  };
  handleNewJobChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCreateJob: (e: React.FormEvent) => void;
  onClose?: () => void; // Added the onClose prop
}

const NewJobForm: React.FC<NewJobFormProps> = ({
  showNewJobModal,
  setShowNewJobModal,
  newJob,
  handleNewJobChange,
  handleCreateJob,
  onClose // Include onClose in the props
}) => {
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  
  const handlePickupSelect = (location: Location) => {
    setPickupLocation(location);
    const event = {
      target: {
        name: 'pickup',
        value: location.address
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleNewJobChange(event);
  };
  
  const handleDropoffSelect = (location: Location) => {
    setDropoffLocation(location);
    const event = {
      target: {
        name: 'dropoff',
        value: location.address
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleNewJobChange(event);
  };
  
  const handleSubmitWithLocations = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pickupLocation) {
      localStorage.setItem('pickupLocation', JSON.stringify(pickupLocation));
    }
    
    if (dropoffLocation) {
      localStorage.setItem('dropoffLocation', JSON.stringify(dropoffLocation));
    }
    
    handleCreateJob(e);
  };
  
  const handleClose = () => {
    // Use the onClose prop if provided, otherwise fall back to setShowNewJobModal
    if (onClose) {
      onClose();
    } else {
      setShowNewJobModal(false);
    }
  };
  
  if (!showNewJobModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-lg font-medium">Create New Delivery Job</h3>
          <button
            onClick={handleClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmitWithLocations} className="p-4 space-y-4">
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
            <LocationSelector
              locationType="pickup"
              onLocationSelect={handlePickupSelect}
              initialValue={newJob.pickup}
            />
          </div>
          
          <div>
            <label htmlFor="dropoff" className="block text-sm font-medium mb-1">
              Dropoff Address
            </label>
            <LocationSelector
              locationType="dropoff"
              onLocationSelect={handleDropoffSelect}
              initialValue={newJob.dropoff}
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
                Price (KES)
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="1"
                min="0"
                value={newJob.price}
                onChange={handleNewJobChange}
                placeholder="0"
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
                <option value="Small (under 2 kg)">Small (under 2 kg)</option>
                <option value="Medium (2-7 kg)">Medium (2-7 kg)</option>
                <option value="Large (7-14 kg)">Large (7-14 kg)</option>
                <option value="Extra Large (14+ kg)">Extra Large (14+ kg)</option>
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
  );
};

export default NewJobForm;
