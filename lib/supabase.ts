
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
 * Gestão de Persistência Mock para Modo Simulação
 */
const MOCK_SESSION_KEY = 'shred_arena_mock_session';
const MOCK_USERS_DB = 'shred_arena_users_db';
const MOCK_VIDEOS_DB = 'shred_arena_videos_db';
const MOCK_BATTLES_DB = 'shred_arena_battles_db';
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

export const getMockBattles = (): any[] => {
  const saved = localStorage.getItem(MOCK_BATTLES_DB);
  return saved ? JSON.parse(saved) : [];
};

const saveMockBattle = (battle: any) => {
  const battles = getMockBattles();
  battles.push(battle);
  localStorage.setItem(MOCK_BATTLES_DB, JSON.stringify(battles));
  return battle;
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
 * Verifica a conectividade real com o banco de dados.
 */
export async function checkSupabaseConnection() {
  if (!supabase) return { success: false, message: "Simulation Mode" };
  try {
    const { error } = await supabase.from('battle_videos').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      return { success: false, message: "Offline" };
    }
    return { success: true, message: "Arena Online" };
  } catch (err: any) {
    return { success: false, message: "Error" };
  }
}

/**
 * Criação de Batalha (Duelo)
 */
export const createBattle = async (playerAId: string, playerBId: string) => {
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + 48);

  const payload = {
    id: 'b-' + Math.random().toString(36).substr(2, 9),
    player_a_id: playerAId,
    player_b_id: playerBId,
    end_time: endTime.toISOString(),
    status: 'active',
    created_at: new Date().toISOString()
  };

  if (!supabase) {
    saveMockBattle(payload);
    return { data: payload, error: null };
  }
  
  return await supabase
    .from('battles')
    .insert([payload])
    .select()
    .single();
};

/**
 * Matchmaking Global (Híbrido: Real + Mock)
 */
export const runGlobalMatchmaking = async () => {
  console.group("Arena Matchmaker v1.1.9");
  
  let allVideos: any[] = [];
  let busyIds = new Set<string>();

  if (supabase) {
    try {
      const { data: battles } = await supabase.from('battles').select('player_a_id, player_b_id');
      battles?.forEach(b => {
        if (b.player_a_id) busyIds.add(b.player_a_id);
        if (b.player_b_id) busyIds.add(b.player_b_id);
      });

      const { data: videos } = await supabase.from('battle_videos').select('id, author_id, author_name').order('created_at', { ascending: true });
      if (videos) allVideos = videos;
    } catch (e) {
      console.error("Erro ao buscar dados reais para matchmaking:", e);
    }
  } else {
    // Modo Simulação: Usar LocalStorage
    const mockBattles = getMockBattles();
    mockBattles.forEach(b => {
      busyIds.add(b.player_a_id);
      busyIds.add(b.player_b_id);
    });
    allVideos = getMockVideos();
  }

  const orphans = allVideos.filter(v => !busyIds.has(v.id));
  console.log(`Status: ${allVideos.length} vídeos, ${orphans.length} sem duelo.`);

  if (orphans.length < 2) {
    console.log("Status: Aguardando mais competidores.");
    console.groupEnd();
    return { count: 0 };
  }

  let matchesCreated = 0;
  const assignedInThisRun = new Set<string>();

  for (let i = 0; i < orphans.length; i++) {
    const videoA = orphans[i];
    if (assignedInThisRun.has(videoA.id)) continue;

    for (let j = i + 1; j < orphans.length; j++) {
      const videoB = orphans[j];
      if (assignedInThisRun.has(videoB.id)) continue;

      if (videoA.author_id !== videoB.author_id) {
        console.log(`⚔️ PAREANDO: ${videoA.author_name} VS ${videoB.author_name}`);
        
        const { error } = await createBattle(videoA.id, videoB.id);
        if (!error) {
          assignedInThisRun.add(videoA.id);
          assignedInThisRun.add(videoB.id);
          matchesCreated++;
          break; 
        }
      }
    }
  }

  console.log(`Sucesso: ${matchesCreated} novos duelos criados.`);
  console.groupEnd();
  return { count: matchesCreated };
};

export const auth = {
  signUp: async (email: string, pass: string, name: string) => {
    if (!supabase) {
      const users = getMockUsers();
      if (users.find(u => u.email === email)) {
        return { data: { user: null, session: null }, error: { message: "E-mail já cadastrado localmente." } };
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
      const users = getMockUsers();
      const user = users.find(u => u.email === email);
      if (user) {
        const session = setMockSession(user);
        return { data: { user, session }, error: null };
      }
      return { data: { user: null, session: null }, error: { message: "Guerreiro não encontrado na base local. Cadastre-se primeiro!" } };
    }
    return await supabase.auth.signInWithPassword({ email, password: pass });
  },

  updateUser: async (attributes: any) => {
    if (!supabase) {
      const currentSession = getMockSession();
      if (!currentSession) return { data: { user: null }, error: { message: "Sessão expirada." } };
      const updatedUser = {
        ...currentSession.user,
        user_metadata: { ...currentSession.user.user_metadata, ...(attributes.data || {}) }
      };
      saveMockUser(updatedUser);
      const session = setMockSession(updatedUser);
      return { data: { user: updatedUser, session }, error: null };
    }
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
      if (mock) setTimeout(() => callback('INITIAL_SESSION', mock), 50);
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  }
};
