import React from 'react';
import { motion } from 'framer-motion';
import type { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Search, 
  UserCheck, 
  Navigation, 
  Loader2, 
  MapPin, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: OrderStatus;
  className?: string;
}

const statusFlow: OrderStatus[] = [
  'CREATED',
  'SEARCHING_DRIVER',
  'ASSIGNED',
  'DRIVER_TO_PICKUP',
  'IN_PROGRESS',
  'DRIVER_TO_DROPOFF',
  'COMPLETED',
];

const statusConfig: Record<OrderStatus, { label: string; description: string; icon: React.ElementType }> = {
  CREATED: {
    label: 'Order Dibuat',
    description: 'Menunggu konfirmasi',
    icon: FileText,
  },
  SEARCHING_DRIVER: {
    label: 'Mencari Driver',
    description: 'Sedang mencari driver terdekat',
    icon: Search,
  },
  ASSIGNED: {
    label: 'Driver Ditemukan',
    description: 'Driver telah menerima order',
    icon: UserCheck,
  },
  DRIVER_TO_PICKUP: {
    label: 'Menuju Lokasi',
    description: 'Driver sedang menuju lokasi pickup',
    icon: Navigation,
  },
  IN_PROGRESS: {
    label: 'Dalam Proses',
    description: 'Tugas sedang dikerjakan',
    icon: Loader2,
  },
  DRIVER_TO_DROPOFF: {
    label: 'Menuju Dropoff',
    description: 'Mengantar ke lokasi tujuan',
    icon: MapPin,
  },
  COMPLETED: {
    label: 'Selesai',
    description: 'Order telah selesai',
    icon: CheckCircle2,
  },
  CANCELED: {
    label: 'Dibatalkan',
    description: 'Order dibatalkan',
    icon: XCircle,
  },
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ 
  currentStatus, 
  className 
}) => {
  const isCanceled = currentStatus === 'CANCELED';
  
  // If canceled, show all steps as inactive except CREATED
  const getStatusIndex = (status: OrderStatus) => {
    if (isCanceled) return -1;
    return statusFlow.indexOf(status);
  };
  
  const currentIndex = getStatusIndex(currentStatus);
  
  // Filter to only show relevant statuses up to current
  const relevantStatuses = isCanceled 
    ? ['CREATED', 'CANCELED'] as OrderStatus[]
    : statusFlow.filter((_, idx) => idx <= currentIndex || idx <= 3);

  return (
    <div className={cn('space-y-0', className)}>
      {relevantStatuses.map((status, index) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const statusIndex = getStatusIndex(status);
        const isActive = statusIndex === currentIndex;
        const isPast = statusIndex < currentIndex;
        const isLast = index === relevantStatuses.length - 1;
        
        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex gap-4"
          >
            {/* Connector Line */}
            {!isLast && (
              <div 
                className={cn(
                  'absolute left-5 top-10 w-0.5 h-full -ml-px',
                  isPast ? 'bg-blue-500' : 'bg-gray-200'
                )}
              />
            )}
            
            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                'transition-all duration-300',
                isActive && !isCanceled && 'bg-blue-500 text-white shadow-lg shadow-blue-200',
                isPast && !isCanceled && 'bg-blue-500 text-white',
                !isActive && !isPast && !isCanceled && 'bg-gray-100 text-gray-400',
                isCanceled && status === 'CANCELED' && 'bg-red-500 text-white shadow-lg shadow-red-200',
                isCanceled && status === 'CREATED' && 'bg-gray-100 text-gray-400'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && Icon === Loader2 && 'animate-spin')} />
              
              {/* Pulse effect for active status */}
              {isActive && !isCanceled && (
                <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-30" />
              )}
            </div>
            
            {/* Content */}
            <div className={cn('pb-8', isLast && 'pb-0')}>
              <h4
                className={cn(
                  'font-semibold text-sm',
                  isActive && !isCanceled && 'text-blue-700',
                  isPast && !isCanceled && 'text-blue-600',
                  !isActive && !isPast && !isCanceled && 'text-gray-500',
                  isCanceled && status === 'CANCELED' && 'text-red-700',
                  isCanceled && status === 'CREATED' && 'text-gray-500'
                )}
              >
                {config.label}
              </h4>
              <p
                className={cn(
                  'text-sm mt-0.5',
                  isActive && !isCanceled && 'text-blue-600',
                  isPast && !isCanceled && 'text-blue-500',
                  !isActive && !isPast && !isCanceled && 'text-gray-400',
                  isCanceled && status === 'CANCELED' && 'text-red-600',
                  isCanceled && status === 'CREATED' && 'text-gray-400'
                )}
              >
                {config.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
