import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, MapPin, ExternalLink, Bell, Share2, Mail, Loader2, CheckCircle, UserPlus, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, collection, onSnapshot, query, where, doc, setDoc, serverTimestamp } from '../firebase';
import { useFirebase } from '../FirebaseContext';

interface Conference {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
  status: string;
  type: string;
  format: 'online' | 'offline';
  websiteUrl?: string;
  instagram?: string;
}

export default function Conferences() {
  const { user } = useFirebase();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConf, setSelectedConf] = useState<Conference | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormat, setFilterFormat] = useState<'all' | 'online' | 'offline'>('all');

  useEffect(() => {
    const q = query(collection(db, 'conferences'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const confs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Conference[];
      setConferences(confs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleJoin = async (role: 'delegate' | 'chair') => {
    if (!user || !selectedConf) return;
    setJoining(true);
    try {
      const participantRef = doc(db, 'conferences', selectedConf.id, 'participants', user.uid);
      await setDoc(participantRef, {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        role,
        status: 'pending',
        joinedAt: serverTimestamp()
      });
      setJoinSuccess(true);
      setTimeout(() => {
        setJoinSuccess(false);
        setSelectedConf(null);
      }, 3000);
    } catch (error) {
      console.error('Error joining conference:', error);
    } finally {
      setJoining(false);
    }
  };

  const filteredConferences = conferences.filter(conf => {
    const matchesSearch = 
      conf.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      conf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conf.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFormat = filterFormat === 'all' || conf.format === filterFormat;
    
    return matchesSearch && matchesFormat;
  });

  return (
    <div className="pt-20">
      {/* Editorial Header */}
      <header className="relative h-[60vh] flex items-end pb-24 px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover grayscale opacity-40" 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-surface/80 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <span className="text-primary-container tracking-[0.3em] text-sm font-bold uppercase">Global Secretariat</span>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter editorial-shadow leading-tight">
              Diplomatic <br /> <span className="text-primary-container">Calendar.</span>
            </h1>
          </motion.div>
        </div>
      </header>

      {/* Search Bar */}
      <section className="max-w-7xl mx-auto px-8 -mt-12 relative z-20">
        <div className="bg-surface-container-high p-4 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 items-center border border-white/5">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={20} />
            <input 
              className="w-full bg-surface-container-low border-none rounded-lg py-3 pl-12 pr-4 focus:ring-1 focus:ring-primary-container text-on-surface placeholder:text-on-surface/30" 
              placeholder="Search by conference name, city or description..." 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              value={filterFormat}
              onChange={(e) => setFilterFormat(e.target.value as any)}
              className="bg-surface-container-low border-none rounded-lg py-3 px-6 text-sm font-medium focus:ring-1 focus:ring-primary-container min-w-[140px]"
            >
              <option value="all">All Formats</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </section>

      {/* Conferences Grid */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Active Conferences</h2>
            <p className="text-on-surface/50 max-w-md">Browse and join upcoming Model UN simulations across the globe.</p>
          </div>
          <Link to="/host-mun">
            <button className="bg-surface-container-high text-on-surface px-6 py-3 rounded font-bold border border-white/5 uppercase tracking-widest text-[10px]">Host an Event</button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-container" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredConferences.map((conf) => (
              <motion.div 
                key={conf.id}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-2xl bg-surface-container-low border border-white/5 flex flex-col h-full"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={conf.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000'} 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent"></div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${conf.type === 'verified' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface'}`}>
                      {conf.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${conf.format === 'online' ? 'bg-amber-400 text-black' : 'bg-surface-container-highest text-on-surface'}`}>
                      {conf.format}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-2 tracking-tight">{conf.title}</h3>
                  <div className="flex flex-col gap-2 mb-6 text-on-surface/60 text-xs">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-primary-container" /> {conf.date}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-primary-container" /> {conf.location}</span>
                  </div>
                  <p className="text-sm text-on-surface/50 mb-8 line-clamp-3 flex-1">{conf.description}</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedConf(conf)}
                      className="flex-1 bg-white text-black py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-colors"
                    >
                      Join MUN
                    </button>
                    {conf.websiteUrl && (
                      <a 
                        href={conf.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-surface-container-high rounded-lg hover:text-primary-container transition-colors"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Join Modal */}
      <AnimatePresence>
        {selectedConf && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedConf(null)}
              className="absolute inset-0 bg-surface/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-surface-container-low p-8 rounded-3xl border border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedConf(null)}
                className="absolute top-6 right-6 text-on-surface/40 hover:text-on-surface"
              >
                <X size={24} />
              </button>

              {joinSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-primary-container" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Request Sent</h3>
                  <p className="text-on-surface/60">Your application has been sent to the MUN Secretariat for approval.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-2 uppercase tracking-tight">Join {selectedConf.title}</h3>
                  <p className="text-on-surface/60 mb-8 text-sm">Select your desired role for this conference. All applications are subject to approval by the Secretariat.</p>
                  
                  <div className="space-y-4">
                    <button 
                      disabled={joining}
                      onClick={() => handleJoin('delegate')}
                      className="w-full flex items-center gap-4 p-6 bg-surface-container rounded-2xl border border-white/5 hover:border-primary-container/50 transition-all group"
                    >
                      <div className="p-3 bg-primary-container/10 rounded-xl text-primary-container">
                        <UserPlus size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold">Join as Delegate</p>
                        <p className="text-xs text-on-surface/40">Participate in committees and debates.</p>
                      </div>
                    </button>

                    <button 
                      disabled={joining}
                      onClick={() => handleJoin('chair')}
                      className="w-full flex items-center gap-4 p-6 bg-surface-container rounded-2xl border border-white/5 hover:border-primary-container/50 transition-all group"
                    >
                      <div className="p-3 bg-primary-container/10 rounded-xl text-primary-container">
                        <ShieldCheck size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold">Apply as Chair</p>
                        <p className="text-xs text-on-surface/40">Lead a committee and evaluate delegates.</p>
                      </div>
                    </button>
                  </div>

                  {joining && (
                    <div className="mt-6 flex justify-center">
                      <Loader2 className="animate-spin text-primary-container" size={24} />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowRight({ size }: { size: number }) {
  return <motion.span className="inline-block"><ExternalLink size={size} /></motion.span>;
}
