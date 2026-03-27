import { motion } from 'motion/react';

export default function Privacy() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-12">Privacy Policy</h1>
          <div className="prose prose-invert max-w-none space-y-8 text-on-surface-variant font-light leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-on-surface mb-4 uppercase tracking-widest">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, apply for a conference, or send us feedback. This may include your name, email address, institution, and MUN experience.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-on-surface mb-4 uppercase tracking-widest">2. How We Use Information</h2>
              <p>We use the information we collect to operate and improve our platform, process your applications, and communicate with you about conferences and updates.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-on-surface mb-4 uppercase tracking-widest">3. Data Security</h2>
              <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. All data is stored securely using Firebase infrastructure.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-on-surface mb-4 uppercase tracking-widest">4. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at rezervparasat@gmail.com.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
