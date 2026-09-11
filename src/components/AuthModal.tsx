import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle, Mail, User, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { signInWithGoogleOAuth, signInOrRegisterUser, UserSession, isSupabaseConfigured } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await signInWithGoogleOAuth();
      if (res.error) {
        setErrorMsg(res.error);
        setIsSubmitting(false);
      }
    } catch {
      setErrorMsg('Unable to continue with Google OAuth. You can use the direct Email / Admin login below.');
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signInOrRegisterUser(email, fullName);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.session) {
        onLoginSuccess(res.session);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error signing in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-[#E5E5E5] p-6 sm:p-8 my-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#737373] hover:text-[#111111] cursor-pointer"
          aria-label="Close authentication"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#737373] font-semibold block mb-1">
            Tifeh.s Place Atelier
          </span>
          <h2 className="text-2xl font-serif text-[#111111]">Client & Admin Access</h2>
          <p className="text-xs text-[#737373] mt-1 max-w-xs mx-auto">
            Sign in to track orders, upload your profile picture, or access the boutique management portal.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 text-left">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Option 1: Continue with Google */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-white border border-[#D4D4D4] hover:border-[#111111] hover:bg-[#F9F9F9] text-[#111111] text-xs font-medium transition-all flex items-center justify-center gap-3 shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>{isSubmitting ? 'Connecting...' : 'Continue with Google'}</span>
            {!isSubmitting && <ArrowRight size={14} />}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E5E5]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-[#737373]">
            <span className="bg-white px-3 font-semibold">Or Direct Sign In</span>
          </div>
        </div>

        {/* Option 2: Direct Email / Admin sign-in */}
        <form onSubmit={handleEmailSignIn} className="space-y-3.5 text-left">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Email Address / Admin Gmail
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="savyzeus101@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
              />
            </div>
            {/* Quick autofill chip for administrator */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-[#737373]">Quick fill:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('savyzeus101@gmail.com');
                  setFullName('Savy Zeus');
                }}
                className="text-[10px] text-[#C5A059] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={11} />
                <span>savyzeus101@gmail.com</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#111111] mb-1">
              Full Name (Optional)
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Savy Zeus"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#111111] hover:bg-black text-[#FAFAFA] text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In / Open Account'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Persistence & Connectivity Note */}
        <div className="mt-5 pt-4 border-t border-[#F0F0F0] text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-[#737373]">
            <Sparkles size={11} className="text-[#C5A059]" />
            <span>Profile and custom gallery photos persist automatically across sessions.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
