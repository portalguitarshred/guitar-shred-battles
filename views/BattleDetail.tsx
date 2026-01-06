
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Zap,
  Brain,
  Star,
  Activity,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase, isSupabaseConfigured, getMockBattles, getMockVideos } from '../lib/supabase';
import { MOCK_BATTLES } from '../constants';
import { generateAIFeedback } from '../services/geminiService';
import { AIFeedback } from '../types';

const BattleDetail: React.FC = () => {
  const { id } = useParams();
  const [battle, setBattle] = useState<any>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchBattleData = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('battles')
            .select(`
              id, end_time, status,
              player_a:battle_videos!player_a_id(*),
              player_b:battle_videos!player_b_id(*)
            `)
            .eq('id', id)
            .maybeSingle();

          if (!error && data) {
            setBattle(data);
            return;
          }
        } catch (e) {
          console.warn("Falha ao buscar batalha no DB, tentando Mock.");
        }
      }

      // Tenta buscar no LocalStorage (Modo Simulação Dinâmico)
      const storedBattles = getMockBattles();
      const dynamicBattle = storedBattles.find(b => b.id === id);
      
      if (dynamicBattle) {
        const allVideos = getMockVideos();
        const playerA = allVideos.find(v => v.id === dynamicBattle.player_a_id);
        const playerB = allVideos.find(v => v.id === dynamicBattle.player_b_id);
        
        setBattle({
          ...dynamicBattle,
          player_a: playerA,
          player_b: playerB
        });
        return;
      }

      // Fallback para constantes fixas
      const mock = MOCK_BATTLES.find(b => b.id === id) || MOCK_BATTLES[0];
      setBattle({
        id: mock.id,
        end_time: mock.endTime,
        status: mock.status,
        player_a: { ...mock.playerA, author_name: mock.playerA.authorName, video_url: mock.playerA.videoUrl, votes: mock.playerA.votes },
        player_b: { ...mock.playerB, author_name: mock.playerB.authorName, video_url: mock.playerB.videoUrl, votes: mock.playerB.votes },
      });
    };

    fetchBattleData();
  }, [id]);

  useEffect(() => {
    if (!battle) return;
    const timer = setInterval(() => {
      const diff = +new Date(battle.end_time) - +new Date();
      if (diff <= 0) {
        setTimeLeft('ENCERRADO');
        clearInterval(timer);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [battle]);

  const requestAIVerdict = async (side: 'A' | 'B') => {
    if (!battle) return;
    setAiLoading(true);
    try {
      const player = side === 'A' ? battle.player_a : battle.player_b;
      const opponent = side === 'A' ? battle.player_b : battle.player_a;
      
      const feedback = await generateAIFeedback(
        player, 
        opponent, 
        player.votes, 
        player.votes > opponent.votes
      );
      setAiFeedback(feedback);
    } catch (e) {
      console.error("AI Verdict Error", e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleVote = async (side: 'A' | 'B') => {
    if (voted || !battle) return;
    const player = side === 'A' ? battle.player_a : battle.player_b;
    
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('battle_videos')
        .update({ votes: (player.votes || 0) + 1 })
        .eq('id', player.id);
    } else {
      setBattle((prev: any) => ({
        ...prev,
        [side === 'A' ? 'player_a' : 'player_b']: {
          ...player,
          votes: (player.votes || 0) + 1
        }
      }));
    }

    setVoted(side);
    requestAIVerdict(side);
  };

  if (!battle) return <div className="min-h-screen flex items-center justify-center font-black italic uppercase text-zinc-700 animate-pulse">Invocando a Arena...</div>;

  const total = (battle.player_a.votes || 0) + (battle.player_b.votes || 0);
  const pctA = total > 0 ? Math.round((battle.player_a.votes / total) * 100) : 50;
  const pctB = 100 - pctA;

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('.mp4')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const vid = (match && match[2].length === 11) ? match[2] : 'dQw4w9WgXcQ';
    return `https://www.youtube.com/embed/${vid}?modestbranding=1&rel=0`;
  };

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex justify-between items-center px-2">
        <Link to="/" className="flex items-center gap-3 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar à Arena
        </Link>
        <div className="bg-zinc-900/50 border border-white/5 px-4 py-2 rounded-xl text-[10px] font-black text-zinc-400 backdrop-blur-md">
          ARENA // MATCH #{String(battle.id).slice(0,8).toUpperCase()}
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
           <Activity className="w-3 h-3" /> Live Duelo
        </div>
        <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter text-white tabular-nums leading-none">{timeLeft}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Player A */}
        <div className="space-y-6">
          <div className="group relative aspect-video rounded-[2.5rem] overflow-hidden border-2 border-white/5 bg-black shadow-2xl transition-all hover:border-red-600/40">
             <iframe src={getYouTubeEmbedUrl(battle.player_a?.video_url)} className="w-full h-full" allowFullScreen />
             {pctA > pctB && <div className="absolute top-6 left-6 bg-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 shadow-xl"><Zap className="w-3 h-3 fill-white" /> Crowd Favorite</div>}
          </div>
          <div className="flex justify-between items-end px-4">
             <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Shredder Alpha</p>
                <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">{battle.player_a?.author_name}</h3>
             </div>
             <div className="text-right">
                <p className="text-4xl font-black italic text-white leading-none">{battle.player_a?.votes || 0}</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Votos</p>
             </div>
          </div>
          <button onClick={() => handleVote('A')} disabled={!!voted} className={`group relative w-full py-6 rounded-3xl font-black uppercase italic tracking-[0.2em] transition-all overflow-hidden ${voted === 'A' ? 'bg-green-600' : voted ? 'bg-zinc-900/50 text-zinc-700 border border-white/5' : 'bg-white text-black hover:bg-red-600 hover:text-white hover:scale-[1.02]'}`}>
             <span className="relative z-10">{voted === 'A' ? 'Voto Computado' : 'Dominar Arena (Votar A)'}</span>
             {!voted && <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform" />}
          </button>
        </div>

        {/* Player B */}
        <div className="space-y-6">
          <div className="group relative aspect-video rounded-[2.5rem] overflow-hidden border-2 border-white/5 bg-black shadow-2xl transition-all hover:border-red-600/40">
             <iframe src={getYouTubeEmbedUrl(battle.player_b?.video_url)} className="w-full h-full" allowFullScreen />
             {pctB > pctA && <div className="absolute top-6 right-6 bg-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 shadow-xl"><Zap className="w-3 h-3 fill-white" /> Crowd Favorite</div>}
          </div>
          <div className="flex justify-between items-end px-4">
             <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Shredder Bravo</p>
                <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">{battle.player_b?.author_name}</h3>
             </div>
             <div className="text-right">
                <p className="text-4xl font-black italic text-white leading-none">{battle.player_b?.votes || 0}</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Votos</p>
             </div>
          </div>
          <button onClick={() => handleVote('B')} disabled={!!voted} className={`group relative w-full py-6 rounded-3xl font-black uppercase italic tracking-[0.2em] transition-all overflow-hidden ${voted === 'B' ? 'bg-green-600' : voted ? 'bg-zinc-900/50 text-zinc-700 border border-white/5' : 'bg-white text-black hover:bg-red-600 hover:text-white hover:scale-[1.02]'}`}>
             <span className="relative z-10">{voted === 'B' ? 'Voto Computado' : 'Dominar Arena (Votar B)'}</span>
             {!voted && <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform" />}
          </button>
        </div>
      </div>

      {/* AI JUDGING PANEL */}
      <div className="relative bg-[#0d0d0d] border border-white/5 rounded-[3rem] p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/5 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="bg-red-600/10 p-4 rounded-2xl border border-red-600/20">
                    <Brain className="w-8 h-8 text-red-500" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">AI Technical Jury</h3>
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Powered by Gemini 1.5 Pro // Análise técnica profunda</p>
                 </div>
              </div>
              {!aiFeedback && !aiLoading && (
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest border border-white/10 px-4 py-2 rounded-xl italic">
                    Vote em um guitarrista para ver o veredito da IA
                 </p>
              )}
           </div>

           {aiLoading ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-6">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                <div className="text-center">
                   <p className="text-xl font-black italic uppercase text-white tracking-tighter">Processando Audio e Vídeo...</p>
                   <p className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] mt-2">Calculando precisão, técnica e feeling</p>
                </div>
             </div>
           ) : aiFeedback ? (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-4 space-y-6">
                   <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-center">
                      <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Technical AI Score</p>
                      <div className="text-8xl font-black italic text-red-600 leading-none">{aiFeedback.technicalScore}<span className="text-2xl text-white/20 italic">/10</span></div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/10 p-4 rounded-2xl">
                         <CheckCircle className="w-5 h-5 text-green-500" />
                         <p className="text-xs font-bold text-zinc-300 italic">{aiFeedback.publicHighlight}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-2xl">
                         <Star className="w-5 h-5 text-yellow-500" />
                         <p className="text-xs font-bold text-zinc-300 italic">{aiFeedback.publicImprovement}</p>
                      </div>
                   </div>
                </div>
                
                <div className="lg:col-span-8 space-y-8">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.5em]">Detailed Analysis</h4>
                      <p className="text-zinc-400 text-lg font-medium leading-relaxed italic border-l-2 border-red-600/30 pl-8">
                         "{aiFeedback.technicalAnalysis}"
                      </p>
                   </div>
                   <div className="bg-red-600 p-8 rounded-[2rem] space-y-4 shadow-xl">
                      <div className="flex items-center gap-3 text-white">
                         <Zap className="w-5 h-5 fill-white" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Practical Training Goal</span>
                      </div>
                      <p className="text-white text-xl font-black italic uppercase tracking-tight">
                         {aiFeedback.practicalSuggestion}
                      </p>
                   </div>
                </div>
             </div>
           ) : null}
        </div>
      </div>

      <div className="bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-[3rem] p-12 space-y-8 relative overflow-hidden">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
           <span>Arena Flow {pctA}%</span>
           <span>Technical Impact {pctB}%</span>
        </div>
        <div className="h-6 bg-zinc-900 rounded-full overflow-hidden flex p-1.5 border border-white/5 shadow-inner">
           <div style={{ width: `${pctA}%` }} className="h-full bg-red-600 transition-all duration-1000 shadow-[0_0_30px_rgba(239,68,68,0.5)] rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-shimmer" />
           </div>
           <div style={{ width: `${pctB}%` }} className="h-full bg-zinc-800 transition-all duration-1000 rounded-full ml-1" />
        </div>
      </div>
    </div>
  );
};

export default BattleDetail;
