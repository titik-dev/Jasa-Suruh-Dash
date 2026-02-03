import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Calendar } from 'lucide-react';
import type { Order } from '@/types';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  className?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onClick,
  className,
}) => {
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Safe access helpers
  const orderId = order.orderId || order.order_id || '-';
  const serviceName = order.serviceName || order.service_name || '-';
  const pickupAddress = order.pickup?.address || order.pickup_address || '-';
  const dropoffAddress = order.dropoff?.address || order.dropoff_address || '-';
  const createdAt = order.createdAt || order.created_at;
  const estimatedTime = order.estimatedTime || (order.estimated_time_min && order.estimated_time_max 
    ? { min: order.estimated_time_min, max: order.estimated_time_max } 
    : undefined);
  const estimatedFee = order.estimatedFee || (order.estimated_fee_min !== undefined && order.estimated_fee_max !== undefined
    ? { min: order.estimated_fee_min, max: order.estimated_fee_max }
    : undefined);
  const finalFee = order.finalFee || order.final_fee;

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-5 border border-gray-100',
        'shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">{orderId}</p>
          <h3 className="font-semibold text-gray-900">{serviceName}</h3>
        </div>
        <StatusBadge 
          status={order.status} 
          size="sm" 
          pulse={order.status === 'SEARCHING_DRIVER'} 
        />
      </div>
      
      {/* Route */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Navigation className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="text-gray-700 truncate">{pickupAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-gray-700 truncate">{dropoffAddress}</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(createdAt)}</span>
          </div>
          {estimatedTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>~{estimatedTime.min}-{estimatedTime.max} menit</span>
            </div>
          )}
        </div>
        
        <div className="text-right">
          {finalFee ? (
            <span className="font-semibold text-gray-900">
              {formatCurrency(finalFee)}
            </span>
          ) : estimatedFee ? (
            <span className="font-semibold text-gray-900">
              {formatCurrency(estimatedFee.min)} - {formatCurrency(estimatedFee.max)}
            </span>
          ) : (
            <span className="font-semibold text-gray-900">-</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;
