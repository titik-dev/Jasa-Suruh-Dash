import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY (or VITE_* variants).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return `+62${cleaned.slice(1)}`;
  if (!cleaned.startsWith('+')) return `+${cleaned}`;
  return cleaned;
};

const toEmail = (phone) => `${formatPhone(phone).replace(/\+/g, '')}@jsg.local`;

const accounts = [
  {
    role: 'user',
    phone: '081234567890',
    password: 'password123',
    name: 'Ahmad Fauzi',
  },
  {
    role: 'driver',
    phone: '081234567891',
    password: 'password123',
    name: 'Pak Budi',
    vehicleType: 'Honda Beat',
    vehiclePlate: 'AB 1234 XY',
  },
  {
    role: 'admin',
    phone: '081234567892',
    password: 'admin123',
    name: 'Administrator',
  },
];

const signUpWithProfile = async (account) => {
  const email = toEmail(account.phone);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: account.password,
    phone: formatPhone(account.phone),
    options: {
      data: {
        name: account.name,
        user_type: account.role === 'admin' ? 'user' : account.role,
      },
    },
  });

  if (error) {
    console.error(`[${account.role}] signUp failed:`, error.message);
    return;
  }

  const user = data.user;
  const session = data.session;

  if (!user) {
    console.error(`[${account.role}] signUp missing user.`);
    return;
  }

  if (!session) {
    console.warn(
      `[${account.role}] signUp requires email confirmation. Disable confirmation in Supabase Auth for dev or insert profile manually.`
    );
    return;
  }

  if (account.role === 'driver') {
    const { error: profileError } = await supabase.from('drivers').insert({
      id: user.id,
      phone: formatPhone(account.phone),
      name: account.name,
      email,
      vehicle_type: account.vehicleType || 'Motor',
      vehicle_plate: account.vehiclePlate || '-',
      status: 'OFFLINE',
    });
    if (profileError) {
      console.error('[driver] profile insert failed:', profileError.message);
    }
  } else {
    const { error: profileError } = await supabase.from('users').insert({
      id: user.id,
      phone: formatPhone(account.phone),
      name: account.name,
      email,
      points: 0,
    });
    if (profileError) {
      console.error(`[${account.role}] profile insert failed:`, profileError.message);
    }
  }

  await supabase.auth.signOut();
  console.log(`[${account.role}] created: ${email}`);
};

const main = async () => {
  for (const account of accounts) {
    await signUpWithProfile(account);
  }

  console.log('\nAdmin role setup:');
  console.log('Run this in Supabase SQL Editor to mark admin:');
  console.log(`update auth.users set app_metadata = jsonb_set(coalesce(app_metadata, '{}'::jsonb), '{role}', '"admin"', true) where email = '${toEmail('081234567892')}';`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
