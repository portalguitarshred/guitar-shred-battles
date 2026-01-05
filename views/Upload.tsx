
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Youtube, CheckCircle2, Link as LinkIcon, Play, Loader2, Brain, Activity, ShieldCheck, Zap } from 'lucide-react';
import { Category, SkillLevel, Style } from '../types';
import { supabase, isSupabaseConfigured, auth, saveMockVideo } from '../lib/supabase';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [validationStage, setValidationStage] = useState(0);
  
  const [form, setForm] = useState({
    category: Category.SHRED,
    style: Style.METAL,
    skillLevel: SkillLevel.ADVANCED,
  });

  useEffect(() => {
    auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user || null);
    });
  }, []);

  useEffect(() => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    setVideoId(id);
  }, [youtubeUrl]);

  const handleSubmit = async () => {
    if (!videoId || !currentUser) return;
    
    setLoading(true);
    setStep(4); // Vai para tela de validação

    const stages = [
      "Escaneando Frequências...",
      "Validando Sincronia Rítmica...",
      "Analisando BPM e Pitch...",
      "Identidade Confirmada na Arena!"
    ];

    for (let i = 0; i < stages.length; i++) {
      setValidationStage(i);
      await new Promise(r => setTimeout(r, 1200));
    }

    const authorName = currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0];
    const videoData = {
      id: 'v-' + Math.random().toString(36).substr(2, 9),
      author_id: currentUser.id,
      author_name: authorName,
      video_url: youtubeUrl,
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      category: form.category,
      style: form.style,
      skill_level: form.skillLevel,
      votes: 0,
      created_at: new Date().toISOString()
    };
    
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: videoError } = await supabase
          .from('battle_videos')
          .insert([videoData]);

        if (videoError) throw videoError;
      } else {
        // Modo Simulação
        saveMockVideo(videoData);
      }

      setStep(3); // Sucesso
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error: any) {
      alert("Erro ao publicar: " + error.message);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-700">
      <div className="bg-[#0d0d0d] border border-white/5 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
        {step === 1 && (
          <div className="space-y-10">
            <div className="text-center space-y-2">
               <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">Enter the Arena</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Insira o link da sua performance épica</p>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600/5 blur-xl group-focus-within:bg-red-600/10 transition-all" />
              <div className="relative bg-black border border-white/5 rounded-[2rem] p-3 flex items-center shadow-inner">
                <LinkIcon className="w-5 h-5 text-zinc-600 ml-6" />
                <input 
                  type="text" 
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..." 
                  className="w-full bg-transparent py-5 px-6 text-[11px] font-black uppercase tracking-widest focus:outline-none text-white placeholder:text-zinc-800"
                />
              </div>
            </div>

            {videoId ? (
              <div className="aspect-video rounded-[2.5rem] overflow-hidden border-2 border-white/5 relative group animate-in zoom-in-95 duration-500">
                <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                   <div className="bg-white/10 backdrop-blur-md p-6 rounded-full border border-white/20">
                      <Play className="w-12 h-12 text-white fill-current" />
                   </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-zinc-700">
                 <Youtube className="w-12 h-12" />
                 <p className="text-[9px] font-black uppercase tracking-widest">Aguardando sinal do YouTube...</p>
              </div>
            )}

            <button onClick={() => setStep(2)} disabled={!videoId} className="w-full py-6 rounded-2xl bg-white text-black font-black uppercase italic tracking-widest disabled:opacity-10 transition-all hover:bg-red-600 hover:text-white hover:scale-[1.02] shadow-xl">
              Próximo Passo
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
             <div className="space-y-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-6">
                   <div className="relative">
                      <img src={currentUser?.user_metadata?.avatar_url} className="w-16 h-16 rounded-2xl border-2 border-white/10" />
                      <div className="absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-lg">
                         <ShieldCheck className="w-3 h-3 text-black" />
                      </div>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic leading-none mb-2">Identidade Verificada</p>
                      <p className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{currentUser?.user_metadata?.display_name || 'Shredder'}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-zinc-600 ml-4 tracking-[0.2em]">Categoria Técnica</label>
                      <select value={form.category} onChange={e => setForm({...form, category: e.target.value as Category})} className="w-full bg-black border border-white/5 rounded-2xl p-5 text-[10px] font-black uppercase text-white outline-none focus:border-red-600 transition-colors appearance-none shadow-inner">
                        {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-zinc-600 ml-4 tracking-[0.2em]">Estilo Musical</label>
                      <select value={form.style} onChange={e => setForm({...form, style: e.target.value as Style})} className="w-full bg-black border border-white/5 rounded-2xl p-5 text-[10px] font-black uppercase text-white outline-none focus:border-red-600 transition-colors appearance-none shadow-inner">
                        {Object.values(Style).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>
                </div>
             </div>

             <div className="bg-red-600/5 p-6 rounded-2xl border border-red-600/10">
                <p className="text-[9px] font-black uppercase text-red-500 tracking-widest text-center">Ao publicar, você concorda em ser julgado pela IA da Arena.</p>
             </div>

             <button onClick={handleSubmit} disabled={loading} className="w-full bg-red-600 py-6 rounded-2xl text-white font-black uppercase italic tracking-widest shadow-2xl hover:bg-red-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-4">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Activity className="w-5 h-5" /> Publicar na Arena</>}
             </button>
          </div>
        )}

        {step === 4 && (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in duration-500">
             <div className="relative">
                <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 animate-pulse" />
                <div className="relative w-24 h-24 bg-red-600/10 border border-red-600/30 rounded-3xl flex items-center justify-center">
                   <Brain className="w-12 h-12 text-red-600 animate-bounce" />
                </div>
             </div>
             <div className="space-y-3">
                <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">
                   {["Escaneando...", "Validando...", "Analisando...", "Sincronizando..."][validationStage]}
                </h2>
                <div className="w-64 h-1.5 bg-zinc-900 rounded-full overflow-hidden mx-auto border border-white/5">
                   <div 
                      className="h-full bg-red-600 transition-all duration-700 ease-out" 
                      style={{ width: `${(validationStage + 1) * 25}%` }} 
                   />
                </div>
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] animate-pulse">
                   {["BPM", "Sincronia", "Pitch", "Matchmaking"][validationStage]} AI VALIDATION
                </p>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-24 text-center space-y-10 animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-green-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.3)] rotate-12">
                <CheckCircle2 className="w-12 h-12 text-black" />
             </div>
             <div className="space-y-2">
                <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter">No Palco!</h2>
                <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Sua performance foi aceita pela Arena. Redirecionando...</p>
             </div>
             <div className="inline-flex items-center gap-2 bg-white/5 px-6 py-2 rounded-full border border-white/5">
                <Zap className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">+500 XP DE ESTREIA</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
