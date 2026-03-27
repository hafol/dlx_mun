import { motion } from 'motion/react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Globe, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/profile');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-surface-container-low rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
        {/* Left Side: Branding */}
        <div className="bg-primary-container p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <Globe className="text-on-primary-container" size={32} />
              <span className="text-2xl font-black tracking-tighter text-on-primary-container uppercase">DLX MUN</span>
            </div>
            <h1 className="text-4xl font-black text-on-primary-container leading-none tracking-tighter mb-6">
              SHAPE THE <br /> GLOBAL <br /> DISCOURSE.
            </h1>
            <p className="text-on-primary-container/80 text-sm max-w-xs leading-relaxed">
              Join the most prestigious diplomatic simulation network in Central Asia. Authenticate to access your delegate dashboard.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-on-primary-container/70 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={16} /> Secure Authentication
            </div>
            <div className="flex items-center gap-3 text-on-primary-container/70 text-xs font-bold uppercase tracking-widest">
              <Zap size={16} /> Instant Access
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-12 flex flex-col justify-center bg-surface">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
            <p className="text-on-surface-variant text-sm">Sign in to your account to continue your journey.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container/20 border border-error/20 rounded-lg text-error text-sm font-medium">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 bg-white text-black py-4 rounded-xl font-bold transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </>
            )}
          </button>

          <div className="mt-10 pt-10 border-t border-white/5">
            <p className="text-xs text-on-surface-variant text-center leading-relaxed">
              By continuing, you agree to the DLX MUN Terms of Service and Privacy Policy. 
              Your data is secured with enterprise-grade encryption.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
