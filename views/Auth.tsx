
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Guitar, Mail, Lock, User, ArrowRight, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth, isSupabaseConfigured } from '../lib/supabase';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Se não houver redirect, manda para o profile após login
  const redirectPath = searchParams.get('redirect') || '/profile';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
  }, [isLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Atenção: A Arena está em MODO SIMULAÇÃO. Cadastros reais não são permitidos aqui.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const result = await auth.signIn(formData.email, formData.password);
        if (result.error) throw result.error;
        if (result.data?.user) {
          navigate(redirectPath);
        }
      } else {
        if (!formData.name) throw new Error("Escolha um Nome de Artista.");
        if (formData.password.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");
        
        const result = await auth.signUp(formData.email, formData.password, formData.name);
        if (result.error) throw result.error;
        
        setSuccessMsg("Identidade forjada! Verifique seu e-mail para confirmar o cadastro e poder entrar na arena.");
        setIsLogin(true);
      }
    } catch (err: any) {
      let msg = err.message;
      if (msg.includes("Email not confirmed")) {
        msg = "E-mail ainda não confirmado. Verifique sua caixa de entrada ou spam.";
      }
      setError(msg || "Erro na conexão com a Arena.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-600/10 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="relative bg-[#0d0d0d] border border-white/5 p-10 rounded-[3.5rem] shadow-2xl space-y-8 backdrop-blur-sm">
          
          <div className="text-center space-y-4">
            <div className="inline-flex bg-red-600 p-4 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)] mb-2 rotate-[-4deg]">
              <Guitar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              {isLogin ? 'Back to Battle' : 'New Identity'}
            </h2>
          </div>

          {error && (
            <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl flex items-start gap-3 text-red-500 text-[11px] font-black uppercase tracking-widest leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-600/10 border border-green-600/20 p-4 rounded-2xl flex flex-col gap-2 text-green-500 text-[11px] font-black uppercase tracking-widest leading-relaxed">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-600 ml-4 tracking-widest italic">Stage Name</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="EX: SLASH_JR" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black border border-white/5 rounded-2xl py-4.5 pl-14 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all text-white"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-zinc-600 ml-4 tracking-widest italic">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="GUERREIRO@ARENA.COM" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black border border-white/5 rounded-2xl py-4.5 pl-14 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-zinc-600 ml-4 tracking-widest italic">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-black border border-white/5 rounded-2xl py-4.5 pl-14 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all text-white"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-red-600 hover:text-white transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-6 shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar na Arena' : 'Confirmar Identidade'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[10px] font-black uppercase text-zinc-500 hover:text-white tracking-widest transition-colors flex items-center gap-2 mx-auto group"
            >
              {isLogin ? (
                <>Sem identidade forjada? <span className="text-red-500 group-hover:underline">Cadastre-se</span></>
              ) : (
                <>Já é um competidor? <span className="text-red-500 group-hover:underline">Login</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
