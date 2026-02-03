import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Package, ArrowRight, Banknote } from 'lucide-react';
import type { Offer } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OfferCardProps {
  offer: Offer;
  onAccept: () => void;
  onDecline: () => void;
  className?: string;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onAccept,
  onDecline,
  className,
}) => {
  const [ttl, setTtl] = useState(offer.ttl);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTtl(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [offer.id]);
  
  const ttlProgress = (ttl / offer.ttl) * 100;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        'bg-white rounded-2xl shadow-xl overflow-hidden',
        'border border-gray-100',
        className
      )}
    >
      {/* TTL Progress Bar */}
      <div className="relative h-1.5 bg-gray-100">
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 transition-all duration-1000 ease-linear',
            ttlProgress > 50 ? 'bg-green-500' : ttlProgress > 25 ? 'bg-yellow-500' : 'bg-red-500'
          )}
          style={{ width: `${ttlProgress}%` }}
        />
      </div>
      
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">{offer.serviceName}</span>
          </div>
          <span className={cn(
            'text-sm font-medium',
            ttl > 10 ? 'text-green-600' : 'text-red-600'
          )}>
            {ttl}s
          </span>
        </div>
        
        {/* Route */}
        <div className="space-y-3 mb-5">
          {/* Pickup */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Navigation className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Pickup</p>
              <p className="text-sm font-medium text-gray-900 truncate">{offer.pickup.address}</p>
              {offer.pickup.landmark && (
                <p className="text-xs text-gray-500">{offer.pickup.landmark}</p>
              )}
            </div>
          </div>
          
          {/* Connector */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 flex justify-center">
              <div className="w-0.5 h-6 bg-gray-200" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          
          {/* Dropoff */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Dropoff</p>
              <p className="text-sm font-medium text-gray-900 truncate">{offer.dropoff.address}</p>
              {offer.dropoff.landmark && (
                <p className="text-xs text-gray-500">{offer.dropoff.landmark}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Details */}
        <div className="flex items-center gap-4 mb-5 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Navigation className="w-4 h-4" />
            <span>{offer.distance} km</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>~{offer.estimatedTime} menit</span>
          </div>
        </div>
        
        {/* Fee */}
        <div className="flex items-center gap-2 mb-5 p-3 bg-green-50 rounded-xl">
          <Banknote className="w-5 h-5 text-green-600" />
          <span className="text-2xl font-bold text-green-700">
            {formatCurrency(offer.estimatedFee)}
          </span>
        </div>
        
        {/* Notes */}
        {offer.notes && (
          <div className="mb-5 p-3 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Catatan:</span> {offer.notes}
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 text-gray-700 border-gray-300 hover:bg-gray-50"
            onClick={onDecline}
          >
            Tolak
          </Button>
          <Button
            className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={onAccept}
          >
            Terima
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default OfferCard;
