import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldCheck, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useFirebase } from '../FirebaseContext';
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';

export default function Apply() {
  const { user, profile } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.displayName || '',
    institution: '',
    email: profile?.email || '',
    experience: '',
    committee: '',
    statement: '',
    certified: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.certified) {
      alert('Please certify the accuracy of your records.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'applications'), {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        institution: formData.institution,
        experience: formData.experience,
        committee: formData.committee,
        statement: formData.statement,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'applications');
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
          <h1 className="text-3xl font-black tracking-tighter mb-4 uppercase">Application Received</h1>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Your credentials have been transmitted to the Secretariat. You will receive a notification in your profile once the review process is complete.
          </p>
          <button 
            onClick={() => window.location.href = '/profile'}
            className="w-full bg-primary-container text-on-primary-container py-4 rounded font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-8"
            >
              <span className="inline-block px-3 py-1 bg-primary-container/10 border border-primary-container/20 text-primary-container text-[10px] tracking-[0.2em] uppercase font-bold mb-6">Executive Secretariat Call</span>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                Shape the <span className="text-primary-container">Global Discourse</span>
              </h1>
              <p className="text-lg lg:text-xl text-on-surface/60 max-w-2xl leading-relaxed">
                Join the ranks of the Digital Attaché. We are seeking individuals of exceptional character, diplomatic poise, and intellectual rigor to preside over the committees of DLX MUN.
              </p>
            </motion.div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-64 lg:h-96 rounded-xl overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
              >
                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1000" />
              </motion.div>
            </div>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/5 rounded-full blur-[120px]"></div>
      </section>

      {/* Standard Section */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-container-low p-8 lg:p-12 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <ShieldCheck size={120} className="text-primary-container/10 group-hover:text-primary-container/20 transition-colors" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-10 tracking-tight">The Digital Attaché Standard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {[
                  { title: 'Expertise', desc: 'Deep understanding of parliamentary procedure and nuanced command over the agenda of the assigned committee.' },
                  { title: 'Impartiality', desc: 'Maintaining the highest standard of neutrality, ensuring that the discourse remains fair, balanced, and productive.' },
                  { title: 'Authority', desc: 'Leading with quiet confidence, resolving conflicts through diplomatic tact, and steering delegates toward resolution.' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-4">
                    <h3 className="text-primary-container font-semibold uppercase text-xs tracking-widest">{item.title}</h3>
                    <p className="text-sm text-on-surface/70 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <form className="space-y-24" onSubmit={handleSubmit}>
            <FormSection step="I" title="Identity & Affiliation">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Full Name</label>
                  <input 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface placeholder:text-white/10" 
                    placeholder="Your diplomatic title and name" 
                    type="text" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Academic Institution</label>
                    <input 
                      required
                      value={formData.institution}
                      onChange={(e) => setFormData({...formData, institution: e.target.value})}
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface placeholder:text-white/10" 
                      placeholder="University/School" 
                      type="text" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Email Address</label>
                    <input 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface placeholder:text-white/10" 
                      placeholder="official@domain.com" 
                      type="email" 
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection step="II" title="Diplomatic Tenure" desc="List previous conferences attended and roles served (Delegate, Rapporteur, Chair).">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Conference History</label>
                <textarea 
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface placeholder:text-white/10 resize-none" 
                  placeholder="Format: Conference Name (Year) - Role - Committee" 
                  rows={6}
                ></textarea>
              </div>
            </FormSection>

            <FormSection step="III" title="Committee Assignment">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['UN Security Council', 'ECOFIN', 'DISEC', 'UNEP'].map(committee => (
                  <label key={committee} className="relative flex items-center p-4 bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors border border-transparent has-[:checked]:border-primary-container/40 has-[:checked]:bg-primary-container/5">
                    <input 
                      required
                      className="w-4 h-4 text-primary-container bg-surface-container-high border-none ring-offset-surface-container-low focus:ring-primary-container" 
                      name="committee" 
                      type="radio" 
                      value={committee}
                      checked={formData.committee === committee}
                      onChange={(e) => setFormData({...formData, committee: e.target.value})}
                    />
                    <span className="ml-3 text-sm font-medium">{committee}</span>
                  </label>
                ))}
              </div>
            </FormSection>

            <FormSection step="IV" title="Statement of Purpose">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Vision for the Committee (500 Words Max)</label>
                <textarea 
                  required
                  value={formData.statement}
                  onChange={(e) => setFormData({...formData, statement: e.target.value})}
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-container p-4 rounded-lg text-sm text-on-surface placeholder:text-white/10 resize-none" 
                  placeholder="Outline your philosophy as a chair and how you intend to foster an environment of critical debate." 
                  rows={8}
                ></textarea>
                <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-6">
                  <div className="flex items-center gap-2">
                    <input 
                      required
                      checked={formData.certified}
                      onChange={(e) => setFormData({...formData, certified: e.target.checked})}
                      className="rounded bg-surface-container-high border-none text-primary-container focus:ring-primary-container" 
                      type="checkbox" 
                    />
                    <span className="text-[10px] text-on-surface/50 uppercase tracking-widest">I certify the accuracy of these records</span>
                  </div>
                  <motion.button 
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full md:w-auto bg-primary-container text-on-primary-container px-10 py-4 rounded-md font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary-container/10 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    {isSubmitting ? 'Transmitting...' : 'Submit Application'}
                  </motion.button>
                </div>
              </div>
            </FormSection>
          </form>
        </div>
      </section>
    </main>
  );
}

function FormSection({ step, title, desc, children }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary-container">{step}</h3>
        <p className="text-xl font-bold mt-2">{title}</p>
        {desc && <p className="text-xs text-on-surface/40 mt-4 leading-relaxed">{desc}</p>}
      </div>
      <div className="md:col-span-8">
        {children}
      </div>
    </div>
  );
}
