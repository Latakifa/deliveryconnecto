
import React, { useState } from 'react';
import { Location } from '@/types/location';
import JobFormHeader from './job-form/JobFormHeader';
import BasicInfoSection from './job-form/BasicInfoSection';
import LocationsSection from './job-form/LocationsSection';
import DeliveryDetailsSection from './job-form/DeliveryDetailsSection';
import FormActions from './job-form/FormActions';

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
  onClose?: () => void;
}

const NewJobForm: React.FC<NewJobFormProps> = ({
  showNewJobModal,
  setShowNewJobModal,
  newJob,
  handleNewJobChange,
  handleCreateJob,
  onClose
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
        <JobFormHeader onClose={handleClose} />
        
        <form onSubmit={handleSubmitWithLocations} className="p-4 space-y-4">
          <BasicInfoSection 
            title={newJob.title}
            description={newJob.description}
            onChange={handleNewJobChange}
          />
          
          <LocationsSection
            pickup={newJob.pickup}
            dropoff={newJob.dropoff}
            onPickupSelect={handlePickupSelect}
            onDropoffSelect={handleDropoffSelect}
          />
          
          <DeliveryDetailsSection
            date={newJob.date}
            time={newJob.time}
            price={newJob.price}
            packageSize={newJob.packageSize}
            onChange={handleNewJobChange}
          />
          
          <FormActions onCancel={handleClose} />
        </form>
      </div>
    </div>
  );
};

export default NewJobForm;
