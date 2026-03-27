import { Link } from 'react-router-dom';
import { Mail, Instagram, MessageSquare, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-surface py-20 px-6 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-container/10 backdrop-blur-md rounded-sm flex items-center justify-center border border-white/5 overflow-hidden">
                <img 
                  src="/assets/logo.png" 
                  alt="Logo" 
                  className="w-8 h-8 object-contain brightness-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-8 h-8 bg-primary-container rounded-sm flex items-center justify-center"><span class="text-on-primary-container font-black text-xs">D</span></div>';
                    }
                  }}
                />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">DLX MUN</span>
            </div>
            <p className="text-on-surface-variant font-light max-w-sm leading-relaxed">
              The Standard of Excellence in Central Asia. Experience the pinnacle of diplomatic simulation in the heart of the Steppe.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] font-bold mb-6 text-primary">Legal</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant font-light">
              <li><Link to="/privacy" className="hover:text-primary-container transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-container transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] font-bold mb-6 text-primary">Support</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant font-light">
              <li><Link to="/contact" className="hover:text-primary-container transition-colors">Contact Us</Link></li>
              <li><a href="mailto:rezervparasat@gmail.com" className="hover:text-primary-container transition-colors">Email Support</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-on-surface/40 font-bold">
            © 2026 DLX MUN. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-on-surface/40 hover:text-primary-container transition-colors"><Instagram size={18} /></a>
            <a href="https://wa.me/77053701298" target="_blank" rel="noopener noreferrer" className="text-on-surface/40 hover:text-primary-container transition-colors"><Phone size={18} /></a>
            <a href="mailto:rezervparasat@gmail.com" className="text-on-surface/40 hover:text-primary-container transition-colors"><Mail size={18} /></a>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-on-surface/40 font-bold">
            Designed by <span className="text-primary-container">LevelUp Studio</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
