
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string | undefined => {
  try {
    const val = (window as any).process?.env?.[key] || (process as any).env?.[key];
    if (val === `process.env.${key}` || !val) return undefined;
    return val;
  } catch (e) {
    return undefined;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Verifica a conectividade com o Supabase.
 * Exportado explicitamente como função para evitar erros de resolução de símbolo.
 */
export async function checkSupabaseConnection() {
  if (!supabase) return { success: false, message: "Offline" };
  try {
    const { error } = await supabase.from('battle_videos').select('id').limit(1);
    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, message: "Conectado" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Helper unificado para autenticação.
 */
export const auth = {
  signUp: async (email: string, pass: string, name: string) => {
    if (!supabase) return { error: { message: "Arena em modo simulação." } };
    return await (supabase.auth as any).signUp({
      email,
      password: pass,
      options: {
        data: { 
          display_name: name, 
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}` 
        },
        emailRedirectTo: window.location.origin
      }
    });
  },
  signIn: async (email: string, pass: string) => {
    if (!supabase) return { error: { message: "Arena em modo simulação." } };
    return await (supabase.auth as any).signInWithPassword({ email, password: pass });
  },
  signOut: async () => {
    if (!supabase) return;
    return await (supabase.auth as any).signOut();
  },
  getUser: async () => {
    if (!supabase) return { data: { user: null }, error: null };
    return await (supabase.auth as any).getUser();
  },
  getSession: async () => {
    if (!supabase) return { data: { session: null }, error: null };
    return await (supabase.auth as any).getSession();
  },
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    if (!supabase) return { data: { subscription: null } };
    return (supabase.auth as any).onAuthStateChange(callback);
  }
};
