import React from 'react';
import { motion } from 'framer-motion';
import { Star, Package, Clock, MapPin } from 'lucide-react';
import type { Driver } from '@/types';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DriverCardProps {
  driver: Driver;
  onClick?: () => void;
  className?: string;
}

export const DriverCard: React.FC<DriverCardProps> = ({
  driver,
  onClick,
  className,
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTimeAgo = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return d.toLocaleDateString('id-ID');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-5 border border-gray-100',
        'shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={driver.avatar || driver.avatar_url || ''} alt={driver.name} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
              {getInitials(driver.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{driver.name}</h3>
            <p className="text-sm text-gray-500">{driver.vehicleType || driver.vehicle_type || '-'} • {driver.vehiclePlate || driver.vehicle_plate || '-'}</p>
          </div>
        </div>
        <StatusBadge 
          status={driver.status} 
          size="sm" 
          pulse={driver.status === 'ONLINE'} 
        />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-gray-900">{driver.rating}</span>
          </div>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-gray-900">{driver.totalOrders || driver.total_orders || 0}</span>
          </div>
          <p className="text-xs text-gray-500">Order</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-gray-900">{getTimeAgo(driver.lastActive || driver.last_active)}</span>
          </div>
          <p className="text-xs text-gray-500">Aktif</p>
        </div>
      </div>
      
      {/* Current Order */}
      {(driver.currentOrderId || driver.current_order_id) && (
        <div className="p-3 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-700">
              Sedang menangani order: {driver.currentOrderId || driver.current_order_id}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DriverCard;
