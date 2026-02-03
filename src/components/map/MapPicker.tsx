import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import { geocode, getRoute, reverseGeocode } from '@/lib/maps';
import { cn } from '@/lib/utils';

const DEFAULT_CENTER: LatLngTuple = [-7.965, 110.601];

export type LocationValue = {
  address: string;
  landmark: string;
  lat?: number;
  lng?: number;
};

interface MapPickerProps {
  pickup: LocationValue;
  dropoff: LocationValue;
  onPickupChange: (next: LocationValue) => void;
  onDropoffChange: (next: LocationValue) => void;
  onRouteChange?: (distanceMeters: number, durationSeconds: number) => void;
}

type ActivePoint = 'pickup' | 'dropoff';

const isValidCoord = (value?: number) => typeof value === 'number' && !Number.isNaN(value);

const formatDistance = (meters: number) => {
  if (!meters) return '-';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds: number) => {
  if (!seconds) return '-';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return `${hours} jam ${rem} menit`;
};

const ClickHandler: React.FC<{
  onPick: (lat: number, lng: number) => void;
}> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MapPicker: React.FC<MapPickerProps> = ({
  pickup,
  dropoff,
  onPickupChange,
  onDropoffChange,
  onRouteChange,
}) => {
  const [activePoint, setActivePoint] = useState<ActivePoint>('pickup');
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [pickupResults, setPickupResults] = useState<Array<{ displayName: string; lat: number; lng: number }>>([]);
  const [dropoffResults, setDropoffResults] = useState<Array<{ displayName: string; lat: number; lng: number }>>([]);
  const [route, setRoute] = useState<{ distance: number; duration: number; coords: LatLngTuple[] } | null>(null);

  const pickupPos = useMemo<LatLngTuple | null>(() => {
    if (isValidCoord(pickup.lat) && isValidCoord(pickup.lng)) return [pickup.lat as number, pickup.lng as number];
    return null;
  }, [pickup.lat, pickup.lng]);

  const dropoffPos = useMemo<LatLngTuple | null>(() => {
    if (isValidCoord(dropoff.lat) && isValidCoord(dropoff.lng)) return [dropoff.lat as number, dropoff.lng as number];
    return null;
  }, [dropoff.lat, dropoff.lng]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!pickupPos || !dropoffPos) {
        setRoute(null);
        if (onRouteChange) onRouteChange(0, 0);
        return;
      }
      const result = await getRoute(
        { lat: pickupPos[0], lng: pickupPos[1] },
        { lat: dropoffPos[0], lng: dropoffPos[1] },
      );
      if (!active) return;
      if (!result) {
        setRoute(null);
        if (onRouteChange) onRouteChange(0, 0);
        return;
      }
      setRoute({
        distance: result.distanceMeters,
        duration: result.durationSeconds,
        coords: result.coordinates,
      });
      if (onRouteChange) onRouteChange(result.distanceMeters, result.durationSeconds);
    };
    run();
    return () => {
      active = false;
    };
  }, [pickupPos, dropoffPos, onRouteChange]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!pickupQuery.trim()) {
        setPickupResults([]);
        return;
      }
      const results = await geocode(pickupQuery);
      setPickupResults(results);
    }, 500);
    return () => clearTimeout(timer);
  }, [pickupQuery]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!dropoffQuery.trim()) {
        setDropoffResults([]);
        return;
      }
      const results = await geocode(dropoffQuery);
      setDropoffResults(results);
    }, 500);
    return () => clearTimeout(timer);
  }, [dropoffQuery]);

  const updatePoint = async (point: ActivePoint, lat: number, lng: number) => {
    const address = await reverseGeocode(lat, lng);
    if (point === 'pickup') {
      onPickupChange({
        ...pickup,
        address: address || pickup.address || '',
        lat,
        lng,
      });
    } else {
      onDropoffChange({
        ...dropoff,
        address: address || dropoff.address || '',
        lat,
        lng,
      });
    }
  };

  const handleSelect = (point: ActivePoint, value: { displayName: string; lat: number; lng: number }) => {
    if (point === 'pickup') {
      onPickupChange({ ...pickup, address: value.displayName, lat: value.lat, lng: value.lng });
      setPickupResults([]);
      setPickupQuery(value.displayName);
    } else {
      onDropoffChange({ ...dropoff, address: value.displayName, lat: value.lat, lng: value.lng });
      setDropoffResults([]);
      setDropoffQuery(value.displayName);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActivePoint('pickup')}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium border',
            activePoint === 'pickup' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200',
          )}
        >
          Set Pickup
        </button>
        <button
          type="button"
          onClick={() => setActivePoint('dropoff')}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium border',
            activePoint === 'dropoff' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200',
          )}
        >
          Set Dropoff
        </button>
        <div className="ml-auto text-xs text-gray-500">
          Klik peta untuk menaruh pin
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari lokasi pickup..."
            value={pickupQuery}
            onChange={(e) => setPickupQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {pickupResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
              {pickupResults.map((item) => (
                <button
                  key={`${item.lat}-${item.lng}`}
                  type="button"
                  onClick={() => handleSelect('pickup', item)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  {item.displayName}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari lokasi dropoff..."
            value={dropoffQuery}
            onChange={(e) => setDropoffQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {dropoffResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
              {dropoffResults.map((item) => (
                <button
                  key={`${item.lat}-${item.lng}`}
                  type="button"
                  onClick={() => handleSelect('dropoff', item)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  {item.displayName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-72 md:h-96 rounded-2xl overflow-hidden border border-gray-200">
        <MapContainer center={pickupPos || dropoffPos || DEFAULT_CENTER} zoom={13} className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler
            onPick={(lat, lng) => updatePoint(activePoint, lat, lng)}
          />
          {pickupPos && (
            <Marker
              position={pickupPos}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  updatePoint('pickup', pos.lat, pos.lng);
                },
              }}
            />
          )}
          {dropoffPos && (
            <Marker
              position={dropoffPos}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  updatePoint('dropoff', pos.lat, pos.lng);
                },
              }}
            />
          )}
          {route?.coords && route.coords.length > 0 && (
            <Polyline positions={route.coords} pathOptions={{ color: '#2563eb', weight: 4 }} />
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2">
        <span>Jarak: <span className="font-semibold text-gray-800">{route ? formatDistance(route.distance) : '-'}</span></span>
        <span>Estimasi: <span className="font-semibold text-gray-800">{route ? formatDuration(route.duration) : '-'}</span></span>
      </div>
    </div>
  );
};

export default MapPicker;
