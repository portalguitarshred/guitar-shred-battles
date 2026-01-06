
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Timer, Users, TrendingUp, Sword, Trophy, Play, RefreshCw, Activity, Loader2 } from 'lucide-react';
import { TOP_RANKING, MOCK_BATTLES } from '../constants';
import { supabase, isSupabaseConfigured, runGlobalMatchmaking, getMockBattles, getMockVideos } from '../lib/supabase';

const Home: React.FC = () => {
  const [battles, setBattles] = useState<any[]>([]);
  const [pendingVideos, setPendingVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMocks, setUsingMocks] = useState(false);

  const loadMockArena = () => {
    console.log("⚠️ Arena: Carregando modo de simulação...");
    
    // Pega as batalhas mock do LocalStorage (criadas pelo matchmaker)
    const storedBattles = getMockBattles();
    const allVideos = getMockVideos();

    const dynamicMocks = storedBattles.map(b => {
      const playerA = allVideos.find(v => v.id === b.player_a_id);
      const playerB = allVideos.find(v => v.id === b.player_b_id);
      return {
        ...b,
        player_a: playerA,
        player_b: playerB
      };
    }).filter(b => b.player_a && b.player_b);

    // Se não houver dinâmicas, mostra os exemplos fixos
    if (dynamicMocks.length === 0) {
      const formattedMocks = MOCK_BATTLES.map(b => ({
        id: b.id, status: b.status, end_time: b.endTime,
        player_a: { ...b.playerA, author_name: b.playerA.authorName, thumbnail_url: b.playerA.thumbnailUrl },
        player_b: { ...b.playerB, author_name: b.playerB.authorName, thumbnail_url: b.playerB.thumbnailUrl }
      }));
      setBattles(formattedMocks);
    } else {
      setBattles(dynamicMocks);
    }

    setPendingVideos(allVideos.slice(-5));
    setUsingMocks(true);
    setLoading(false);
  };

  const fetchArenaData = async () => {
    try {
      // Tenta rodar matchmaking hibrido em cada load
      await runGlobalMatchmaking();

      if (isSupabaseConfigured && supabase) {
        const { data: battleData, error: battleError } = await supabase
          .from('battles')
          .select(`
            id, status, end_time,
            player_a:battle_videos!player_a_id(*),
            player_b:battle_videos!player_b_id(*)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        const { data: recentVideos } = await supabase
          .from('battle_videos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (battleError) throw battleError;

        if (battleData && battleData.length > 0) {
          setBattles(battleData);
          setUsingMocks(false);
        } else {
           loadMockArena();
        }

        if (recentVideos) setPendingVideos(recentVideos);
      } else {
        loadMockArena();
      }
    } catch (e) {
      console.error("Home Data Error:", e);
      loadMockArena();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArenaData();
  }, []);

  return (
    <div className="space-y-12 py-4 animate-in fade-in duration-700">
      {/* CINEMATIC HERO */}
      <section className="relative group overflow-hidden rounded-[3rem] border border-white/5 bg-[#0a0a0a] min-h-[450px] flex items-center p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-red-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Season 04 Open</span>
             </div>
             {usingMocks && (
               <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full flex items-center gap-2 border border-yellow-500/20">
                 <RefreshCw className="w-3 h-3" />
                 Simulação
               </span>
             )}
          </div>

          <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-[0.85] tracking-tighter text-white">
            SHRED <br /> <span className="text-red-600">OR DIE.</span>
          </h1>
          
          <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-lg">
            A arena onde a técnica encontra a glória. Desafie os melhores guitarristas do mundo em duelos validados por IA.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/upload" className="group relative overflow-hidden bg-white text-black px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest hover:scale-[1.05] transition-all shadow-2xl">
              <span className="relative z-10 flex items-center gap-3">
                 <Sword className="w-5 h-5 fill-black" /> Entrar na Arena
              </span>
              <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        <div className="absolute right-20 hidden xl:flex flex-col items-center gap-4">
           <div className="relative">
              <div className="w-64 h-64 border-2 border-white/5 rounded-[2rem] flex items-center justify-center p-4 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                 <img src="https://picsum.photos/id/10/400/400" className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all shadow-2xl" />
              </div>
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white">
              <TrendingUp className="text-red-600 w-8 h-8" /> Duelos Ativos ({battles.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                 <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                 <span className="text-zinc-500 font-black uppercase italic text-[10px] tracking-[0.3em]">Sincronizando Arena...</span>
              </div>
            ) : battles.length > 0 ? battles.map((battle) => (
              <Link key={battle.id} to={`/battle/${battle.id}`} className="group block">
                <div className="relative bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-red-600/40 shadow-2xl min-h-[350px]">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="relative md:w-1/2 overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
                      <img src={battle.player_a?.thumbnail_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-8 left-10">
                        <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter">{battle.player_a?.author_name}</h4>
                        <span className="text-[10px] font-black text-red-500 uppercase">{battle.player_a?.style}</span>
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                      <div className="bg-[#050505] w-16 h-16 rounded-full border-4 border-zinc-900 flex items-center justify-center shadow-2xl">
                         <span className="text-lg font-black italic text-red-600">VS</span>
                      </div>
                    </div>
                    <div className="relative md:w-1/2 overflow-hidden">
                      <img src={battle.player_b?.thumbnail_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-8 right-10 text-right">
                        <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter">{battle.player_b?.author_name}</h4>
                        <span className="text-[10px] font-black text-zinc-400 uppercase">{battle.player_b?.style}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-white/5 rounded-[3rem]">
                 <p className="font-black uppercase italic text-sm">Nenhuma batalha encontrada</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
            <div className="space-y-1">
               <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
                 <Activity className="text-green-500 w-5 h-5" /> Novos Desafiantes
               </h3>
               <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600">Últimos Vídeos Postados</p>
            </div>

            <div className="space-y-6">
               {pendingVideos.length > 0 ? pendingVideos.map((vid) => (
                 <div key={vid.id} className="flex items-center gap-4 group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                       <img src={vid.thumbnail_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="font-black italic uppercase text-white truncate text-sm">{vid.author_name}</p>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-red-600/10 text-red-500 rounded border border-red-600/20">{vid.category}</span>
                          <span className="text-[8px] font-black uppercase text-zinc-500 tracking-tighter">{vid.style}</span>
                       </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 </div>
               )) : (
                 <div className="text-center py-6 text-zinc-600 border border-dashed border-white/5 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest">A arena está calma...</p>
                 </div>
               )}
            </div>

            <Link to="/upload" className="block w-full text-center py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all">
               Enviar Meu Desafio
            </Link>
          </div>

          <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
              <Trophy className="text-yellow-500 w-6 h-6" /> Hall of Fame
            </h3>
            <div className="space-y-4">
              {TOP_RANKING.map((rank, idx) => (
                <div key={rank.id} className="flex items-center gap-4 p-2">
                  <span className="text-xl font-black italic text-zinc-700 w-6">{idx + 1}</span>
                  <img src={rank.avatar} className="w-10 h-10 rounded-xl object-cover" />
                  <div className="flex-1">
                     <p className="font-black italic text-sm text-white uppercase">{rank.name}</p>
                     <p className="text-[8px] font-bold text-red-500 uppercase">{rank.score} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
