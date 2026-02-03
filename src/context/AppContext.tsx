import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Order, Driver, Offer, AppMode, OrderStatus, ServiceType, User, Service } from '@/types';
import { services as staticServices, orders as mockOrders, drivers as mockDrivers, currentUser } from '@/data/mock';
import {
  signIn as supaSignIn,
  signUp as supaSignUp,
  signOut as supaSignOut,
  getSession,
  getUserProfile,
} from '@/services/authService';
import { supabase } from '@/lib/supabase';
import { verifyOtp } from '@/services/otpService';
import {
  createOrder as supaCreateOrder,
  getOrdersByUser,
  getOrdersByDriver,
  getAllOrders,
  updateOrderStatus as supaUpdateOrderStatus,
  cancelOrder as supaCancelOrder,
  assignDriver as supaAssignDriver,
  getWaitingOrders,
} from '@/services/orderService';
import {
  getAllDrivers,
  updateDriverStatus,
} from '@/services/driverService';
import { subscribeToOrders, subscribeToDrivers } from '@/lib/supabase';

// Context State Interface
interface AppState {
  // Auth
  user: User | Driver | null;
  userType: 'user' | 'driver' | 'admin' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // App Mode
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  
  // Orders
  orders: Order[];
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  createOrder: (orderData: any) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, additionalData?: any) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  
  // Drivers
  drivers: Driver[];
  onlineDrivers: Driver[];
  toggleDriverStatus: () => Promise<void>;
  assignDriver: (orderId: string, driverId: string) => Promise<void>;
  
  // Offers (for Driver App)
  offers: Offer[];
  currentOffer: Offer | null;
  setCurrentOffer: (offer: Offer | null) => void;
  acceptOffer: (offerId: string) => Promise<void>;
  declineOffer: (offerId: string) => Promise<void>;
  refreshOffers: () => Promise<void>;
  
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Services
  services: Service[];
  
  // Order Form (for creating new order)
  orderForm: {
    serviceType: ServiceType | null;
    requiresPin: boolean;
    pickup: { address: string; landmark: string; lat?: number; lng?: number };
    dropoff: { address: string; landmark: string; lat?: number; lng?: number };
    notes: string;
    itemSize: 'kecil' | 'sedang' | 'besar';
    whoPays: 'user' | 'driver';
    isSubscription: boolean;
  };
  updateOrderForm: (data: Partial<AppState['orderForm']>) => void;
  resetOrderForm: () => void;
  
  // Auth Actions
  signIn: (phone: string, password: string) => Promise<void>;
  signInWithOtp: (phone: string, code: string, loginType: 'user' | 'driver' | 'admin') => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
}

// Initial Order Form State
const initialOrderForm: AppState['orderForm'] = {
  serviceType: null,
  requiresPin: false,
  pickup: { address: '', landmark: '', lat: undefined, lng: undefined },
  dropoff: { address: '', landmark: '', lat: undefined, lng: undefined },
  notes: '',
  itemSize: 'sedang',
  whoPays: 'user',
  isSubscription: false,
};

// Create Context
const AppContext = createContext<AppState | undefined>(undefined);
const DEMO_MODE =
  (import.meta as any).env?.VITE_DEMO_MODE === 'true' ||
  (typeof window !== 'undefined' && localStorage.getItem('demo_mode') === '1');

const normalizeDriver = (driver: any): Driver => {
  if (!driver) return driver;
  return {
    ...driver,
    avatar_url: driver.avatar_url ?? driver.avatar,
    avatar: driver.avatar ?? driver.avatar_url,
    vehicleType: driver.vehicleType ?? driver.vehicle_type,
    vehiclePlate: driver.vehiclePlate ?? driver.vehicle_plate,
    totalOrders: driver.totalOrders ?? driver.total_orders,
    currentOrderId: driver.currentOrderId ?? driver.current_order_id,
    lastActive: driver.lastActive ?? driver.last_active,
  } as Driver;
};

const normalizeOrder = (order: any): Order => {
  if (!order) return order;
  const estimatedFee = order.estimatedFee ?? (
    order.estimated_fee_min !== undefined && order.estimated_fee_max !== undefined
      ? { min: order.estimated_fee_min, max: order.estimated_fee_max }
      : undefined
  );
  const estimatedTime = order.estimatedTime ?? (
    order.estimated_time_min !== undefined && order.estimated_time_max !== undefined
      ? { min: order.estimated_time_min, max: order.estimated_time_max }
      : undefined
  );
  const pickup = order.pickup ?? (order.pickup_address
    ? {
        address: order.pickup_address,
        lat: order.pickup_lat ?? 0,
        lng: order.pickup_lng ?? 0,
        landmark: order.pickup_landmark,
      }
    : undefined);
  const dropoff = order.dropoff ?? (order.dropoff_address
    ? {
        address: order.dropoff_address,
        lat: order.dropoff_lat ?? 0,
        lng: order.dropoff_lng ?? 0,
        landmark: order.dropoff_landmark,
      }
    : undefined);
  const driver = order.driver ? normalizeDriver(order.driver) : undefined;
  return {
    ...order,
    orderId: order.orderId ?? order.order_id,
    userId: order.userId ?? order.user_id,
    driverId: order.driverId ?? order.driver_id,
    serviceType: order.serviceType ?? order.service_type,
    serviceName: order.serviceName ?? order.service_name,
    requiresPin: order.requiresPin ?? order.requires_pin,
    whoPays: order.whoPays ?? order.who_pays,
    itemSize: order.itemSize ?? order.item_size,
    isSubscription: order.isSubscription ?? order.is_subscription,
    createdAt: order.createdAt ?? order.created_at,
    estimatedFee,
    estimatedTime,
    pickup,
    dropoff,
    driver,
    userName: order.userName ?? order.user?.name,
    userPhone: order.userPhone ?? order.user?.phone,
  } as Order;
};

const resolveUserType = (sessionUser: any, profile: any): 'user' | 'driver' | 'admin' => {
  if (sessionUser?.app_metadata?.role === 'admin') return 'admin';
  return profile?.userType || 'user';
};

// Provider Component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State
  const [user, setUser] = useState<User | Driver | null>(null);
  const [userType, setUserType] = useState<'user' | 'driver' | 'admin' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // App Mode
  const [appMode, setAppModeState] = useState<AppMode>('user');
  
  // Wrapper for setAppMode (role-based guard)
  const setAppMode = useCallback((mode: AppMode) => {
    if (userType === 'admin') {
      setAppModeState(mode);
      return;
    }
    if (userType === 'driver' && mode !== 'driver') return;
    if (userType === 'user' && mode !== 'user') return;
    setAppModeState(mode);
  }, [userType]);
  
  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  // Drivers State
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  // Offers State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  
  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');
  
  // Order Form State
  const [orderForm, setOrderForm] = useState(initialOrderForm);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    if (!isAuthenticated || DEMO_MODE) return;

    const ordersSub = subscribeToOrders(async () => {
      await refreshOrders();
    });

    const driversSub = subscribeToDrivers(async () => {
      await refreshDrivers();
    });

    return () => {
      ordersSub.unsubscribe();
      driversSub.unsubscribe();
    };
  }, [isAuthenticated, userType, user, appMode]);

  // Check authentication status
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      if (DEMO_MODE) {
        const savedUser = localStorage.getItem('demo_user');
        const savedUserType = localStorage.getItem('demo_user_type');
        if (savedUser && savedUserType) {
          const parsed = JSON.parse(savedUser);
          setUser(normalizeDriver(parsed));
          setUserType(savedUserType as any);
          setIsAuthenticated(true);
          setAppModeState(savedUserType as any);
          await loadInitialData({ ...parsed, userType: savedUserType });
        }
        return;
      }
      const session = await getSession();
      if (!session?.user) return;

      const profile = await getUserProfile(session.user.id);
      const normalizedUser = normalizeDriver(profile);
      const resolvedType = resolveUserType(session.user, profile);
      setUser(normalizedUser);
      setUserType(resolvedType);
      setIsAuthenticated(true);
      setAppModeState(resolvedType);
      await loadInitialData({ ...profile, userType: resolvedType });
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth Actions
  const signIn = async (phone: string, password: string) => {
    await supaSignIn({ phone, password });
    const session = await getSession();
    if (!session?.user) throw new Error('Failed to create session');
    const profile = await getUserProfile(session.user.id);
    const normalizedUser = normalizeDriver(profile);
    const resolvedType = resolveUserType(session.user, profile);
    setUser(normalizedUser);
    setUserType(resolvedType);
    setIsAuthenticated(true);
    setAppModeState(resolvedType);
    await loadInitialData({ ...profile, userType: resolvedType });
  };

  const signInWithOtp = async (phone: string, code: string, loginType: 'user' | 'driver' | 'admin') => {
    if (DEMO_MODE) {
      if (code !== '123456') {
        throw new Error('OTP demo salah. Gunakan 123456.');
      }
      if (loginType === 'admin') {
        const adminUser: User = {
          id: 'admin',
          phone: phone || 'admin',
          name: 'Administrator',
          email: 'admin@jsg.local',
          avatar_url: null,
          points: 0,
        };
        setUser(adminUser);
        setUserType('admin');
        setIsAuthenticated(true);
        setAppModeState('admin');
        localStorage.setItem('demo_user', JSON.stringify(adminUser));
        localStorage.setItem('demo_user_type', 'admin');
        await loadInitialData({ ...adminUser, userType: 'admin' });
        return;
      }
      if (loginType === 'driver') {
        const driver = normalizeDriver(mockDrivers[0]);
        setUser(driver);
        setUserType('driver');
        setIsAuthenticated(true);
        setAppModeState('driver');
        localStorage.setItem('demo_user', JSON.stringify(driver));
        localStorage.setItem('demo_user_type', 'driver');
        await loadInitialData({ ...driver, userType: 'driver' });
        return;
      }
      const user = normalizeDriver(currentUser);
      setUser(user);
      setUserType('user');
      setIsAuthenticated(true);
      setAppModeState('user');
      localStorage.setItem('demo_user', JSON.stringify(user));
      localStorage.setItem('demo_user_type', 'user');
      await loadInitialData({ ...user, userType: 'user' });
      return;
    }
    const { session } = await verifyOtp(phone, code, loginType);
    if (!session?.access_token || !session?.refresh_token) {
      throw new Error('Invalid session from OTP');
    }
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    const current = await getSession();
    if (!current?.user) throw new Error('Failed to create session');
    const profile = await getUserProfile(current.user.id);
    const normalizedUser = normalizeDriver(profile);
    const resolvedType = resolveUserType(current.user, profile);
    setUser(normalizedUser);
    setUserType(resolvedType);
    setIsAuthenticated(true);
    setAppModeState(resolvedType);
    await loadInitialData({ ...profile, userType: resolvedType });
  };

  const signUp = async (data: any) => {
    await supaSignUp(data);
    const session = await getSession();
    if (!session?.user) throw new Error('Failed to create session');
    const profile = await getUserProfile(session.user.id);
    const normalizedUser = normalizeDriver(profile);
    const resolvedType = resolveUserType(session.user, profile);
    setUser(normalizedUser);
    setUserType(resolvedType);
    setIsAuthenticated(true);
    setAppModeState(resolvedType);
    await loadInitialData({ ...profile, userType: resolvedType });
  };

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
      setAppModeState('user');
      setCurrentOrder(null);
      setOrders([]);
      setDrivers([]);
      setOffers([]);
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_user_type');
      return;
    }
    await supaSignOut();
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
    setAppModeState('user');
    setCurrentOrder(null);
    setOrders([]);
    setDrivers([]);
    setOffers([]);
  };

  // Data Actions
  const refreshOrders = async () => {
    if (userType === 'user' && user) {
      const userOrders = await getOrdersByUser(user.id);
      setOrders(userOrders.map(normalizeOrder));
    } else if (userType === 'driver' && user) {
      const driverOrders = await getOrdersByDriver(user.id);
      setOrders(driverOrders.map(normalizeOrder));
    } else if (userType === 'admin') {
      const allOrders = await getAllOrders();
      setOrders(allOrders.map(normalizeOrder));
    }
  };

  const refreshDrivers = async () => {
    const allDrivers = await getAllDrivers();
    setDrivers(allDrivers.map(normalizeDriver));
  };

  const refreshOffers = async () => {
    const waitingOrders = await getWaitingOrders();
    const offersData: Offer[] = waitingOrders.map((raw: any) => {
      const order = normalizeOrder(raw);
      return {
        id: `off-${order.id}`,
        orderId: order.id,
        pickup: order.pickup || {
          address: order.pickup_address || '-',
          lat: 0,
          lng: 0,
          landmark: order.pickup_landmark,
        },
        dropoff: order.dropoff || {
          address: order.dropoff_address || '-',
          lat: 0,
          lng: 0,
          landmark: order.dropoff_landmark,
        },
        serviceType: order.serviceType || order.service_type,
        serviceName: order.serviceName || order.service_name,
        estimatedFee: order.estimatedFee?.min ?? order.estimated_fee_min ?? 0,
        distance: 2.5,
        estimatedTime: order.estimatedTime?.min ?? order.estimated_time_min ?? 20,
        notes: order.notes,
        ttl: 30,
        createdAt: order.createdAt ? new Date(order.createdAt as any) : new Date(),
      } as Offer;
    });
    setOffers(offersData);
    if (offersData.length > 0) {
      setCurrentOffer(offersData[0]);
    }
  };

  const loadInitialData = async (profile: any) => {
    if (DEMO_MODE) {
      setOrders(mockOrders.map(normalizeOrder));
      setDrivers(mockDrivers.map(normalizeDriver));
      setOffers([]);
      return;
    }
    if (profile?.userType === 'user') {
      const userOrders = await getOrdersByUser(profile.id);
      setOrders(userOrders.map(normalizeOrder));
    } else if (profile?.userType === 'driver') {
      const driverOrders = await getOrdersByDriver(profile.id);
      setOrders(driverOrders.map(normalizeOrder));
      await refreshOffers();
    } else if (profile?.userType === 'admin') {
      const allOrders = await getAllOrders();
      setOrders(allOrders.map(normalizeOrder));
    }

    const allDrivers = await getAllDrivers();
    setDrivers(allDrivers.map(normalizeDriver));
  };

  // Order Actions
  const createOrder = async (orderData: any) => {
    if (!user) throw new Error('User not authenticated');
    
    const newOrder = await supaCreateOrder({
      user_id: user.id,
      service_type: orderForm.serviceType || 'lainnya',
      service_name: getServiceName(orderForm.serviceType),
      pickup_address: orderForm.pickup.address,
      pickup_landmark: orderForm.pickup.landmark,
      pickup_lat: orderForm.pickup.lat,
      pickup_lng: orderForm.pickup.lng,
      dropoff_address: orderForm.dropoff.address,
      dropoff_landmark: orderForm.dropoff.landmark,
      dropoff_lat: orderForm.dropoff.lat,
      dropoff_lng: orderForm.dropoff.lng,
      notes: orderForm.notes,
      item_size: orderForm.itemSize,
      who_pays: orderForm.whoPays,
      requires_pin: orderForm.requiresPin,
      estimated_fee_min: 15000,
      estimated_fee_max: 35000,
      is_subscription: orderForm.isSubscription,
      ...orderData,
    } as any);
    const normalized = normalizeOrder(newOrder);
    setOrders(prev => [normalized, ...prev]);
    setCurrentOrder(normalized);
    return normalized;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, additionalData?: any) => {
    await supaUpdateOrderStatus(orderId, status, additionalData);
    await refreshOrders();
  };

  const cancelOrder = async (orderId: string, reason?: string) => {
    await supaCancelOrder(orderId, reason);
    await refreshOrders();
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    await supaAssignDriver(orderId, driverId);
    await Promise.all([refreshOrders(), refreshDrivers()]);
  };

  // Driver Actions
  const toggleDriverStatus = async () => {
    if (!user || userType !== 'driver') return;
    
    const currentStatus = (user as Driver).status || 'OFFLINE';
    const newStatus = currentStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    const updated = await updateDriverStatus(user.id, { status: newStatus });
    const normalized = normalizeDriver(updated);
    setUser(normalized);
    await refreshDrivers();
  };

  // Offer Actions
  const acceptOffer = async (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer || !user) return;
    
    await assignDriver(offer.orderId, user.id);
    await refreshOffers();
  };

  const declineOffer = async (offerId: string) => {
    setOffers(prev => prev.filter(o => o.id !== offerId));
    if (currentOffer?.id === offerId) {
      setCurrentOffer(null);
    }
  };

  // Form Actions
  const updateOrderForm = useCallback((data: Partial<typeof initialOrderForm>) => {
    setOrderForm(prev => ({ ...prev, ...data }));
  }, []);

  const resetOrderForm = useCallback(() => {
    setOrderForm(initialOrderForm);
  }, []);

  // Helper
  const getServiceName = (type: ServiceType | null): string => {
    const names: Record<ServiceType, string> = {
      'antar-barang': 'Antar Barang',
      'belanja-titip': 'Belanja Titip',
      'ambil-dokumen': 'Ambil Dokumen',
      'lainnya': 'Lainnya',
    };
    return type ? names[type] : 'Layanan';
  };

  // Computed
  const onlineDrivers = drivers.filter(d => d.status === 'ONLINE');

  const value: AppState = {
    user,
    userType,
    isAuthenticated,
    isLoading,
    appMode,
    setAppMode,
    orders,
    currentOrder,
    setCurrentOrder,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    refreshOrders,
    drivers,
    onlineDrivers,
    toggleDriverStatus,
    assignDriver,
    offers,
    currentOffer,
    setCurrentOffer,
    acceptOffer,
    declineOffer,
    refreshOffers,
    currentPage,
    setCurrentPage,
    services: staticServices,
    orderForm,
    updateOrderForm,
    resetOrderForm,
    signIn,
    signInWithOtp,
    signUp,
    signOut,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
