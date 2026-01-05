
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
 * Mock Persistence Management for Simulation Mode
 */
const MOCK_SESSION_KEY = 'shred_arena_mock_session';
const MOCK_USERS_DB = 'shred_arena_users_db';
const MOCK_VIDEOS_DB = 'shred_arena_videos_db';
const listeners: Set<(event: string, session: any) => void> = new Set();

export const getMockUsers = (): any[] => {
  const saved = localStorage.getItem(MOCK_USERS_DB);
  return saved ? JSON.parse(saved) : [];
};

const saveMockUser = (user: any) => {
  const users = getMockUsers();
  const exists = users.find(u => u.email === user.email);
  if (!exists) {
    users.push(user);
    localStorage.setItem(MOCK_USERS_DB, JSON.stringify(users));
  }
};

export const getMockVideos = (): any[] => {
  const saved = localStorage.getItem(MOCK_VIDEOS_DB);
  return saved ? JSON.parse(saved) : [];
};

export const saveMockVideo = (video: any) => {
  const videos = getMockVideos();
  videos.push(video);
  localStorage.setItem(MOCK_VIDEOS_DB, JSON.stringify(videos));
  return video;
};

const getMockSession = () => {
  const saved = localStorage.getItem(MOCK_SESSION_KEY);
  return saved ? JSON.parse(saved) : null;
};

const setMockSession = (user: any) => {
  const session = { user, access_token: 'mock_token_' + Date.now(), expires_at: Date.now() + 3600000 };
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  listeners.forEach(l => l('SIGNED_IN', session));
  return session;
};

/**
 * Verifica a conectividade com o Supabase.
 */
export async function checkSupabaseConnection() {
  if (!supabase) return { success: false, message: "Modo Simulação" };
  try {
    const { error } = await supabase.from('battle_videos').select('id').limit(1);
    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, message: "Conectado" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Helper unificado para autenticação (Híbrido)
 */
export const auth = {
  signUp: async (email: string, pass: string, name: string) => {
    if (!supabase) {
      const mockUser = {
        id: 'dev-' + Math.random().toString(36).substr(2, 9),
        email,
        user_metadata: { 
          display_name: name, 
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}` 
        }
      };
      saveMockUser(mockUser);
      const session = setMockSession(mockUser);
      return { data: { user: mockUser, session }, error: null };
    }
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
    if (!supabase) {
      const users = getMockUsers();
      const user = users.find(u => u.email === email);
      if (user) {
        const session = setMockSession(user);
        return { data: session, error: null };
      }
      return { data: { user: null, session: null }, error: { message: "Identidade não encontrada. Registre-se primeiro." } };
    }
    return await (supabase.auth as any).signInWithPassword({ email, password: pass });
  },
  signOut: async () => {
    localStorage.removeItem(MOCK_SESSION_KEY);
    listeners.forEach(l => l('SIGNED_OUT', null));
    if (!supabase) return;
    return await (supabase.auth as any).signOut();
  },
  getUser: async () => {
    if (!supabase) {
      const mock = getMockSession();
      return { data: { user: mock?.user || null }, error: null };
    }
    return await (supabase.auth as any).getUser();
  },
  getSession: async () => {
    if (!supabase) {
      const mock = getMockSession();
      return { data: { session: mock }, error: null };
    }
    return await (supabase.auth as any).getSession();
  },
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    if (!supabase) {
      listeners.add(callback);
      const mock = getMockSession();
      if (mock) {
        setTimeout(() => callback('INITIAL_SESSION', mock), 50);
      }
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    }
    return (supabase.auth as any).onAuthStateChange(callback);
  }
};
