import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, isAdmin: boolean) => void;
  onGoToAdminLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onGoToAdminLogin,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const isAdmin = email.toLowerCase().includes('admin');
      onLoginSuccess(email, isAdmin);
      onClose();
    }, 400);
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

        <div className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#737373] font-semibold block mb-1">
            Tifeh.s Place Account
          </span>
          <h2 className="text-2xl font-serif text-[#111111]">
            {mode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
          </h2>
          <p className="text-xs text-[#737373] mt-1">
            Access your order history and quick checkout preferences.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                  placeholder="e.g. Tife Balogun"
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
                placeholder="name@example.com"
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
            className="w-full py-3.5 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#737373]">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#111111] font-semibold underline underline-offset-2"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#111111] font-semibold underline underline-offset-2"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* Dedicated Admin Login Switcher */}
        <div className="mt-6 pt-4 border-t border-[#E5E5E5] text-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              onGoToAdminLogin();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#525252] hover:text-[#111111] font-medium"
          >
            <ShieldCheck size={14} className="text-[#C5A059]" />
            <span>Store Admin Login Portal (/admin/login)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
