import React, { useState } from 'react';
import { X, User, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { isAdminEmail } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, isAdmin: boolean, name?: string, provider?: 'email' | 'google') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google sign in prompt states
  const [isGooglePromptOpen, setIsGooglePromptOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('savyzeus101@gmail.com');

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const cleanEmail = email.trim().toLowerCase();
      const isAdmin = isAdminEmail(cleanEmail);
      const name = fullName.trim() || (cleanEmail.split('@')[0]);
      onLoginSuccess(cleanEmail, isAdmin, name, 'email');
      onClose();
    }, 350);
  };

  const handleGoogleSignIn = (selectedGmail: string) => {
    if (!selectedGmail || !selectedGmail.includes('@')) {
      setErrorMsg('Please enter a valid Gmail address.');
      return;
    }
    const cleanEmail = selectedGmail.trim().toLowerCase();
    const isAdmin = isAdminEmail(cleanEmail);
    const derivedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsGooglePromptOpen(false);
      onLoginSuccess(cleanEmail, isAdmin, formattedName, 'google');
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-[#E5E5E5] p-6 sm:p-8 my-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#737373] hover:text-[#111111]"
          aria-label="Close authentication"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#737373] font-semibold block mb-1">
            Tifeh.s Place Atelier
          </span>
          <h2 className="text-2xl font-serif text-[#111111]">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-[#737373] mt-1 max-w-xs mx-auto">
            Sign in to manage your luxury orders or access boutique administration.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Google / Gmail Sign In Button */}
        {!isGooglePromptOpen ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsGooglePromptOpen(true)}
              className="w-full py-3 px-4 bg-white border border-[#D4D4D4] hover:border-[#111111] hover:bg-[#F9F9F9] text-[#111111] text-xs font-medium transition-all flex items-center justify-center gap-3 shadow-2xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{mode === 'login' ? 'Sign In with Google (Gmail)' : 'Register with Google (Gmail)'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#E5E5E5] w-full" />
              <span className="bg-white px-3 text-[10px] uppercase tracking-widest text-[#737373] relative shrink-0">
                Or with email
              </span>
            </div>
          </div>
        ) : (
          /* Google Account Confirmation Box */
          <div className="mb-5 p-4 bg-[#F9F9F9] border border-[#E5E5E5] space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#111111] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                Google Authentication
              </span>
              <button
                type="button"
                onClick={() => setIsGooglePromptOpen(false)}
                className="text-[11px] text-[#737373] hover:text-[#111111]"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-[#737373]">
              Enter your Gmail address to sign in or register instantly:
            </p>

            <div className="space-y-2">
              <input
                type="email"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-3 py-2 bg-white border border-[#D4D4D4] text-xs focus:outline-none focus:border-[#111111]"
              />
              <button
                type="button"
                onClick={() => handleGoogleSignIn(googleEmailInput)}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-xs uppercase tracking-wider font-medium transition-all flex items-center justify-center gap-2"
              >
                <span>Continue with this Gmail</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5 text-xs mt-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Tifeh Balogun"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="email"
                required
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Toggle between Login and Signup */}
        <div className="mt-5 text-center text-xs text-[#737373]">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#111111] font-semibold underline underline-offset-2 hover:opacity-80"
              >
                Register Here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#111111] font-semibold underline underline-offset-2 hover:opacity-80"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
