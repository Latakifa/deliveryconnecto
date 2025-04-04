
import React from 'react';
import { Input } from '@/components/ui/input';

interface BasicInfoSectionProps {
  title: string;
  description: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ title, description, onChange }) => {
  return (
    <>
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Job Title
        </label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={onChange}
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
          value={description}
          onChange={onChange}
          placeholder="Describe the delivery requirements..."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none min-h-[80px]"
          required
        />
      </div>
    </>
  );
};

export default BasicInfoSection;
