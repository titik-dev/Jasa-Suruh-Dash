import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  MapPin, 
  Navigation, 
  Package, 
  Check, 
  Info,
  AlertCircle,
  ShoppingCart,
  FileText,
  MoreHorizontal,
  ArrowRight,
  Calendar,
  CreditCard,
  Wallet,
  Clock,
  Banknote,
  Shield
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import MapPicker from '@/components/map/MapPicker';
import { cn } from '@/lib/utils';
import type { ServiceType } from '@/types';

interface Step {
  id: number;
  label: string;
  description: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  { id: 1, label: 'Layanan', description: 'Pilih jenis layanan', icon: Package },
  { id: 2, label: 'Lokasi', description: 'Tentukan alamat', icon: MapPin },
  { id: 3, label: 'Detail', description: 'Jelaskan tugas', icon: Info },
  { id: 4, label: 'Konfirmasi', description: 'Periksa & pesan', icon: Check },
];

const iconMap: Record<ServiceType, React.ElementType> = {
  'antar-barang': Package,
  'belanja-titip': ShoppingCart,
  'ambil-dokumen': FileText,
  'lainnya': MoreHorizontal,
};

interface ValidationErrors {
  serviceType?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  notes?: string;
}

export const OrderFlow: React.FC = () => {
  const { orderForm, updateOrderForm, resetOrderForm, createOrder, setCurrentPage, setCurrentOrder, services } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        if (!orderForm.serviceType) {
          newErrors.serviceType = 'Pilih jenis layanan terlebih dahulu';
        }
        break;
      case 2:
        if (!orderForm.pickup.address.trim()) {
          newErrors.pickupAddress = 'Alamat pickup wajib diisi';
        }
        if (!orderForm.dropoff.address.trim()) {
          newErrors.dropoffAddress = 'Alamat dropoff wajib diisi';
        }
        break;
      case 3:
        if (!orderForm.notes.trim()) {
          newErrors.notes = 'Jelaskan apa yang perlu dilakukan';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep);
    console.log('orderForm.serviceType:', orderForm.serviceType);
    
    const isValid = validateStep(currentStep);
    console.log('isValid:', isValid);
    
    if (isValid) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
        setTouched({});
        setErrors({});
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    } else {
      setCurrentPage('home');
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    setIsSubmitting(true);
    try {
      const newOrder = await createOrder({});
      console.log('Order created:', newOrder);
      setCurrentOrder(newOrder);
      resetOrderForm();
      setCurrentStep(1);
      setCurrentPage('tracking');
    } catch (error: any) {
      console.error('Failed to create order:', error);
      alert('Gagal membuat order: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceSelect = (serviceId: ServiceType, requiresPin: boolean) => {
    console.log('Service selected:', serviceId, 'requiresPin:', requiresPin);
    updateOrderForm({ 
      serviceType: serviceId,
      requiresPin 
    });
    // Clear error immediately when service is selected
    setErrors(prev => ({ ...prev, serviceType: undefined }));
    setTouched(prev => ({ ...prev, serviceType: true }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate estimated fee based on service and item size
  const getEstimatedFee = () => {
    const baseFee = 15000;
    const sizeMultiplier = {
      kecil: 1,
      sedang: 1.3,
      besar: 1.8
    };
    const distanceKm = routeInfo?.distance ? routeInfo.distance / 1000 : 0;
    const distanceFee = distanceKm > 0 ? distanceKm * 2500 : 0;
    const min = Math.round((baseFee + distanceFee) * sizeMultiplier[orderForm.itemSize]);
    const max = Math.round((baseFee + 15000 + distanceFee) * sizeMultiplier[orderForm.itemSize]);
    return { min, max };
  };

  const estimatedFee = getEstimatedFee();

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900">Buat Order Baru</h1>
              <p className="text-sm text-gray-500">Langkah {currentStep} dari 4</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100 sticky top-[65px] z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: isActive || isCompleted ? '#2563EB' : '#F3F4F6',
                        scale: isActive ? 1.1 : 1,
                      }}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                        (isActive || isCompleted) ? 'shadow-lg shadow-blue-200' : ''
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <StepIcon className={cn(
                          'w-5 h-5',
                          isActive ? 'text-white' : 'text-gray-400'
                        )} />
                      )}
                    </motion.div>
                    <span className={cn(
                      'text-xs mt-1.5 font-medium transition-colors',
                      isActive ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-2 transition-colors',
                      isCompleted ? 'bg-blue-500' : 'bg-gray-200'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Layanan */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Pilih Layanan</h2>
                <p className="text-gray-500">Pilih jenis layanan yang sesuai dengan kebutuhan Anda</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service, index) => {
                  const ServiceIcon = iconMap[service.id];
                  const isSelected = orderForm.serviceType === service.id;
                  
                  return (
                    <motion.button
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleServiceSelect(service.id, service.requiresPin)}
                      className={cn(
                        'relative p-5 rounded-2xl text-left transition-all duration-300 border-2',
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100' 
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className={cn(
                        'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors',
                        isSelected ? 'bg-blue-500' : 'bg-gray-100'
                      )}>
                        <ServiceIcon className={cn(
                          'w-7 h-7',
                          isSelected ? 'text-white' : 'text-gray-600'
                        )} />
                      </div>
                      
                      <h3 className={cn(
                        'font-semibold text-lg mb-1',
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      )}>
                        {service.name}
                      </h3>
                      <p className={cn(
                        'text-sm',
                        isSelected ? 'text-blue-600' : 'text-gray-500'
                      )}>
                        {service.description}
                      </p>
                      
                      {service.requiresPin && (
                        <div className="flex items-center gap-1.5 mt-3">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Dengan PIN Aman</span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {errors.serviceType && touched.serviceType && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-50 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{errors.serviceType}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 2: Lokasi */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Lokasi & Rute</h2>
                <p className="text-gray-500">
                  Pilih titik di peta, lalu lengkapi detail alamat untuk akurasi maksimal
                </p>
              </div>

              {/* Route Summary */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Ringkasan Rute</p>
                  <p className="text-sm text-gray-800 font-semibold">
                    {routeInfo?.distance
                      ? `${(routeInfo.distance / 1000).toFixed(1)} km • ${Math.max(5, Math.round(routeInfo.duration / 60))} menit`
                      : 'Pilih pickup & dropoff untuk menghitung rute'}
                  </p>
                </div>
                <div
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    routeInfo?.distance ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {routeInfo?.distance ? 'Rute siap' : 'Menunggu titik'}
                </div>
              </div>

              {/* Map Picker (Primary) */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Peta Rute</h3>
                  <span className="text-xs text-gray-500">Klik peta untuk menaruh pin</span>
                </div>
                <MapPicker
                  pickup={orderForm.pickup}
                  dropoff={orderForm.dropoff}
                  onPickupChange={(next) => updateOrderForm({ pickup: next })}
                  onDropoffChange={(next) => updateOrderForm({ dropoff: next })}
                  onRouteChange={(distance, duration) => setRouteInfo({ distance, duration })}
                />
              </div>

              {/* Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pickup */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Pickup</h3>
                      <p className="text-sm text-gray-500">Dari mana barang diambil?</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pickup-address" className="text-gray-700">
                        Alamat Lengkap <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="pickup-address"
                        placeholder="Contoh: Jl. MT Haryono No. 123, Wonosari..."
                        value={orderForm.pickup.address}
                        onChange={(e) => {
                          updateOrderForm({ 
                            pickup: { ...orderForm.pickup, address: e.target.value }
                          });
                          if (errors.pickupAddress) {
                            setErrors(prev => ({ ...prev, pickupAddress: undefined }));
                          }
                        }}
                        onBlur={() => setTouched(prev => ({ ...prev, pickupAddress: true }))}
                        className={cn(
                          'mt-1.5 min-h-[72px] resize-none',
                          errors.pickupAddress && touched.pickupAddress && 'border-red-500 focus:border-red-500'
                        )}
                      />
                      {errors.pickupAddress && touched.pickupAddress && (
                        <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.pickupAddress}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pickup-landmark" className="text-gray-700">
                        Patokan (opsional)
                      </Label>
                      <Input
                        id="pickup-landmark"
                        placeholder="Contoh: Rumah cat kuning, depan warung Pak Slamet..."
                        value={orderForm.pickup.landmark}
                        onChange={(e) => updateOrderForm({ 
                          pickup: { ...orderForm.pickup, landmark: e.target.value }
                        })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Dropoff */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Dropoff</h3>
                      <p className="text-sm text-gray-500">Ke mana barang diantar?</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dropoff-address" className="text-gray-700">
                        Alamat Lengkap <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="dropoff-address"
                        placeholder="Contoh: Jl. Sudirman No. 45, Playen..."
                        value={orderForm.dropoff.address}
                        onChange={(e) => {
                          updateOrderForm({ 
                            dropoff: { ...orderForm.dropoff, address: e.target.value }
                          });
                          if (errors.dropoffAddress) {
                            setErrors(prev => ({ ...prev, dropoffAddress: undefined }));
                          }
                        }}
                        onBlur={() => setTouched(prev => ({ ...prev, dropoffAddress: true }))}
                        className={cn(
                          'mt-1.5 min-h-[72px] resize-none',
                          errors.dropoffAddress && touched.dropoffAddress && 'border-red-500 focus:border-red-500'
                        )}
                      />
                      {errors.dropoffAddress && touched.dropoffAddress && (
                        <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.dropoffAddress}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="dropoff-landmark" className="text-gray-700">
                        Patokan (opsional)
                      </Label>
                      <Input
                        id="dropoff-landmark"
                        placeholder="Contoh: Kantor Pos, sebelah bank BRI..."
                        value={orderForm.dropoff.landmark}
                        onChange={(e) => updateOrderForm({ 
                          dropoff: { ...orderForm.dropoff, landmark: e.target.value }
                        })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Detail Tugas */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Detail Tugas</h2>
                <p className="text-gray-500">Jelaskan detail tugas agar driver memahami dengan jelas</p>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <Label htmlFor="notes" className="text-gray-700 flex items-center gap-2">
                  Apa yang perlu dilakukan? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder={orderForm.serviceType === 'belanja-titip' 
                    ? "Contoh: Beli 1kg beras, 1L minyak goreng, 5 bungkus mie instan..."
                    : orderForm.serviceType === 'ambil-dokumen'
                    ? "Contoh: Ambil surat keterangan domisili atas nama..."
                    : "Contoh: Ambil paket di counter, hati-hati barang pecah belah..."
                  }
                  value={orderForm.notes}
                  onChange={(e) => {
                    updateOrderForm({ notes: e.target.value });
                    if (errors.notes) {
                      setErrors(prev => ({ ...prev, notes: undefined }));
                    }
                  }}
                  onBlur={() => setTouched(prev => ({ ...prev, notes: true }))}
                  className={cn(
                    'mt-2 min-h-[120px] resize-none',
                    errors.notes && touched.notes && 'border-red-500 focus:border-red-500'
                  )}
                />
                {errors.notes && touched.notes && (
                  <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.notes}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Semakin detail penjelasan, semakin mudah driver menyelesaikan tugas
                </p>
              </div>

              {/* Item Size */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <Label className="text-gray-700 mb-4 block">Ukuran Barang</Label>
                <RadioGroup
                  value={orderForm.itemSize}
                  onValueChange={(value) => updateOrderForm({ itemSize: value as any })}
                  className="grid grid-cols-3 gap-3"
                >
                  {[
                    { value: 'kecil', label: 'Kecil', desc: 'Dokumen, makanan', icon: FileText },
                    { value: 'sedang', label: 'Sedang', desc: 'Paket, belanjaan', icon: Package },
                    { value: 'besar', label: 'Besar', desc: 'Barang besar', icon: ShoppingCart },
                  ].map((size) => (
                    <div key={size.value}>
                      <RadioGroupItem
                        value={size.value}
                        id={`size-${size.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`size-${size.value}`}
                        className={cn(
                          'flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all h-full',
                          'hover:border-blue-300 hover:bg-blue-50',
                          'peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50'
                        )}
                      >
                        <size.icon className={cn(
                          'w-6 h-6 mb-2',
                          'text-gray-400 peer-data-[state=checked]:text-blue-500'
                        )} />
                        <span className="font-semibold text-gray-900">{size.label}</span>
                        <span className="text-xs text-gray-500 text-center mt-1">{size.desc}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <Label className="text-gray-700 mb-4 block">Metode Pembayaran Belanja</Label>
                <RadioGroup
                  value={orderForm.whoPays}
                  onValueChange={(value) => updateOrderForm({ whoPays: value as any })}
                  className="grid grid-cols-2 gap-3"
                >
                  <div>
                    <RadioGroupItem
                      value="user"
                      id="pay-user"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="pay-user"
                      className={cn(
                        'flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all',
                        'hover:border-blue-300 hover:bg-blue-50',
                        'peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50'
                      )}
                    >
                      <Wallet className="w-6 h-6 mb-2 text-gray-400 peer-data-[state=checked]:text-blue-500" />
                      <span className="font-semibold text-gray-900">Saya Bayar</span>
                      <span className="text-xs text-gray-500 mt-1">Transfer ke driver</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="driver"
                      id="pay-driver"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="pay-driver"
                      className={cn(
                        'flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all',
                        'hover:border-blue-300 hover:bg-blue-50',
                        'peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50'
                      )}
                    >
                      <CreditCard className="w-6 h-6 mb-2 text-gray-400 peer-data-[state=checked]:text-blue-500" />
                      <span className="font-semibold text-gray-900">Driver Dulu</span>
                      <span className="text-xs text-gray-500 mt-1">Saya ganti nanti</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </motion.div>
          )}

          {/* Step 4: Konfirmasi */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Order</h2>
                <p className="text-gray-500">Periksa kembali detail order sebelum memesan</p>
              </div>

              {/* Service Summary */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  Detail Layanan
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Jenis Layanan</span>
                    <span className="font-medium text-gray-900">
                      {services.find(s => s.id === orderForm.serviceType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Ukuran Barang</span>
                    <span className="font-medium text-gray-900 capitalize">{orderForm.itemSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Pembayaran</span>
                    <span className="font-medium text-gray-900">
                      {orderForm.whoPays === 'user' ? 'Saya bayar ke driver' : 'Driver dulu, saya ganti'}
                    </span>
                  </div>
                  {orderForm.requiresPin && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl mt-3">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-700">PIN serah-terima akan dibuat otomatis</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Summary */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Detail Lokasi
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pickup</p>
                      <p className="font-medium text-gray-900">{orderForm.pickup.address}</p>
                      {orderForm.pickup.landmark && (
                        <p className="text-sm text-gray-500 mt-0.5">Patokan: {orderForm.pickup.landmark}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dropoff</p>
                      <p className="font-medium text-gray-900">{orderForm.dropoff.address}</p>
                      {orderForm.dropoff.landmark && (
                        <p className="text-sm text-gray-500 mt-0.5">Patokan: {orderForm.dropoff.landmark}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Summary */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Catatan Tugas
                </h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{orderForm.notes}</p>
              </div>

              {/* Price Estimate */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Estimasi Biaya
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Biaya Layanan</span>
                    <span className="font-semibold">{formatCurrency(estimatedFee.min)} - {formatCurrency(estimatedFee.max)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Estimasi Waktu</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {routeInfo?.duration
                        ? `${Math.max(5, Math.round(routeInfo.duration / 60))} menit`
                        : '20 - 45 menit'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Jarak</span>
                    <span className="font-semibold">
                      {routeInfo?.distance
                        ? `${(routeInfo.distance / 1000).toFixed(1)} km`
                        : '-'}
                    </span>
                  </div>
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <p className="text-sm text-blue-100">
                      *Biaya final dapat berbeda tergantung jarak dan kondisi
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Checkbox
                  id="subscription"
                  checked={orderForm.isSubscription}
                  onCheckedChange={(checked) => updateOrderForm({ isSubscription: checked as boolean })}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor="subscription" className="font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Jadikan langganan rutin
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Order ini akan diulang secara berkala sesuai jadwal yang Anda tentukan
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action - Fixed at bottom with safe area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-30">
        <div className="max-w-lg mx-auto">
          {currentStep === 4 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Estimasi Total:</span>
                <span className="font-bold text-lg text-blue-600">
                  {formatCurrency(estimatedFee.min)} - {formatCurrency(estimatedFee.max)}
                </span>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-xl disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Memproses...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Pesan Sekarang
                  </div>
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentStep === 1 && !orderForm.serviceType}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjut
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderFlow;
