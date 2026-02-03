import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Real-time subscriptions
export const subscribeToOrders = (callback: (payload: any) => void) => {
  return supabase
    .channel('orders-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      callback
    )
    .subscribe();
};

export const subscribeToOrderEvents = (orderId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`order-events-${orderId}`)
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'order_events',
        filter: `order_id=eq.${orderId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToDrivers = (callback: (payload: any) => void) => {
  return supabase
    .channel('drivers-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'drivers' },
      callback
    )
    .subscribe();
};

