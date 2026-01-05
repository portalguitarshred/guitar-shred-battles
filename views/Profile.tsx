
import React, { useEffect, useState } from 'react';
import { Trophy, Target, Zap, Instagram, Award, Star, Edit3, Play, Loader2, Link2 } from 'lucide-react';
import { supabase, isSupabaseConfigured, auth } from '../lib/supabase';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await auth.getUser();
        if (data?.user) {
          setUser(data.user);
          
          const { data: videos } = await supabase
            .from('battle_videos')
            .select('*')
            .eq('author_id', data.user.id)
            .order('created_at', { ascending: false });

          if (videos) setUserVideos(videos);
        }
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

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

  return (
    <div className="space-y-12 py-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
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
                  Um novo desafiante acaba de entrar na arena Shred Battles. Que os solos comecem.
               </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
               <div className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                  <Instagram className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">@{displayName.toLowerCase().replace(' ', '_')}</span>
               </div>
               <div className="flex items-center gap-3 text-zinc-500">
                  <Link2 className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Shred.Link/ID_{user.id.slice(0,4).toUpperCase()}</span>
               </div>
               <div className="flex items-center gap-3 text-zinc-500">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Elite Member</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto">
             <button className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 transition-all">
                <Edit3 className="w-4 h-4" /> Editar Perfil
             </button>
          </div>
        </div>
      </section>

      {/* MEUS VÍDEOS REAIS */}
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
                    <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white border border-white/10">
                       {vid.category}
                    </div>
                 </div>
                 <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-white uppercase italic">{vid.style}</span>
                       <span className="text-[9px] font-black text-zinc-600 uppercase italic tracking-tighter">{new Date(vid.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                       <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Duelo Ativo // Em Votação</p>
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
                <h3 className="text-xl font-black uppercase italic text-zinc-500 tracking-tighter">Arena em Silêncio</h3>
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
