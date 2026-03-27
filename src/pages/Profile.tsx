import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Calendar, MapPin, ChevronRight, CreditCard, Download, Star, Bell, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useFirebase } from '../FirebaseContext';
import { db, collection, query, where, onSnapshot } from '../firebase';

export default function Profile() {
  const { user, profile } = useFirebase();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'applications'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(apps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      {/* Hero Profile Header */}
      <header className="relative mb-16 overflow-hidden rounded-xl bg-surface-container-low p-8 md:p-12">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 hidden md:block">
          <img 
            className="w-full h-full object-cover grayscale" 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-surface via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-primary-container p-1 shrink-0 overflow-hidden bg-surface"
          >
            <img 
              className="w-full h-full object-cover rounded-full" 
              src={user?.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500"} 
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="flex flex-col text-center md:text-left">
            <div className="mb-2">
              <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold flex items-center justify-center md:justify-start w-fit mx-auto md:mx-0">
                <span className="w-2 h-2 rounded-full bg-primary-container mr-2 animate-pulse"></span>
                {profile?.role || 'Delegate'} Member
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-on-surface mb-2 leading-none">{profile?.displayName || user?.displayName}</h1>
            <p className="text-lg md:text-xl text-primary-container font-medium opacity-90">Diplomatic Attaché Corps</p>
            
            <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              {[
                { label: 'Impact Score', value: '842' },
                { label: 'Applications', value: applications.length.toString() },
                { label: 'Status', value: profile?.status || 'Active', accent: true }
              ].map((stat, idx) => (
                <div key={idx} className={`bg-surface-container-high px-6 py-4 rounded-xl flex flex-col items-center md:items-start ${stat.accent ? 'border-l-4 border-primary-container' : ''}`}>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{stat.label}</span>
                  <span className="text-2xl font-black text-on-surface">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Registered Conferences */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-on-surface">Your Applications</h2>
              <button className="text-primary-container text-sm font-semibold hover:underline">View All</button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary-container" size={32} />
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => (
                  <ConferenceItem 
                    key={app.id}
                    title={app.committee || "MUN Conference"} 
                    subtitle={`Applied as: ${app.fullName}`} 
                    status={app.status} 
                    icon={
                      app.status === 'accepted' ? <CheckCircle2 className="text-success" size={20} /> :
                      app.status === 'rejected' ? <XCircle className="text-error" size={20} /> :
                      <Clock className="text-on-surface-variant" size={20} />
                    }
                    pending={app.status === 'pending'}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-low p-12 rounded-xl text-center border border-white/5">
                <p className="text-on-surface-variant mb-6">You haven't submitted any applications yet.</p>
                <button 
                  onClick={() => window.location.href = '/apply'}
                  className="bg-primary-container text-on-primary-container px-6 py-2 rounded font-bold uppercase tracking-widest text-xs"
                >
                  Apply Now
                </button>
              </div>
            )}
          </section>

          {/* Bento Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-primary-container p-8 rounded-xl flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Award size={200} className="text-on-primary-container" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-on-primary-container/60 mb-4 block">International Network</span>
                <h2 className="text-3xl font-black text-on-primary-container leading-tight mb-4">External Event Forum</h2>
                <p className="text-on-primary-container/80 text-sm max-w-[200px]">Access exclusive diplomatic gatherings beyond the MUN circuit.</p>
              </div>
              <button className="bg-on-primary-container text-primary-container px-6 py-3 rounded font-bold uppercase text-xs tracking-widest w-fit hover:bg-surface transition-colors">
                Explore Network
              </button>
            </div>

            <div className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between border border-white/5">
              <div className="flex justify-between items-start">
                <Star className="text-primary-container" size={40} />
                <div className="text-right">
                  <div className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">Kazakhstan Rank</div>
                  <div className="text-3xl font-black">#042</div>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-2">Diplomatic Portfolio</h3>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '80%' }}
                    className="bg-primary-container h-full"
                  ></motion.div>
                </div>
                <p className="text-xs text-on-surface-variant">Top 5% of delegates in the EMEA region.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <section className="bg-surface-container-low rounded-xl p-8 border-t-4 border-primary-container">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="text-primary-container" size={20} />
              <h2 className="text-xl font-bold tracking-tight">Secretary's Briefing</h2>
            </div>
            <div className="space-y-6">
              <BriefingItem 
                title="Position Paper Deadline" 
                tag="Critical" 
                desc="Submissions for the Geneva Summit must be uploaded by Friday, 23:59 GMT." 
                meta="48 Hours Remaining"
              />
              <div className="h-px bg-white/5"></div>
              <BriefingItem 
                title="System Update v4.2" 
                desc="New automated resolution tracking system is now live for all Senior Delegates." 
                meta="Posted 4 hours ago"
              />
              <div className="h-px bg-white/5"></div>
              <div className="group cursor-pointer">
                <h4 className="font-bold text-sm uppercase tracking-wide group-hover:text-primary-container transition-colors mb-2">Crisis Briefing Room</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">Security Council delegates must review the pre-summit dossier regarding Arctic Sovereignty.</p>
                <button className="mt-3 text-[10px] font-bold text-primary-container flex items-center gap-1 uppercase tracking-widest">
                  Download Dossier <Download size={12} />
                </button>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-highest rounded-xl p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant mb-6">Delegate Stats</h3>
            <div className="space-y-4">
              <StatRow label="Resolution Index" value="92%" />
              <StatRow label="Attendance Rate" value="100%" highlight />
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Diplomacy Rating</span>
                <div className="flex text-primary-container gap-0.5">
                  {[1, 2, 3, 4].map(i => <Star key={i} size={12} fill="currentColor" />)}
                  <Star size={12} />
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function ConferenceItem({ title, subtitle, status, icon, pending }: any) {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className={`bg-surface-container-low group hover:bg-surface-container-high transition-all p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 ${pending ? 'border-l-4 border-primary-container/40' : ''}`}
    >
      <div className="flex items-center gap-6 w-full">
        <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${pending ? 'bg-surface-container-highest text-on-surface-variant' : 'bg-primary-container/10 text-primary-container border border-primary-container/20'}`}>
          {status}
        </span>
        <ChevronRight className="text-on-surface-variant group-hover:text-primary-container transition-colors" size={20} />
      </div>
    </motion.div>
  );
}

function BriefingItem({ title, tag, desc, meta }: any) {
  return (
    <div className="group cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-sm uppercase tracking-wide group-hover:text-primary-container transition-colors">{title}</h4>
        {tag && <span className="text-[10px] bg-error-container/20 text-error px-2 py-0.5 rounded font-bold uppercase">{tag}</span>}
      </div>
      <p className="text-xs text-on-surface-variant mb-1 leading-relaxed">{desc}</p>
      <span className="text-[10px] font-medium text-primary-container/60">{meta}</span>
    </div>
  );
}

function StatRow({ label, value, highlight }: any) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className={`font-bold ${highlight ? 'text-primary-container' : ''}`}>{value}</span>
    </div>
  );
}
