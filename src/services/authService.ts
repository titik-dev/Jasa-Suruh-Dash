import { supabase } from '@/lib/supabase';

export interface SignUpData {
  phone: string;
  password: string;
  name: string;
  userType: 'user' | 'driver';
  vehicleType?: string;
  vehiclePlate?: string;
}

export interface SignInData {
  phone: string;
  password: string;
}

// Format phone number (add +62 if needed)
const formatPhone = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add +62 if starts with 0
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.slice(1);
  }
  
  // Add + if not present
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }
  
  return cleaned;
};

// Sign up new user
export const signUp = async (data: SignUpData) => {
  const formattedPhone = formatPhone(data.phone);
  const email = `${formattedPhone.replace(/\+/g, '')}@jsg.local`;
  
  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: data.password,
    phone: formattedPhone,
    options: {
      data: {
        name: data.name,
        user_type: data.userType,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  // Create profile in appropriate table
  if (data.userType === 'driver') {
    const { error: profileError } = await supabase.from('drivers').insert({
      id: authData.user.id,
      phone: formattedPhone,
      name: data.name,
      email: email,
      vehicle_type: data.vehicleType || 'Motor',
      vehicle_plate: data.vehiclePlate || '-',
      status: 'OFFLINE',
    } as any);

    if (profileError) throw profileError;
  } else {
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      phone: formattedPhone,
      name: data.name,
      email: email,
      points: 0,
    } as any);

    if (profileError) throw profileError;
  }

  return authData;
};

// Sign in with phone and password
export const signIn = async (data: SignInData) => {
  const formattedPhone = formatPhone(data.phone);
  const email = `${formattedPhone.replace(/\+/g, '')}@jsg.local`;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password: data.password,
  });

  if (error) throw error;
  return authData;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

// Get user profile (user or driver)
export const getUserProfile = async (userId: string) => {
  // Try to get user profile first
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userProfile && typeof userProfile === 'object') {
    return { ...(userProfile as Record<string, unknown>), userType: 'user' as const };
  }

  // If not found, try driver profile
  const { data: driverProfile } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', userId)
    .single();

  if (driverProfile && typeof driverProfile === 'object') {
    return { ...(driverProfile as Record<string, unknown>), userType: 'driver' as const };
  }

  throw new Error('Profile not found');
};

// Update user profile
export const updateProfile = async (userId: string, userType: 'user' | 'driver', data: Record<string, unknown>) => {
  const table = userType === 'driver' ? 'drivers' : 'users';
  
  const { data: updatedProfile, error } = await supabase
    .from(table)
    .update(data as never)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return updatedProfile;
};

// Send OTP (for phone verification)
export const sendOTP = async (phone: string) => {
  const formattedPhone = formatPhone(phone);
  
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });

  if (error) throw error;
  return data;
};

// Verify OTP
export const verifyOTP = async (phone: string, token: string) => {
  const formattedPhone = formatPhone(phone);
  
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: 'sms',
  });

  if (error) throw error;
  return data;
};

// Reset password
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
};

// Update password
export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
};

// Subscribe to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
