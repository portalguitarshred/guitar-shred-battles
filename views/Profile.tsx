
import React, { useEffect, useState } from 'react';
import { Trophy, Target, Zap, Instagram, Award, Star, Edit3, Play, Loader2, Link2, X, Save, Globe } from 'lucide-react';
import { supabase, isSupabaseConfigured, auth, getMockVideos } from '../lib/supabase';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [editForm, setEditForm] = useState({
    display_name: '',
    instagram: '',
    website: ''
  });

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data } = await auth.getUser();
      if (data?.user) {
        setUser(data.user);
        setEditForm({
          display_name: data.user.user_metadata?.display_name || '',
          instagram: data.user.user_metadata?.instagram || '',
          website: data.user.user_metadata?.website || ''
        });
        
        let allVideos: any[] = [];

        if (isSupabaseConfigured && supabase) {
          const { data: videos } = await supabase
            .from('battle_videos')
            .select('*')
            .eq('author_id', data.user.id)
            .order('created_at', { ascending: false });

          if (videos) allVideos = [...videos];
        }

        const mockVideos = getMockVideos().filter(v => v.author_id === data.user.id);
        allVideos = [...allVideos, ...mockVideos];

        const uniqueVideos = Array.from(new Set(allVideos.map(v => v.id)))
          .map(id => allVideos.find(v => v.id === id))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setUserVideos(uniqueVideos);
      }
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const { data, error } = await auth.updateUser({
        data: {
          display_name: editForm.display_name,
          instagram: editForm.instagram,
          website: editForm.website
        }
      });

      if (error) throw error;
      
      setUser(data.user);
      setIsEditing(false);
    } catch (err: any) {
      alert("Erro ao atualizar perfil: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
         <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 animate-pulse">Sincronizando Identidade...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6">
         <div className="bg-red-600/10 p-6 rounded-full border border-red-600/20">
            <Zap className="w-12 h-12 text-red-600" />
         </div>
         <div className="space-y-2">
           <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Identidade Não Localizada</h2>
           <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Você precisa entrar na arena para ver seu perfil.</p>
         </div>
         <button onClick={() => window.location.hash = '#/auth'} className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase italic tracking-widest hover:bg-red-600 hover:text-white transition-all">
            Fazer Login
         </button>
      </div>
    );
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Shredder';
  const avatarUrl = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;
  const instagram = user?.user_metadata?.instagram;
  const website = user?.user_metadata?.website;

  return (
    <div className="space-y-12 py-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* MODAL DE EDIÇÃO */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full" />
             
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Editar Identidade</h2>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                   <X className="w-6 h-6 text-zinc-500" />
                </button>
             </div>

             <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-600 ml-4 tracking-widest italic">Nome de Artista</label>
                  <input 
                    type="text" 
                    value={editForm.display_name}
                    onChange={e => setEditForm({...editForm, display_name: e.target.value})}
                    placeholder="EX: SLASH MASTER"
                    className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-[11px] font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-600 ml-4 tracking-widest italic">Instagram Handle</label>
                  <div className="relative group">
                    <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      value={editForm.instagram}
                      onChange={e => setEditForm({...editForm, instagram: e.target.value})}
                      placeholder="@seu_perfil"
                      className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-600 ml-4 tracking-widest italic">Site / Link Externo</label>
                  <div className="relative group">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="url" 
                      value={editForm.website}
                      onChange={e => setEditForm({...editForm, website: e.target.value})}
                      placeholder="https://meusite.com"
                      className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all text-white"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saveLoading}
                  className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 mt-4 shadow-xl disabled:opacity-50"
                >
                  {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Salvar Alterações</>}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* BENTO HEADER CARD */}
      <section className="relative bg-[#0d0d0d] border border-white/5 rounded-[3rem] p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src={avatarUrl} className="relative w-48 h-48 rounded-[2.5rem] object-cover border-4 border-[#151515] shadow-2xl transition-all duration-700" alt={displayName} />
            <div className="absolute -bottom-4 -right-4 bg-red-600 p-4 rounded-2xl shadow-xl rotate-12 group-hover:rotate-0 transition-transform">
               <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
               <div className="flex items-center gap-4">
                  <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{displayName}</h1>
                  <span className="bg-red-600/10 border border-red-600/20 text-red-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">Competidor Verificado</span>
               </div>
               <p className="text-zinc-400 font-medium max-w-xl text-lg leading-relaxed italic border-l-2 border-red-600 pl-6">
                  Seja bem-vindo de volta à Arena, {displayName}. Sua jornada técnica continua.
               </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
               {instagram && (
                 <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors cursor-pointer group">
                    <Instagram className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{instagram.startsWith('@') ? instagram : `@${instagram}`}</span>
                 </a>
               )}
               {website && (
                 <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors cursor-pointer group">
                    <Globe className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Web Link</span>
                 </a>
               )}
               <div className="flex items-center gap-3 text-zinc-500">
                  <Link2 className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">ID: {user.id.slice(0,8).toUpperCase()}</span>
               </div>
               <div className="flex items-center gap-3 text-zinc-500">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Level 1 Shredder</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto">
             <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 transition-all">
                <Edit3 className="w-4 h-4" /> Editar Perfil
             </button>
          </div>
        </div>
      </section>

      {/* HISTÓRICO */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-4">
           <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-white">
              <Play className="w-5 h-5 text-red-600 fill-current" /> Histórico de Batalhas
           </h2>
           <span className="text-[9px] font-black uppercase text-zinc-500 italic tracking-widest border border-white/5 px-4 py-2 rounded-full">{userVideos.length} Atos Registrados</span>
        </div>

        {userVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userVideos.map((vid) => (
              <div key={vid.id} className="bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden group hover:border-red-600/30 transition-all shadow-xl">
                 <div className="aspect-video relative">
                    <img src={vid.thumbnail_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Play className="w-10 h-10 text-white fill-current" />
                    </div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0d0d0d] border border-dashed border-white/10 rounded-[3rem] p-24 text-center space-y-6">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                <Play className="w-6 h-6 text-zinc-700" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black uppercase italic text-zinc-500 tracking-tighter">Silêncio na Arena</h3>
                <p className="text-zinc-600 text-[10px] uppercase tracking-widest max-w-xs mx-auto font-black italic">Sua guitarra ainda não rugiu nestas terras. A glória te espera.</p>
             </div>
             <button onClick={() => window.location.hash = '#/upload'} className="inline-block bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase italic tracking-widest hover:scale-105 transition-all shadow-lg shadow-red-600/20">
                Lançar Primeiro Desafio
             </button>
          </div>
        )}
      </section>

      {/* STATS HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Battles Won', value: '0', icon: <Trophy className="w-5 h-5 text-yellow-500" />, trend: 'Season 04 Start' },
          { label: 'Global Win Rate', value: '0%', icon: <Target className="w-5 h-5 text-red-500" />, trend: 'Collecting Data' },
          { label: 'Rank Position', value: 'N/A', icon: <Award className="w-5 h-5 text-blue-500" />, trend: 'Need 1 Battle' },
          { label: 'Fame XP', value: '0', icon: <Zap className="w-5 h-5 text-orange-500" />, trend: 'Lvl 1 Shredder' },
        ].map((stat, i) => (
          <div key={i} className="group bg-[#0d0d0d] border border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:border-red-600/30 transition-all shadow-xl">
            <div className="flex justify-between items-center">
              <div className="p-3 bg-white/5 rounded-xl text-zinc-500 group-hover:text-white transition-colors border border-white/5">
                {stat.icon}
              </div>
              <span className="text-[8px] font-black uppercase text-zinc-600 tracking-[0.2em] italic">{stat.trend}</span>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 italic">[{stat.label}]</p>
               <p className="text-4xl font-black italic text-white leading-none tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
