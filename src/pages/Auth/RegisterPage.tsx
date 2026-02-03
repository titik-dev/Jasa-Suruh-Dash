import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Eye, EyeOff, AlertCircle, User, Truck, ArrowLeft, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const RegisterPage: React.FC<{ onBackToLogin: () => void }> = ({ onBackToLogin }) => {
  const { signUp } = useApp();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'user' | 'driver'>('user');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: 'Motor',
    vehiclePlate: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.name.trim()) {
        setError('Nama lengkap wajib diisi');
        return;
      }
      if (!formData.phone.trim()) {
        setError('Nomor telepon wajib diisi');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (formData.password.length < 6) {
        setError('Password minimal 6 karakter');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Password tidak cocok');
        return;
      }
      if (userType === 'driver') {
        if (!formData.vehiclePlate.trim()) {
          setError('Nomor plat kendaraan wajib diisi');
          return;
        }
      }

      setIsLoading(true);
      try {
        await signUp({
          phone: formData.phone,
          password: formData.password,
          name: formData.name,
          userType,
          vehicleType: formData.vehicleType,
          vehiclePlate: formData.vehiclePlate,
        });
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Pendaftaran gagal. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-gray-500 mb-6">
              Akun Anda telah berhasil dibuat. Anda sekarang dapat masuk ke aplikasi.
            </p>
            <Button
              onClick={onBackToLogin}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl"
            >
              Masuk Sekarang
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
          >
            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1">Daftar Akun</h1>
          <p className="text-blue-100">Jasa Suruh Gunungkidul 3.0</p>
        </div>

        {/* Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* User Type Selection (only on step 1) */}
          {step === 1 && (
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setUserType('user')}
                className={cn(
                  'flex-1 py-4 text-center font-medium transition-all flex items-center justify-center gap-2',
                  userType === 'user'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <User className="w-4 h-4" />
                Pelanggan
              </button>
              <button
                onClick={() => setUserType('driver')}
                className={cn(
                  'flex-1 py-4 text-center font-medium transition-all flex items-center justify-center gap-2',
                  userType === 'driver'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Truck className="w-4 h-4" />
                Driver
              </button>
            </div>
          )}

          <div className="p-6">
            {/* Back Button */}
            <button
              onClick={step === 1 ? onBackToLogin : () => setStep(1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">{step === 1 ? 'Kembali ke Login' : 'Kembali'}</span>
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {step === 1 ? 'Informasi Dasar' : 'Informasi Akun'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {step === 1 
                ? `Daftar sebagai ${userType === 'user' ? 'Pelanggan' : 'Driver'}`
                : 'Buat password untuk akun Anda'}
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 bg-red-50 rounded-xl mb-4"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  {/* Name Input */}
                  <div>
                    <Label htmlFor="name" className="text-gray-700">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1.5 h-12"
                      required
                    />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <Label htmlFor="phone" className="text-gray-700">
                      Nomor Telepon <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="text-gray-500 font-medium">+62</span>
                        <div className="w-px h-5 bg-gray-300" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="812-3456-7890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhoneInput(e.target.value) })}
                        className="pl-20 h-12"
                        required
                      />
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Vehicle Info (Driver only) */}
                  {userType === 'driver' && (
                    <>
                      <div>
                        <Label htmlFor="vehicleType" className="text-gray-700">
                          Jenis Kendaraan
                        </Label>
                        <select
                          id="vehicleType"
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                          className="w-full mt-1.5 h-12 px-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        >
                          <option value="Motor">Motor</option>
                          <option value="Mobil">Mobil</option>
                          <option value="Pickup">Pickup</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="vehiclePlate" className="text-gray-700">
                          Nomor Plat <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="vehiclePlate"
                          type="text"
                          placeholder="AB 1234 XY"
                          value={formData.vehiclePlate}
                          onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                          className="mt-1.5 h-12"
                          required
                        />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Password Input */}
                  <div>
                    <Label htmlFor="password" className="text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pr-12 h-12"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-700">
                      Konfirmasi Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Ulangi password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pr-12 h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full h-12 text-white font-semibold rounded-xl mt-6',
                  userType === 'driver' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                )}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : step === 1 ? (
                  <div className="flex items-center gap-2">
                    Lanjutkan
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                ) : (
                  'Daftar Sekarang'
                )}
              </Button>
            </form>

            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              <div className={cn('w-2 h-2 rounded-full', step === 1 ? 'bg-blue-500' : 'bg-gray-300')} />
              <div className={cn('w-2 h-2 rounded-full', step === 2 ? 'bg-blue-500' : 'bg-gray-300')} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
