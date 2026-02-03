import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, FileText, MoreHorizontal } from 'lucide-react';
import type { ServiceType } from '@/types';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  type: ServiceType;
  name: string;
  description: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const iconMap: Record<ServiceType, React.ElementType> = {
  'antar-barang': Package,
  'belanja-titip': ShoppingCart,
  'ambil-dokumen': FileText,
  'lainnya': MoreHorizontal,
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  type,
  name,
  description,
  selected = false,
  onClick,
  className,
}) => {
  const Icon = iconMap[type];
  
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative w-full p-5 rounded-2xl text-left transition-all duration-300',
        'border-2 focus:outline-none focus:ring-4 focus:ring-blue-100',
        selected 
          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100' 
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md',
        className
      )}
    >
      {/* Selected Indicator */}
      {selected && (
        <motion.div
          layoutId="selectedIndicator"
          className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
      
      {/* Icon */}
      <div
        className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
          selected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
        )}
      >
        <Icon className="w-7 h-7" />
      </div>
      
      {/* Content */}
      <h3 className={cn(
        'font-semibold text-lg mb-1',
        selected ? 'text-blue-900' : 'text-gray-900'
      )}>
        {name}
      </h3>
      <p className={cn(
        'text-sm leading-relaxed',
        selected ? 'text-blue-600' : 'text-gray-500'
      )}>
        {description}
      </p>
    </motion.button>
  );
};

export default ServiceCard;
