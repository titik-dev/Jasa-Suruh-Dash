import React from 'react';
import type { OrderStatus, DriverStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus | DriverStatus;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; icon: string }> = {
  // Order Statuses
  CREATED: { label: 'Dibuat', bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: 'file' },
  SEARCHING_DRIVER: { label: 'Mencari Driver', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: 'search' },
  ASSIGNED: { label: 'Driver Ditemukan', bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: 'user' },
  DRIVER_TO_PICKUP: { label: 'Menuju Pickup', bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: 'navigation' },
  IN_PROGRESS: { label: 'Dalam Proses', bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: 'loader' },
  DRIVER_TO_DROPOFF: { label: 'Menuju Dropoff', bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: 'map-pin' },
  COMPLETED: { label: 'Selesai', bgColor: 'bg-green-100', textColor: 'text-green-700', icon: 'check' },
  CANCELED: { label: 'Dibatalkan', bgColor: 'bg-red-100', textColor: 'text-red-700', icon: 'x' },
  // Driver Statuses
  ONLINE: { label: 'Online', bgColor: 'bg-green-100', textColor: 'text-green-700', icon: 'wifi' },
  OFFLINE: { label: 'Offline', bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: 'wifi-off' },
  BUSY: { label: 'Sibuk', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: 'clock' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  pulse = false,
  className 
}) => {
  const config = statusConfig[status] || statusConfig.CREATED;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        config.bgColor,
        config.textColor,
        sizeClasses[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', config.textColor.replace('text-', 'bg-'))} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
