// Date formatter helper
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

// Currency formatter helper
export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Time ago helper
export const getTimeAgo = (date: Date | string | undefined): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return d.toLocaleDateString('id-ID');
};

// Safe order accessor helpers
export const getOrderId = (order: { orderId?: string; order_id?: string }): string => {
  return order.orderId || order.order_id || '-';
};

export const getServiceName = (order: { serviceName?: string; service_name?: string }): string => {
  return order.serviceName || order.service_name || '-';
};

export const getUserName = (order: { userName?: string; user_name?: string; user?: { name?: string } }): string => {
  return order.userName || order.user_name || order.user?.name || '-';
};

export const getPickupAddress = (order: { pickup?: { address?: string }; pickup_address?: string }): string => {
  return order.pickup?.address || order.pickup_address || '-';
};

export const getDropoffAddress = (order: { dropoff?: { address?: string }; dropoff_address?: string }): string => {
  return order.dropoff?.address || order.dropoff_address || '-';
};

export const getPickupLandmark = (order: { pickup?: { landmark?: string }; pickup_landmark?: string }): string => {
  return order.pickup?.landmark || order.pickup_landmark || '-';
};

export const getDropoffLandmark = (order: { dropoff?: { landmark?: string }; dropoff_landmark?: string }): string => {
  return order.dropoff?.landmark || order.dropoff_landmark || '-';
};

export const getEstimatedFee = (order: { 
  estimatedFee?: { min?: number; max?: number }; 
  estimated_fee_min?: number; 
  estimated_fee_max?: number;
}): { min: number; max: number } | undefined => {
  if (order.estimatedFee?.min !== undefined && order.estimatedFee?.max !== undefined) {
    return { min: order.estimatedFee.min, max: order.estimatedFee.max };
  }
  if (order.estimated_fee_min !== undefined && order.estimated_fee_max !== undefined) {
    return { min: order.estimated_fee_min, max: order.estimated_fee_max };
  }
  return undefined;
};

export const getFinalFee = (order: { finalFee?: number; final_fee?: number }): number | undefined => {
  return order.finalFee || order.final_fee;
};

export const getCreatedAt = (order: { createdAt?: Date | string; created_at?: Date | string }): Date | string | undefined => {
  return order.createdAt || order.created_at;
};

// Safe driver accessor helpers
export const getDriverName = (driver: { name?: string } | undefined): string => {
  return driver?.name || '-';
};

export const getDriverTotalOrders = (driver: { totalOrders?: number; total_orders?: number } | undefined): number => {
  return driver?.totalOrders || driver?.total_orders || 0;
};

export const getDriverVehicleType = (driver: { vehicleType?: string; vehicle_type?: string } | undefined): string => {
  return driver?.vehicleType || driver?.vehicle_type || '-';
};

export const getDriverVehiclePlate = (driver: { vehiclePlate?: string; vehicle_plate?: string } | undefined): string => {
  return driver?.vehiclePlate || driver?.vehicle_plate || '-';
};

export const getDriverLastActive = (driver: { lastActive?: Date | string; last_active?: Date | string } | undefined): Date | string | undefined => {
  return driver?.lastActive || driver?.last_active;
};
