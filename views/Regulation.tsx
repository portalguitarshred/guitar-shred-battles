
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, CheckCircle2, ShieldAlert, Music, ArrowLeft } from 'lucide-react';

const Regulation: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const rules = [
    { title: "Duração Exata", desc: "Seu vídeo deve ter exatamente 60 segundos. Vídeos maiores ou menores serão desclassificados automaticamente pela IA." },
    { title: "Mixagem Justa", desc: "A Backing Track deve estar em volume audível, mas a sua guitarra deve ser o destaque principal (70/30 de mix)." },
    { title: "Sem Edição de Áudio", desc: "É proibido o uso de correção de afinação (Auto-tune) ou edição de tempo (Elastic Audio) em sua performance." },
    { title: "Vídeo em Alta Definição", desc: "A imagem deve estar clara e as suas mãos devem estar visíveis o tempo todo para validação técnica." }
  ];

  const handleDownload = () => {
    if (!accepted) return;
    // Simulação de download
    alert("Iniciando download da Backing Track oficial...");
    // Poderia redirecionar para o upload ou voltar
  };

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-700">
      <div className="space-y-12">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-red-600 mb-2">
               <FileText className="w-6 h-6" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Official Competition Docs</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">Regulamento do Duelo</h1>
            <p className="text-zinc-500 font-medium text-lg italic">"A arena não perdoa erros. A técnica é a sua única verdade."</p>
          </div>
          <button onClick={() => navigate(-1)} className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all">
             <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule, i) => (
            <div key={i} className="bg-[#0d0d0d] border border-white/5 p-8 rounded-[2rem] space-y-4 hover:border-red-600/30 transition-all">
               <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600 font-black italic">
                  0{i+1}
               </div>
               <h3 className="text-xl font-black uppercase italic tracking-tight text-white">{rule.title}</h3>
               <p className="text-zinc-500 text-sm leading-relaxed font-medium">{rule.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-red-600/5 border border-red-600/20 p-10 rounded-[3rem] space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] pointer-events-none" />
           
           <div className="flex items-center gap-4 text-red-500 relative z-10">
              <ShieldAlert className="w-6 h-6" />
              <h4 className="text-lg font-black uppercase tracking-widest">Compromisso do Shredder</h4>
           </div>
           
           <label className="flex items-start gap-6 cursor-pointer group relative z-10">
              <input 
                type="checkbox" 
                className="mt-1 w-6 h-6 bg-zinc-900 border-white/10 rounded-md checked:bg-red-600 transition-all"
                checked={accepted}
                onChange={() => setAccepted(!accepted)}
              />
              <span className="text-zinc-300 font-medium leading-relaxed select-none">
                Eu li e compreendo todas as regras do duelo. Entendo que qualquer tentativa de fraude ou edição ilegal resultará em banimento permanente da Arena ShredBattles.
              </span>
           </label>

           <div className="pt-4 relative z-10">
              <button 
                onClick={handleDownload}
                disabled={!accepted}
                className={`w-full flex items-center justify-center gap-4 py-6 rounded-2xl font-black uppercase italic tracking-widest transition-all transform ${
                  accepted 
                  ? 'bg-white text-black hover:bg-red-600 hover:text-white hover:scale-[1.02]' 
                  : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                }`}
              >
                <div className={`${accepted ? 'bg-red-600 text-white' : 'bg-zinc-800'} p-2 rounded-lg`}>
                  <Download className="w-5 h-5" />
                </div>
                Baixar Backing Track Oficial (WAV/MP3)
              </button>
           </div>
        </div>

        <div className="flex items-center justify-center gap-4 opacity-40">
           <Music className="w-4 h-4 text-zinc-500" />
           <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Formato: High-Fidelity 24-bit // 48kHz</span>
        </div>
      </div>
    </div>
  );
};

export default Regulation;
