
import React, { useState } from 'react';
import { Location } from '@/types/location';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import MapContainer from './MapContainer';

interface LocationSelectorProps {
  onLocationSelect: (location: Location) => void;
  locationType: 'pickup' | 'dropoff';
  initialValue?: string;
  initialLocation?: Location | null;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  locationType,
  initialValue = '',
  initialLocation = null
}) => {
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState(initialValue);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation);

  const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    if (selectedLocation) {
      // If the user edits the address manually, clear the selected location coordinates
      setSelectedLocation(null);
    }
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setAddress(location.address);
    onLocationSelect(location);
    setShowMap(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={address}
          onChange={handleManualAddressChange}
          placeholder={`${locationType === 'pickup' ? 'Pickup' : 'Dropoff'} address`}
        />
        <Button
          type="button"
          variant="outline"
          className="flex-shrink-0"
          onClick={() => setShowMap(!showMap)}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {showMap ? 'Hide Map' : 'Use Map'}
        </Button>
      </div>
      
      {showMap && (
        <div className="mt-2 border border-border rounded-lg overflow-hidden h-[300px]">
          <MapContainer
            onPickupSelect={locationType === 'pickup' ? handleLocationSelect : undefined}
            onDropoffSelect={locationType === 'dropoff' ? handleLocationSelect : undefined}
            pickupLocation={locationType === 'pickup' ? selectedLocation : null}
            dropoffLocation={locationType === 'dropoff' ? selectedLocation : null}
          />
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
