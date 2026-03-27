import { motion } from 'motion/react';
import { Mail, Instagram, MessageSquare, Phone } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-surface">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-12">Contact Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <p className="text-on-surface-variant font-light text-lg leading-relaxed">
                Have questions about DLX MUN or need technical support? Our team is here to help you. Reach out through any of the channels below.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-on-primary-container transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Email</p>
                    <a href="mailto:rezervparasat@gmail.com" className="text-xl font-bold hover:text-primary-container transition-colors">rezervparasat@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-on-primary-container transition-all">
                    <Instagram size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Instagram</p>
                    <a href="#" className="text-xl font-bold hover:text-primary-container transition-colors">@dlx_mun</a>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-on-primary-container transition-all">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">WhatsApp</p>
                    <a href="https://wa.me/77053701298" target="_blank" rel="noopener noreferrer" className="text-xl font-bold hover:text-primary-container transition-colors">+7 (705) 370-12-98</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="text-primary-container" size={24} />
                <h3 className="text-xl font-bold uppercase tracking-widest">Secretariat Support</h3>
              </div>
              <p className="text-on-surface-variant font-light text-sm mb-8">
                For urgent matters regarding conference participation, delegate status, or chair applications, please contact the Secretariat directly.
              </p>
              <div className="p-6 bg-surface rounded-xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-on-surface/40">Response Time</span>
                  <span className="text-xs font-bold text-primary-container">Within 24 Hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-on-surface/40">Availability</span>
                  <span className="text-xs font-bold text-primary-container">Mon - Fri, 9:00 - 18:00</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
