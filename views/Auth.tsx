
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Guitar, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(false);
  const redirectPath = searchParams.get('redirect') || '/';

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login/registro
    navigate(redirectPath);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-in fade-in duration-700">
      <div className="w-full max-w-md space-y-8 bg-[#0d0d0d] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[60px] pointer-events-none" />
        
        <div className="text-center space-y-3">
          <div className="bg-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.3)] mb-6 rotate-[-5deg]">
            <Guitar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            {isLogin ? 'Bem-vindo de Volta' : 'Junte-se ao Exército'}
          </h2>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
            {isLogin ? 'Entre na Arena' : 'Crie sua Conta de Guitarrista'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 pt-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="NOME DE ARTISTA" 
                className="w-full bg-zinc-900 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:border-red-600 outline-none transition-all"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="email" 
              placeholder="EMAIL@EXEMPLO.COM" 
              className="w-full bg-zinc-900 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:border-red-600 outline-none transition-all"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="password" 
              placeholder="SENHA SECRETA" 
              className="w-full bg-zinc-900 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:border-red-600 outline-none transition-all"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 mt-4"
          >
            {isLogin ? 'Entrar na Arena' : 'Criar Perfil Shredder'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-[10px] font-black uppercase text-zinc-500 hover:text-red-500 tracking-[0.2em] transition-colors"
          >
            {isLogin ? 'Não tem conta? Registre-se aqui' : 'Já é um competidor? Faça login'}
          </button>
        </div>

        <div className="flex items-center gap-2 justify-center pt-8 border-t border-white/5 mt-8 opacity-50">
           <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
           <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Dados Protegidos por ShredCloud</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
