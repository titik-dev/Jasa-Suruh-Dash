import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Power, 
  Package, 
  Star, 
  MapPin, 
  ChevronRight,
  Wallet,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Bike
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Mock driver data
const currentDriver = {
  id: 'drv-001',
  name: 'Pak Budi Santoso',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
  rating: 4.8,
  totalOrders: 156,
  todayOrders: 3,
  todayEarnings: 85000,
  weeklyEarnings: 485000,
  memberSince: 'Januari 2024',
  vehicleType: 'Honda Beat',
  vehiclePlate: 'AB 1234 XY',
};

export const DriverHome: React.FC = () => {
  const { drivers, toggleDriverStatus, setCurrentPage, onlineDrivers } = useApp();
  const [isToggling, setIsToggling] = useState(false);
  
  // Get current driver from drivers array
  const driver = drivers.find(d => d.id === currentDriver.id);
  const isOnline = driver?.status === 'ONLINE';

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await toggleDriverStatus();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-14 h-14 border-2 border-white/30">
                <AvatarImage src={currentDriver.avatar} alt={currentDriver.name} />
                <AvatarFallback className="bg-white text-blue-600 font-semibold text-lg">
                  {currentDriver.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-blue-100 text-sm">{getGreeting()}</p>
                <h1 className="font-bold text-lg">{currentDriver.name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="font-semibold text-sm">{currentDriver.rating}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Online Toggle Card */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-2xl p-5 shadow-lg transition-all duration-500',
            isOnline 
              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-100'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={isOnline ? {
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center',
                  isOnline ? 'bg-white/20' : 'bg-gray-100'
                )}
              >
                <Power className={cn(
                  'w-7 h-7',
                  isOnline ? 'text-white' : 'text-gray-400'
                )} />
              </motion.div>
              <div>
                <h2 className={cn(
                  'text-2xl font-bold',
                  isOnline ? 'text-white' : 'text-gray-700'
                )}>
                  {isOnline ? 'Online' : 'Offline'}
                </h2>
                <p className={cn(
                  'text-sm',
                  isOnline ? 'text-green-100' : 'text-gray-500'
                )}>
                  {isOnline 
                    ? `${onlineDrivers.length} driver online di area ini` 
                    : 'Aktifkan untuk menerima order'}
                </p>
              </div>
            </div>
            <div className="relative">
              <Switch
                checked={isOnline}
                onCheckedChange={handleToggleStatus}
                disabled={isToggling}
                className={cn(
                  "scale-150",
                  isOnline ? "data-[state=checked]:bg-white" : ""
                )}
              />
              {isToggling && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Status indicator pulse */}
          <AnimatePresence>
            {isOnline && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/20"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <span className="text-sm text-white/90">Menunggu order masuk...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Today's Stats */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Performa Hari Ini</h2>
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Order Hari Ini</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{currentDriver.todayOrders}</p>
              <p className="text-xs text-gray-400 mt-1">Target: 10 order/hari</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Pendapatan</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                Rp{currentDriver.todayEarnings.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-400 mt-1">+Rp{currentDriver.weeklyEarnings.toLocaleString('id-ID')} minggu ini</p>
            </motion.div>
          </div>
        </section>

        {/* Quick Actions */}
        <AnimatePresence>
          {isOnline && (
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => setCurrentPage('job-board')}
                className="w-full h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 font-semibold text-lg"
              >
                <Package className="w-6 h-6 mr-2" />
                Lihat Order Tersedia
                <ChevronRight className="w-5 h-5 ml-auto" />
              </Button>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Vehicle Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Info Kendaraan</h2>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <Bike className="w-7 h-7 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{currentDriver.vehicleType}</h3>
                <p className="text-lg font-bold text-gray-700">{currentDriver.vehiclePlate}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Area Kerja */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Area Kerja</h2>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Wonosari & Sekitar</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Radius 5km dari pusat kota Wonosari
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Wonosari', 'Playen', 'Semanu', 'Karangmojo'].map((area) => (
                    <span 
                      key={area} 
                      className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Tips Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-yellow-100"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-900">Tips Meningkatkan Order</h3>
              <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Tetap online di jam sibuk (08:00-10:00 & 16:00-18:00)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Respon cepat saat ada order masuk
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Jaga rating tinggi dengan pelayanan terbaik
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Member Since */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-sm text-gray-400 flex items-center justify-center gap-1">
            <Calendar className="w-4 h-4" />
            Bergabung sejak {currentDriver.memberSince}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default DriverHome;
