import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  Mic, 
  MessageSquare, 
  Send, 
  Database, 
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { db, doc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp } from '../firebase';
import { useFirebase } from '../FirebaseContext';

export default function SessionView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useFirebase();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, 'sessions', id), (doc) => {
      if (doc.exists()) {
        setSession({ id: doc.id, ...doc.data() });
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

    const msgUnsub = onSnapshot(collection(db, 'sessions', id, 'messages'), (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => a.createdAt?.seconds - b.createdAt?.seconds));
    });

    return () => {
      unsub();
      msgUnsub();
    };
  }, [id]);

  const handleVote = async (option: string) => {
    if (!id || !session?.votingState?.active || hasVoted) return;

    const newResults = { ...session.votingState.results };
    newResults[option] = (newResults[option] || 0) + 1;

    try {
      await updateDoc(doc(db, 'sessions', id), {
        'votingState.results': newResults
      });
      setHasVoted(true);
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !message.trim() || !user) return;

    try {
      await addDoc(collection(db, 'sessions', id, 'messages'), {
        text: message,
        sender: user.displayName || 'Anonymous',
        senderUid: user.uid,
        type: 'message',
        createdAt: serverTimestamp()
      });
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const raiseMotion = async (type: string) => {
    if (!id || !user) return;
    try {
      await addDoc(collection(db, 'sessions', id, 'messages'), {
        text: `Raised a Motion: ${type}`,
        sender: user.displayName || 'Anonymous',
        senderUid: user.uid,
        type: 'motion',
        createdAt: serverTimestamp()
      });
      alert('Motion raised to the Chair!');
    } catch (err) {
      console.error('Error raising motion:', err);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-surface p-6 text-center">
        <div>
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2">{error || 'Session Not Found'}</h1>
          <p className="text-on-surface/60 mb-8">The session you are looking for does not exist or has ended.</p>
          <Link to="/">
            <button className="bg-primary-container text-on-primary-container px-8 py-3 rounded font-bold uppercase tracking-widest text-xs">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-6 bg-surface flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Live Session</p>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">{session.committeeName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-primary-container/10 text-primary-container rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Users size={14} /> {session.delegates?.filter((d: any) => d.status !== 'absent').length} Present
            </div>
            <div className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} /> {session.sessionType?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
          {/* Main View */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Timer & Speaker */}
            <div className="bg-surface-container-low p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-primary-container/5"></div>
              
              <div className="relative z-10 w-full">
                <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-8">Session Timer</p>
                <div className={`text-9xl font-black leading-none tracking-tighter mb-12 ${session.timer < 10 && session.timer > 0 ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                  {formatTime(session.timer)}
                </div>

                {session.activeSpeaker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-6 p-6 bg-surface rounded-2xl border border-white/5 max-w-md mx-auto"
                  >
                    <img 
                      src={`https://flagcdn.com/w80/${session.activeSpeaker.country.code.toLowerCase()}.png`} 
                      alt={session.activeSpeaker.country.name}
                      className="w-12 h-8 object-cover rounded shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Current Speaker</p>
                      <h4 className="text-xl font-black uppercase italic tracking-tighter">{session.activeSpeaker.country.name}</h4>
                    </div>
                    <Mic size={24} className="ml-auto text-primary-container animate-pulse" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Voting Section */}
            <AnimatePresence>
              {session.votingState?.active && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-amber-500/10 p-8 rounded-3xl border border-amber-500/20"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="text-amber-500" size={24} />
                    <h3 className="text-xl font-black uppercase tracking-tight text-amber-500">Live Vote: {session.votingState.question}</h3>
                  </div>
                  
                  {hasVoted ? (
                    <div className="text-center py-8">
                      <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
                      <p className="text-lg font-bold uppercase tracking-tight">Vote Cast Successfully</p>
                      <p className="text-sm text-on-surface/40">Waiting for Chair to close voting...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {session.votingState.options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => handleVote(opt)}
                          className="p-6 bg-surface rounded-2xl border border-white/5 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left group"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold uppercase tracking-tight">{opt}</span>
                            <ChevronRight size={20} className="text-on-surface/20 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Delegate Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5">
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => raiseMotion('Point of Order')}
                    className="p-3 bg-surface rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest hover:border-primary-container/50 transition-all"
                  >
                    Point of Order
                  </button>
                  <button 
                    onClick={() => raiseMotion('Point of Personal Privilege')}
                    className="p-3 bg-surface rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest hover:border-primary-container/50 transition-all"
                  >
                    Personal Privilege
                  </button>
                  <button 
                    onClick={() => raiseMotion('Moderated Caucus')}
                    className="p-3 bg-surface rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest hover:border-primary-container/50 transition-all"
                  >
                    Motion: Mod
                  </button>
                  <button 
                    onClick={() => raiseMotion('Unmoderated Caucus')}
                    className="p-3 bg-surface rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest hover:border-primary-container/50 transition-all"
                  >
                    Motion: Unmod
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5">
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-6">Announcements</h3>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {messages.filter(m => m.type === 'announcement').reverse().map((m, i) => (
                    <div key={i} className="p-3 bg-primary-container/5 rounded-xl border border-primary-container/10">
                      <p className="text-xs text-on-surface/80 leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                  {messages.filter(m => m.type === 'announcement').length === 0 && (
                    <p className="text-center py-4 text-on-surface/20 text-[10px] uppercase tracking-widest">No announcements yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex-grow flex flex-col h-[600px]">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="text-primary" size={20} />
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary">Committee Chat</h3>
              </div>
              
              <div className="flex-grow overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                {messages.filter(m => m.type === 'message').map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.senderUid === user?.uid ? 'items-end' : 'items-start'}`}>
                    <span className="text-[8px] uppercase tracking-widest font-bold text-on-surface/40 mb-1">{m.sender}</span>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                      m.senderUid === user?.uid 
                        ? 'bg-primary-container text-on-primary-container rounded-tr-none' 
                        : 'bg-surface border border-white/5 rounded-tl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-container transition-colors"
                />
                <button 
                  type="submit"
                  className="p-3 bg-primary-container text-on-primary-container rounded-xl hover:scale-105 transition-transform"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
