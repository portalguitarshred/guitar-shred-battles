
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
  const index = users.findIndex(u => u.email === user.email);
  if (index === -1) {
    users.push(user);
  } else {
    users[index] = user;
  }
  localStorage.setItem(MOCK_USERS_DB, JSON.stringify(users));
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
  const session = { 
    user, 
    access_token: 'mock_token_' + Date.now(), 
    expires_at: Math.floor(Date.now() / 1000) + 3600 
  };
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
 * Este objeto abstrai se estamos salvando localmente ou no banco real.
 */
export const auth = {
  signUp: async (email: string, pass: string, name: string) => {
    if (!supabase) {
      // MOCK SIGNUP
      const users = getMockUsers();
      if (users.find(u => u.email === email)) {
        return { data: null, error: { message: "Este e-mail já está em uso na arena local." } };
      }
      
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

    // REAL SUPABASE SIGNUP
    return await supabase.auth.signUp({
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
      // MOCK SIGNIN
      const users = getMockUsers();
      const user = users.find(u => u.email === email);
      if (user) {
        // Em um sistema real haveria verificação de senha, aqui simulamos sucesso.
        const session = setMockSession(user);
        // Fix: Changed the mock return structure to match Supabase's { data: { user, session }, error } structure
        return { data: { user, session }, error: null };
      }
      return { data: { user: null, session: null }, error: { message: "Identidade não encontrada. Verifique seu e-mail ou cadastre-se." } };
    }

    // REAL SUPABASE SIGNIN
    return await supabase.auth.signInWithPassword({ email, password: pass });
  },

  updateUser: async (attributes: any) => {
    if (!supabase) {
      // MOCK UPDATE
      const currentSession = getMockSession();
      if (!currentSession) return { data: null, error: { message: "Sessão expirada." } };
      
      const updatedUser = {
        ...currentSession.user,
        user_metadata: {
          ...currentSession.user.user_metadata,
          ...(attributes.data || {})
        }
      };
      
      saveMockUser(updatedUser);
      const session = setMockSession(updatedUser);
      return { data: { user: updatedUser, session }, error: null };
    }

    // REAL SUPABASE UPDATE
    return await supabase.auth.updateUser(attributes);
  },

  signOut: async () => {
    if (!supabase) {
      localStorage.removeItem(MOCK_SESSION_KEY);
      listeners.forEach(l => l('SIGNED_OUT', null));
      return { error: null };
    }
    return await supabase.auth.signOut();
  },

  getUser: async () => {
    if (!supabase) {
      const mock = getMockSession();
      return { data: { user: mock?.user || null }, error: null };
    }
    return await supabase.auth.getUser();
  },

  getSession: async () => {
    if (!supabase) {
      const mock = getMockSession();
      return { data: { session: mock }, error: null };
    }
    return await supabase.auth.getSession();
  },

  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    if (!supabase) {
      listeners.add(callback);
      const mock = getMockSession();
      if (mock) {
        // Notifica o estado inicial com um pequeno delay
        setTimeout(() => callback('INITIAL_SESSION', mock), 50);
      }
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  }
};
