
import React, { useState } from 'react';
import { Trophy, Medal, Star, Flame, Search } from 'lucide-react';

const Rankings: React.FC = () => {
  const [tab, setTab] = useState('weekly');

  const rankingData = [
    { rank: 1, name: 'Slash_Master', level: 64, xp: 12500, winRate: 82, avatar: 'https://picsum.photos/id/65/100/100' },
    { rank: 2, name: 'Elias_Prog_God', level: 58, xp: 11200, winRate: 75, avatar: 'https://picsum.photos/id/66/100/100' },
    { rank: 3, name: 'Lina_Fretless', level: 52, xp: 10400, winRate: 71, avatar: 'https://picsum.photos/id/67/100/100' },
    { rank: 4, name: 'Djent_Box', level: 49, xp: 9800, winRate: 68, avatar: 'https://picsum.photos/id/68/100/100' },
    { rank: 5, name: 'Shreddy_McShred', level: 47, xp: 9500, winRate: 65, avatar: 'https://picsum.photos/id/69/100/100' },
    { rank: 6, name: 'Blues_Soul', level: 44, xp: 8200, winRate: 63, avatar: 'https://picsum.photos/id/70/100/100' },
    { rank: 7, name: 'Poly_Fan', level: 42, xp: 7800, winRate: 60, avatar: 'https://picsum.photos/id/71/100/100' },
  ];

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Ranking Global</h1>
          <p className="text-zinc-500 font-medium">The hall of fame for the greatest shredders in the world.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#151515] border border-white/5 rounded-2xl px-4 py-2 w-full md:w-64">
           <Search className="w-4 h-4 text-zinc-500" />
           <input type="text" placeholder="Search guitarist..." className="bg-transparent border-none outline-none text-sm font-bold w-full" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
         {['weekly', 'shred', 'solo', 'beginner', 'advanced'].map((t) => (
           <button 
             key={t}
             onClick={() => setTab(t)}
             className={`whitespace-nowrap px-8 py-3 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all ${
               tab === t ? 'shred-gradient text-white' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
             }`}
           >
             {t}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
            {rankingData.map((item, idx) => (
              <div 
                key={item.rank} 
                className={`flex items-center gap-6 p-6 rounded-3xl border transition-all ${
                  idx < 3 ? 'bg-red-600/5 border-red-600/20' : 'bg-[#151515] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10">
                   {item.rank === 1 ? <Trophy className="w-8 h-8 text-yellow-500" /> : 
                    item.rank === 2 ? <Medal className="w-8 h-8 text-zinc-400" /> :
                    item.rank === 3 ? <Medal className="w-8 h-8 text-orange-600" /> :
                    <span className="text-xl font-black italic text-zinc-700">{item.rank}</span>}
                </div>
                <img src={item.avatar} className="w-16 h-16 rounded-2xl border-2 border-zinc-800 object-cover" />
                <div className="flex-1">
                   <h3 className="font-black italic uppercase text-lg">{item.name}</h3>
                   <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded">LVL {item.level}</span>
                      <span className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter">WIN RATE: {item.winRate}%</span>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black italic">{item.xp.toLocaleString()}</p>
                   <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">SEASON XP</p>
                </div>
              </div>
            ))}
         </div>

         <div className="space-y-6">
            <div className="bg-[#151515] border border-white/5 p-8 rounded-[40px] space-y-6">
               <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Your Rank
               </h3>
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center font-black italic text-2xl">#482</div>
                  <div>
                     <p className="font-black italic text-lg tracking-tight uppercase">Top 15% Global</p>
                     <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Next Milestone: #400</p>
                  </div>
               </div>
               <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full shred-gradient w-[65%]" />
               </div>
               <button className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl text-xs font-black uppercase italic tracking-widest hover:bg-white/10 transition-colors">
                  View Full Progress
               </button>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/20 p-8 rounded-[40px] space-y-4">
               <div className="flex items-center gap-2 text-yellow-500">
                  <Flame className="w-5 h-5" />
                  <h3 className="font-black uppercase italic">Hot This Week</h3>
               </div>
               <p className="text-xs font-medium text-zinc-400">Winning a battle in the <span className="text-yellow-500 font-bold">FUSION</span> category grants <span className="text-white font-bold">2x XP</span> for the next 48 hours!</p>
               <button className="w-full bg-yellow-500 text-black py-3 rounded-xl font-black uppercase italic tracking-widest hover:bg-yellow-400 transition-colors">
                  Compete in Fusion
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Rankings;
