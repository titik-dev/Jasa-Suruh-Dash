import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  XCircle,
  MapPin,
  Navigation,
  Package,
  AlertCircle,
  Phone,
  User
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/ui-custom';
import type { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: OrderStatus | 'all' | 'active';
  count?: number;
}

export const OrderQueue: React.FC = () => {
  const { setCurrentPage, updateOrderStatus, orders, drivers } = useApp();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState<string | null>(null);

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filter by status
      if (activeFilter === 'active') {
        const activeStatuses: OrderStatus[] = ['CREATED', 'SEARCHING_DRIVER', 'ASSIGNED', 'DRIVER_TO_PICKUP', 'IN_PROGRESS', 'DRIVER_TO_DROPOFF'];
        if (!activeStatuses.includes(order.status)) return false;
      } else if (activeFilter !== 'all' && order.status !== activeFilter) {
        return false;
      }
      
      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const orderId = (order.orderId || order.order_id || '').toLowerCase();
        const serviceName = (order.serviceName || order.service_name || '').toLowerCase();
        const userName = (order.userName || '').toLowerCase();
        const pickupAddress = (order.pickup?.address || order.pickup_address || '').toLowerCase();
        return (
          orderId.includes(query) ||
          serviceName.includes(query) ||
          userName.includes(query) ||
          pickupAddress.includes(query)
        );
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by status priority and then by date
      const statusPriority: Record<OrderStatus, number> = {
        'SEARCHING_DRIVER': 0,
        'CREATED': 1,
        'ASSIGNED': 2,
        'DRIVER_TO_PICKUP': 3,
        'IN_PROGRESS': 4,
        'DRIVER_TO_DROPOFF': 5,
        'COMPLETED': 6,
        'CANCELED': 7,
      };
      const aCreated = a.createdAt || a.created_at;
      const bCreated = b.createdAt || b.created_at;
      const aDate = typeof aCreated === 'string' ? new Date(aCreated) : aCreated;
      const bDate = typeof bCreated === 'string' ? new Date(bCreated) : bCreated;
      const aTime = aDate ? aDate.getTime() : 0;
      const bTime = bDate ? bDate.getTime() : 0;
      return statusPriority[a.status] - statusPriority[b.status] || bTime - aTime;
    });
  }, [activeFilter, searchQuery, orders]);

  // Get filter counts
  const getFilterCount = (filter: OrderStatus | 'all' | 'active') => {
    if (filter === 'active') {
      const activeStatuses: OrderStatus[] = ['CREATED', 'SEARCHING_DRIVER', 'ASSIGNED', 'DRIVER_TO_PICKUP', 'IN_PROGRESS', 'DRIVER_TO_DROPOFF'];
      return orders.filter(o => activeStatuses.includes(o.status)).length;
    }
    if (filter === 'all') return orders.length;
    return orders.filter(o => o.status === filter).length;
  };

  const filters: FilterOption[] = [
    { label: 'Semua', value: 'all' },
    { label: 'Aktif', value: 'active', count: getFilterCount('active') },
    { label: 'Mencari Driver', value: 'SEARCHING_DRIVER', count: getFilterCount('SEARCHING_DRIVER') },
    { label: 'Assigned', value: 'ASSIGNED', count: getFilterCount('ASSIGNED') },
    { label: 'Selesai', value: 'COMPLETED', count: getFilterCount('COMPLETED') },
    { label: 'Dibatalkan', value: 'CANCELED', count: getFilterCount('CANCELED') },
  ];

  const handleAssignDriver = async (driverId: string) => {
    setAssigningDriver(driverId);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, 'ASSIGNED');
      setShowAssignDialog(false);
      setSelectedOrder(null);
    }
    setAssigningDriver(null);
  };

  const handleCancelOrder = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, 'CANCELED');
      setShowDetailDialog(false);
      setSelectedOrder(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

  const getTimeAgo = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return formatDate(d);
  };

  // Get available drivers (online and not busy)
  const availableDrivers = drivers.filter(
    d => d.status === 'ONLINE' && !(d.currentOrderId || d.current_order_id)
  );

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
              <h1 className="font-bold text-gray-900">Antrian Order</h1>
              <p className="text-sm text-gray-500">{filteredOrders.length} order ditemukan</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="bg-white border-b border-gray-100 sticky top-[65px] z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari order ID, layanan, pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12"
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
                {filter.count !== undefined && filter.count > 0 && (
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

      {/* Orders List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredOrders.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all',
                    order.status === 'SEARCHING_DRIVER' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        order.status === 'SEARCHING_DRIVER' ? 'bg-amber-100' : 'bg-gray-100'
                      )}>
                        <Package className={cn(
                          'w-5 h-5',
                          order.status === 'SEARCHING_DRIVER' ? 'text-amber-600' : 'text-gray-600'
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">
                            {order.orderId || order.order_id || '-'}
                          </span>
                          <StatusBadge 
                            status={order.status} 
                            size="sm" 
                            pulse={order.status === 'SEARCHING_DRIVER'} 
                          />
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {order.serviceName || order.service_name || '-'}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {order.estimatedFee
                          ? `${formatCurrency(order.estimatedFee.min)} - ${formatCurrency(order.estimatedFee.max)}`
                          : order.estimated_fee_min !== undefined && order.estimated_fee_max !== undefined
                          ? `${formatCurrency(order.estimated_fee_min)} - ${formatCurrency(order.estimated_fee_max)}`
                          : '-'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTimeAgo(order.createdAt || order.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Customer & Route */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{order.userName || 'Pelanggan'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">{order.userPhone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 truncate">
                        {order.pickup?.address || order.pickup_address || '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-gray-700 truncate">
                        {order.dropoff?.address || order.dropoff_address || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    {order.status === 'SEARCHING_DRIVER' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowAssignDialog(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <UserPlus className="w-4 h-4 mr-1.5" />
                        Assign Driver
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Detail
                    </Button>
                    {order.status !== 'COMPLETED' && order.status !== 'CANCELED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelOrder}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Batalkan
                      </Button>
                    )}
                  </div>
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
            <h3 className="font-bold text-gray-900 mb-1">Tidak ada order</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Tidak ditemukan order yang sesuai dengan pencarian' 
                : 'Tidak ada order dengan filter yang dipilih'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Assign Driver Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              Assign Driver Manual
            </DialogTitle>
            <DialogDescription>
              Pilih driver untuk order {selectedOrder?.orderId || selectedOrder?.order_id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            {/* Order Summary */}
            {selectedOrder && (
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {selectedOrder.serviceName || selectedOrder.service_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Navigation className="w-4 h-4" />
                  <span className="truncate">
                    {selectedOrder.pickup?.address || selectedOrder.pickup_address}
                  </span>
                </div>
              </div>
            )}

            {/* Available Drivers */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Driver Tersedia ({availableDrivers.length})
              </p>
              {availableDrivers.length > 0 ? (
                availableDrivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleAssignDriver(driver.id)}
                    disabled={assigningDriver === driver.id}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                      'hover:border-blue-300 hover:bg-blue-50',
                      assigningDriver === driver.id && 'opacity-50'
                    )}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{driver.name}</p>
                      <p className="text-sm text-gray-500">
                        {driver.vehicleType || driver.vehicle_type} • {driver.vehiclePlate || driver.vehicle_plate}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm">{driver.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {driver.totalOrders ?? driver.total_orders ?? 0} order
                        </span>
                      </div>
                    </div>
                    {assigningDriver === driver.id ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                    ) : (
                      <UserPlus className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-gray-600">Tidak ada driver yang tersedia</p>
                  <p className="text-sm text-gray-500">Semua driver sedang sibuk atau offline</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Order</DialogTitle>
            <DialogDescription>{selectedOrder?.orderId || selectedOrder?.order_id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Status</span>
                <StatusBadge status={selectedOrder.status} />
              </div>

              {/* Customer */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">Pelanggan</p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {(selectedOrder.userName || 'Pelanggan').split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.userName || 'Pelanggan'}
                    </p>
                    <p className="text-sm text-gray-500">{selectedOrder.userPhone || '-'}</p>
                  </div>
                  <a 
                    href={`tel:${selectedOrder.userPhone || ''}`}
                    className="ml-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-green-600" />
                  </a>
                </div>
              </div>

              {/* Route */}
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-700 mb-1">Pickup</p>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.pickup?.address || selectedOrder.pickup_address}
                  </p>
                  {(selectedOrder.pickup?.landmark || selectedOrder.pickup_landmark) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedOrder.pickup?.landmark || selectedOrder.pickup_landmark}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-sm text-red-700 mb-1">Dropoff</p>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.dropoff?.address || selectedOrder.dropoff_address}
                  </p>
                  {(selectedOrder.dropoff?.landmark || selectedOrder.dropoff_landmark) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedOrder.dropoff?.landmark || selectedOrder.dropoff_landmark}
                    </p>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Estimasi Biaya</p>
                  <p className="font-bold text-gray-900">
                    {selectedOrder.estimatedFee
                      ? `${formatCurrency(selectedOrder.estimatedFee.min)} - ${formatCurrency(selectedOrder.estimatedFee.max)}`
                      : selectedOrder.estimated_fee_min !== undefined && selectedOrder.estimated_fee_max !== undefined
                      ? `${formatCurrency(selectedOrder.estimated_fee_min)} - ${formatCurrency(selectedOrder.estimated_fee_max)}`
                      : '-'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Waktu Order</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedOrder.createdAt || selectedOrder.created_at)}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-700 mb-1">Catatan</p>
                  <p className="text-gray-800">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderQueue;
