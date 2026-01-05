
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Trophy, User, Upload, Guitar, Bell, Search } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Arena', icon: <Flame className="w-5 h-5" /> },
    { path: '/rankings', label: 'Ranking', icon: <Trophy className="w-5 h-5" /> },
    { path: '/upload', label: 'Desafiar', icon: <Upload className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] selection:bg-red-600 selection:text-white">
      {/* Dynamic Background Ornament */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-red-600/5 blur-[120px] pointer-events-none z-0" />

      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 py-4">
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
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-black" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />
            <Link to="/profile" className="flex items-center gap-3 group pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-white uppercase leading-none">Kiko Jr.</p>
                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">Diamond Rank</p>
              </div>
              <div className="relative">
                <img src="https://picsum.photos/id/64/100/100" className="w-10 h-10 rounded-xl border-2 border-white/10 group-hover:border-red-600 transition-colors object-cover" alt="Profile" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full p-6 pb-32">
        {children}
      </main>

      {/* Mobile Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden bg-black/80 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-[2rem] flex items-center gap-10 shadow-2xl">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              location.pathname === item.path ? 'text-red-500 scale-110' : 'text-zinc-500'
            }`}
          >
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
