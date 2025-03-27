import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Updated Mapbox token with the provided token
mapboxgl.accessToken = 'pk.eyJ1IjoibXdhc25naW1zIiwiYSI6ImNtN2l6M2w0bTAxbDIybHM3cjdpMTlpNHIifQ.6Z17fdhqFj28jSAQfb0Txw';

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
  showRoute?: boolean;
}

const Map: React.FC<MapProps> = ({
  onPickupSelect,
  onDropoffSelect,
  pickupLocation,
  dropoffLocation,
  trackingMode = false,
  carrierLocation,
  readOnly = false,
  showRoute = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarker = useRef<mapboxgl.Marker | null>(null);
  const carrierMarker = useRef<mapboxgl.Marker | null>(null);
  const routeLine = useRef<mapboxgl.GeoJSONSource | null>(null);
  const [selectingMode, setSelectingMode] = useState<'pickup' | 'dropoff' | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map with proper error handling
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      console.log('Initializing map with new token...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-122.4194, 37.7749], // Default to San Francisco
        zoom: 12,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-right');

      // Add geolocation control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: trackingMode,
        showUserLocation: true
      });
      
      map.current.addControl(geolocate);

      // Wait for map to load before setting initialized state
      map.current.on('load', () => {
        console.log('Map initialized successfully');
        setMapInitialized(true);
        
        if (!map.current) return;

        // Add a source and layer for the route line
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });
        
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
        
        routeLine.current = map.current.getSource('route') as mapboxgl.GeoJSONSource;
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('There was an error loading the map components');
      });

      // Clean up on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to load map. Please check your connection and try again.');
    }
  }, [trackingMode]);

  // Handle click on map to select location
  useEffect(() => {
    if (!map.current || !mapInitialized || readOnly) return;

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
        setMapError('Failed to get address. Please try again.');
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
  }, [selectingMode, onPickupSelect, onDropoffSelect, readOnly, mapInitialized]);

  // Add or update markers for pickup and dropoff locations
  useEffect(() => {
    if (!map.current || !mapInitialized) return;
    
    // Setup pickup marker
    if (pickupLocation) {
      if (pickupMarker.current) pickupMarker.current.remove();
      try {
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
      } catch (error) {
        console.error('Error adding pickup marker:', error);
      }
    }
    
    // Setup dropoff marker
    if (dropoffLocation) {
      if (dropoffMarker.current) dropoffMarker.current.remove();
      try {
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
      } catch (error) {
        console.error('Error adding dropoff marker:', error);
      }
    }
    
    // If both pickup and dropoff are set, fit map to show both
    if (pickupLocation && dropoffLocation && map.current) {
      try {
        const bounds = new mapboxgl.LngLatBounds()
          .extend([pickupLocation.lng, pickupLocation.lat])
          .extend([dropoffLocation.lng, dropoffLocation.lat]);
        
        map.current.fitBounds(bounds, {
          padding: 100
        });
        
        // Draw a route line between pickup and dropoff if showRoute is true
        if (showRoute && routeLine.current) {
          // In a real app, you would use the Mapbox Directions API here
          // For this demo, we'll just draw a straight line
          routeLine.current.setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [pickupLocation.lng, pickupLocation.lat],
                [dropoffLocation.lng, dropoffLocation.lat]
              ]
            }
          });
        }
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [pickupLocation, dropoffLocation, mapInitialized, showRoute]);

  // Handle carrier location for tracking
  useEffect(() => {
    if (!map.current || !mapInitialized || !trackingMode || !carrierLocation) return;
    
    try {
      if (carrierMarker.current) {
        carrierMarker.current.setLngLat([carrierLocation.lng, carrierLocation.lat]);
      } else if (map.current) {
        carrierMarker.current = new mapboxgl.Marker({ color: '#32CD32' })
          .setLngLat([carrierLocation.lng, carrierLocation.lat])
          .addTo(map.current);
      }
      
      // Update map view to follow carrier
      if (map.current) {
        map.current.flyTo({
          center: [carrierLocation.lng, carrierLocation.lat],
          zoom: 15
        });
      }
      
      // Update route if showRoute is true and we have both pickup and dropoff
      if (showRoute && routeLine.current && pickupLocation && dropoffLocation) {
        // In a real app, you would update the route based on carrier's position
        // For this demo, we'll update the line to show carrier's progress
        routeLine.current.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [pickupLocation.lng, pickupLocation.lat],
              [carrierLocation.lng, carrierLocation.lat],
              [dropoffLocation.lng, dropoffLocation.lat]
            ]
          }
        });
      }
    } catch (error) {
      console.error('Error updating carrier marker:', error);
    }
  }, [carrierLocation, trackingMode, mapInitialized, showRoute, pickupLocation, dropoffLocation]);

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
