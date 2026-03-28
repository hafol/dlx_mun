import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Menu, X, LogOut, ShieldCheck, ChevronRight, Star, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirebase } from '../FirebaseContext';
import { auth, signOut } from '../firebase';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Conferences', path: '/conferences' },
  { name: 'Leaderboard', path: '/leaderboard' },
  { name: 'Apply', path: '/apply' },
  { name: 'Host MUN', path: '/host' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, profile } = useFirebase();
  const isChair = profile?.role === 'chair';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-surface/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-10 h-10 bg-primary-container/10 backdrop-blur-md rounded-sm flex items-center justify-center border border-white/5"
          >
            <img 
              src="/assets/logo.png" 
              alt="DLX Logo" 
              className="w-8 h-8 object-contain brightness-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-8 h-8 bg-primary-container rounded-sm flex items-center justify-center"><span class="text-on-primary-container font-black text-xs">D</span></div>';
                }
              }}
            />
          </motion.div>
          <span className="text-xl font-black tracking-tighter text-on-surface uppercase">DLX MUN</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:text-primary-container ${location.pathname === link.path ? 'text-primary-container' : 'text-on-surface-variant'}`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="h-4 w-px bg-white/10"></div>

          <div className="flex items-center gap-4">
            {(isAdmin || isChair) && (
              <Link to="/chair" className="text-amber-400 hover:opacity-80 transition-all" title="Chair Dashboard">
                <Star size={20} />
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-primary-container hover:opacity-80 transition-all" title="Admin Dashboard">
                <ShieldCheck size={20} />
              </Link>
            )}
            {(isAdmin || profile?.role === 'organizer') && (
              <Link to="/organizer" className="text-primary-container hover:opacity-80 transition-all" title="Organizer Dashboard">
                <Users size={20} />
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-8 h-8 rounded-full overflow-hidden border border-primary-container/50 cursor-pointer"
                  >
                    <img src={user.photoURL || ''} className="w-full h-full object-cover" alt="Profile" />
                  </motion.div>
                </Link>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="text-on-surface-variant hover:text-error transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </motion.button>
              </div>
            ) : (
              <Link to="/login">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-container text-on-primary-container px-6 py-2 rounded font-bold uppercase tracking-widest text-[10px]"
                >
                  Login
                </motion.button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-primary-container" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full bg-surface-container-low border-b border-white/5 px-8 py-10 space-y-8"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-black tracking-tighter uppercase flex items-center justify-between group"
              >
                {link.name}
                <ChevronRight className="text-primary-container opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            ))}
            
            <div className="h-px bg-white/5"></div>

            <div className="flex flex-col gap-4">
              {(isAdmin || isChair) && (
                <Link 
                  to="/chair" 
                  onClick={() => setIsOpen(false)}
                  className="text-amber-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"
                >
                  <Star size={18} /> Chair Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsOpen(false)}
                  className="text-primary-container font-bold uppercase tracking-widest text-sm flex items-center gap-2"
                >
                  <ShieldCheck size={18} /> Admin Dashboard
                </Link>
              )}
              {(isAdmin || profile?.role === 'organizer') && (
                <Link 
                  to="/organizer" 
                  onClick={() => setIsOpen(false)}
                  className="text-primary-container font-bold uppercase tracking-widest text-sm flex items-center gap-2"
                >
                  <Users size={18} /> Organizer Dashboard
                </Link>
              )}
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsOpen(false)}
                    className="text-on-surface font-bold uppercase tracking-widest text-sm"
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="text-error font-bold uppercase tracking-widest text-sm text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="bg-primary-container text-on-primary-container px-6 py-4 rounded font-bold uppercase tracking-widest text-center"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
