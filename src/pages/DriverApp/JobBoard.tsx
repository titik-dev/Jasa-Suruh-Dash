import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  RefreshCw, 
  Inbox, 
  MapPin, 
  Navigation, 
  Clock, 
  Package,
  Banknote,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Offer } from '@/types';

// Generate more realistic offers
const generateOffers = (): Offer[] => [
  {
    id: 'off-001',
    orderId: 'ord-002',
    pickup: {
      address: 'Pasar Wonosari, Jl. A. Yani',
      lat: -7.968,
      lng: 110.603,
      landmark: 'Pintu masuk utama, dekat toilet',
    },
    dropoff: {
      address: 'Jl. Pemuda No. 78, Wonosari',
      lat: -7.962,
      lng: 110.598,
      landmark: 'Rumah pagar hijau, depan mushola',
    },
    serviceType: 'belanja-titip',
    serviceName: 'Belanja Titip',
    estimatedFee: 18000,
    distance: 2.5,
    estimatedTime: 35,
    notes: 'Beli 1kg beras premium, 1L minyak goreng Bimoli, 5 bungkus mie instan Indomie goreng. Total belanja sekitar 75rb.',
    ttl: 25,
    createdAt: new Date(),
  },
  {
    id: 'off-002',
    orderId: 'ord-006',
    pickup: {
      address: 'Kantor Camat Wonosari',
      lat: -7.965,
      lng: 110.595,
      landmark: 'Meja informasi lantai 1',
    },
    dropoff: {
      address: 'Jl. Ahmad Yani No. 67, Wonosari',
      lat: -7.97,
      lng: 110.605,
      landmark: 'Rumah cat biru, pager putih',
    },
    serviceType: 'antar-barang',
    serviceName: 'Antar Barang',
    estimatedFee: 22000,
    distance: 3.2,
    estimatedTime: 25,
    notes: 'Paket dokumen penting, ukuran A4 envelope. Jangan ditekuk dan hati-hati.',
    ttl: 30,
    createdAt: new Date(),
  },
  {
    id: 'off-003',
    orderId: 'ord-007',
    pickup: {
      address: 'Kantor Desa Semanu',
      lat: -8.02,
      lng: 110.55,
      landmark: 'Bagian umum, meja depan',
    },
    dropoff: {
      address: 'Jl. Pahlawan No. 12, Wonosari',
      lat: -7.965,
      lng: 110.595,
      landmark: 'Rumah tembok batu, pager hitam',
    },
    serviceType: 'ambil-dokumen',
    serviceName: 'Ambil Dokumen',
    estimatedFee: 35000,
    distance: 8.5,
    estimatedTime: 55,
    notes: 'Ambil surat keterangan domisili atas nama Bapak Sujono. Bawa KTP untuk verifikasi.',
    ttl: 30,
    createdAt: new Date(),
  },
];

export const JobBoard: React.FC = () => {
  const { setCurrentPage, acceptOffer, declineOffer, updateOrderStatus } = useApp();
  const [offers, setOffers] = useState<Offer[]>(generateOffers());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [action, setAction] = useState<'idle' | 'accepting' | 'declining'>('idle');

  const currentOffer = offers[currentIndex];
  const hasMoreOffers = currentIndex < offers.length - 1;

  // Auto-refresh offers when empty
  useEffect(() => {
    if (offers.length === 0 && !isRefreshing) {
      const timer = setTimeout(() => {
        handleRefresh();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [offers.length, isRefreshing]);

  const handleAccept = async () => {
    if (!currentOffer || action !== 'idle') return;
    
    setAction('accepting');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    acceptOffer(currentOffer.id);
    updateOrderStatus(currentOffer.orderId, 'ASSIGNED');
    
    // Remove current offer and move to next
    setOffers(prev => prev.filter((_, i) => i !== currentIndex));
    setAction('idle');
    
    // Navigate to active job
    setCurrentPage('active-job');
  };

  const handleDecline = async () => {
    if (!currentOffer || action !== 'idle') return;
    
    setAction('declining');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    declineOffer(currentOffer.id);
    
    if (hasMoreOffers) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setOffers(prev => prev.filter((_, i) => i !== currentIndex));
    }
    
    setAction('idle');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setOffers(generateOffers());
    setCurrentIndex(0);
    setIsRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage('driver-home')}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="font-bold text-gray-900">Order Tersedia</h1>
                <p className="text-sm text-gray-500">
                  {offers.length > 0 
                    ? `Order ${currentIndex + 1} dari ${offers.length}` 
                    : 'Tidak ada order'}
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-5 h-5 text-gray-600', isRefreshing && 'animate-spin')} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {currentOffer ? (
            <motion.div
              key={currentOffer.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="space-y-4"
            >
              {/* TTL Progress Bar */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="relative h-2 bg-gray-100">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: currentOffer.ttl, ease: 'linear' }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400"
                  />
                </div>
                
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">{currentOffer.serviceName}</h2>
                        <p className="text-sm text-gray-500">{currentOffer.orderId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Berakhir dalam</p>
                      <p className="font-bold text-green-600">{currentOffer.ttl}s</p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="space-y-4 mb-5">
                    {/* Pickup */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Navigation className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Pickup</p>
                        <p className="font-medium text-gray-900">{currentOffer.pickup.address}</p>
                        {currentOffer.pickup.landmark && (
                          <p className="text-sm text-gray-500 mt-0.5">{currentOffer.pickup.landmark}</p>
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
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Dropoff</p>
                        <p className="font-medium text-gray-900">{currentOffer.dropoff.address}</p>
                        {currentOffer.dropoff.landmark && (
                          <p className="text-sm text-gray-500 mt-0.5">{currentOffer.dropoff.landmark}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-6 mb-5 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-700">{currentOffer.distance} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-700">~{currentOffer.estimatedTime} menit</span>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl mb-5">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-6 h-6 text-green-600" />
                      <span className="text-gray-600">Fee yang didapat</span>
                    </div>
                    <span className="text-3xl font-bold text-green-700">
                      {formatCurrency(currentOffer.estimatedFee)}
                    </span>
                  </div>

                  {/* Notes */}
                  {currentOffer.notes && (
                    <div className="p-4 bg-amber-50 rounded-xl mb-5">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-900 mb-1">Catatan Pelanggan</p>
                          <p className="text-sm text-amber-800">{currentOffer.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-14 text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 font-semibold"
                      onClick={handleDecline}
                      disabled={action !== 'idle'}
                    >
                      {action === 'declining' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 mr-2" />
                          Tolak
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-1 h-14 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg"
                      onClick={handleAccept}
                      disabled={action !== 'idle'}
                    >
                      {action === 'accepting' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Terima
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-blue-50 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Terima order sebelum waktu habis. Jika Anda menolak, order akan ditawarkan ke driver lain.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Inbox className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tidak Ada Order
              </h3>
              <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                Saat ini tidak ada order yang tersedia di area Anda. Tetap online dan tunggu order masuk.
              </p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Cek Lagi
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JobBoard;
