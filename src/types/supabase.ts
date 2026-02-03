export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          name: string
          email: string | null
          avatar_url: string | null
          points: number
          default_pickup_address: string | null
          default_pickup_landmark: string | null
          default_pickup_lat: number | null
          default_pickup_lng: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          name: string
          email?: string | null
          avatar_url?: string | null
          points?: number
          default_pickup_address?: string | null
          default_pickup_landmark?: string | null
          default_pickup_lat?: number | null
          default_pickup_lng?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          name?: string
          email?: string | null
          avatar_url?: string | null
          points?: number
          default_pickup_address?: string | null
          default_pickup_landmark?: string | null
          default_pickup_lat?: number | null
          default_pickup_lng?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          phone: string
          name: string
          email: string | null
          avatar_url: string | null
          status: 'ONLINE' | 'OFFLINE' | 'BUSY'
          rating: number
          total_orders: number
          current_order_id: string | null
          last_active: string
          vehicle_type: string
          vehicle_plate: string
          license_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          name: string
          email?: string | null
          avatar_url?: string | null
          status?: 'ONLINE' | 'OFFLINE' | 'BUSY'
          rating?: number
          total_orders?: number
          current_order_id?: string | null
          last_active?: string
          vehicle_type: string
          vehicle_plate: string
          license_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          name?: string
          email?: string | null
          avatar_url?: string | null
          status?: 'ONLINE' | 'OFFLINE' | 'BUSY'
          rating?: number
          total_orders?: number
          current_order_id?: string | null
          last_active?: string
          vehicle_type?: string
          vehicle_plate?: string
          license_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_id: string
          user_id: string
          driver_id: string | null
          service_type: 'antar-barang' | 'belanja-titip' | 'ambil-dokumen' | 'lainnya'
          service_name: string
          status: 'CREATED' | 'SEARCHING_DRIVER' | 'ASSIGNED' | 'DRIVER_TO_PICKUP' | 'IN_PROGRESS' | 'DRIVER_TO_DROPOFF' | 'COMPLETED' | 'CANCELED'
          pickup_address: string
          pickup_landmark: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          dropoff_address: string
          dropoff_landmark: string | null
          dropoff_lat: number | null
          dropoff_lng: number | null
          notes: string | null
          item_size: 'kecil' | 'sedang' | 'besar'
          who_pays: 'user' | 'driver'
          requires_pin: boolean
          pin: string | null
          estimated_fee_min: number
          estimated_fee_max: number
          final_fee: number | null
          estimated_time_min: number
          estimated_time_max: number
          is_subscription: boolean
          subscription_frequency: 'daily' | 'weekly' | 'monthly' | null
          cancel_reason: string | null
          created_at: string
          assigned_at: string | null
          started_at: string | null
          completed_at: string | null
          canceled_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          driver_id?: string | null
          service_type: 'antar-barang' | 'belanja-titip' | 'ambil-dokumen' | 'lainnya'
          service_name: string
          status?: 'CREATED' | 'SEARCHING_DRIVER' | 'ASSIGNED' | 'DRIVER_TO_PICKUP' | 'IN_PROGRESS' | 'DRIVER_TO_DROPOFF' | 'COMPLETED' | 'CANCELED'
          pickup_address: string
          pickup_landmark?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          dropoff_address: string
          dropoff_landmark?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          notes?: string | null
          item_size?: 'kecil' | 'sedang' | 'besar'
          who_pays?: 'user' | 'driver'
          requires_pin?: boolean
          pin?: string | null
          estimated_fee_min: number
          estimated_fee_max: number
          final_fee?: number | null
          estimated_time_min?: number
          estimated_time_max?: number
          is_subscription?: boolean
          subscription_frequency?: 'daily' | 'weekly' | 'monthly' | null
          cancel_reason?: string | null
          created_at?: string
          assigned_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          canceled_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string
          driver_id?: string | null
          service_type?: 'antar-barang' | 'belanja-titip' | 'ambil-dokumen' | 'lainnya'
          service_name?: string
          status?: 'CREATED' | 'SEARCHING_DRIVER' | 'ASSIGNED' | 'DRIVER_TO_PICKUP' | 'IN_PROGRESS' | 'DRIVER_TO_DROPOFF' | 'COMPLETED' | 'CANCELED'
          pickup_address?: string
          pickup_landmark?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          dropoff_address?: string
          dropoff_landmark?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          notes?: string | null
          item_size?: 'kecil' | 'sedang' | 'besar'
          who_pays?: 'user' | 'driver'
          requires_pin?: boolean
          pin?: string | null
          estimated_fee_min?: number
          estimated_fee_max?: number
          final_fee?: number | null
          estimated_time_min?: number
          estimated_time_max?: number
          is_subscription?: boolean
          subscription_frequency?: 'daily' | 'weekly' | 'monthly' | null
          cancel_reason?: string | null
          created_at?: string
          assigned_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          canceled_at?: string | null
          updated_at?: string
        }
      }
      order_events: {
        Row: {
          id: string
          order_id: string
          status: string
          actor: 'system' | 'user' | 'driver' | 'admin'
          actor_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          actor?: 'system' | 'user' | 'driver' | 'admin'
          actor_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          actor?: 'system' | 'user' | 'driver' | 'admin'
          actor_id?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      driver_locations: {
        Row: {
          id: string
          driver_id: string
          lat: number
          lng: number
          accuracy: number | null
          created_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          lat: number
          lng: number
          accuracy?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          lat?: number
          lng?: number
          accuracy?: number | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          base_order_id: string
          frequency: 'daily' | 'weekly' | 'monthly'
          is_active: boolean
          next_delivery_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          base_order_id: string
          frequency: 'daily' | 'weekly' | 'monthly'
          is_active?: boolean
          next_delivery_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          base_order_id?: string
          frequency?: 'daily' | 'weekly' | 'monthly'
          is_active?: boolean
          next_delivery_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status: 'CREATED' | 'SEARCHING_DRIVER' | 'ASSIGNED' | 'DRIVER_TO_PICKUP' | 'IN_PROGRESS' | 'DRIVER_TO_DROPOFF' | 'COMPLETED' | 'CANCELED'
      service_type: 'antar-barang' | 'belanja-titip' | 'ambil-dokumen' | 'lainnya'
      driver_status: 'ONLINE' | 'OFFLINE' | 'BUSY'
      item_size: 'kecil' | 'sedang' | 'besar'
      subscription_frequency: 'daily' | 'weekly' | 'monthly'
    }
  }
}
