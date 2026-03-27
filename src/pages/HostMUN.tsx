import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Send, CheckCircle, Loader2, Image as ImageIcon, Calendar, MapPin, Link as LinkIcon, Users, Phone, Instagram } from 'lucide-react';
import { useFirebase } from '../FirebaseContext';
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function HostMUN() {
  const { user } = useFirebase();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: '',
    websiteUrl: '',
    instagram: '',
    phone: '',
    founderName: '',
    format: 'offline' as 'online' | 'offline',
    type: 'community' as 'verified' | 'community'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'conferences'), {
        ...formData,
        organizerUid: user.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'conferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-surface">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-surface-container-low p-12 rounded-2xl border border-primary-container/20 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="text-primary-container" size={40} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-4 uppercase">Proposal Submitted</h1>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Your conference proposal has been sent to the DLX Executive Board for review. You will be notified once it is approved and listed on the platform.
          </p>
          <button 
            onClick={() => navigate('/conferences')}
            className="w-full bg-primary-container text-on-primary-container py-4 rounded font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
          >
            View Conferences
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20">
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 bg-primary-container/10 border border-primary-container/20 text-primary-container text-[10px] tracking-[0.2em] uppercase font-bold mb-6">Global Network Expansion</span>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6">Host your <span className="text-primary-container">MUN</span> on DLX</h1>
            <p className="text-lg text-on-surface/60 max-w-2xl mx-auto leading-relaxed">
              Empower your local community by hosting a conference on the world's most advanced MUN platform. Get access to our tools, network, and standard.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-surface-container-low p-8 lg:p-12 rounded-2xl border border-white/5 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                    <Globe size={12} /> Conference Title
                  </label>
                  <input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                    placeholder="e.g. Harvard WorldMUN 2026" 
                    type="text" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                      <Calendar size={12} /> Date
                    </label>
                    <input 
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                      placeholder="March 15-18, 2026" 
                      type="text" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                      <MapPin size={12} /> Location
                    </label>
                    <input 
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                      placeholder="Geneva, Switzerland" 
                      type="text" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                      <Globe size={12} /> Format
                    </label>
                    <select 
                      required
                      value={formData.format}
                      onChange={(e) => setFormData({...formData, format: e.target.value as 'online' | 'offline'})}
                      className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface"
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                      <Users size={12} /> Founder Name
                    </label>
                    <input 
                      required
                      value={formData.founderName}
                      onChange={(e) => setFormData({...formData, founderName: e.target.value})}
                      className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                      placeholder="John Doe" 
                      type="text" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                      <Phone size={12} /> Contact Phone
                    </label>
                    <input 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                      placeholder="+1 234 567 890" 
                      type="tel" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                      <Instagram size={12} /> Instagram
                    </label>
                    <input 
                      value={formData.instagram}
                      onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                      className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                      placeholder="@yourmun" 
                      type="text" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                    <ImageIcon size={12} /> Cover Image URL
                  </label>
                  <input 
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                    placeholder="https://images.unsplash.com/..." 
                    type="url" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                    <LinkIcon size={12} /> Official Website
                  </label>
                  <input 
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                    className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                    placeholder="https://www.yourmun.org" 
                    type="url" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Description & Vision</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface resize-none" 
                    placeholder="Tell us about your conference, committees, and goals..." 
                    rows={6}
                  ></textarea>
                </div>
              </div>

              <div className="pt-6">
                <motion.button 
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-2xl shadow-primary-container/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  {isSubmitting ? 'Submitting Proposal...' : 'Submit for Approval'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
