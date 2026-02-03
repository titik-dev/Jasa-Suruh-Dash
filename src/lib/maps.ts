export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  coordinates: Array<[number, number]>;
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OSRM_BASE = 'https://router.project-osrm.org';

const toNumber = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  return typeof value === 'number' ? value : parseFloat(value);
};

export const geocode = async (query: string): Promise<GeocodeResult[]> => {
  if (!query.trim()) return [];
  const url = `${NOMINATIM_BASE}/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data as any[]).map((item) => ({
    displayName: item.display_name as string,
    lat: toNumber(item.lat),
    lng: toNumber(item.lon),
  }));
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return (data as any).display_name || null;
};

export const getRoute = async (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<RouteResult | null> => {
  const url = `${OSRM_BASE}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) return null;
  const route = data.routes[0];
  const coords = (route.geometry.coordinates as [number, number][]) || [];
  return {
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    coordinates: coords.map(([lng, lat]) => [lat, lng]),
  };
};
