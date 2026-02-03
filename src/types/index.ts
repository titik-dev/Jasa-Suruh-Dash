// Order Status Flow
export type OrderStatus =
  | 'CREATED'
  | 'SEARCHING_DRIVER'
  | 'ASSIGNED'
  | 'DRIVER_TO_PICKUP'
  | 'IN_PROGRESS'
  | 'DRIVER_TO_DROPOFF'
  | 'COMPLETED'
  | 'CANCELED';

// Service Types
export type ServiceType =
  | 'antar-barang'
  | 'belanja-titip'
  | 'ambil-dokumen'
  | 'lainnya';

// Driver Status
export type DriverStatus = 'ONLINE' | 'OFFLINE' | 'BUSY';

// Cancel Reasons
export type CancelReason =
  | 'user_cancel_before_assigned'
  | 'user_cancel_after_assigned'
  | 'user_cancel_driver_otw'
  | 'driver_decline'
  | 'driver_no_show'
  | 'user_no_show'
  | 'other';

// Location
export interface Location {
  address: string;
  lat: number;
  lng: number;
  landmark?: string;
}

// Service
export interface Service {
  id: ServiceType;
  name: string;
  icon: string;
  description: string;
  requiresPin: boolean;
}

// Driver - flexible type that works with both snake_case and camelCase
export interface Driver {
  id: string;
  phone: string;
  name: string;
  email?: string;
  avatar_url?: string;
  avatar?: string;
  status: DriverStatus;
  rating: number;
  total_orders?: number;
  totalOrders?: number;
  current_order_id?: string;
  currentOrderId?: string;
  last_active?: Date | string;
  lastActive?: Date;
  vehicle_type?: string;
  vehicleType?: string;
  vehicle_plate?: string;
  vehiclePlate?: string;
  license_number?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Order - flexible type that works with both snake_case and camelCase
export interface Order {
  id: string;
  order_id: string;
  orderId?: string;
  user_id: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  driver_id?: string;
  driverId?: string;
  driver?: Driver;
  service_type: ServiceType;
  serviceType?: ServiceType;
  service_name: string;
  serviceName?: string;
  status: OrderStatus;
  pickup?: Location;
  dropoff?: Location;
  pickup_address?: string;
  pickup_landmark?: string;
  dropoff_address?: string;
  dropoff_landmark?: string;
  notes?: string;
  item_size?: 'kecil' | 'sedang' | 'besar';
  itemSize?: 'kecil' | 'sedang' | 'besar';
  who_pays?: 'user' | 'driver';
  whoPays?: 'user' | 'driver';
  requires_pin?: boolean;
  requiresPin?: boolean;
  pin?: string;
  estimated_fee_min: number;
  estimated_fee_max: number;
  estimatedFee?: { min: number; max: number };
  final_fee?: number;
  finalFee?: number;
  estimated_time_min?: number;
  estimated_time_max?: number;
  estimatedTime?: { min: number; max: number };
  created_at: Date | string;
  createdAt?: Date;
  assigned_at?: Date | string;
  started_at?: Date | string;
  completed_at?: Date | string;
  canceled_at?: Date | string;
  is_subscription?: boolean;
  isSubscription?: boolean;
  subscription_frequency?: 'daily' | 'weekly' | 'monthly';
  cancel_reason?: CancelReason;
}

// Order Event (Audit Trail)
export interface OrderEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  created_at: Date;
  actor: 'system' | 'user' | 'driver' | 'admin';
  actor_id?: string;
  notes?: string;
}

// Offer (for Driver App)
export interface Offer {
  id: string;
  orderId: string;
  pickup: Location;
  dropoff: Location;
  serviceType: ServiceType;
  serviceName: string;
  estimatedFee: number;
  distance: number;
  estimatedTime: number;
  notes?: string;
  ttl: number;
  createdAt: Date;
}

// User - flexible type that works with both snake_case and camelCase
export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  avatar_url?: string;
  avatar?: string;
  default_pickup?: Location;
  defaultPickup?: Location;
  points?: number;
  created_at?: Date | string;
  memberSince?: Date;
}

// App Mode
export type AppMode = 'user' | 'driver' | 'admin';

// Navigation Item
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}
