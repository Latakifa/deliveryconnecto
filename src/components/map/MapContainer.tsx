
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import MapView from './MapView';
import { Location } from '@/types/location';

interface MapContainerProps {
  onPickupSelect?: (location: Location) => void;
  onDropoffSelect?: (location: Location) => void;
  pickupLocation?: Location | null;
  dropoffLocation?: Location | null;
  trackingMode?: boolean;
  carrierLocation?: Location | null;
  readOnly?: boolean;
  showRoute?: boolean;
}

const MapContainer: React.FC<MapContainerProps> = ({
  onPickupSelect,
  onDropoffSelect,
  pickupLocation,
  dropoffLocation,
  trackingMode = false,
  carrierLocation,
  readOnly = false,
  showRoute = false
}) => {
  const [selectingMode, setSelectingMode] = React.useState<'pickup' | 'dropoff' | null>(null);
  const [mapError, setMapError] = React.useState<string | null>(null);

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg">
        <div className="text-center p-6">
          <div className="text-destructive mb-2">⚠️ {mapError}</div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
      <MapView
        pickupLocation={pickupLocation}
        dropoffLocation={dropoffLocation}
        trackingMode={trackingMode}
        carrierLocation={carrierLocation}
        showRoute={showRoute}
        selectingMode={selectingMode}
        onPickupSelect={onPickupSelect}
        onDropoffSelect={onDropoffSelect}
        onError={setMapError}
        readOnly={readOnly}
      />
      
      {!readOnly && (
        <div className="absolute top-4 left-4 z-10 space-y-2">
          <Button
            variant={selectingMode === 'pickup' ? 'default' : 'outline'}
            className="flex items-center gap-2"
            onClick={() => setSelectingMode('pickup')}
          >
            <MapPin className="h-4 w-4" />
            <span>Select Pickup</span>
          </Button>
          
          <Button
            variant={selectingMode === 'dropoff' ? 'default' : 'outline'}
            className="flex items-center gap-2"
            onClick={() => setSelectingMode('dropoff')}
          >
            <MapPin className="h-4 w-4" />
            <span>Select Dropoff</span>
          </Button>
        </div>
      )}
      
      {selectingMode && (
        <div className="absolute top-4 right-4 z-10 bg-card p-2 rounded-md border border-border">
          <p className="text-sm">
            {selectingMode === 'pickup' 
              ? 'Click on the map to set pickup location' 
              : 'Click on the map to set dropoff location'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
