
import React from 'react';
import { Input } from '@/components/ui/input';

interface DeliveryDetailsSectionProps {
  date: string;
  time: string;
  price: string;
  packageSize: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const DeliveryDetailsSection: React.FC<DeliveryDetailsSectionProps> = ({
  date,
  time,
  price,
  packageSize,
  onChange
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">
            Delivery Date
          </label>
          <Input
            id="date"
            name="date"
            type="date"
            value={date}
            onChange={onChange}
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
            value={time}
            onChange={onChange}
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
            value={price}
            onChange={onChange}
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
            value={packageSize}
            onChange={onChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Small (under 2 kg)">Small (under 2 kg)</option>
            <option value="Medium (2-7 kg)">Medium (2-7 kg)</option>
            <option value="Large (7-14 kg)">Large (7-14 kg)</option>
            <option value="Extra Large (14+ kg)">Extra Large (14+ kg)</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default DeliveryDetailsSection;
