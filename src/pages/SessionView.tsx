import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Users, Mic, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { db, doc, onSnapshot } from '../firebase';

export default function SessionView() {
  const { id } = useParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, 'sessions', id), (snapshot) => {
      if (snapshot.exists()) {
        setSession({ id: snapshot.id, ...snapshot.data() });
        setError(null);
      } else {
        setError('Session not found or has ended.');
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching session:', err);
      setError('Failed to connect to the session.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary-container" size={40} />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="mx-auto text-error mb-6" size={64} />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">{error || 'Session Ended'}</h2>
          <p className="text-on-surface/60 mb-8">The session you are looking for is no longer active.</p>
          <Link to="/">
            <button className="bg-primary-container text-on-primary-container px-8 py-3 rounded font-bold uppercase tracking-widest text-xs">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-10 px-6 bg-surface flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[2px] w-8 bg-primary-container"></span>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Live Delegate View</span>
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-on-surface">{session.committeeName}</h1>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-success/10 text-success rounded-full">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Session</span>
          </div>
        </div>

        {/* Main Display: Timer & Speaker */}
        <div className="bg-surface-container-low p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-container/5"></div>
          
          <div className="relative z-10 w-full">
            <div className={`text-[12rem] font-black leading-none tracking-tighter mb-12 ${session.timer < 10 && session.timer > 0 ? 'text-error animate-pulse' : 'text-on-surface'}`}>
              {formatTime(session.timer)}
            </div>
            
            <div className="h-px bg-white/10 w-full mb-12"></div>

            {session.activeSpeaker ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-48 h-32 mb-6 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <img 
                    src={`https://flagcdn.com/w320/${session.activeSpeaker.country.code.toLowerCase()}.png`} 
                    alt={session.activeSpeaker.country.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter text-primary-container mb-2">
                  {session.activeSpeaker.country.name}
                </h2>
                <div className="flex items-center gap-2 text-on-surface/40">
                  <Mic size={18} className="animate-pulse text-primary-container" />
                  <span className="text-xs uppercase tracking-widest font-bold">Floor is open</span>
                </div>
              </motion.div>
            ) : (
              <div className="py-12">
                <p className="text-2xl font-bold text-on-surface/20 uppercase tracking-widest italic">Waiting for Speaker...</p>
              </div>
            )}
          </div>
        </div>

        {/* Speakers List (Next) */}
        <div className="bg-surface-container-low p-8 rounded-2xl border border-white/5">
          <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6">Next in Line</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {session.speakersList?.slice(0, 4).map((s: any, index: number) => (
              <div key={s.id} className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-white/5">
                <span className="text-xs font-bold text-on-surface/20">#{index + 1}</span>
                <img 
                  src={`https://flagcdn.com/w40/${s.country.code.toLowerCase()}.png`} 
                  alt={s.country.name}
                  className="w-8 h-5 object-cover rounded-sm shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <span className="text-sm font-bold uppercase tracking-tight">{s.country.name}</span>
              </div>
            ))}
            {(!session.speakersList || session.speakersList.length === 0) && (
              <p className="text-on-surface/20 italic text-sm">No speakers in queue.</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold mb-1">Present</p>
            <p className="text-2xl font-black">{session.delegates?.filter((d: any) => d.status !== 'absent').length || 0}</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold mb-1">Majority</p>
            <p className="text-2xl font-black">{Math.floor((session.delegates?.filter((d: any) => d.status !== 'absent').length || 0) / 2) + 1}</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold mb-1">Session Type</p>
            <p className="text-lg font-black uppercase text-primary-container">{session.sessionType}</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold mb-1">Time Limit</p>
            <p className="text-lg font-black uppercase">60s</p>
          </div>
        </div>
      </div>
    </div>
  );
}
