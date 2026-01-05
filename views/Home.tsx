
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Timer, Users, TrendingUp, Sword, Trophy, Play, Gift } from 'lucide-react';
import { TOP_RANKING, MOCK_BATTLES } from '../constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const Home: React.FC = () => {
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('battles')
            .select(`
              id,
              status,
              end_time,
              player_a:battle_videos!player_a_id(*),
              player_b:battle_videos!player_b_id(*)
            `)
            .eq('status', 'active')
            .limit(5);

          if (!error && data && data.length > 0) {
            setBattles(data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Erro ao buscar do Supabase, usando Mocks:", e);
      }
      
      // Fallback para Mocks se o Supabase falhar ou não houver dados
      // Transformando MOCK_BATTLES para o formato esperado pela view
      const formattedMocks = MOCK_BATTLES.map(b => ({
        id: b.id,
        status: b.status,
        end_time: b.endTime,
        player_a: { ...b.playerA, author_name: b.playerA.authorName, thumbnail_url: b.playerA.thumbnailUrl },
        player_b: { ...b.playerB, author_name: b.playerB.authorName, thumbnail_url: b.playerB.thumbnailUrl }
      }));
      
      setBattles(formattedMocks);
      setLoading(false);
    };

    fetchBattles();
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
             {!isSupabaseConfigured && (
               <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">Modo Demo (Offline)</span>
             )}
          </div>

          <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-[0.85] tracking-tighter">
            SHRED <br /> <span className="text-red-600">OR DIE.</span>
          </h1>
          
          <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-lg">
            A arena onde a técnica encontra a glória. Desafie os melhores guitarristas do mundo em duelos de 60 segundos validados por IA.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/upload" className="group relative overflow-hidden bg-white text-black px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest hover:scale-[1.05] transition-all shadow-2xl">
              <span className="relative z-10 flex items-center gap-3">
                 <Sword className="w-5 h-5 fill-black" /> Entrar na Arena
              </span>
              <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>

            <Link to="/rankings" className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-500" /> Ranking
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

      {/* GRANDE PRÊMIO SECTION */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#111] to-black border border-white/5 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-full bg-red-600/5 blur-[120px] pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-yellow-500">
                <Gift className="w-6 h-6" />
                <span className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500">Season Grand Prize</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-[0.9] tracking-tighter text-white">
                O VENCEDOR VAI <br />
                <span className="text-red-600">GANHAR ESTA GUITARRA.</span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-8 pt-4">
               <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-white font-black italic tracking-tighter text-sm">GUITAR MASTER BRAND</div>
            </div>
          </div>
          <div className="lg:col-span-5 relative flex items-center justify-center">
             <div className="relative z-10 bg-white/5 border border-white/10 rounded-[4rem] p-10 backdrop-blur-3xl shadow-2xl">
                <img src="https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=800&auto=format&fit=crop" className="w-full max-w-[300px] h-auto rounded-3xl rotate-12 hover:rotate-6 transition-all duration-700" alt="Prize Guitar" />
             </div>
          </div>
        </div>
      </section>

      {/* LIVE BATTLES LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4">
            <TrendingUp className="text-red-600 w-8 h-8" /> Live Duels
          </h2>

          <div className="grid grid-cols-1 gap-12">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-zinc-500 font-black uppercase italic animate-pulse">Carregando Arena...</div>
            ) : battles.map((battle) => (
              <Link key={battle.id} to={`/battle/${battle.id}`} className="group block">
                <div className="relative bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-red-600/40 shadow-2xl min-h-[350px]">
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Player A */}
                    <div className="relative md:w-1/2 overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
                      <img src={battle.player_a.thumbnail_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-8 left-10">
                        <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter">{battle.player_a.author_name}</h4>
                        <span className="text-[10px] font-black text-red-500 uppercase">{battle.player_a.style}</span>
                      </div>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                      <div className="bg-[#050505] w-16 h-16 rounded-full border-4 border-zinc-900 flex items-center justify-center shadow-2xl">
                         <span className="text-lg font-black italic text-red-600">VS</span>
                      </div>
                    </div>

                    {/* Player B */}
                    <div className="relative md:w-1/2 overflow-hidden">
                      <img src={battle.player_b.thumbnail_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-8 right-10 text-right">
                        <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter">{battle.player_b.author_name}</h4>
                        <span className="text-[10px] font-black text-zinc-400 uppercase">{battle.player_b.style}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between px-6 text-[10px] font-black uppercase text-zinc-500">
                   <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5"><Timer className="w-3 h-3 text-red-600" /> Ativo</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {(battle.player_a.votes || 0) + (battle.player_b.votes || 0)} Votos</span>
                   </div>
                   <div className="flex items-center gap-2 text-red-600 group-hover:text-white transition-colors">
                      <Play className="w-3 h-3 fill-current" />
                      <span>Ver Duelo</span>
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Hall of Fame Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] p-6 space-y-6">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
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
