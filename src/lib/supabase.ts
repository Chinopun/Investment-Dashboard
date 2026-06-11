import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !anon) {
  if (typeof window !== 'undefined') {
    console.warn('Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});

export const USER_EMAIL =
  process.env.NEXT_PUBLIC_USER_EMAIL ?? 'chinopun2008@gmail.com';

export async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', USER_EMAIL)
    .maybeSingle();
  if (error) {
    console.warn('getCurrentUserId', error.message);
    return null;
  }
  return data?.id ?? null;
}
