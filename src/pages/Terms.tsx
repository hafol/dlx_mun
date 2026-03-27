import { motion } from 'motion/react';

export default function Terms() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-12">Terms of Service</h1>
          <div className="prose prose-invert max-w-none space-y-8 text-on-surface-variant font-light leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-on-surface mb-4 uppercase tracking-widest">1. Acceptance of Terms</h2>
              <p>By accessing or using the DLX MUN platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-on-surface mb-4 uppercase tracking-widest">2. User Conduct</h2>
              <p>You are responsible for your use of the platform and for any content you provide. You agree not to engage in any activity that interferes with or disrupts the platform.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-on-surface mb-4 uppercase tracking-widest">3. Conference Participation</h2>
              <p>Participation in conferences is subject to application approval and adherence to the specific rules of each conference. We reserve the right to restrict access to any user who violates these rules.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-on-surface mb-4 uppercase tracking-widest">4. Intellectual Property</h2>
              <p>All content on the platform, including text, graphics, logos, and software, is the property of DLX MUN or its licensors and is protected by copyright and other intellectual property laws.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
