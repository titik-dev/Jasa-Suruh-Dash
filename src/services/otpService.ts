const EDGE_BASE = import.meta.env.VITE_SUPABASE_EDGE_URL || '';
const DEMO_MODE =
  (import.meta as any).env?.VITE_DEMO_MODE === 'true' ||
  (typeof window !== 'undefined' && localStorage.getItem('demo_mode') === '1');

const resolveEdgeUrl = (path: string) => {
  if (EDGE_BASE) return `${EDGE_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  if (!supabaseUrl) return '';
  return `${supabaseUrl.replace('.supabase.co', '.functions.supabase.co')}/${path.replace(/^\//, '')}`;
};

export const sendOtp = async (phone: string) => {
  if (DEMO_MODE) {
    return { status: true };
  }
  const url = resolveEdgeUrl('whatsapp-otp');
  if (!url) throw new Error('Edge URL not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'send', phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to send OTP');
  return data;
};

export const verifyOtp = async (phone: string, code: string, loginType: 'user' | 'driver' | 'admin') => {
  if (DEMO_MODE) {
    if (code !== '123456') throw new Error('OTP demo salah. Gunakan 123456.');
    return { session: { access_token: 'demo', refresh_token: 'demo' } };
  }
  const url = resolveEdgeUrl('whatsapp-otp');
  if (!url) throw new Error('Edge URL not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', phone, code, loginType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to verify OTP');
  return data;
};
