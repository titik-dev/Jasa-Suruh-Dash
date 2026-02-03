import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Search, SlidersHorizontal } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { OrderCard } from '@/components/ui-custom';
import type { OrderStatus, Order } from '@/types';
import { cn } from '@/lib/utils';

const filters: { label: string; value: 'all' | OrderStatus }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Berlangsung', value: 'SEARCHING_DRIVER' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Dibatalkan', value: 'CANCELED' },
];

export const HistoryPage: React.FC = () => {
  const { user, setCurrentPage, setCurrentOrder, orders } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userOrders = orders.filter((o: Order) => (o.userId || o.user_id) === user?.id);

  const filteredOrders = userOrders.filter(order => {
    // Filter by status
    if (activeFilter === 'SEARCHING_DRIVER') {
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
      const pickupAddress = (order.pickup?.address || order.pickup_address || '').toLowerCase();
      const dropoffAddress = (order.dropoff?.address || order.dropoff_address || '').toLowerCase();
      return (
        orderId.includes(query) ||
        serviceName.includes(query) ||
        pickupAddress.includes(query) ||
        dropoffAddress.includes(query)
      );
    }
    
    return true;
  });

  const handleOrderClick = (order: Order) => {
    setCurrentOrder(order);
    setCurrentPage('tracking');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('home')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="font-semibold text-gray-900">Riwayat Order</h1>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  activeFilter === filter.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <OrderCard
                  order={order}
                  onClick={() => handleOrderClick(order)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Tidak ada order</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Tidak ditemukan order yang sesuai' 
                : 'Anda belum memiliki order'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
