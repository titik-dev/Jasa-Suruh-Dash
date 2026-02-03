import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, AlertCircle, KeyRound } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { sendOtp } from '@/services/otpService';

interface LoginPageProps {
  onRegisterClick?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onRegisterClick }) => {
  const { signInWithOtp, setAppMode } = useApp();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState<'user' | 'driver' | 'admin'>('user');
  const demoMode = typeof window !== 'undefined' && localStorage.getItem('demo_mode') === '1';

  const handleSendOtp = async () => {
    setError('');
    setIsSending(true);
    try {
      await sendOtp(phone);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim OTP. Coba lagi.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithOtp(phone, otp, loginType);
      if (loginType === 'admin') setAppMode('admin');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa nomor telepon dan OTP Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneInput = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as Indonesian phone number
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
          >
            <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Jasa Suruh</h1>
          <p className="text-blue-100">Gunungkidul 3.0</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {demoMode && (
            <div className="bg-amber-100 text-amber-900 px-4 py-2 text-sm font-medium text-center">
              Demo Mode aktif
            </div>
          )}
          {/* Login Type Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setLoginType('user')}
              className={cn(
                'flex-1 py-4 text-center font-medium transition-all',
                loginType === 'user'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Pelanggan
            </button>
            <button
              onClick={() => setLoginType('driver')}
              className={cn(
                'flex-1 py-4 text-center font-medium transition-all',
                loginType === 'driver'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Driver
            </button>
            <button
              onClick={() => setLoginType('admin')}
              className={cn(
                'flex-1 py-4 text-center font-medium transition-all',
                loginType === 'admin'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Admin
            </button>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Masuk sebagai {loginType === 'user' ? 'Pelanggan' : loginType === 'driver' ? 'Driver' : 'Admin'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Masukkan nomor telepon Anda, lalu verifikasi OTP WhatsApp
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
              {/* Phone/Username Input */}
              <div>
                <Label htmlFor="phone" className="text-gray-700">
                  Nomor Telepon
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
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                    className={cn("h-12", "pl-20")}
                    required
                  />
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* OTP Input */}
              <div>
                <Label htmlFor="otp" className="text-gray-700">
                  Kode OTP
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="6 digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pr-12 h-12"
                    required
                  />
                  <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Send OTP */}
              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending || !phone}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl"
              >
                {isSending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  'Kirim OTP via WhatsApp'
                )}
              </Button>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !otpSent}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  'Verifikasi & Masuk'
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-medium mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Pelanggan:</strong> 081234567890 (OTP)</p>
                <p><strong>Driver:</strong> 081234567891 (OTP)</p>
                <p><strong>Admin:</strong> 081234567892 (OTP)</p>
                <p><strong>OTP Demo:</strong> 123456</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('demo_mode', '1');
                    window.location.reload();
                  }}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Aktifkan Demo Mode
                </button>
                <span className="text-xs text-gray-400">|</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('demo_mode');
                    window.location.reload();
                  }}
                  className="text-xs font-medium text-gray-500 hover:underline"
                >
                  Matikan Demo Mode
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-blue-100 text-sm mt-6">
          Belum punya akun?{' '}
          <button 
            onClick={onRegisterClick}
            className="text-white font-medium hover:underline"
          >
            Daftar sekarang
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
