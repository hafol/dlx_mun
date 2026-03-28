import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Send, CheckCircle, Loader2, Image as ImageIcon, Calendar, MapPin, Link as LinkIcon, Users, Phone, Instagram, XCircle } from 'lucide-react';
import { useFirebase } from '../FirebaseContext';
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType, doc, setDoc } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
    googleFormUrl: '',
    instagram: '',
    phone: '',
    founderName: '',
    format: 'offline' as 'online' | 'offline',
    type: 'community' as 'verified' | 'community',
    kaspiNumber: '',
    kaspiName: '',
    price: 0,
    language: 'English',
    committees: [{ name: '', topic: '' }]
  });

  const addCommittee = () => {
    setFormData({
      ...formData,
      committees: [...formData.committees, { name: '', topic: '' }]
    });
  };

  const removeCommittee = (index: number) => {
    const newCommittees = formData.committees.filter((_, i) => i !== index);
    setFormData({ ...formData, committees: newCommittees });
  };

  const updateCommittee = (index: number, field: 'name' | 'topic', value: string) => {
    const newCommittees = [...formData.committees];
    newCommittees[index][field] = value;
    setFormData({ ...formData, committees: newCommittees });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit button clicked, starting submission process...");
    
    if (!user) {
      console.error("Submission failed: User not logged in");
      toast.error("You must be logged in to submit a proposal");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Attempting to add document to 'conferences' collection...", formData);
      const docRef = await addDoc(collection(db, 'conferences'), {
        ...formData,
        organizerUid: user.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      console.log("Document successfully added with ID:", docRef.id);

      // Assign organizer role to user if they aren't already an admin
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'organizer' // This will be merged, but we should be careful
      }, { merge: true });

      setIsSuccess(true);
      toast.success("Proposal submitted successfully! Our team will review it shortly.");
    } catch (err) {
      console.error("Submission error details:", err);
      toast.error("Failed to submit proposal. Please try again.");
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
                    <ImageIcon size={12} /> Cover Image
                  </label>
                  <div className="flex flex-col gap-4">
                    {formData.image && (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, image: ''})}
                          className="absolute top-2 right-2 p-2 bg-error text-white rounded-full hover:opacity-90 transition-opacity"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                    <label className={`w-full aspect-video rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all ${formData.image ? 'hidden' : 'flex'}`}>
                      <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container">
                        <ImageIcon size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold">Click to upload photo</p>
                        <p className="text-[10px] text-on-surface/40 uppercase tracking-widest mt-1">PNG, JPG up to 800KB</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 800 * 1024) {
                              toast.error("Image size must be less than 800KB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({...formData, image: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                      <LinkIcon size={12} /> Official Website
                    </label>
                    <input 
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                      className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                      placeholder="https://www.yourmun.org" 
                      type="text" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                      <LinkIcon size={12} /> Google Form (Alternative)
                    </label>
                    <input 
                      value={formData.googleFormUrl}
                      onChange={(e) => setFormData({...formData, googleFormUrl: e.target.value})}
                      className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                      placeholder="https://forms.gle/..." 
                      type="text" 
                    />
                  </div>
                </div>

                <div className="p-6 bg-primary-container/5 rounded-2xl border border-primary-container/10 space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary-container">Payment Details (Kaspi)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Kaspi Number</label>
                      <input 
                        required
                        value={formData.kaspiNumber}
                        onChange={(e) => setFormData({...formData, kaspiNumber: e.target.value})}
                        className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                        placeholder="8 707 123 4567" 
                        type="text" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Account Name (e.g. John D.)</label>
                      <input 
                        required
                        value={formData.kaspiName}
                        onChange={(e) => setFormData({...formData, kaspiName: e.target.value})}
                        className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                        placeholder="John D." 
                        type="text" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Price (KZT)</label>
                      <input 
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                        placeholder="5000" 
                        type="number" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Conference Language</label>
                      <input 
                        required
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                        className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface" 
                        placeholder="English, Russian, Kazakh" 
                        type="text" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold flex items-center gap-2">
                      <Users size={12} /> Committees & Topics
                    </label>
                    <button 
                      type="button"
                      onClick={addCommittee}
                      className="text-[10px] uppercase tracking-widest text-primary-container font-bold hover:underline"
                    >
                      + Add Committee
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.committees.map((committee, index) => (
                      <div key={index} className="p-4 bg-surface-container rounded-xl border border-white/5 relative group">
                        {formData.committees.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeCommittee(index)}
                            className="absolute -top-2 -right-2 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input 
                            required
                            value={committee.name}
                            onChange={(e) => updateCommittee(index, 'name', e.target.value)}
                            className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-container p-3 rounded-lg text-xs text-on-surface" 
                            placeholder="Committee Name (e.g. DISEC)" 
                            type="text" 
                          />
                          <input 
                            required
                            value={committee.topic}
                            onChange={(e) => updateCommittee(index, 'topic', e.target.value)}
                            className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-container p-3 rounded-lg text-xs text-on-surface" 
                            placeholder="Committee Topic" 
                            type="text" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
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
                  type="submit"
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
