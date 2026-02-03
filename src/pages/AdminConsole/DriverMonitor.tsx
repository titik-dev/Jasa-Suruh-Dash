import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  Phone, 
  Package, 
  Star
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Driver, DriverStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: DriverStatus | 'all';
  count?: number;
}

export const DriverMonitor: React.FC = () => {
  const { setCurrentPage, drivers } = useApp();
  const [activeFilter, setActiveFilter] = useState<DriverStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Filter and search drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      // Filter by status
      if (activeFilter !== 'all' && driver.status !== activeFilter) {
        return false;
      }
      
      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          driver.name.toLowerCase().includes(query) ||
          (driver.vehiclePlate || driver.vehicle_plate || '').toLowerCase().includes(query) ||
          driver.phone.includes(query)
        );
      }
      
      return true;
    });
  }, [activeFilter, searchQuery, drivers]);

  // Get filter counts
  const getFilterCount = (filter: DriverStatus | 'all') => {
    if (filter === 'all') return drivers.length;
    return drivers.filter(d => d.status === filter).length;
  };

  const filters: FilterOption[] = [
    { label: 'Semua', value: 'all' },
    { label: 'Online', value: 'ONLINE', count: getFilterCount('ONLINE') },
    { label: 'Sibuk', value: 'BUSY', count: getFilterCount('BUSY') },
    { label: 'Offline', value: 'OFFLINE', count: getFilterCount('OFFLINE') },
  ];

  const handleDriverClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDetailDialog(true);
  };

  const getTimeAgo = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return d.toLocaleDateString('id-ID');
  };

  const getStatusColor = (status: DriverStatus) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-500';
      case 'BUSY': return 'bg-amber-500';
      case 'OFFLINE': return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: DriverStatus) => {
    switch (status) {
      case 'ONLINE': return 'Online';
      case 'BUSY': return 'Sibuk';
      case 'OFFLINE': return 'Offline';
    }
  };

  // Stats
  const stats = {
    online: drivers.filter(d => d.status === 'ONLINE').length,
    busy: drivers.filter(d => d.status === 'BUSY').length,
    offline: drivers.filter(d => d.status === 'OFFLINE').length,
    totalOrders: drivers.reduce((sum, d) => sum + (d.totalOrders ?? d.total_orders ?? 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('admin-dashboard')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900">Monitor Driver</h1>
              <p className="text-sm text-gray-500">{filteredDrivers.length} driver ditemukan</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-700">{stats.online}</p>
              <p className="text-xs text-green-600">Online</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-2xl font-bold text-amber-700">{stats.busy}</p>
              <p className="text-xs text-amber-600">Sibuk</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-700">{stats.offline}</p>
              <p className="text-xs text-gray-600">Offline</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-700">{stats.totalOrders}</p>
              <p className="text-xs text-blue-600">Total Order</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border-b border-gray-100 sticky top-[65px] z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari driver atau plat nomor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2',
                  activeFilter === filter.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {filter.label}
                {filter.count !== undefined && (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs',
                    activeFilter === filter.value ? 'bg-white/20' : 'bg-gray-200'
                  )}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredDrivers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {filteredDrivers.map((driver, index) => (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleDriverClick(driver)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">
                            {driver.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn(
                          'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white',
                          getStatusColor(driver.status)
                        )} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{driver.name}</h3>
                        <p className="text-sm text-gray-500">
                          {driver.vehicleType || driver.vehicle_type} • {driver.vehiclePlate || driver.vehicle_plate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold">{driver.rating}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="font-bold text-gray-900">
                        {driver.totalOrders ?? driver.total_orders ?? 0}
                      </p>
                      <p className="text-xs text-gray-500">Order</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="font-bold text-gray-900">
                        {getTimeAgo(driver.lastActive || driver.last_active)}
                      </p>
                      <p className="text-xs text-gray-500">Aktif</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className={cn(
                        'font-bold',
                        driver.status === 'ONLINE' ? 'text-green-600' :
                        driver.status === 'BUSY' ? 'text-amber-600' : 'text-gray-500'
                      )}>
                        {getStatusLabel(driver.status)}
                      </p>
                      <p className="text-xs text-gray-500">Status</p>
                    </div>
                  </div>

                  {/* Current Order */}
                  {(driver.currentOrderId || driver.current_order_id) && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                      <Package className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-blue-700">
                        Sedang menangani: {driver.currentOrderId || driver.current_order_id}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Tidak ada driver</h3>
            <p className="text-gray-500">Tidak ditemukan driver yang sesuai dengan filter</p>
          </motion.div>
        )}
      </div>

      {/* Driver Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Driver</DialogTitle>
            <DialogDescription>Informasi lengkap driver</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="py-4 space-y-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-blue-500 text-white text-2xl font-bold">
                    {selectedDriver.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900">{selectedDriver.name}</h3>
                  <p className="text-gray-600">{selectedDriver.vehicleType || selectedDriver.vehicle_type}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedDriver.vehiclePlate || selectedDriver.vehicle_plate}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium text-white',
                      getStatusColor(selectedDriver.status)
                    )}>
                      {getStatusLabel(selectedDriver.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold">{selectedDriver.rating}</span>
                  </div>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-bold">
                    {selectedDriver.totalOrders ?? selectedDriver.total_orders ?? 0}
                  </p>
                  <p className="text-sm text-gray-500">Total Order</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-bold">
                    {getTimeAgo(selectedDriver.lastActive || selectedDriver.last_active)}
                  </p>
                  <p className="text-sm text-gray-500">Terakhir Aktif</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-green-600">
                    Rp{((selectedDriver.totalOrders ?? selectedDriver.total_orders ?? 0) * 25000).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-500">Est. Pendapatan</p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex gap-3">
                <a
                  href={`tel:${selectedDriver.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Telepon
                </a>
                <a
                  href={`https://wa.me/${selectedDriver.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                >
                  <MessageCircleIcon className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>

              {/* Current Order */}
              {(selectedDriver.currentOrderId || selectedDriver.current_order_id) && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-amber-900">Sedang Menangani Order</span>
                  </div>
                  <p className="text-amber-800">
                    {selectedDriver.currentOrderId || selectedDriver.current_order_id}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Icon component
const MessageCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

export default DriverMonitor;
