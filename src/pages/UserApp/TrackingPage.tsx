import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Phone, MessageCircle, Copy, Check, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusTimeline, StatusBadge } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MapTracking from '@/components/map/MapTracking';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const TrackingPage: React.FC = () => {
  const { currentOrder, setCurrentPage, cancelOrder } = useApp();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // Use a mock order if no current order
  const order = currentOrder || {
    id: 'ord-001',
    orderId: 'JSG-20260130-001',
    status: 'DRIVER_TO_PICKUP',
    driver: {
      name: 'Mas Adi',
      phone: '081234567891',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adi',
      rating: 4.9,
      vehicleType: 'Motor',
      vehiclePlate: 'AB 5678 ZZ',
    },
    pickup: {
      address: 'Jl. MT Haryono No. 123, Wonosari',
      landmark: 'Rumah cat kuning',
      lat: -7.965,
      lng: 110.601,
    },
    dropoff: {
      address: 'Jl. Sudirman No. 45, Playen',
      landmark: 'Kantor Pos Playen',
      lat: -7.93,
      lng: 110.55,
    },
    estimatedFee: { min: 25000, max: 35000 },
    estimatedTime: { min: 30, max: 45 },
    requiresPin: true,
    pin: '4521',
    createdAt: new Date(),
  };

  const rawOrder = order as any;
  const pickup = order.pickup || (rawOrder.pickup_address
    ? { lat: rawOrder.pickup_lat, lng: rawOrder.pickup_lng }
    : undefined);
  const dropoff = order.dropoff || (rawOrder.dropoff_address
    ? { lat: rawOrder.dropoff_lat, lng: rawOrder.dropoff_lng }
    : undefined);

  const handleCopyPin = () => {
    if (order.pin) {
      navigator.clipboard.writeText(order.pin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handleCancel = () => {
    cancelOrder(order.id, 'user_cancel_driver_otw');
    setShowCancelDialog(false);
    setCurrentPage('home');
  };

  const getCancelFee = () => {
    if (order.status === 'SEARCHING_DRIVER' || order.status === 'CREATED') {
      return 0;
    }
    if (order.status === 'ASSIGNED') {
      return 5000;
    }
    return 10000;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage('home')}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="font-semibold text-gray-900">Tracking Order</h1>
                <p className="text-sm text-gray-500">{order.orderId}</p>
              </div>
            </div>
            <StatusBadge 
              status={order.status} 
              size="sm" 
              pulse={order.status === 'SEARCHING_DRIVER'} 
            />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* ETA Card */}
        {order.status !== 'COMPLETED' && order.status !== 'CANCELED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500 rounded-2xl p-5 text-white"
          >
            <p className="text-blue-100 text-sm mb-1">Estimasi waktu tiba</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {order.estimatedTime?.min}-{order.estimatedTime?.max}
              </span>
              <span className="text-blue-100">menit</span>
            </div>
          </motion.div>
        )}

        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Status Order</h2>
          <StatusTimeline currentStatus={order.status} />
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Peta Rute</h2>
          <MapTracking
            pickup={pickup}
            dropoff={dropoff}
          />
        </motion.div>

        {/* Driver Info */}
        {order.driver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 border border-gray-100"
          >
            <h2 className="font-semibold text-gray-900 mb-4">Info Driver</h2>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-blue-100">
                <AvatarImage src={order.driver.avatar} alt={order.driver.name} />
                <AvatarFallback className="bg-blue-500 text-white text-lg font-semibold">
                  {order.driver.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{order.driver.name}</h3>
                <p className="text-sm text-gray-500">{order.driver.vehicleType} • {order.driver.vehiclePlate}</p>
                <div className="flex items-center gap-1 mt-1">
                  <svg className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{order.driver.rating}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </button>
                <a 
                  href={`tel:${order.driver.phone}`}
                  className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <Phone className="w-5 h-5 text-blue-600" />
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* PIN Serah-Terima */}
        {order.requiresPin && order.pin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">PIN Serah-Terima</h2>
              <button
                onClick={handleCopyPin}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                {copiedPin ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-purple-100 text-sm mb-3">
              Berikan PIN ini ke driver saat serah-terima
            </p>
            <div className="flex items-center justify-center gap-3">
              {order.pin.split('').map((digit, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="w-14 h-16 bg-white rounded-xl flex items-center justify-center"
                >
                  <span className="text-3xl font-bold text-purple-600">{digit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Detail Order</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pickup</p>
              <p className="font-medium text-gray-900">{order.pickup.address}</p>
              {order.pickup.landmark && (
                <p className="text-sm text-gray-500 mt-0.5">{order.pickup.landmark}</p>
              )}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dropoff</p>
              <p className="font-medium text-gray-900">{order.dropoff.address}</p>
              {order.dropoff.landmark && (
                <p className="text-sm text-gray-500 mt-0.5">{order.dropoff.landmark}</p>
              )}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estimasi Biaya</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(order.estimatedFee?.min || 0)} - {formatCurrency(order.estimatedFee?.max || 0)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cancel Button */}
        {order.status !== 'COMPLETED' && order.status !== 'CANCELED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => setShowCancelDialog(true)}
              className="w-full py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors"
            >
              Batalkan Order
            </button>
          </motion.div>
        )}
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Batalkan Order?
            </DialogTitle>
            <DialogDescription>
              {getCancelFee() > 0 ? (
                <>
                  Pembatalan saat ini akan dikenakan biaya{' '}
                  <span className="font-semibold text-red-600">{formatCurrency(getCancelFee())}</span>
                  {' '}sebagai kompensasi untuk driver.
                </>
              ) : (
                'Anda dapat membatalkan order ini tanpa biaya.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Kembali
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
            >
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrackingPage;
