import { supabase } from '@/lib/supabase';
import type { DriverStatus } from '@/types';

export interface UpdateDriverLocationData {
  driver_id: string;
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface UpdateDriverStatusData {
  status: DriverStatus;
  current_order_id?: string | null;
}

// Get driver by ID
export const getDriverById = async (driverId: string) => {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', driverId)
    .single();

  if (error) throw error;
  return data;
};

// Get all drivers
export const getAllDrivers = async () => {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('last_active', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get online drivers
export const getOnlineDrivers = async () => {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('status', 'ONLINE')
    .order('last_active', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get available drivers (online and not busy)
export const getAvailableDrivers = async () => {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('status', 'ONLINE')
    .is('current_order_id', null)
    .order('rating', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Update driver status
export const updateDriverStatus = async (
  driverId: string, 
  data: UpdateDriverStatusData
) => {
  const { data: driver, error } = await supabase
    .from('drivers')
    .update({
      ...data,
      last_active: new Date().toISOString(),
    } as never)
    .eq('id', driverId)
    .select()
    .single();

  if (error) throw error;
  return driver;
};

// Update driver location
export const updateDriverLocation = async (data: UpdateDriverLocationData) => {
  const { data: location, error } = await supabase
    .from('driver_locations')
    .insert(data as any)
    .select()
    .single();

  if (error) throw error;
  return location;
};

// Get driver location history
export const getDriverLocationHistory = async (driverId: string, limit = 100) => {
  const { data, error } = await supabase
    .from('driver_locations')
    .select('*')
    .eq('driver_id', driverId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

// Get driver's current order
export const getDriverCurrentOrder = async (driverId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(id, name, phone, avatar_url)
    `)
    .eq('driver_id', driverId)
    .in('status', ['ASSIGNED', 'DRIVER_TO_PICKUP', 'IN_PROGRESS', 'DRIVER_TO_DROPOFF'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && (error as any).code !== 'PGRST116') throw error;
  return data || null;
};

// Update driver rating
export const updateDriverRating = async (driverId: string, newRating: number) => {
  // Get current driver data
  const { data: driver, error: getError } = await supabase
    .from('drivers')
    .select('rating, total_orders')
    .eq('id', driverId)
    .single();

  if (getError) throw getError;

  const d = driver as Record<string, number>;
  // Calculate new average rating
  const currentTotal = d.rating * d.total_orders;
  const newAverage = (currentTotal + newRating) / (d.total_orders + 1);

  const { data, error } = await supabase
    .from('drivers')
    .update({ rating: parseFloat(newAverage.toFixed(1)) } as never)
    .eq('id', driverId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get driver stats
export const getDriverStats = async (driverId: string) => {
  const { data: driver, error } = await supabase
    .from('drivers')
    .select('rating, total_orders')
    .eq('id', driverId)
    .single();

  if (error) throw error;

  const d = driver as any;
  // Get today's orders
  const today = new Date().toISOString().split('T')[0];
  const { count: todayOrders, error: countError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('driver_id', driverId)
    .eq('status', 'COMPLETED')
    .gte('completed_at', today);

  if (countError) throw countError;

  // Get today's earnings
  const { data: earnings, error: earningsError } = await supabase
    .from('orders')
    .select('final_fee')
    .eq('driver_id', driverId)
    .eq('status', 'COMPLETED')
    .gte('completed_at', today);

  if (earningsError) throw earningsError;

  const todayEarnings = (earnings as any[])?.reduce((sum, o) => sum + (o.final_fee || 0), 0) || 0;

  return {
    rating: d.rating,
    totalOrders: d.total_orders,
    todayOrders: todayOrders || 0,
    todayEarnings,
  };
};
