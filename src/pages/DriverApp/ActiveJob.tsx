import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Package,
  Clock,
  AlertCircle,
  Shield,
  ArrowRight,
  User,
  Banknote,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

// Mock active order data
const mockActiveOrder = {
  id: 'ord-001',
  orderId: 'JSG-20260130-001',
  status: 'DRIVER_TO_PICKUP' as OrderStatus,
  user: {
    name: 'Ahmad Fauzi',
    phone: '081298765432',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
  },
  pickup: {
    address: 'Jl. MT Haryono No. 123, Wonosari',
    landmark: 'Rumah cat kuning, depan warung Pak Slamet',
  },
  dropoff: {
    address: 'Jl. Sudirman No. 45, Playen',
    landmark: 'Kantor Pos Playen, sebelah bank BRI',
  },
  notes: 'Paket berisi dokumen penting, jangan ditekuk. Hati-hati saat mengantar.',
  requiresPin: true,
  pin: '4521',
  estimatedFee: 30000,
  createdAt: new Date(Date.now() - 600000),
};

interface StatusStep {
  status: OrderStatus;
  label: string;
  description: string;
  actionLabel: string;
  icon: React.ElementType;
  color: string;
}

const statusSteps: StatusStep[] = [
  {
    status: 'ASSIGNED',
    label: 'Order Diterima',
    description: 'Menuju lokasi pickup',
    actionLabel: 'Menuju Pickup',
    icon: Navigation,
    color: 'blue',
  },
  {
    status: 'DRIVER_TO_PICKUP',
    label: 'Menuju Pickup',
    description: 'Sampai di lokasi pickup',
    actionLabel: 'Sampai di Pickup',
    icon: MapPin,
    color: 'green',
  },
  {
    status: 'IN_PROGRESS',
    label: 'Sampai di Pickup',
    description: 'Mulai mengerjakan tugas',
    actionLabel: 'Mulai Tugas',
    icon: Package,
    color: 'blue',
  },
  {
    status: 'DRIVER_TO_DROPOFF',
    label: 'Dalam Perjalanan',
    description: 'Mengantar ke dropoff',
    actionLabel: 'Selesai',
    icon: CheckCircle2,
    color: 'green',
  },
];

export const ActiveJob: React.FC = () => {
  const { setCurrentPage, updateOrderStatus } = useApp();
  const [order, setOrder] = useState(mockActiveOrder);
  const [pin, setPin] = useState('');
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);
  const currentStep = statusSteps[currentStepIndex];
  const isLastStep = currentStepIndex === statusSteps.length - 1;

  const handleStatusUpdate = async () => {
    if (isLastStep) {
      if (order.requiresPin) {
        setShowCompleteDialog(true);
      } else {
        await completeOrder();
      }
    } else {
      setIsUpdating(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const nextStatus = statusSteps[currentStepIndex + 1].status;
      setOrder(prev => ({ ...prev, status: nextStatus }));
      updateOrderStatus(order.id, nextStatus);
      setIsUpdating(false);
    }
  };

  const completeOrder = async () => {
    setIsUpdating(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setOrder(prev => ({ ...prev, status: 'COMPLETED' }));
    updateOrderStatus(order.id, 'COMPLETED');
    setShowCompleteDialog(false);
    setShowSuccessDialog(true);
    setIsUpdating(false);
  };

  const handleCompleteWithPin = async () => {
    if (pin === order.pin) {
      await completeOrder();
    } else {
      alert('PIN tidak valid. Pastikan Anda memasukkan PIN yang benar dari pelanggan.');
    }
  };

  const handleCopyPin = () => {
    if (order.pin) {
      navigator.clipboard.writeText(order.pin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('driver-home')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900">Order Aktif</h1>
              <p className="text-sm text-gray-500">{order.orderId}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Status Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Status Order</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / statusSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: isActive ? '#2563EB' : '#F3F4F6',
                        scale: isCurrent ? 1.1 : 1,
                      }}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center z-10',
                        isActive ? 'shadow-lg shadow-blue-200' : ''
                      )}
                    >
                      {isActive ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                      )}
                    </motion.div>
                    <span className={cn(
                      'text-xs mt-2 font-medium text-center max-w-[70px]',
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Current Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'rounded-2xl p-5 text-white',
            order.status === 'COMPLETED' ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'
          )}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              {order.status === 'COMPLETED' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <currentStep.icon className="w-7 h-7" />
              )}
            </div>
            <div>
              <p className="text-white/80 text-sm">Status Saat Ini</p>
              <h2 className="text-xl font-bold">
                {order.status === 'COMPLETED' ? 'Order Selesai!' : currentStep?.label}
              </h2>
              {order.status !== 'COMPLETED' && (
                <p className="text-sm text-blue-100 mt-0.5">{currentStep?.description}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Customer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Info Pelanggan
          </h2>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-blue-100">
              <AvatarImage src={order.user.avatar} alt={order.user.name} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-lg">
                {order.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{order.user.name}</h3>
              <p className="text-sm text-gray-500">Pelanggan</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Order {formatTime(order.createdAt)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <a 
                href={`https://wa.me/${order.user.phone}`}
                className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
              </a>
              <a 
                href={`tel:${order.user.phone}`}
                className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <Phone className="w-5 h-5 text-blue-600" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* PIN Display (if required) */}
        {order.requiresPin && order.pin && order.status !== 'COMPLETED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                PIN Serah-Terima
              </h3>
              <button
                onClick={handleCopyPin}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                {copiedPin ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-purple-100 text-sm mb-4">
              Berikan PIN ini ke pelanggan saat serah-terima
            </p>
            <div className="flex items-center justify-center gap-3">
              {order.pin.split('').map((digit, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                  className="w-14 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-3xl font-bold text-purple-600">{digit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Route Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Detail Rute
          </h2>
          <div className="space-y-4">
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Navigation className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">Pickup</p>
                <p className="font-medium text-gray-900">{order.pickup.address}</p>
                {order.pickup.landmark && (
                  <p className="text-sm text-gray-500 mt-0.5">{order.pickup.landmark}</p>
                )}
              </div>
            </div>

            {/* Connector */}
            <div className="flex items-center gap-3 ml-5">
              <div className="w-0.5 h-8 bg-gray-200" />
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Dropoff */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">Dropoff</p>
                <p className="font-medium text-gray-900">{order.dropoff.address}</p>
                {order.dropoff.landmark && (
                  <p className="text-sm text-gray-500 mt-0.5">{order.dropoff.landmark}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notes */}
        {order.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-amber-50 rounded-2xl p-5 border border-amber-100"
          >
            <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Catatan Pelanggan
            </h3>
            <p className="text-amber-800">{order.notes}</p>
          </motion.div>
        )}

        {/* Fee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="w-6 h-6 text-green-600" />
              <span className="text-gray-700 font-medium">Fee yang akan didapat</span>
            </div>
            <span className="text-2xl font-bold text-green-700">
              {formatCurrency(order.estimatedFee)}
            </span>
          </div>
        </motion.div>

        {/* Action Button */}
        {order.status !== 'COMPLETED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className={cn(
                'w-full h-16 text-white text-lg font-semibold rounded-2xl shadow-lg transition-all',
                isLastStep 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              )}
            >
              {isUpdating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <currentStep.icon className="w-6 h-6 mr-2" />
                  {currentStep.actionLabel}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Complete Dialog with PIN */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Konfirmasi Selesai</DialogTitle>
            <DialogDescription className="text-center">
              Masukkan PIN dari pelanggan untuk menyelesaikan order
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex justify-center gap-3 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'w-14 h-16 rounded-xl flex items-center justify-center text-2xl font-bold transition-all',
                    pin[i] 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
                      : 'bg-gray-100 text-gray-400'
                  )}
                >
                  {pin[i] || '•'}
                </div>
              ))}
            </div>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Masukkan 4 digit PIN"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(value);
              }}
              className="text-center text-xl tracking-[1em] h-14"
              autoFocus
            />
            <p className="text-sm text-gray-500 text-center mt-3">
              Minta PIN dari pelanggan saat serah-terima barang
            </p>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCompleteDialog(false);
                setPin('');
              }}
              className="flex-1 h-12"
            >
              Batal
            </Button>
            <Button
              onClick={handleCompleteWithPin}
              disabled={pin.length !== 4 || isUpdating}
              className="flex-1 h-12 bg-green-500 hover:bg-green-600"
            >
              {isUpdating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Selesai
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>
            <DialogTitle className="text-2xl">Order Selesai!</DialogTitle>
            <DialogDescription className="text-base">
              Terima kasih telah menyelesaikan order dengan baik.
              <br />
              <span className="font-semibold text-green-600 text-lg mt-2 block">
                +{formatCurrency(order.estimatedFee)}
              </span>
              <span className="text-sm text-gray-500">telah ditambahkan ke saldo Anda</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-center mt-4">
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                setCurrentPage('driver-home');
              }}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-lg font-semibold"
            >
              Kembali ke Beranda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveJob;
