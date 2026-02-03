import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import { getRoute } from '@/lib/maps';

const DEFAULT_CENTER: LatLngTuple = [-7.965, 110.601];

interface MapTrackingProps {
  pickup?: { lat?: number; lng?: number };
  dropoff?: { lat?: number; lng?: number };
  driver?: { lat?: number; lng?: number };
}

const isValidCoord = (value?: number) => typeof value === 'number' && !Number.isNaN(value);

export const MapTracking: React.FC<MapTrackingProps> = ({ pickup, dropoff, driver }) => {
  const [route, setRoute] = useState<LatLngTuple[] | null>(null);

  const pickupPos = useMemo<LatLngTuple | null>(() => {
    if (isValidCoord(pickup?.lat) && isValidCoord(pickup?.lng)) return [pickup!.lat!, pickup!.lng!];
    return null;
  }, [pickup?.lat, pickup?.lng]);

  const dropoffPos = useMemo<LatLngTuple | null>(() => {
    if (isValidCoord(dropoff?.lat) && isValidCoord(dropoff?.lng)) return [dropoff!.lat!, dropoff!.lng!];
    return null;
  }, [dropoff?.lat, dropoff?.lng]);

  const driverPos = useMemo<LatLngTuple | null>(() => {
    if (isValidCoord(driver?.lat) && isValidCoord(driver?.lng)) return [driver!.lat!, driver!.lng!];
    return null;
  }, [driver?.lat, driver?.lng]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!pickupPos || !dropoffPos) {
        setRoute(null);
        return;
      }
      const result = await getRoute(
        { lat: pickupPos[0], lng: pickupPos[1] },
        { lat: dropoffPos[0], lng: dropoffPos[1] },
      );
      if (!active) return;
      setRoute(result?.coordinates || null);
    };
    run();
    return () => {
      active = false;
    };
  }, [pickupPos, dropoffPos]);

  if (!pickupPos && !dropoffPos) {
    return (
      <div className="h-56 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500">
        Lokasi belum tersedia
      </div>
    );
  }

  return (
    <div className="h-72 md:h-96 rounded-2xl overflow-hidden border border-gray-200">
      <MapContainer
        center={pickupPos || dropoffPos || DEFAULT_CENTER}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pickupPos && <Marker position={pickupPos} />}
        {dropoffPos && <Marker position={dropoffPos} />}
        {driverPos && <Marker position={driverPos} />}
        {route && route.length > 0 && (
          <Polyline positions={route} pathOptions={{ color: '#16a34a', weight: 4 }} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapTracking;
