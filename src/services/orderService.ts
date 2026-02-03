import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus, ServiceType } from '@/types';

export interface CreateOrderData {
  user_id: string;
  service_type: ServiceType;
  service_name: string;
  pickup_address: string;
  pickup_landmark?: string;
  dropoff_address: string;
  dropoff_landmark?: string;
  notes?: string;
  item_size: 'kecil' | 'sedang' | 'besar';
  who_pays: 'user' | 'driver';
  requires_pin: boolean;
  estimated_fee_min: number;
  estimated_fee_max: number;
  is_subscription: boolean;
}

// Generate order ID
const generateOrderId = () => {
  const prefix = 'JSG-';
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(100 + Math.random() * 900);
  return `${prefix}${datePart}-${randomPart}`;
};

// Generate PIN
const generatePin = () => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

// Create new order
export const createOrder = async (data: CreateOrderData) => {
  const orderId = generateOrderId();
  const pin = data.requires_pin ? generatePin() : null;

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      ...data,
      order_id: orderId,
      pin,
      status: 'SEARCHING_DRIVER',
    } as any)
    .select()
    .single();

  if (error) throw error;
  return order;
};

// Get order by ID
export const getOrderById = async (orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(id, name, phone, avatar_url),
      driver:drivers(id, name, phone, avatar_url, vehicle_type, vehicle_plate, rating)
    `)
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
};

// Get orders by user ID
export const getOrdersByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      driver:drivers(id, name, avatar_url, vehicle_type, vehicle_plate, rating)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get orders by driver ID
export const getOrdersByDriver = async (driverId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(id, name, phone, avatar_url)
    `)
    .eq('driver_id', driverId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get active orders (for admin)
export const getActiveOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(id, name, phone),
      driver:drivers(id, name, avatar_url)
    `)
    .in('status', ['CREATED', 'SEARCHING_DRIVER', 'ASSIGNED', 'DRIVER_TO_PICKUP', 'IN_PROGRESS', 'DRIVER_TO_DROPOFF'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get all orders (for admin)
export const getAllOrders = async (limit = 100) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(id, name, phone),
      driver:drivers(id, name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

// Update order status
export const updateOrderStatus = async (
  orderId: string, 
  status: OrderStatus, 
  additionalData?: Partial<Order>
) => {
  const updateData: Record<string, unknown> = { status };
  
  // Set timestamps based on status
  if (status === 'ASSIGNED') {
    updateData.assigned_at = new Date().toISOString();
  } else if (status === 'IN_PROGRESS') {
    updateData.started_at = new Date().toISOString();
  } else if (status === 'COMPLETED') {
    updateData.completed_at = new Date().toISOString();
  } else if (status === 'CANCELED') {
    updateData.canceled_at = new Date().toISOString();
  }

  if (additionalData) {
    Object.assign(updateData, additionalData);
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData as never)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Assign driver to order
export const assignDriver = async (orderId: string, driverId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      driver_id: driverId,
      status: 'ASSIGNED',
      assigned_at: new Date().toISOString(),
    } as never)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;

  // Update driver status to BUSY
  await supabase
    .from('drivers')
    .update({
      status: 'BUSY',
      current_order_id: orderId,
    } as never)
    .eq('id', driverId);

  return data;
};

// Cancel order
export const cancelOrder = async (orderId: string, reason?: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'CANCELED',
      cancel_reason: reason,
      canceled_at: new Date().toISOString(),
    } as never)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Complete order with PIN verification
export const completeOrder = async (orderId: string, pin: string, finalFee?: number) => {
  // Verify PIN first
  const { data: order, error: getError } = await supabase
    .from('orders')
    .select('pin')
    .eq('id', orderId)
    .single();

  if (getError) throw getError;
  if ((order as Record<string, unknown>).pin !== pin) {
    throw new Error('PIN tidak valid');
  }

  const updateData: Record<string, unknown> = {
    status: 'COMPLETED',
    completed_at: new Date().toISOString(),
  };

  if (finalFee) {
    updateData.final_fee = finalFee;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData as never)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get order events (audit trail)
export const getOrderEvents = async (orderId: string) => {
  const { data, error } = await supabase
    .from('order_events')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Get orders waiting for driver (for driver app)
export const getWaitingOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(id, name, phone, avatar_url)
    `)
    .eq('status', 'SEARCHING_DRIVER')
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) throw error;
  return data || [];
};
