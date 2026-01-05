
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Flame, Trophy, User, Upload, Guitar, Wifi, WifiOff, LogOut, Code, Terminal } from 'lucide-react';
import { isSupabaseConfigured, checkSupabaseConnection, auth } from '../lib/supabase';

const Layout: React.FC<{ children: React.ReactNode, user?: any }> = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const verify = async () => {
      if (!isSupabaseConfigured) {
        setDbStatus('offline');
        return;
      }
      try {
        const { success } = await checkSupabaseConnection();
        setDbStatus(success ? 'online' : 'offline');
      } catch (e) {
        setDbStatus('offline');
      }
    };
    verify();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/', label: 'Arena', icon: <Flame className="w-5 h-5" /> },
    { path: '/rankings', label: 'Ranking', icon: <Trophy className="w-5 h-5" /> },
    { path: '/upload', label: 'Desafiar', icon: <Upload className="w-5 h-5" /> },
  ];

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Guerreiro';
  const avatarUrl = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] selection:bg-red-600 selection:text-white">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-red-600/5 blur-[120px] pointer-events-none z-0" />

      <header className="sticky top-0 z-[60] border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-red-600 p-2 rounded-xl group-hover:shred-glow transition-all rotate-[-5deg] group-hover:rotate-0">
                <Guitar className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter uppercase italic leading-none">
                SHRED<span className="text-red-600">BATTLES</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                    location.pathname === item.path 
                    ? 'bg-red-600/10 text-red-500 border border-red-600/20' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
              dbStatus === 'online' ? 'bg-green-500/5 border-green-500/20 text-green-500' : 
              'bg-white/5 border-white/10 text-zinc-500'
            }`}>
              {dbStatus === 'online' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {dbStatus === 'online' ? 'Arena Online' : 'Simulation Mode'}
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-3 group pl-2 border-l border-white/10 ml-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-white uppercase leading-none">{displayName}</p>
                    <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1 italic">Arena Profile</p>
                  </div>
                  <img src={avatarUrl} className="w-10 h-10 rounded-xl border-2 border-white/10 group-hover:border-red-600 transition-colors object-cover" alt="Profile" />
                </Link>
                <button onClick={handleLogout} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-500 hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest hover:bg-red-600 hover:text-white transition-all">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full p-6 pb-32">
        {children}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-4 flex justify-between items-center pointer-events-none z-[70] px-8">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Live Status: v1.1.2 Verified</span>
             <Terminal className="w-3 h-3 text-red-500 ml-2" />
          </div>
      </footer>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] md:hidden bg-black/80 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-[2rem] flex items-center gap-10 shadow-2xl">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 transition-all ${location.pathname === item.path ? 'text-red-500 scale-110' : 'text-zinc-500'}`}>
            {item.icon}
          </Link>
        ))}
        <Link to="/profile">
           <User className={`w-5 h-5 ${location.pathname === '/profile' ? 'text-red-500' : 'text-zinc-500'}`} />
        </Link>
      </nav>
    </div>
  );
};

export default Layout;
