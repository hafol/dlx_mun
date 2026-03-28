import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, CheckCircle, XCircle, Loader2, ChevronRight, ChevronDown, Calendar, MapPin, Mail, User, FileText, CreditCard } from 'lucide-react';
import { db, collection, onSnapshot, query, where, doc, updateDoc, handleFirestoreError, OperationType } from '../firebase';
import { useFirebase } from '../FirebaseContext';
import { toast } from 'sonner';

interface Committee {
  name: string;
  topic: string;
}

interface Conference {
  id: string;
  title: string;
  date: string;
  location: string;
  status: string;
  committees?: Committee[];
}

interface Participant {
  uid: string;
  displayName: string;
  role: 'delegate' | 'chair';
  status: 'pending' | 'approved' | 'rejected';
  bio?: string;
  origin?: string;
  preferredCommittees?: string[];
  paymentProof?: string;
  createdAt: any;
}

export default function Organizer() {
  const { user, role } = useFirebase();
  const [myConferences, setMyConferences] = useState<Conference[]>([]);
  const [selectedConf, setSelectedConf] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'conferences'), where('organizerUid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const confs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Conference[];
      setMyConferences(confs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedConf) {
      setParticipants([]);
      return;
    }

    setLoadingParticipants(true);
    const unsubscribe = onSnapshot(
      collection(db, 'conferences', selectedConf, 'participants'),
      (snapshot) => {
        const parts = snapshot.docs.map(doc => ({ ...doc.data() })) as Participant[];
        setParticipants(parts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        setLoadingParticipants(false);
      },
      (error) => {
        console.error('Error fetching participants:', error);
        handleFirestoreError(error, OperationType.GET, `conferences/${selectedConf}/participants`);
        setLoadingParticipants(false);
      }
    );

    return () => unsubscribe();
  }, [selectedConf]);

  const updateParticipantStatus = async (participantUid: string, newStatus: 'approved' | 'rejected') => {
    if (!selectedConf) return;

    try {
      const participantRef = doc(db, 'conferences', selectedConf, 'participants', participantUid);
      await updateDoc(participantRef, { status: newStatus });
      toast.success(`Participant ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Failed to ${newStatus} participant.`);
      handleFirestoreError(error, OperationType.UPDATE, `conferences/${selectedConf}/participants/${participantUid}`);
    }
  };

  if (role !== 'organizer' && role !== 'admin') {
    return (
      <div className="pt-32 px-8 text-center">
        <h1 className="text-4xl font-black mb-4">Access Denied</h1>
        <p className="text-on-surface/60">This dashboard is only available for MUN organizers.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">Organizer Dashboard</h1>
        <p className="text-on-surface/50">Manage your conferences and review delegate applications.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary-container" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conferences List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary-container mb-6">Your Conferences</h2>
            {myConferences.length === 0 ? (
              <div className="p-8 bg-surface-container rounded-2xl border border-white/5 text-center">
                <p className="text-sm text-on-surface/40">You haven't hosted any MUNs yet.</p>
              </div>
            ) : (
              myConferences.map((conf) => (
                <button
                  key={conf.id}
                  onClick={() => setSelectedConf(conf.id)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all ${
                    selectedConf === conf.id 
                      ? 'bg-primary-container text-on-primary-container border-primary-container' 
                      : 'bg-surface-container-low border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      conf.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {conf.status}
                    </span>
                    <ChevronRight size={16} className={selectedConf === conf.id ? 'rotate-90' : ''} />
                  </div>
                  <h3 className="font-bold mb-2">{conf.title}</h3>
                  <div className="flex flex-col gap-1 text-[10px] opacity-60 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Calendar size={12} /> {conf.date}</span>
                    <span className="flex items-center gap-2"><MapPin size={12} /> {conf.location}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Participants List */}
          <div className="lg:col-span-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary-container mb-6">
              {selectedConf ? 'Applications' : 'Select a conference to view applications'}
            </h2>

            {!selectedConf ? (
              <div className="h-[400px] flex flex-col items-center justify-center bg-surface-container rounded-3xl border border-white/5 text-on-surface/30">
                <Users size={48} className="mb-4 opacity-20" />
                <p>No conference selected</p>
              </div>
            ) : loadingParticipants ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-primary-container" size={32} />
              </div>
            ) : participants.length === 0 ? (
              <div className="p-12 bg-surface-container rounded-3xl border border-white/5 text-center">
                <p className="text-on-surface/40">No applications yet for this conference.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {participants.map((part) => (
                  <motion.div
                    key={part.uid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center text-primary-container font-bold">
                            {part.displayName[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{part.displayName}</h4>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-surface-container-highest rounded">
                                {part.role}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                part.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                part.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {part.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {part.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateParticipantStatus(part.uid, 'approved')}
                              className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => updateParticipantStatus(part.uid, 'rejected')}
                              className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">Bio</p>
                            <p className="text-sm text-on-surface/70 leading-relaxed">{part.bio || 'No bio provided.'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">Origin</p>
                            <p className="text-sm flex items-center gap-2"><MapPin size={14} /> {part.origin || 'Unknown'}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">Preferred Committees</p>
                            <div className="flex flex-wrap gap-2">
                              {part.preferredCommittees?.map((c, i) => (
                                <span key={i} className="text-[10px] bg-surface-container-highest px-2 py-1 rounded border border-white/5">
                                  {c}
                                </span>
                              ))}
                              {(!part.preferredCommittees || part.preferredCommittees.length === 0) && (
                                <span className="text-xs text-on-surface/30 italic">None specified</span>
                              )}
                            </div>
                          </div>
                          {part.paymentProof && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40">Payment Proof</p>
                              <a 
                                href={part.paymentProof} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs text-primary-container hover:underline"
                              >
                                <CreditCard size={14} /> View Document
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
