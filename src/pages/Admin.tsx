import { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, where, updateDoc, doc, UserProfile, Timestamp, orderBy } from '../firebase';
import { ShieldCheck, Users, FileText, Ban, CheckCircle, XCircle, Search, MoreVertical, Globe, Zap, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'applications' | 'conferences' | 'evaluations' | 'requests'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedConferenceId, setSelectedConferenceId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    
    // Subscribe to users
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id })) as UserProfile[];
      setUsers(usersData);
      setLoading(false);
    });

    // Subscribe to applications
    const appsQuery = query(collection(db, 'applications'));
    const unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
      const appsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setApplications(appsData);
    });

    // Subscribe to conferences
    const confQuery = query(collection(db, 'conferences'));
    const unsubscribeConf = onSnapshot(confQuery, (snapshot) => {
      const confData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setConferences(confData);
    });

    // Subscribe to evaluations
    const evalQuery = query(collection(db, 'evaluations'), orderBy('createdAt', 'desc'));
    const unsubscribeEval = onSnapshot(evalQuery, (snapshot) => {
      const evalData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setEvaluations(evalData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeApps();
      unsubscribeConf();
      unsubscribeEval();
    };
  }, []);

  useEffect(() => {
    if (!selectedConferenceId) {
      setParticipants([]);
      return;
    }

    const partQuery = query(collection(db, 'conferences', selectedConferenceId, 'participants'));
    const unsubscribePart = onSnapshot(partQuery, (snapshot) => {
      const partData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setParticipants(partData);
    });

    return () => unsubscribePart();
  }, [selectedConferenceId]);

  const handleBanUser = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    try {
      await updateDoc(doc(db, 'users', uid), { status: newStatus });
      toast.success(`User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully`);
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status');
    }
  };

  const handleUpdateAppStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'applications', id), { status });
      toast.success(`Application ${status} successfully`);
    } catch (err) {
      console.error('Error updating application status:', err);
      toast.error('Failed to update application status');
    }
  };

  const handleUpdateConfStatus = async (id: string, status: string) => {
    console.log(`Attempting to update conference ${id} status to ${status}...`);
    try {
      await updateDoc(doc(db, 'conferences', id), { status });
      console.log(`Conference ${id} status successfully updated to ${status}`);
      toast.success(`Conference ${status} successfully`);
    } catch (err) {
      console.error('Error updating conference status:', err);
      toast.error('Failed to update conference status');
    }
  };

  const handleDeleteConference = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this conference? This action cannot be undone.")) return;
    try {
      await updateDoc(doc(db, 'conferences', id), { status: 'deleted' }); // Or use deleteDoc
      toast.success("Conference marked as deleted");
    } catch (err) {
      console.error('Error deleting conference:', err);
      toast.error('Failed to delete conference');
    }
  };

  const handleUpdateParticipantStatus = async (confId: string, userId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'conferences', confId, 'participants', userId), { status });
      toast.success(`Participant ${status} successfully`);
    } catch (err) {
      console.error('Error updating participant status:', err);
      toast.error('Failed to update participant status');
    }
  };

  const handlePromoteAdmin = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'delegate' : 'admin';
    
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Failed to update user role');
    }
  };

  const handlePromoteChair = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'chair' ? 'delegate' : 'chair';
    
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApps = applications.filter(a => 
    a.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConfs = conferences.filter(c => 
    c.status === 'approved' && (
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredRequests = conferences.filter(c => 
    c.status === 'pending' && (
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.founderName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-primary-container" size={24} />
            <span className="text-xs font-black tracking-[0.3em] text-primary-container uppercase">Secretariat Control</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-none">ADMIN DASHBOARD</h1>
        </div>

        <div className="flex bg-surface-container-low p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <Users size={16} /> Users
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'applications' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <FileText size={16} /> Applications
          </button>
          <button 
            onClick={() => setActiveTab('conferences')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'conferences' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <Globe size={16} /> Conferences
          </button>
          <button 
            onClick={() => setActiveTab('evaluations')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'evaluations' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <Zap size={16} /> Evaluations
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 relative ${activeTab === 'requests' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <Send size={16} /> MUN Proposals
            {conferences.filter(c => c.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-[8px] flex items-center justify-center rounded-full text-white animate-pulse">
                {conferences.filter(c => c.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Users />} label="Total Delegates" value={users.length.toString()} />
        <StatCard icon={<FileText />} label="Pending Apps" value={applications.filter(a => a.status === 'pending').length.toString()} />
        <StatCard icon={<Globe />} label="Pending MUNs" value={conferences.filter(c => c.status === 'pending').length.toString()} />
        <StatCard icon={<Zap />} label="Evaluations" value={evaluations.length.toString()} />
      </section>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
        <input 
          type="text" 
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-surface-container-low border border-white/5 rounded-xl py-4 pl-12 pr-6 text-on-surface focus:outline-none focus:border-primary-container/50 transition-all"
        />
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-high text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant">
                {activeTab === 'users' ? (
                  <>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </>
                ) : activeTab === 'applications' ? (
                  <>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Institution</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </>
                ) : activeTab === 'conferences' ? (
                  <>
                    <th className="px-6 py-4">Conference</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </>
                ) : activeTab === 'requests' ? (
                  <>
                    <th className="px-6 py-4">Proposed MUN</th>
                    <th className="px-6 py-4">Founder & Contact</th>
                    <th className="px-6 py-4">Format</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4">Delegate</th>
                    <th className="px-6 py-4">Chair</th>
                    <th className="px-6 py-4">Scores</th>
                    <th className="px-6 py-4 text-right">Feedback</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {activeTab === 'users' ? (
                  filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.uid}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.photoURL} className="w-8 h-8 rounded-full" alt="" />
                          <div>
                            <div className="font-bold text-sm">{user.displayName}</div>
                            <div className="text-xs text-on-surface-variant">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${user.role === 'admin' ? 'bg-primary-container/20 text-primary-container' : user.role === 'chair' ? 'bg-amber-400/20 text-amber-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${user.status === 'active' ? 'text-success' : 'text-error'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-success' : 'bg-error'}`}></div>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handlePromoteAdmin(user.uid, user.role)}
                            className={`p-2 rounded-lg transition-all ${user.role === 'admin' ? 'text-primary-container bg-primary-container/10' : 'text-on-surface-variant hover:bg-white/5'}`}
                            title={user.role === 'admin' ? 'Demote to Delegate' : 'Promote to Admin'}
                          >
                            <ShieldCheck size={18} />
                          </button>
                          <button 
                            onClick={() => handlePromoteChair(user.uid, user.role)}
                            className={`p-2 rounded-lg transition-all ${user.role === 'chair' ? 'text-amber-400 bg-amber-400/10' : 'text-on-surface-variant hover:bg-white/5'}`}
                            title={user.role === 'chair' ? 'Demote to Delegate' : 'Promote to Chair'}
                          >
                            <Zap size={18} />
                          </button>
                          <button 
                            onClick={() => handleBanUser(user.uid, user.status)}
                            className={`p-2 rounded-lg transition-all ${user.status === 'banned' ? 'text-success hover:bg-success/10' : 'text-error hover:bg-error/10'}`}
                            title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                          >
                            <Ban size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : activeTab === 'applications' ? (
                  filteredApps.map((app) => (
                    <motion.tr 
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-sm">{app.fullName}</div>
                          <div className="text-xs text-on-surface-variant">{app.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {app.institution}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                          app.status === 'accepted' ? 'bg-success/20 text-success' : 
                          app.status === 'rejected' ? 'bg-error/20 text-error' : 
                          'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateAppStatus(app.id, 'accepted')}
                            className="p-2 text-success hover:bg-success/10 rounded-lg transition-all"
                            title="Accept"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-all"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : activeTab === 'conferences' ? (
                  filteredConfs.map((conf) => (
                    <motion.tr 
                      key={conf.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-sm">{conf.title}</div>
                          <div className="text-xs text-on-surface-variant">{conf.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {conf.location}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                          conf.status === 'approved' ? 'bg-success/20 text-success' : 
                          conf.status === 'rejected' ? 'bg-error/20 text-error' : 
                          'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {conf.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedConferenceId(conf.id)}
                            className="p-2 text-primary-container hover:bg-primary-container/10 rounded-lg transition-all"
                            title="Manage Participants"
                          >
                            <Users size={18} />
                          </button>
                          {conf.status !== 'approved' && (
                            <button 
                              onClick={() => handleUpdateConfStatus(conf.id, 'approved')}
                              className="p-2 text-success hover:bg-success/10 rounded-lg transition-all"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleUpdateConfStatus(conf.id, 'rejected')}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-all"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : activeTab === 'requests' ? (
                  filteredRequests.map((req) => (
                    <motion.tr 
                      key={req.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center overflow-hidden">
                            {req.image ? <img src={req.image} className="w-full h-full object-cover" alt="" /> : <Globe size={20} className="text-primary-container" />}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{req.title}</div>
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">{req.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold">{req.founderName}</div>
                        <div className="text-xs text-on-surface-variant">{req.phone}</div>
                        {req.instagram && <div className="text-[10px] text-primary-container">@{req.instagram}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${req.format === 'online' ? 'bg-amber-400/20 text-amber-400' : 'bg-primary-container/20 text-primary-container'}`}>
                          {req.format}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {req.status !== 'approved' && (
                            <button 
                              onClick={() => handleUpdateConfStatus(req.id, 'approved')}
                              className="p-2 text-success hover:bg-success/10 rounded-lg transition-all"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleUpdateConfStatus(req.id, 'rejected')}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-all"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  evaluations.map((ev) => (
                    <motion.tr 
                      key={ev.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold">
                          {users.find(u => u.uid === ev.delegateUid)?.displayName || 'Unknown Delegate'}
                        </div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                          {ev.committee || 'General Assembly'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {users.find(u => u.uid === ev.chairUid)?.displayName || 'Unknown Chair'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <span className="text-[10px] bg-primary-container/10 text-primary-container px-1.5 py-0.5 rounded font-bold">D: {ev.diplomacy}</span>
                          <span className="text-[10px] bg-primary-container/10 text-primary-container px-1.5 py-0.5 rounded font-bold">S: {ev.speech}</span>
                          <span className="text-[10px] bg-primary-container/10 text-primary-container px-1.5 py-0.5 rounded font-bold">P: {ev.position}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-xs text-on-surface-variant max-w-[200px] truncate ml-auto" title={ev.feedback}>
                          {ev.feedback || 'No feedback'}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {loading && (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {((activeTab === 'users' && filteredUsers.length === 0) || (activeTab === 'applications' && filteredApps.length === 0)) && !loading && (
          <div className="p-12 text-center text-on-surface-variant">
            No results found for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Participant Management Modal */}
      <AnimatePresence>
        {selectedConferenceId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedConferenceId(null)}
              className="absolute inset-0 bg-surface/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-surface-container-low p-8 rounded-3xl border border-white/10 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight">Conference Participants</h3>
                  <p className="text-on-surface/40 text-xs uppercase tracking-widest mt-1">
                    {conferences.find(c => c.id === selectedConferenceId)?.title}
                  </p>
                </div>
                <button onClick={() => setSelectedConferenceId(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <XCircle size={24} className="text-on-surface/40" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-high text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Requested Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {participants.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm">{p.displayName}</div>
                          <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">{p.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${p.role === 'chair' ? 'bg-amber-400/20 text-amber-400' : 'bg-primary-container/20 text-primary-container'}`}>
                            {p.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                            p.status === 'approved' ? 'bg-success/20 text-success' : 
                            p.status === 'rejected' ? 'bg-error/20 text-error' : 
                            'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateParticipantStatus(selectedConferenceId, p.id, 'approved')}
                              className="p-2 text-success hover:bg-success/10 rounded-lg transition-all"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleUpdateParticipantStatus(selectedConferenceId, p.id, 'rejected')}
                              className="p-2 text-error hover:bg-error/10 rounded-lg transition-all"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {participants.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-on-surface/40">
                          No participants registered for this conference yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex items-center gap-6">
      <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-1">{label}</div>
        <div className="text-2xl font-black">{value}</div>
      </div>
    </div>
  );
}
