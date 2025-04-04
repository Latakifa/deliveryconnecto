
import React from 'react';
import { Location } from '@/types/location';
import LocationSelector from '../map/LocationSelector';

interface LocationsSectionProps {
  pickup: string;
  dropoff: string;
  onPickupSelect: (location: Location) => void;
  onDropoffSelect: (location: Location) => void;
}

const LocationsSection: React.FC<LocationsSectionProps> = ({
  pickup,
  dropoff,
  onPickupSelect,
  onDropoffSelect
}) => {
  return (
    <>
      <div>
        <label htmlFor="pickup" className="block text-sm font-medium mb-1">
          Pickup Address
        </label>
        <LocationSelector
          locationType="pickup"
          onLocationSelect={onPickupSelect}
          initialValue={pickup}
        />
      </div>
      
      <div>
        <label htmlFor="dropoff" className="block text-sm font-medium mb-1">
          Dropoff Address
        </label>
        <LocationSelector
          locationType="dropoff"
          onLocationSelect={onDropoffSelect}
          initialValue={dropoff}
        />
      </div>
    </>
  );
};

export default LocationsSection;
