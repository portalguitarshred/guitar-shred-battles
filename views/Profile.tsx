
import React from 'react';
import { MOCK_USER, MOCK_BATTLES } from '../constants';
import { Trophy, Target, Zap, Link as LinkIcon, Instagram, Youtube, Award, Clock, Star, Edit3, Settings } from 'lucide-react';

const Profile: React.FC = () => {
  const user = MOCK_USER;

  return (
    <div className="space-y-12 py-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* BENTO HEADER CARD */}
      <section className="relative bg-[#0d0d0d] border border-white/5 rounded-[3rem] p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/5 via-transparent to-transparent" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-12">
          {/* Avatar Area */}
          <div className="relative group">
            <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src={user.avatar} className="relative w-48 h-48 rounded-[2.5rem] object-cover border-4 border-[#151515] shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
            <div className="absolute -bottom-4 -right-4 bg-red-600 p-4 rounded-2xl shadow-xl rotate-12 group-hover:rotate-0 transition-transform">
               <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
               <div className="flex items-center gap-4">
                  <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{user.name}</h1>
                  <span className="bg-red-600/10 border border-red-600/20 text-red-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">Pro Member</span>
               </div>
               <p className="text-zinc-400 font-medium max-w-xl text-lg leading-relaxed italic border-l-2 border-red-600 pl-6">"{user.bio}"</p>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
               <div className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                  <Instagram className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">kiko_shred</span>
               </div>
               <div className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                  <Youtube className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">ShredChannel</span>
               </div>
               <div className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                  <Star className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">4.8 Avg IA Score</span>
               </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full lg:w-auto">
             <button className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 transition-all">
                <Edit3 className="w-4 h-4" /> Editar Perfil
             </button>
             <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:bg-white/10 transition-colors">
                <Settings className="w-4 h-4" /> Definições
             </button>
          </div>
        </div>
      </section>

      {/* STATS HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Batalhas Vencidas', value: '124', icon: <Trophy className="w-5 h-5 text-yellow-500" />, trend: '+12 este mês' },
          { label: 'Win Rate Global', value: `${user.winRate}%`, icon: <Target className="w-5 h-5 text-red-500" />, trend: 'Top 5% League' },
          { label: 'Rank Global', value: '#482', icon: <Award className="w-5 h-5 text-blue-500" />, trend: 'Diamond II' },
          { label: 'Streak Semanal', value: '5 Dias', icon: <Zap className="w-5 h-5 text-orange-500" />, trend: 'Fire Multiplier x2' },
        ].map((stat, i) => (
          <div key={i} className="group bg-[#0d0d0d] border border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:border-red-600/30 transition-all shadow-xl">
            <div className="flex justify-between items-center">
              <div className="p-3 bg-white/5 rounded-xl text-zinc-500 group-hover:text-white transition-colors">
                {stat.icon}
              </div>
              <span className="text-[8px] font-black uppercase text-zinc-600 tracking-[0.2em]">{stat.trend}</span>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">{stat.label}</p>
               <p className="text-4xl font-black italic text-white leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Battle History Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex justify-between items-end border-b border-white/5 pb-6 px-2">
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Histórico de Duelos</h2>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Temporada Atual</p>
            </div>
            <div className="flex gap-2">
              <button className="px-5 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase italic tracking-widest">Todas</button>
              <button className="px-5 py-2 rounded-xl bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase italic tracking-widest hover:text-white transition-colors">Vitórias</button>
            </div>
          </div>
          
          <div className="space-y-4">
            {MOCK_BATTLES.map((battle) => (
              <div key={battle.id} className="group bg-[#0d0d0d] border border-white/5 p-8 rounded-[2.5rem] hover:border-red-600/30 transition-all cursor-pointer relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex flex-1 items-center gap-10">
                    <div className="relative flex -space-x-8 group-hover:-space-x-4 transition-all duration-500">
                      <img src={battle.playerA.thumbnailUrl} className="w-20 h-20 rounded-2xl border-4 border-[#0d0d0d] object-cover shadow-2xl z-20" />
                      <img src={battle.playerB.thumbnailUrl} className="w-20 h-20 rounded-2xl border-4 border-[#0d0d0d] object-cover shadow-2xl z-10" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black italic uppercase text-xl text-white group-hover:text-red-500 transition-colors">
                        vs {battle.playerB.authorName}
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase text-zinc-500 tracking-tighter">
                         <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 2 Weeks Ago</span>
                         <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                         <span className="text-red-500">{battle.playerA.category} Arena</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                     <div className="text-right">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Score IA</p>
                        <p className="text-2xl font-black italic text-white">8.2</p>
                     </div>
                     <div className="bg-green-600/10 border border-green-600/20 text-green-500 text-[10px] font-black px-6 py-3 rounded-2xl uppercase tracking-[0.2em] shadow-lg">
                        Vitória
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Progression */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-[#0d0d0d] border border-white/5 p-10 rounded-[3rem] space-y-10 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Progressão</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Diamond League</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-4xl font-black italic leading-none">42</p>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">LEVEL ATUAL</p>
                </div>
                <p className="text-[10px] font-black text-red-500 uppercase italic tracking-widest">2,450 / 3,000 XP</p>
              </div>
              <div className="relative h-4 w-full bg-zinc-900 rounded-full overflow-hidden p-1 border border-white/5">
                <div className="h-full shred-gradient rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(239,68,68,0.5)]" style={{ width: '82%' }} />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Estilos Dominantes</p>
              <div className="flex flex-wrap gap-2">
                 {user.styles.map(s => (
                   <span key={s} className="bg-white/5 hover:bg-red-600/10 hover:text-red-500 text-[10px] font-black uppercase px-4 py-2 rounded-xl border border-white/5 transition-all cursor-default">
                     {s}
                   </span>
                 ))}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Conquistas Elite</p>
              <div className="grid grid-cols-3 gap-4">
                 {user.achievements.map((a, i) => (
                   <div key={i} className="group relative aspect-square bg-[#111] border border-white/5 rounded-2xl flex items-center justify-center cursor-help hover:border-red-600/50 transition-all">
                      <Award className="w-7 h-7 text-yellow-500 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-32 p-3 bg-black border border-white/10 text-[9px] font-black uppercase rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center shadow-2xl z-30">
                        {a}
                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black" />
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </section>

          <div className="bg-gradient-to-br from-red-600 to-red-900 rounded-[3rem] p-10 text-white space-y-6 shadow-2xl shadow-red-600/20 relative overflow-hidden">
             <div className="relative z-10 space-y-4">
               <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Desbloqueia <br />o teu Potencial</h3>
               <p className="text-sm font-medium opacity-90 leading-relaxed">Vídeos ilimitados, relatórios detalhados da IA e badges exclusivas de campeão.</p>
               <button className="w-full bg-black hover:bg-zinc-900 text-white py-5 rounded-[1.5rem] font-black uppercase italic tracking-widest transition-all shadow-xl active:scale-95">
                  Tornar-me PRO
               </button>
             </div>
             <Star className="absolute top-[-20px] left-[-20px] w-32 h-32 opacity-10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
