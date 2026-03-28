import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Users, Star, Send, CheckCircle, Loader2, Search, Filter, Trophy, MessageSquare, Globe, Play } from 'lucide-react';
import { useFirebase } from '../FirebaseContext';
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType, onSnapshot, query, where, doc, updateDoc, getDoc } from '../firebase';

interface Delegate {
  uid: string;
  displayName: string;
  photoURL: string;
  points: number;
  rank: string;
}

interface Conference {
  id: string;
  title: string;
}

export default function ChairDashboard() {
  const { user, profile } = useFirebase();
  const [myConferences, setMyConferences] = useState<Conference[]>([]);
  const [selectedConf, setSelectedConf] = useState<Conference | null>(null);
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDelegates, setLoadingDelegates] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scores, setScores] = useState({
    diplomacy: 5,
    speech: 5,
    position: 5,
    feedback: ''
  });

  useEffect(() => {
    if (!user) return;

    // Fetch conferences where user is an approved chair
    const q = query(collection(db, 'conferences'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const confsData: Conference[] = [];
      
      // We need to check the subcollection for each conference
      // This is a bit complex with onSnapshot, so we'll use a different approach
      // or just fetch all and filter client-side if the number of conferences is small.
      // For now, let's fetch all approved conferences and then check participation.
      const approvedConfs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      // In a real app, you'd use a collectionGroup query or a more efficient structure
      // For this demo, we'll fetch the participant doc for each conference
      const checkParticipation = async () => {
        const myApprovedConfs: Conference[] = [];
        for (const conf of approvedConfs) {
          const partRef = doc(db, 'conferences', conf.id, 'participants', user.uid);
          const partSnap = await getDoc(partRef);
          if (partSnap.exists() && partSnap.data().role === 'chair' && partSnap.data().status === 'approved') {
            myApprovedConfs.push({ id: conf.id, title: conf.title });
          }
        }
        setMyConferences(myApprovedConfs);
        setLoading(false);
      };

      checkParticipation();
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedConf) {
      setDelegates([]);
      return;
    }

    setLoadingDelegates(true);
    // Fetch approved delegates for the selected conference
    const q = query(
      collection(db, 'conferences', selectedConf.id, 'participants'), 
      where('role', '==', 'delegate'),
      where('status', '==', 'approved')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const delegatesData = snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        displayName: doc.data().displayName,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.id}`,
        points: 0, // We'll fetch real points from users collection if needed
        rank: 'Novice'
      })) as Delegate[];
      setDelegates(delegatesData);
      setLoadingDelegates(false);
    });

    return () => unsubscribe();
  }, [selectedConf]);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDelegate) return;

    setIsSubmitting(true);
    const totalScore = scores.diplomacy + scores.speech + scores.position;

    try {
      // 1. Create evaluation record
      await addDoc(collection(db, 'evaluations'), {
        delegateUid: selectedDelegate.uid,
        chairUid: user.uid,
        conferenceId: selectedConf?.id,
        conferenceTitle: selectedConf?.title,
        committee: 'General Assembly', 
        diplomacy: scores.diplomacy,
        speech: scores.speech,
        position: scores.position,
        totalScore,
        feedback: scores.feedback,
        createdAt: serverTimestamp()
      });

      // 2. Update delegate's total points and rank
      const delegateRef = doc(db, 'users', selectedDelegate.uid);
      const delegateSnap = await getDoc(delegateRef);
      const currentPoints = delegateSnap.data()?.points || 0;
      const newPoints = currentPoints + totalScore;

      // Simple rank logic
      let newRank = 'Novice';
      if (newPoints > 100) newRank = 'Diplomat';
      if (newPoints > 250) newRank = 'Ambassador';
      if (newPoints > 500) newRank = 'Secretary General';

      await updateDoc(delegateRef, {
        points: newPoints,
        rank: newRank
      });

      setSelectedDelegate(null);
      setScores({ diplomacy: 5, speech: 5, position: 5, feedback: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'evaluations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDelegates = delegates.filter(d => 
    d.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary-container" size={40} />
      </div>
    );
  }

  return (
    <main className="pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase">Chair <span className="text-primary-container">Dashboard</span></h1>
            <p className="text-on-surface/60">Manage your assigned committees and run live sessions.</p>
          </div>
          <Link to="/chair/session">
            <button className="bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-transform shadow-2xl shadow-primary-container/20">
              Launch Session Pro <Play size={18} fill="currentColor" />
            </button>
          </Link>
        </header>

        {myConferences.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-dashed border-white/10">
            <div className="w-20 h-20 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Trophy className="text-primary-container" size={40} />
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-4 uppercase">No Active Assignments</h2>
            <p className="text-on-surface/60 mb-8 max-w-md mx-auto leading-relaxed">
              You are not currently assigned as a Chair to any active MUN conferences. You can still use Session Pro for practice or local events.
            </p>
            <Link to="/conferences">
              <button className="border border-primary-container/20 text-primary-container px-8 py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-primary-container/5 transition-colors">
                Browse Conferences
              </button>
            </Link>
          </div>
        ) : !selectedConf ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myConferences.map(conf => (
              <button
                key={conf.id}
                onClick={() => setSelectedConf(conf)}
                className="p-8 bg-surface-container-low rounded-2xl border border-white/5 hover:border-primary-container/50 transition-all text-left group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary-container/10 rounded-xl text-primary-container group-hover:scale-110 transition-transform">
                    <Globe size={24} />
                  </div>
                  <div className="text-[10px] bg-success/20 text-success px-2 py-1 rounded font-bold uppercase tracking-widest">Active</div>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight">{conf.title}</h3>
                <p className="text-xs text-on-surface/40 mt-2">Click to enter evaluation dashboard</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Delegate List */}
            <div className="lg:col-span-4 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={18} />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search delegates..."
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-container p-4 pl-12 rounded-xl text-sm"
                />
              </div>

              <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Delegates</span>
                  <Users size={14} className="opacity-40" />
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {loadingDelegates ? (
                    <div className="p-12 flex justify-center">
                      <Loader2 className="animate-spin text-primary-container/20" size={24} />
                    </div>
                  ) : filteredDelegates.length === 0 ? (
                    <div className="p-8 text-center text-on-surface/40 text-xs uppercase tracking-widest">
                      No approved delegates found
                    </div>
                  ) : (
                    filteredDelegates.map(delegate => (
                      <button
                        key={delegate.uid}
                        onClick={() => setSelectedDelegate(delegate)}
                        className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-none ${selectedDelegate?.uid === delegate.uid ? 'bg-primary-container/10' : ''}`}
                      >
                        <img src={delegate.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${delegate.uid}`} className="w-10 h-10 rounded-full bg-surface-container-high" />
                        <div>
                          <p className="text-sm font-bold">{delegate.displayName || 'Anonymous Delegate'}</p>
                          <p className="text-[10px] text-on-surface/40 uppercase tracking-widest">{delegate.rank || 'Novice'}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Evaluation Form */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {selectedDelegate ? (
                  <motion.div
                    key={selectedDelegate.uid}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-surface-container-low p-8 lg:p-12 rounded-2xl border border-white/5"
                  >
                    <div className="flex items-center gap-6 mb-12">
                      <img src={selectedDelegate.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDelegate.uid}`} className="w-20 h-20 rounded-2xl shadow-2xl" />
                      <div>
                        <h2 className="text-3xl font-bold tracking-tight uppercase">{selectedDelegate.displayName}</h2>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] bg-primary-container/10 text-primary-container px-2 py-1 rounded uppercase tracking-widest font-bold">
                            {selectedDelegate.rank || 'Novice'}
                          </span>
                          <span className="text-[10px] text-on-surface/40 uppercase tracking-widest font-bold">
                            Points: {selectedDelegate.points || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitScore} className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ScoreInput 
                          label="Diplomacy" 
                          value={scores.diplomacy} 
                          onChange={(v) => setScores({...scores, diplomacy: v})} 
                        />
                        <ScoreInput 
                          label="Speech" 
                          value={scores.speech} 
                          onChange={(v) => setScores({...scores, speech: v})} 
                        />
                        <ScoreInput 
                          label="Position" 
                          value={scores.position} 
                          onChange={(v) => setScores({...scores, position: v})} 
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                          <MessageSquare size={12} /> Qualitative Feedback
                        </label>
                        <textarea 
                          value={scores.feedback}
                          onChange={(e) => setScores({...scores, feedback: e.target.value})}
                          className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-6 rounded-xl text-sm text-on-surface resize-none" 
                          placeholder="Provide detailed feedback on the delegate's performance..." 
                          rows={6}
                        ></textarea>
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-white/5">
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold mb-1">Total Score</p>
                          <p className="text-4xl font-black text-primary-container">{scores.diplomacy + scores.speech + scores.position}</p>
                        </div>
                        <motion.button 
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-primary-container text-on-primary-container px-12 py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-2xl shadow-primary-container/20 flex items-center gap-3 disabled:opacity-50"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                          {isSubmitting ? 'Transmitting...' : 'Finalize Evaluation'}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-surface-container-low rounded-2xl border border-dashed border-white/10 text-center p-12">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                      <Users className="text-on-surface/20" size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">No Delegate Selected</h3>
                    <p className="text-sm text-on-surface/40 max-w-xs">
                      Select a delegate from the list on the left to begin the evaluation process.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ScoreInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">{label}</label>
        <span className="text-xl font-black text-primary-container">{value}</span>
      </div>
      <input 
        type="range" 
        min="1" 
        max="10" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary-container"
      />
      <div className="flex justify-between text-[8px] text-on-surface/20 font-bold uppercase tracking-tighter">
        <span>Novice</span>
        <span>Expert</span>
      </div>
    </div>
  );
}
