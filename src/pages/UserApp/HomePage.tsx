import React from 'react';
import { motion } from 'framer-motion';
import { Plus, History, MapPin, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ServiceCard, OrderCard } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Order } from '@/types';

export const HomePage: React.FC = () => {
  const { user, setCurrentPage, services, orders } = useApp();
  
  // Get recent orders (max 3)
  const recentOrders = orders
    .filter((o: Order) => (o.userId || o.user_id) === user?.id)
    .slice(0, 3);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-blue-100">
                <AvatarImage src={user?.avatar_url || ''} alt={user?.name} />
                <AvatarFallback className="bg-blue-500 text-white font-semibold">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-500">{getGreeting()}</p>
                <h1 className="font-semibold text-gray-900">{user?.name || 'Pengguna'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-full">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-yellow-700">
                {(user as { points?: number })?.points || 0} Poin
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={() => setCurrentPage('order-flow')}
              className="w-full h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200"
            >
              <Plus className="w-6 h-6 mr-2" />
              <span className="text-lg font-semibold">Buat Order Baru</span>
            </Button>
          </motion.div>
        </section>

        {/* Services Grid */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Layanan Kami</h2>
          <div className="grid grid-cols-2 gap-3">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <ServiceCard
                  type={service.id}
                  name={service.name}
                  description={service.description}
                  onClick={() => setCurrentPage('order-flow')}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Terbaru</h2>
              <button 
                onClick={() => setCurrentPage('history')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Lihat Semua
                <History className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <OrderCard 
                    order={order} 
                    onClick={() => setCurrentPage('tracking')}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Default Location */}
        {(user as { default_pickup?: { address?: string; landmark?: string } })?.default_pickup && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lokasi Tersimpan</h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">Alamat Utama</p>
                  <p className="text-sm text-gray-600 mt-0.5">{(user as { default_pickup?: { address?: string } })?.default_pickup?.address}</p>
                  {(user as { default_pickup?: { landmark?: string } })?.default_pickup?.landmark && (
                    <p className="text-xs text-gray-500 mt-1">
                      Patokan: {(user as { default_pickup?: { landmark?: string } })?.default_pickup?.landmark}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;
