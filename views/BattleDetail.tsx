
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Sword, 
  ArrowLeft, 
  Timer, 
  Activity, 
  Users,
  Download,
  Zap
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_BATTLES } from '../constants';

const BattleDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState<any>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchBattleData = async () => {
      // 1. Tentar buscar no Supabase se configurado
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

      // 2. Fallback para Mocks
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

    // 3. Escutar Realtime apenas se configurado
    let channel: any;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel(`battle_changes_${id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'battle_videos' 
        }, (payload) => {
          setBattle((current: any) => {
            if (!current) return current;
            const updatedPlayer = payload.new;
            return {
              ...current,
              player_a: current.player_a.id === updatedPlayer.id ? updatedPlayer : current.player_a,
              player_b: current.player_b.id === updatedPlayer.id ? updatedPlayer : current.player_b,
            };
          });
        })
        .subscribe();
    }

    return () => { if (channel) supabase?.removeChannel(channel); };
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

  const handleVote = async (side: 'A' | 'B') => {
    if (voted || !battle) return;
    const player = side === 'A' ? battle.player_a : battle.player_b;
    
    // Se Supabase está ativo, persiste. Se não, apenas simula localmente.
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('battle_videos')
        .update({ votes: (player.votes || 0) + 1 })
        .eq('id', player.id);
      
      if (error) {
        console.error("Erro ao votar:", error);
      }
    } else {
      // Simulação local em modo offline
      setBattle((prev: any) => ({
        ...prev,
        [side === 'A' ? 'player_a' : 'player_b']: {
          ...player,
          votes: (player.votes || 0) + 1
        }
      }));
    }

    setVoted(side);
    setTimeout(() => setShowAI(true), 1200);
  };

  if (!battle) return <div className="min-h-screen flex items-center justify-center font-black italic uppercase text-zinc-700">Conectando à Arena...</div>;

  const total = (battle.player_a.votes || 0) + (battle.player_b.votes || 0);
  const pctA = total > 0 ? Math.round((battle.player_a.votes / total) * 100) : 50;
  const pctB = 100 - pctA;

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('.mp4')) return url; // Suporte a vídeo direto para mocks
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const vid = (match && match[2].length === 11) ? match[2] : 'dQw4w9WgXcQ';
    return `https://www.youtube.com/embed/${vid}?modestbranding=1&rel=0`;
  };

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex justify-between items-center px-2">
        <Link to="/" className="flex items-center gap-3 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Voltar à Arena
        </Link>
        <div className="bg-zinc-900 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-black text-zinc-400">
          DUELO #{String(battle.id).slice(0,8)}
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="bg-red-600 inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">Live Battle</div>
        <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter text-white tabular-nums">{timeLeft}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Player A */}
        <div className="space-y-6">
          <div className="aspect-video rounded-[2.5rem] overflow-hidden border-2 border-white/5 bg-black relative shadow-2xl">
             <iframe src={getYouTubeEmbedUrl(battle.player_a.video_url)} className="w-full h-full" allowFullScreen />
             {pctA > pctB && <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"><Zap className="w-3 h-3 fill-white" /> Líder</div>}
          </div>
          <div className="flex justify-between items-end px-4">
             <div>
                <p className="text-[10px] font-black text-red-600 uppercase">Candidato A</p>
                <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">{battle.player_a.author_name}</h3>
             </div>
             <div className="text-right">
                <p className="text-4xl font-black italic text-white leading-none">{battle.player_a.votes}</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gritos</p>
             </div>
          </div>
          <button onClick={() => handleVote('A')} disabled={!!voted} className={`w-full py-6 rounded-3xl font-black uppercase italic tracking-widest transition-all ${voted === 'A' ? 'bg-green-600' : voted ? 'bg-zinc-900 text-zinc-700' : 'bg-white text-black hover:bg-red-600 hover:text-white'}`}>
             {voted === 'A' ? 'Voto Confirmado' : 'Votar neste Solo'}
          </button>
        </div>

        {/* Player B */}
        <div className="space-y-6">
          <div className="aspect-video rounded-[2.5rem] overflow-hidden border-2 border-white/5 bg-black relative shadow-2xl">
             <iframe src={getYouTubeEmbedUrl(battle.player_b.video_url)} className="w-full h-full" allowFullScreen />
             {pctB > pctA && <div className="absolute top-4 right-4 bg-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"><Zap className="w-3 h-3 fill-white" /> Líder</div>}
          </div>
          <div className="flex justify-between items-end px-4">
             <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase">Candidato B</p>
                <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">{battle.player_b.author_name}</h3>
             </div>
             <div className="text-right">
                <p className="text-4xl font-black italic text-white leading-none">{battle.player_b.votes}</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gritos</p>
             </div>
          </div>
          <button onClick={() => handleVote('B')} disabled={!!voted} className={`w-full py-6 rounded-3xl font-black uppercase italic tracking-widest transition-all ${voted === 'B' ? 'bg-green-600' : voted ? 'bg-zinc-900 text-zinc-700' : 'bg-white text-black hover:bg-red-600 hover:text-white'}`}>
             {voted === 'B' ? 'Voto Confirmado' : 'Votar neste Solo'}
          </button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-12 space-y-8 relative overflow-hidden">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
           <span>Flow {pctA}%</span>
           <span>Impacto {pctB}%</span>
        </div>
        <div className="h-4 bg-zinc-900 rounded-full overflow-hidden flex p-1">
           <div style={{ width: `${pctA}%` }} className="h-full bg-red-600 transition-all duration-1000 shadow-[0_0_20px_rgba(239,68,68,0.5)] rounded-full" />
           <div style={{ width: `${pctB}%` }} className="h-full bg-zinc-800 transition-all duration-1000 rounded-full ml-1" />
        </div>
      </div>
    </div>
  );
};

export default BattleDetail;
