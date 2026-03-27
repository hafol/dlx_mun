import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Send, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { useFirebase } from '../FirebaseContext';

const heroWords = ['FUTURE.', 'POLITICS.', 'DIPLOMACY.', 'LEADERSHIP.', 'CHANGE.'];

export default function Home() {
  const { user } = useFirebase();
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        ...feedback,
        uid: user?.uid || null,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setFeedback({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Feedback error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover grayscale brightness-[0.4] contrast-125"
            poster="/assets/astana.jpg"
          >
            <source src="/assets/astana.mp4" type="video/mp4" />
            {/* Fallback to image if video fails or doesn't exist */}
            <img 
              alt="Astana Kazakhstan" 
              className="w-full h-full object-cover grayscale brightness-[0.4] contrast-125" 
              src="/assets/astana.jpg"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=2000";
              }}
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-surface/60 via-transparent to-surface/60"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-primary-container/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
                <img 
                  src="/assets/logo.png" 
                  alt="DLX MUN Logo" 
                  className="w-16 h-16 object-contain brightness-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-3xl font-black text-primary-container">D</span>';
                    }
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="h-[2px] w-8 bg-primary-container"></span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">International Delegation 2026</span>
                </div>
                <h2 className="text-2xl font-black tracking-tighter text-on-surface uppercase">DLX MUN</h2>
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-on-surface leading-[0.85] tracking-tighter mb-10 italic uppercase">
              Lead the <br /> 
              <div className="relative h-[1.1em] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={heroWords[wordIndex]}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="absolute left-0 text-primary-container not-italic block"
                  >
                    {heroWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </h1>
            <p className="max-w-xl text-xl text-on-surface-variant leading-relaxed font-light">
              The Standard of Excellence in Central Asia. Experience the pinnacle of diplomatic simulation in the heart of the Steppe.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-4 flex flex-col gap-6 lg:border-l border-white/10 lg:pl-12"
          >
            <div className="group cursor-pointer">
              <p className="text-xs uppercase tracking-widest text-on-surface/40 mb-2">Current Status</p>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary-container animate-pulse"></div>
                <span className="text-xl font-medium">Registrations Open</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/conferences" className="group flex items-center gap-4 text-primary font-bold uppercase tracking-widest text-sm">
                Explore Councils
                <motion.div whileHover={{ x: 10 }}>
                  <ArrowRight size={20} />
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-surface-container-low py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold tracking-tight mb-6">The Standard of Excellence in Central Asia</h2>
              <p className="text-on-surface-variant font-light text-lg">DLX MUN is not just a conference; it is a global briefing for the next generation of leaders, designed with the precision of a high-stakes summit.</p>
            </div>
            <div className="flex gap-12">
              <div className="text-right">
                <p className="text-5xl font-black text-primary-container">15+</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface/40">Committees</p>
              </div>
              <div className="w-px h-12 bg-white/10"></div>
              <div className="text-right">
                <p className="text-5xl font-black text-primary-container">400+</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface/40">Delegates</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 relative group overflow-hidden rounded-xl bg-surface-container-high p-8 flex flex-col justify-end min-h-[400px]">
              <img 
                alt="Palace of Peace" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" 
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent"></div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest mb-4">Venue Spotlight</span>
                <h3 className="text-3xl font-bold mb-2">Palace of Peace & Reconciliation</h3>
                <p className="text-on-surface-variant text-sm max-w-md">Deliberate in the iconic pyramid of Astana, a symbol of global harmony and religious tolerance.</p>
              </div>
            </div>

            <div className="bg-primary-container p-8 flex flex-col justify-between rounded-xl min-h-[400px]">
              <motion.div 
                animate={{ rotate: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-on-primary-container"
              >
                <ArrowRight size={48} className="rotate-[-45deg]" />
              </motion.div>
              <div>
                <h3 className="text-on-primary-container text-2xl font-bold mb-2 leading-tight">Rigorous Academic Standards</h3>
                <p className="text-on-primary-container/80 text-sm">Experience the most comprehensive study guides and crisis simulations in the region.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section className="py-32 bg-surface overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 leading-none">
                Opportunities: <br /> <span className="text-primary-container not-italic">Lead the Debate</span>
              </h2>
              <div className="space-y-12">
                {[
                  { id: '01', title: 'Delegate Positions', desc: 'Represent nations in committees ranging from UNESCO to the Security Council. Shape international policy through rigorous debate.' },
                  { id: '02', title: 'Press Corps', desc: 'Document the summit. From crisis updates to editorial features, become the voice of the conference.' },
                  { id: '03', title: 'Chairs & Crisis Staff', desc: 'Direct the flow of history. Manage complex simulations and guide delegates toward consensus.' }
                ].map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="flex items-center gap-6 mb-4">
                      <span className="text-4xl font-black text-on-surface/10 group-hover:text-primary-container transition-colors">{item.id}</span>
                      <h4 className="text-2xl font-bold">{item.title}</h4>
                    </div>
                    <p className="pl-16 text-on-surface-variant font-light leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-16 pl-16">
                <Link to="/apply">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-primary-container text-on-primary-container font-bold uppercase tracking-widest text-sm rounded-md shadow-2xl shadow-primary-container/20"
                  >
                    Start Application
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl relative">
                <img 
                  alt="Debate Hall" 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-primary-container/20 mix-blend-overlay"></div>
              </div>
              <div className="absolute -bottom-10 -left-10 bg-surface-container-high p-8 rounded-xl shadow-2xl border border-white/10 hidden xl:block max-w-[280px]">
                <p className="text-[10px] uppercase tracking-widest text-primary-container mb-2 font-bold">Upcoming Milestone</p>
                <p className="text-lg font-bold">Priority Registration Deadline</p>
                <p className="text-on-surface-variant text-sm mt-2">October 15, 2024</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 text-[20rem] font-black text-on-surface/5 select-none pointer-events-none whitespace-nowrap leading-none italic uppercase">
          Diplomacy
        </div>
      </section>
      {/* Feedback Section */}
      <section className="py-24 bg-surface-container-low px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-container/10 mb-8">
            <MessageSquare className="text-primary-container" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-4 italic uppercase tracking-tighter">Your Feedback Matters</h2>
          <p className="text-on-surface-variant font-light mb-12">Help us improve the DLX MUN experience. Share your thoughts or report issues directly to the LevelUp Studio team.</p>
          
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-primary-container/20 rounded-2xl border border-primary-container/30"
            >
              <p className="text-primary-container font-bold uppercase tracking-widest">Thank you! Your feedback has been sent.</p>
              <button onClick={() => setSubmitted(false)} className="mt-4 text-xs underline opacity-50 hover:opacity-100">Send another</button>
            </motion.div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold ml-2">Name</label>
                <input 
                  required
                  type="text" 
                  value={feedback.name}
                  onChange={(e) => setFeedback({...feedback, name: e.target.value})}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 focus:border-primary-container outline-none transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold ml-2">Email</label>
                <input 
                  required
                  type="email" 
                  value={feedback.email}
                  onChange={(e) => setFeedback({...feedback, email: e.target.value})}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 focus:border-primary-container outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold ml-2">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={feedback.message}
                  onChange={(e) => setFeedback({...feedback, message: e.target.value})}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 focus:border-primary-container outline-none transition-all resize-none"
                  placeholder="How can we improve?"
                ></textarea>
              </div>
              <div className="md:col-span-2 mt-4">
                <button 
                  disabled={isSubmitting}
                  className="w-full bg-primary-container text-on-primary-container font-bold uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      Send Feedback <Send size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
