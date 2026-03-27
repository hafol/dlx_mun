import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Star, Search, Filter, Loader2, TrendingUp, Users, Globe } from 'lucide-react';
import { db, collection, onSnapshot, query, orderBy, limit, where } from '../firebase';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL: string;
  points: number;
  rank: string;
  role: string;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch top 50 delegates by points
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'delegate'),
      orderBy('points', 'desc'), 
      limit(50)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id })) as LeaderboardUser[];
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Leaderboard fetch error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary-container" size={40} />
      </div>
    );
  }

  const topThree = filteredUsers.slice(0, 3);
  const rest = filteredUsers.slice(3);

  return (
    <main className="pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="p-3 bg-primary-container/10 rounded-2xl text-primary-container mb-6">
              <Trophy size={32} />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary-container mb-4">Global Diplomatic Standing</span>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 uppercase">The <span className="text-primary-container">Leaderboard</span></h1>
            <p className="text-lg text-on-surface/60 max-w-2xl mx-auto leading-relaxed">
              Tracking the performance of the world's most elite delegates. Ranks are calculated based on qualitative and quantitative assessments from the DLX Secretariat.
            </p>
          </motion.div>
        </header>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
          {/* Silver */}
          {topThree[1] && (
            <PodiumCard user={topThree[1]} rank={2} color="text-slate-400" bg="bg-slate-400/10" border="border-slate-400/20" height="h-64" />
          )}
          {/* Gold */}
          {topThree[0] && (
            <PodiumCard user={topThree[0]} rank={1} color="text-amber-400" bg="bg-amber-400/10" border="border-amber-400/20" height="h-80" />
          )}
          {/* Bronze */}
          {topThree[2] && (
            <PodiumCard user={topThree[2]} rank={3} color="text-orange-400" bg="bg-orange-400/10" border="border-orange-400/20" height="h-56" />
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={18} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search delegates..."
              className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-container p-4 pl-12 rounded-xl text-sm"
            />
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold opacity-40">
            <Users size={14} /> {filteredUsers.length} Active Delegates
          </div>
        </div>

        {/* List */}
        <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 p-6 border-b border-white/5 bg-white/5 text-[10px] uppercase tracking-widest font-bold opacity-40">
            <div className="col-span-1">Rank</div>
            <div className="col-span-6 md:col-span-7">Delegate</div>
            <div className="col-span-3 md:col-span-2 text-right">Points</div>
            <div className="col-span-2 text-right hidden md:block">Standing</div>
          </div>
          <div className="divide-y divide-white/5">
            {rest.map((user, index) => (
              <motion.div 
                key={user.uid}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="grid grid-cols-12 p-6 items-center hover:bg-white/5 transition-colors"
              >
                <div className="col-span-1 font-mono text-xs opacity-40">#{index + 4}</div>
                <div className="col-span-6 md:col-span-7 flex items-center gap-4">
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-10 h-10 rounded-full bg-surface-container-high" />
                  <div>
                    <p className="text-sm font-bold">{user.displayName || 'Anonymous'}</p>
                    <p className="text-[10px] text-on-surface/40 uppercase tracking-widest">{user.rank || 'Novice'}</p>
                  </div>
                </div>
                <div className="col-span-3 md:col-span-2 text-right font-mono text-primary-container font-bold">{user.points || 0}</div>
                <div className="col-span-2 text-right hidden md:block">
                  <span className="text-[10px] bg-primary-container/10 text-primary-container px-2 py-1 rounded uppercase tracking-widest font-bold">
                    {user.rank || 'Novice'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function PodiumCard({ user, rank, color, bg, border, height }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative flex flex-col items-center p-8 rounded-3xl border ${border} ${bg} ${height} justify-center shadow-2xl overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Medal size={120} className={color} />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-24 h-24 rounded-full border-4 border-white/10 shadow-2xl" />
          <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full ${bg} border ${border} flex items-center justify-center font-black text-xl ${color}`}>
            {rank}
          </div>
        </div>
        <h3 className="text-xl font-bold mb-1 uppercase tracking-tight">{user.displayName}</h3>
        <p className={`text-[10px] uppercase tracking-widest font-bold ${color} mb-4`}>{user.rank || 'Novice'}</p>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
          <Star size={12} className={color} />
          <span className="text-sm font-mono font-bold">{user.points || 0}</span>
        </div>
      </div>
    </motion.div>
  );
}
