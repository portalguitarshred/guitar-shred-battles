
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Youtube, CheckCircle2, Link as LinkIcon, Play, Sword } from 'lucide-react';
import { Category, SkillLevel, Style } from '../types';
import { supabase } from '../lib/supabase';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    category: Category.SHRED,
    style: Style.METAL,
    skillLevel: SkillLevel.ADVANCED,
    authorName: ''
  });

  useEffect(() => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    setVideoId(id);
  }, [youtubeUrl]);

  const handleSubmit = async () => {
    if (!videoId) return;
    setLoading(true);
    
    // 1. Inserir o vídeo
    const { data: newVideo, error: videoError } = await supabase
      .from('battle_videos')
      .insert([{
        author_name: form.authorName || 'Anonymous Shredder',
        video_url: youtubeUrl,
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        category: form.category,
        style: form.style,
        skill_level: form.skillLevel,
        votes: 0
      }])
      .select()
      .single();

    if (videoError) {
      alert("Erro ao enviar: " + videoError.message);
      setLoading(false);
      return;
    }

    // 2. Lógica de Matchmaking: Procura oponente na mesma categoria que NÃO esteja em batalha
    const { data: opponent } = await supabase
      .from('battle_videos')
      .select('id')
      .eq('category', form.category)
      .neq('id', newVideo.id)
      .limit(1)
      .maybeSingle();

    if (opponent) {
      // Cria a batalha
      await supabase.from('battles').insert([{
        player_a_id: newVideo.id,
        player_b_id: opponent.id,
        status: 'active',
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      }]);
    }

    setStep(3);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 2500);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-700">
      <div className="bg-[#0d0d0d] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
        {step === 1 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black italic uppercase text-center">Entre na Arena</h2>
            <div className="relative bg-black border border-white/10 rounded-2xl p-2 flex items-center">
              <LinkIcon className="w-5 h-5 text-zinc-500 ml-4" />
              <input 
                type="text" 
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Link do YouTube ou Shorts" 
                className="w-full bg-transparent py-4 px-4 text-sm font-bold focus:outline-none"
              />
            </div>
            {videoId && (
              <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 relative group">
                <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Play className="w-12 h-12 text-white fill-current" />
                </div>
              </div>
            )}
            <button onClick={() => setStep(2)} disabled={!videoId} className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase italic tracking-widest disabled:opacity-20 transition-all">
              Próximo Passo
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
             <div className="space-y-4">
                <input 
                   type="text"
                   placeholder="SEU NOME DE ARTISTA"
                   className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-black uppercase"
                   onChange={e => setForm({...form, authorName: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                   <select onChange={e => setForm({...form, category: e.target.value as Category})} className="bg-black border border-white/10 rounded-xl p-4 text-xs font-black uppercase">
                      {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                   <select onChange={e => setForm({...form, style: e.target.value as Style})} className="bg-black border border-white/10 rounded-xl p-4 text-xs font-black uppercase">
                      {Object.values(Style).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
             </div>
             <button onClick={handleSubmit} disabled={loading} className="w-full shred-gradient py-5 rounded-2xl text-white font-black uppercase italic tracking-widest shadow-xl">
                {loading ? 'Validando Solo...' : 'Publicar na Arena'}
             </button>
          </div>
        )}

        {step === 3 && (
          <div className="py-20 text-center space-y-6">
             <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(22,163,74,0.4)] animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-white" />
             </div>
             <h2 className="text-4xl font-black italic uppercase">Solo Enviado!</h2>
             <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">Aguarde o matchmaking ou veja outros duelos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
