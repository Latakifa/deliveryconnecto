
import React from 'react';
import { X } from 'lucide-react';

interface JobFormHeaderProps {
  onClose: () => void;
}

const JobFormHeader: React.FC<JobFormHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between border-b border-border p-4">
      <h3 className="text-lg font-medium">Create New Delivery Job</h3>
      <button
        onClick={onClose}
        className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default JobFormHeader;
