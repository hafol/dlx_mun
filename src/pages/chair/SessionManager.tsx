import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Search, 
  Trash2, 
  ChevronRight, 
  Save, 
  FileDown, 
  Settings,
  Mic,
  MicOff,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Share2,
  Database,
  Globe,
  Loader2,
  MessageSquare,
  Send,
  Megaphone,
  Vote
} from 'lucide-react';
import { countries, Country } from '../../constants/countries';
import { db, collection, addDoc, serverTimestamp, onSnapshot, query, where, doc, updateDoc, getDoc, getDocs } from '../../firebase';
import { useFirebase } from '../../FirebaseContext';

interface Delegate {
  id: string;
  country: Country;
  name: string;
  status: 'present' | 'voting' | 'absent';
  score: number;
  uid?: string; // Firebase UID if imported
}

interface Conference {
  id: string;
  title: string;
}

interface Motion {
  id: string;
  type: 'moderated' | 'unmoderated' | 'other';
  topic: string;
  totalTime: number; // in seconds
  speakingTime: number; // in seconds
  proposer: string;
}

export default function SessionManager() {
  const { user, profile } = useFirebase();
  const [step, setStep] = useState<'setup' | 'live'>('setup');
  const [committeeName, setCommitteeName] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [myConferences, setMyConferences] = useState<Conference[]>([]);
  const [selectedConfId, setSelectedConfId] = useState<string>('');
  const [isLoadingConfs, setIsLoadingConfs] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  
  // Live Session State
  const [activeSpeaker, setActiveSpeaker] = useState<Delegate | null>(null);
  const [speakersList, setSpeakersList] = useState<Delegate[]>([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionType, setSessionType] = useState<string>('gsl');
  const [motions, setMotions] = useState<Motion[]>([]);
  const [activeMotion, setActiveMotion] = useState<any>(null);
  const [votingState, setVotingState] = useState<{ active: boolean, question: string, options: string[], results: Record<string, number> } | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const debateModes = [
    { id: 'gsl', name: 'General Speakers List', icon: <Globe size={14} /> },
    { id: 'mod', name: 'Moderated Caucus', icon: <Mic size={14} /> },
    { id: 'unmod', name: 'Unmoderated Caucus', icon: <Users size={14} /> },
    { id: 'consultation', name: 'Consultation of the Whole', icon: <Users size={14} /> },
    { id: 'formal', name: 'Formal Debate', icon: <CheckCircle2 size={14} /> },
    { id: 'voting', name: 'Voting Procedure', icon: <Database size={14} /> },
    { id: 'qa', name: 'Q&A Session', icon: <MessageSquare size={14} /> },
    { id: 'panel', name: 'Panel of Authors', icon: <Users size={14} /> },
    { id: 'crisis', name: 'Crisis Mode', icon: <AlertCircle size={14} /> },
    { id: 'docs', name: 'Introduction of Documents', icon: <FileDown size={14} /> },
    { id: 'reply', name: 'Right of Reply', icon: <MicOff size={14} /> },
  ];

  const motionTypes = [
    "Motion to Open the Session",
    "Motion to Establish the Agenda",
    "Motion to Open the Speakers List",
    "Motion for a Moderated Caucus",
    "Motion for an Unmoderated Caucus",
    "Motion for a Consultation of the Whole",
    "Motion to Extend the Caucus",
    "Motion to Close the Speakers List",
    "Motion to Close Debate",
    "Motion to Adjourn the Session",
    "Motion to Suspend the Meeting",
    "Motion to Table the Topic",
    "Motion to Reconsider",
    "Motion for a Roll Call Vote",
    "Motion to Divide the Question",
    "Motion for a Right of Reply",
    "Motion to Appeal the Decision of the Chair",
    "Point of Order",
    "Point of Personal Privilege",
    "Point of Parliamentary Inquiry",
    "Point of Information"
  ];

  // Fetch conferences for import
  useEffect(() => {
    if (!user) return;

    const fetchConfs = async () => {
      try {
        const q = query(collection(db, 'conferences'));
        const snapshot = await getDocs(q);
        const approvedConfs: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const myApprovedConfs: Conference[] = [];
        for (const conf of approvedConfs) {
          const partRef = doc(db, 'conferences', conf.id, 'participants', user.uid);
          const partSnap = await getDoc(partRef);
          if (partSnap.exists() && partSnap.data().role === 'chair' && partSnap.data().status === 'approved') {
            myApprovedConfs.push({ id: conf.id, title: conf.title });
          }
        }
        setMyConferences(myApprovedConfs);
      } catch (err) {
        console.error('Error fetching conferences:', err);
      } finally {
        setIsLoadingConfs(false);
      }
    };

    fetchConfs();
  }, [user]);

  const importDelegates = async () => {
    if (!selectedConfId) return;
    setIsImporting(true);
    try {
      const q = query(
        collection(db, 'conferences', selectedConfId, 'participants'),
        where('role', '==', 'delegate'),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);
      
      const importedDelegates: Delegate[] = [];
      const importedCountries: Country[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Find country by name or code if available in data
        const countryName = data.country || '';
        const country = countries.find(c => 
          c.name.toLowerCase() === countryName.toLowerCase() || 
          c.code.toLowerCase() === countryName.toLowerCase()
        );

        if (country) {
          importedDelegates.push({
            id: Math.random().toString(36).substr(2, 9),
            uid: doc.id,
            country,
            name: data.displayName || 'Anonymous',
            status: 'absent',
            score: 0
          });
          if (!importedCountries.find(c => c.code === country.code)) {
            importedCountries.push(country);
          }
        }
      });

      if (importedDelegates.length > 0) {
        setDelegates(importedDelegates);
        setSelectedCountries(importedCountries);
        const conf = myConferences.find(c => c.id === selectedConfId);
        if (conf) setCommitteeName(conf.title);
        alert(`Successfully imported ${importedDelegates.length} delegates!`);
      } else {
        alert('No delegates with valid country assignments found in this conference.');
      }
    } catch (err) {
      console.error('Error importing delegates:', err);
      alert('Failed to import delegates.');
    } finally {
      setIsImporting(false);
    }
  };

  // Filtered countries for search
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedCountries.find(sc => sc.code === c.code)
  );

  const toggleCountry = (country: Country) => {
    if (selectedCountries.find(c => c.code === country.code)) {
      setSelectedCountries(selectedCountries.filter(c => c.code !== country.code));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const startSession = async () => {
    if (!committeeName) return alert('Please enter a committee name');
    if (selectedCountries.length === 0) return alert('Please select at least one country');
    
    const initialDelegates: Delegate[] = selectedCountries.map(c => ({
      id: Math.random().toString(36).substr(2, 9),
      country: c,
      name: '',
      status: 'absent',
      score: 0
    }));
    
    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        committeeName,
        chairUid: user?.uid,
        status: 'live',
        sessionType: 'gsl',
        timer: 60,
        isTimerRunning: false,
        activeSpeaker: null,
        speakersList: [],
        delegates: initialDelegates,
        createdAt: serverTimestamp()
      });
      setSessionId(docRef.id);
      setDelegates(initialDelegates);
      setStep('live');
    } catch (err) {
      console.error('Error starting session:', err);
    }
  };

  // Sync state to Firestore when it changes
  useEffect(() => {
    if (step === 'live' && sessionId) {
      const updateSession = async () => {
        try {
          await updateDoc(doc(db, 'sessions', sessionId), {
            timer,
            isTimerRunning,
            activeSpeaker,
            speakersList,
            delegates,
            sessionType,
            activeMotion,
            votingState,
            lastUpdated: serverTimestamp()
          });
        } catch (err) {
          console.error('Error updating session:', err);
        }
      };
      
      // Debounce updates to avoid hitting Firestore limits
      const timeout = setTimeout(updateSession, 500);
      return () => clearTimeout(timeout);
    }
  }, [timer, isTimerRunning, activeSpeaker, speakersList, delegates, sessionType, step, sessionId]);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateDelegateStatus = (id: string, status: 'present' | 'voting' | 'absent') => {
    setDelegates(delegates.map(d => d.id === id ? { ...d, status } : d));
  };

  const addToSpeakersList = (delegate: Delegate) => {
    if (!speakersList.find(s => s.id === delegate.id)) {
      setSpeakersList([...speakersList, delegate]);
    }
  };

  const removeFromSpeakersList = (id: string) => {
    setSpeakersList(speakersList.filter(s => s.id !== id));
  };

  const nextSpeaker = () => {
    if (speakersList.length > 0) {
      const next = speakersList[0];
      setActiveSpeaker(next);
      setSpeakersList(speakersList.slice(1));
      setTimer(60); // Default GSL time
      setIsTimerRunning(true);
    }
  };

  const startVoting = (question: string, options: string[]) => {
    const initialResults: Record<string, number> = {};
    options.forEach(opt => initialResults[opt] = 0);
    setVotingState({ active: true, question, options, results: initialResults });
    setSessionType('voting');
  };

  const closeVoting = () => {
    setVotingState(prev => prev ? { ...prev, active: false } : null);
  };

  // Listen for documents and messages
  useEffect(() => {
    if (!sessionId) return;

    const docsUnsub = onSnapshot(collection(db, 'sessions', sessionId, 'documents'), (snap) => {
      setDocuments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const msgUnsub = onSnapshot(collection(db, 'sessions', sessionId, 'messages'), (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => a.createdAt?.seconds - b.createdAt?.seconds));
    });

    return () => {
      docsUnsub();
      msgUnsub();
    };
  }, [sessionId]);

  const sendAnnouncement = async (text: string) => {
    if (!sessionId || !text.trim()) return;
    try {
      await addDoc(collection(db, 'sessions', sessionId, 'messages'), {
        text,
        sender: 'Chair',
        type: 'announcement',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error sending announcement:', err);
    }
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Session Setup</h1>
              <p className="text-on-surface-variant font-light">Configure your committee and delegates for the live session.</p>
            </div>
            <button 
              onClick={startSession}
              className="bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform"
            >
              Start Session <Play size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Config */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-surface-container-low p-8 rounded-2xl border border-white/5">
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold mb-6 text-primary">Import Data</h3>
                <div className="space-y-4">
                  <p className="text-[10px] text-on-surface/40 leading-relaxed">
                    Import approved delegates directly from your assigned conferences.
                  </p>
                  <select 
                    value={selectedConfId}
                    onChange={(e) => setSelectedConfId(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-container"
                  >
                    <option value="">Select Conference...</option>
                    {myConferences.map(conf => (
                      <option key={conf.id} value={conf.id}>{conf.title}</option>
                    ))}
                  </select>
                  <button 
                    onClick={importDelegates}
                    disabled={!selectedConfId || isImporting}
                    className="w-full bg-primary-container/10 text-primary-container py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50"
                  >
                    {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                    {isImporting ? 'Importing...' : 'Import Delegates'}
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-low p-8 rounded-2xl border border-white/5">
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold mb-6 text-primary">Committee Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold mb-2 block">Committee Name</label>
                    <input 
                      type="text" 
                      value={committeeName}
                      onChange={(e) => setCommitteeName(e.target.value)}
                      placeholder="e.g. DISEC, UNHRC"
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-container transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low p-8 rounded-2xl border border-white/5">
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold mb-6 text-primary">Your Committee</h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold">{selectedCountries.length} Countries</span>
                  <button 
                    onClick={() => setSelectedCountries([])}
                    className="text-[10px] uppercase tracking-widest text-error font-bold hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedCountries.map(country => (
                    <div key={country.code} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} 
                          alt={country.name}
                          className="w-6 h-4 object-cover rounded-sm shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-sm font-medium">{country.name}</span>
                      </div>
                      <button onClick={() => toggleCountry(country)} className="text-on-surface/40 hover:text-error transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {selectedCountries.length === 0 && (
                    <p className="text-center py-8 text-on-surface/40 text-sm italic">No countries selected yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Country Selection */}
            <div className="lg:col-span-8">
              <div className="bg-surface-container-low p-8 rounded-2xl border border-white/5 h-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary">Select Member States</h3>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={18} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search countries..."
                      className="w-full bg-surface border border-white/10 rounded-full pl-12 pr-4 py-2 text-sm focus:outline-none focus:border-primary-container transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredCountries.map(country => (
                    <button 
                      key={country.code}
                      onClick={() => toggleCountry(country)}
                      className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-white/5 hover:border-primary-container/50 hover:bg-primary-container/5 transition-all text-left group"
                    >
                      <img 
                        src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} 
                        alt={country.name}
                        className="w-8 h-5 object-cover rounded-sm shadow-sm group-hover:scale-110 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-sm font-medium truncate">{country.name}</span>
                      <Plus size={16} className="ml-auto text-on-surface/20 group-hover:text-primary-container" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIVE SESSION UI
  return (
    <div className="min-h-screen pt-24 pb-10 px-6 bg-surface flex flex-col">
      <div className="max-w-[1600px] mx-auto w-full flex-grow flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar: Roll Call & Stats */}
        <div className="lg:w-80 flex flex-col gap-6">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary">Roll Call</h3>
              <span className="text-[10px] font-bold bg-primary-container/10 text-primary-container px-2 py-1 rounded">
                {delegates.filter(d => d.status !== 'absent').length}/{delegates.length}
              </span>
            </div>
            
            <div className="space-y-2 overflow-y-auto flex-grow pr-2 custom-scrollbar">
              {delegates.map(delegate => (
                <div key={delegate.id} className="p-3 bg-surface rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://flagcdn.com/w40/${delegate.country.code.toLowerCase()}.png`} 
                      alt={delegate.country.name}
                      className="w-6 h-4 object-cover rounded-sm shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-sm font-bold truncate">{delegate.country.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {(['present', 'voting', 'absent'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => updateDelegateStatus(delegate.id, s)}
                        className={`flex-1 text-[8px] uppercase font-black py-1 rounded transition-all ${
                          delegate.status === s 
                            ? s === 'present' ? 'bg-primary-container text-on-primary-container' :
                              s === 'voting' ? 'bg-amber-500 text-black' : 'bg-error text-white'
                            : 'bg-white/5 text-on-surface/40 hover:bg-white/10'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => addToSpeakersList(delegate)}
                    className="w-full py-1.5 border border-primary-container/20 text-primary-container text-[10px] font-bold uppercase tracking-widest rounded hover:bg-primary-container hover:text-on-primary-container transition-all"
                  >
                    Add to Speakers
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content: Timer & Active Speaker */}
        <div className="flex-grow flex flex-col gap-6">
          {/* Top Bar: Session Info */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Committee</p>
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-primary-container">{committeeName}</h2>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Session Type</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {debateModes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSessionType(t.id)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                        sessionType === t.id ? 'bg-primary-container text-on-primary-container' : 'bg-white/5 text-on-surface/40 hover:bg-white/10'
                      }`}
                    >
                      {t.icon} {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/session/${sessionId}`;
                  navigator.clipboard.writeText(url);
                  alert('Session link copied to clipboard!');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-container/10 text-primary-container rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-container hover:text-on-primary-container transition-all"
              >
                <Share2 size={16} /> Share Link
              </button>
              <button className="p-3 bg-white/5 rounded-xl text-on-surface/40 hover:text-primary-container transition-all">
                <Settings size={20} />
              </button>
              <button 
                onClick={() => setStep('setup')}
                className="px-6 py-3 bg-error/10 text-error rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-error hover:text-white transition-all"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Center: Timer & Active Speaker */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Timer Card */}
              <div className="bg-surface-container-low p-12 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary-container/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-8">Remaining Time</p>
                  <div className={`text-[12rem] font-black leading-none tracking-tighter mb-12 ${timer < 10 && timer > 0 ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                    {formatTime(timer)}
                  </div>
                  
                  {votingState?.active && (
                    <div className="mb-12 p-8 bg-amber-500/10 rounded-3xl border border-amber-500/20">
                      <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-amber-500">Live Vote: {votingState.question}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {votingState.options.map(opt => (
                          <div key={opt} className="bg-surface p-4 rounded-xl border border-white/5">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40 mb-1">{opt}</p>
                            <p className="text-2xl font-black">{votingState.results[opt] || 0}</p>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={closeVoting}
                        className="mt-6 w-full py-3 bg-amber-500 text-black font-bold uppercase tracking-widest text-xs rounded-xl"
                      >
                        Close Voting
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-6">
                    <button 
                      onClick={() => setTimer(prev => prev + 30)}
                      className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-on-surface/60 hover:bg-white/10 hover:text-primary-container transition-all"
                    >
                      +30s
                    </button>
                    <button 
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all hover:scale-110 ${
                        isTimerRunning ? 'bg-amber-500 text-black' : 'bg-primary-container text-on-primary-container'
                      }`}
                    >
                      {isTimerRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                    </button>
                    <button 
                      onClick={() => { setIsTimerRunning(false); setTimer(60); }}
                      className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-on-surface/60 hover:bg-white/10 hover:text-error transition-all"
                    >
                      <RotateCcw size={24} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Speaker Card */}
              <div className="bg-surface-container-low p-8 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary">Active Speaker</h3>
                  {activeSpeaker && (
                    <div className="flex items-center gap-2 text-primary-container">
                      <Mic size={16} className="animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Live Mic</span>
                    </div>
                  )}
                </div>

                {activeSpeaker ? (
                  <div className="flex items-center gap-8">
                    <div className="w-32 h-32 bg-surface rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
                      <img 
                        src={`https://flagcdn.com/w160/${activeSpeaker.country.code.toLowerCase()}.png`} 
                        alt={activeSpeaker.country.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="text-4xl font-black uppercase italic tracking-tighter mb-2">{activeSpeaker.country.name}</h4>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-primary-container/10 text-primary-container text-[10px] font-bold uppercase tracking-widest rounded">
                          Delegate
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button 
                              key={star}
                              onClick={() => {
                                setDelegates(delegates.map(d => d.id === activeSpeaker.id ? { ...d, score: d.score + 1 } : d));
                              }}
                              className="text-amber-500 hover:scale-125 transition-transform"
                            >
                              <Trophy size={16} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveSpeaker(null)}
                      className="ml-auto p-4 bg-error/10 text-error rounded-xl hover:bg-error hover:text-white transition-all"
                    >
                      <MicOff size={24} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-on-surface/40 italic">No active speaker. Select from the list to start.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Speakers List & Motions */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Speakers List */}
              <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary">Speakers List</h3>
                  <button 
                    onClick={nextSpeaker}
                    disabled={speakersList.length === 0}
                    className="text-[10px] font-bold text-primary-container hover:underline disabled:opacity-50"
                  >
                    Next Speaker
                  </button>
                </div>
                <div className="space-y-2 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                  {speakersList.map((s, index) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-white/5 group">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-on-surface/20">#{index + 1}</span>
                        <img 
                          src={`https://flagcdn.com/w40/${s.country.code.toLowerCase()}.png`} 
                          alt={s.country.name}
                          className="w-6 h-4 object-cover rounded-sm shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-sm font-bold">{s.country.name}</span>
                      </div>
                      <button 
                        onClick={() => removeFromSpeakersList(s.id)}
                        className="text-on-surface/20 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {speakersList.length === 0 && (
                    <p className="text-center py-12 text-on-surface/40 text-sm italic">List is empty.</p>
                  )}
                </div>
              </div>

              {/* Motions Tracker */}
              <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex-grow overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary">Motions Hub</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const q = prompt("Enter voting question:");
                        const opts = prompt("Enter options (comma separated):", "Yes, No, Abstain");
                        if (q && opts) startVoting(q, opts.split(',').map(s => s.trim()));
                      }}
                      className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-black transition-all"
                      title="Start Vote"
                    >
                      <Database size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {motionTypes.map((m, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveMotion({ type: m, createdAt: new Date().toISOString() })}
                      className={`w-full text-left p-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${
                        activeMotion?.type === m 
                          ? 'bg-primary-container text-on-primary-container border-primary-container' 
                          : 'bg-surface border-white/5 text-on-surface/60 hover:border-white/20'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 h-64 flex flex-col">
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-4">Announcements</h3>
                <div className="flex-grow overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
                  {messages.filter(m => m.type === 'announcement').map((m, i) => (
                    <div key={i} className="p-2 bg-primary-container/5 rounded-lg border border-primary-container/10">
                      <p className="text-[10px] text-on-surface/80">{m.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Broadcast message..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        sendAnnouncement((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-grow bg-surface border border-white/10 rounded-lg px-3 py-2 text-[10px] focus:outline-none focus:border-primary-container"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
