
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string | undefined => {
  try {
    const val = (window as any).process?.env?.[key] || (process as any).env?.[key];
    if (typeof val === 'string' && val.length > 0 && !val.includes('process.env.')) {
      return val;
    }
    return undefined;
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

const MOCK_SESSION_KEY = 'shred_arena_mock_session';
const MOCK_USERS_DB = 'shred_arena_users_db';
const MOCK_VIDEOS_DB = 'shred_arena_videos_db';
const MOCK_BATTLES_DB = 'shred_arena_battles_db';
const listeners: Set<(event: string, session: any) => void> = new Set();

const safeParse = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return [];
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getMockUsers = (): any[] => safeParse(MOCK_USERS_DB);
export const getMockVideos = (): any[] => safeParse(MOCK_VIDEOS_DB);
export const getMockBattles = (): any[] => safeParse(MOCK_BATTLES_DB);

const saveMockUser = (user: any) => {
  const users = getMockUsers();
  const index = users.findIndex(u => u.email === user.email);
  if (index === -1) users.push(user);
  else users[index] = user;
  localStorage.setItem(MOCK_USERS_DB, JSON.stringify(users));
};

export const saveMockVideo = (video: any) => {
  const videos = getMockVideos();
  videos.push(video);
  localStorage.setItem(MOCK_VIDEOS_DB, JSON.stringify(videos));
  return video;
};

const saveMockBattle = (battle: any) => {
  const battles = getMockBattles();
  battles.push(battle);
  localStorage.setItem(MOCK_BATTLES_DB, JSON.stringify(battles));
  return battle;
};

const getMockSession = () => {
  try {
    const item = localStorage.getItem(MOCK_SESSION_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const setMockSession = (user: any) => {
  const session = { 
    user, 
    access_token: 'mock_' + Math.random().toString(36).substr(2), 
    expires_at: Math.floor(Date.now() / 1000) + 3600 
  };
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  listeners.forEach(l => l('SIGNED_IN', session));
  return session;
};

export async function checkSupabaseConnection() {
  if (!supabase) return { success: false, message: "Simulation Mode" };
  try {
    const { error } = await supabase.from('battle_videos').select('id').limit(1);
    if (error) return { success: false, message: "Offline" };
    return { success: true, message: "Arena Online" };
  } catch {
    return { success: false, message: "Connection Error" };
  }
}

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
  
  return await supabase.from('battles').insert([payload]).select().single();
};

export const runGlobalMatchmaking = async () => {
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
       console.warn("Matchmaking query fail", e);
    }
  } else {
    const mockBattles = getMockBattles();
    mockBattles.forEach(b => {
      busyIds.add(b.player_a_id);
      busyIds.add(b.player_b_id);
    });
    allVideos = getMockVideos();
  }

  const orphans = allVideos.filter(v => v && !busyIds.has(v.id));
  if (orphans.length < 2) return { count: 0 };

  let matchesCreated = 0;
  const assignedInThisRun = new Set<string>();

  for (let i = 0; i < orphans.length; i++) {
    const videoA = orphans[i];
    if (assignedInThisRun.has(videoA.id)) continue;

    for (let j = i + 1; j < orphans.length; j++) {
      const videoB = orphans[j];
      if (assignedInThisRun.has(videoB.id)) continue;

      if (videoA.author_id !== videoB.author_id) {
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
  return { count: matchesCreated };
};

export const auth = {
  signUp: async (email: string, pass: string, name: string) => {
    if (!supabase) {
      const users = getMockUsers();
      if (users.find(u => u.email === email)) return { data: { user: null }, error: { message: "E-mail já cadastrado localmente." } };
      const mockUser = { id: 'm-' + Math.random().toString(36).substr(2), email, user_metadata: { display_name: name } };
      saveMockUser(mockUser);
      return { data: { user: mockUser, session: setMockSession(mockUser) }, error: null };
    }
    return await supabase.auth.signUp({ email, password: pass, options: { data: { display_name: name } } });
  },
  signIn: async (email: string, pass: string) => {
    if (!supabase) {
      const user = getMockUsers().find(u => u.email === email);
      if (user) return { data: { user, session: setMockSession(user) }, error: null };
      return { data: null, error: { message: "Guerreiro não encontrado localmente." } };
    }
    return await supabase.auth.signInWithPassword({ email, password: pass });
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
    if (!supabase) return { data: { user: getMockSession()?.user || null }, error: null };
    return await supabase.auth.getUser();
  },
  getSession: async () => {
    if (!supabase) return { data: { session: getMockSession() }, error: null };
    return await supabase.auth.getSession();
  },
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    if (!supabase) {
      listeners.add(callback);
      const mock = getMockSession();
      if (mock) setTimeout(() => callback('INITIAL_SESSION', mock), 1);
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },
  updateUser: async (attributes: any) => {
    if (!supabase) {
      const session = getMockSession();
      if (!session) return { error: { message: "Sem sessão ativa." } };
      const updated = { ...session.user, user_metadata: { ...session.user.user_metadata, ...attributes.data } };
      saveMockUser(updated);
      return { data: { user: updated, session: setMockSession(updated) }, error: null };
    }
    return await supabase.auth.updateUser(attributes);
  }
};
