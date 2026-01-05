
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// No ambiente Vercel/Vite, usamos import.meta.env ou process.env dependendo do bundler.
// Esta implementação cobre ambos os casos para garantir que a tela não fique preta.
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

if (!isSupabaseConfigured) {
  console.warn("ShredBattles: Supabase não detectado. Iniciando em modo de simulação (Mock).");
}
