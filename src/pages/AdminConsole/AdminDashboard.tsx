import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  Activity,
  Clock
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export const AdminDashboard: React.FC = () => {
  const { setCurrentPage, orders, drivers } = useApp();

  // Calculate stats
  const searchingDriverOrders = orders.filter(o => o.status === 'SEARCHING_DRIVER').length;
  const activeOrders = orders.filter(o => 
    ['CREATED', 'SEARCHING_DRIVER', 'ASSIGNED', 'DRIVER_TO_PICKUP', 'IN_PROGRESS', 'DRIVER_TO_DROPOFF'].includes(o.status)
  ).length;
  
  const onlineDrivers = drivers.filter(d => d.status === 'ONLINE').length;
  const busyDrivers = drivers.filter(d => d.status === 'BUSY').length;
  const completedToday = orders.filter(o => o.status === 'COMPLETED').length;
  
  // Calculate today's earnings
  const todayEarnings = orders
    .filter(o => o.status === 'COMPLETED' && (o.finalFee || o.final_fee))
    .reduce((sum, o) => sum + (o.finalFee || o.final_fee || 0), 0);

  const stats = [
    {
      label: 'Mencari Driver',
      value: searchingDriverOrders,
      icon: Clock,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      onClick: () => setCurrentPage('order-queue'),
      alert: searchingDriverOrders > 0,
    },
    {
      label: 'Order Aktif',
      value: activeOrders,
      icon: Package,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      onClick: () => setCurrentPage('order-queue'),
    },
    {
      label: 'Driver Online',
      value: onlineDrivers,
      icon: Users,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      onClick: () => setCurrentPage('driver-monitor'),
    },
    {
      label: 'Driver Sibuk',
      value: busyDrivers,
      icon: Activity,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      onClick: () => setCurrentPage('driver-monitor'),
    },
  ];

  // Recent alerts
  const alerts = [
    { 
      id: 1, 
      type: 'warning' as const, 
      message: `${searchingDriverOrders} order menunggu driver lebih dari 5 menit`, 
      time: 'Baru saja',
      action: 'Assign Manual',
      onAction: () => setCurrentPage('order-queue')
    },
    { 
      id: 2, 
      type: 'success' as const, 
      message: `Order JSG-20260130-001 selesai`, 
      time: '10 menit lalu',
      fee: 30000
    },
    { 
      id: 3, 
      type: 'info' as const, 
      message: `Driver Pak Budi baru saja online`, 
      time: '15 menit lalu' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Admin</h1>
              <p className="text-blue-100 text-sm mt-1">
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Total Pendapatan Hari Ini</p>
              <p className="text-2xl font-bold">
                Rp{todayEarnings.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={stat.onClick}
                className={cn(
                  'bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer relative overflow-hidden',
                  'hover:shadow-lg transition-all duration-200'
                )}
              >
                {stat.alert && (
                  <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3', stat.lightColor)}>
                  <stat.icon className={cn('w-6 h-6', stat.textColor)} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setCurrentPage('order-queue')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-5 text-left transition-all shadow-lg shadow-blue-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/60" />
              </div>
              <p className="font-bold text-lg">Antrian Order</p>
              <p className="text-sm text-blue-100">Kelola order dan assign driver</p>
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => setCurrentPage('driver-monitor')}
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl p-5 text-left transition-all shadow-lg shadow-green-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/60" />
              </div>
              <p className="font-bold text-lg">Monitor Driver</p>
              <p className="text-sm text-green-100">Pantau status dan lokasi driver</p>
            </motion.button>
          </div>
        </section>

        {/* Recent Alerts */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Notifikasi Terbaru</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
          >
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-3 p-4',
                  index !== alerts.length - 1 && 'border-b border-gray-100'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    alert.type === 'warning' && 'bg-amber-100',
                    alert.type === 'info' && 'bg-blue-100',
                    alert.type === 'success' && 'bg-green-100'
                  )}
                >
                  {alert.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
                  {alert.type === 'info' && <Activity className="w-5 h-5 text-blue-600" />}
                  {alert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-500">{alert.time}</p>
                    {alert.fee && (
                      <span className="text-xs text-green-600 font-medium">
                        +Rp{alert.fee.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
                {alert.action && (
                  <button
                    onClick={alert.onAction}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    {alert.action}
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        </section>

        {/* Performance Overview */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Performa Minggu Ini</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Pendapatan Mingguan</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp{(todayEarnings * 7).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">+12%</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progress minggu ini</span>
                <span className="font-medium text-gray-900">75%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
            
            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{completedToday}</p>
                <p className="text-xs text-gray-500">Order Selesai</p>
              </div>
              <div className="text-center border-x border-gray-100">
                <p className="text-lg font-bold text-gray-900">{drivers.length}</p>
                <p className="text-xs text-gray-500">Total Driver</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">4.8</p>
                <p className="text-xs text-gray-500">Rating Rata-rata</p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
