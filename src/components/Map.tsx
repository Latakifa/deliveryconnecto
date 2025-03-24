
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Temporary access token - should be moved to environment variables
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVtby1hY2NvdW50LWxvdmFibGUiLCJhIjoiY2x3eHF1dmFrMGNpMjJqbnhqcnllaXcyciJ9.w6ULgbRYCeUFgptHYzKcQg';

interface Location {
  lng: number;
  lat: number;
  address: string;
}

interface MapProps {
  onPickupSelect?: (location: Location) => void;
  onDropoffSelect?: (location: Location) => void;
  pickupLocation?: Location | null;
  dropoffLocation?: Location | null;
  trackingMode?: boolean;
  carrierLocation?: Location | null;
  readOnly?: boolean;
}

const Map: React.FC<MapProps> = ({
  onPickupSelect,
  onDropoffSelect,
  pickupLocation,
  dropoffLocation,
  trackingMode = false,
  carrierLocation,
  readOnly = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarker = useRef<mapboxgl.Marker | null>(null);
  const carrierMarker = useRef<mapboxgl.Marker | null>(null);
  const [selectingMode, setSelectingMode] = useState<'pickup' | 'dropoff' | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-122.4194, 37.7749], // Default to San Francisco
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geocoder control for searching addresses
    const geocoder = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: trackingMode,
      showUserLocation: true
    });
    map.current.addControl(geocoder);

    // Clean up on unmount
    return () => {
      map.current?.remove();
    };
  }, [trackingMode]);

  // Handle click on map to select location
  useEffect(() => {
    if (!map.current || readOnly) return;

    const handleMapClick = async (e: mapboxgl.MapMouseEvent) => {
      if (!selectingMode || !map.current) return;
      
      const { lng, lat } = e.lngLat;
      
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        const address = data.features[0]?.place_name || 'Unknown location';
        
        if (selectingMode === 'pickup') {
          if (pickupMarker.current) pickupMarker.current.remove();
          pickupMarker.current = new mapboxgl.Marker({ color: '#4169E1' })
            .setLngLat([lng, lat])
            .addTo(map.current);
          
          onPickupSelect?.({ lng, lat, address });
        } else if (selectingMode === 'dropoff') {
          if (dropoffMarker.current) dropoffMarker.current.remove();
          dropoffMarker.current = new mapboxgl.Marker({ color: '#FF5349' })
            .setLngLat([lng, lat])
            .addTo(map.current);
          
          onDropoffSelect?.({ lng, lat, address });
        }
        
        setSelectingMode(null);
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    };

    if (map.current) {
      map.current.on('click', handleMapClick);
    }

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, [selectingMode, onPickupSelect, onDropoffSelect, readOnly]);

  // Add or update markers for pickup and dropoff locations
  useEffect(() => {
    if (!map.current) return;
    
    // Setup pickup marker
    if (pickupLocation) {
      if (pickupMarker.current) pickupMarker.current.remove();
      pickupMarker.current = new mapboxgl.Marker({ color: '#4169E1' })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .addTo(map.current);
      
      // Adjust map view to include pickup location
      if (!dropoffLocation) {
        map.current.flyTo({
          center: [pickupLocation.lng, pickupLocation.lat],
          zoom: 14
        });
      }
    }
    
    // Setup dropoff marker
    if (dropoffLocation) {
      if (dropoffMarker.current) dropoffMarker.current.remove();
      dropoffMarker.current = new mapboxgl.Marker({ color: '#FF5349' })
        .setLngLat([dropoffLocation.lng, dropoffLocation.lat])
        .addTo(map.current);
      
      // Adjust map view to include dropoff location
      if (!pickupLocation) {
        map.current.flyTo({
          center: [dropoffLocation.lng, dropoffLocation.lat],
          zoom: 14
        });
      }
    }
    
    // If both pickup and dropoff are set, fit map to show both
    if (pickupLocation && dropoffLocation && map.current) {
      const bounds = new mapboxgl.LngLatBounds()
        .extend([pickupLocation.lng, pickupLocation.lat])
        .extend([dropoffLocation.lng, dropoffLocation.lat]);
      
      map.current.fitBounds(bounds, {
        padding: 100
      });
    }
  }, [pickupLocation, dropoffLocation]);

  // Handle carrier location for tracking
  useEffect(() => {
    if (!map.current || !trackingMode || !carrierLocation) return;
    
    if (carrierMarker.current) {
      carrierMarker.current.setLngLat([carrierLocation.lng, carrierLocation.lat]);
    } else {
      carrierMarker.current = new mapboxgl.Marker({ color: '#32CD32' })
        .setLngLat([carrierLocation.lng, carrierLocation.lat])
        .addTo(map.current);
    }
    
    // Update map view to follow carrier
    map.current.flyTo({
      center: [carrierLocation.lng, carrierLocation.lat],
      zoom: 15
    });
  }, [carrierLocation, trackingMode]);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      
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

export default Map;
