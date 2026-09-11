import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle } from 'lucide-react';
import { signInWithGoogleOAuth, UserSession } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
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
      setErrorMsg('Unable to continue with Google. Please try again.');
      setIsSubmitting(false);
    }
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
            Tifeh.s Place Atelier
          </span>
          <h2 className="text-2xl font-serif text-[#111111]">Sign In</h2>
          <p className="text-xs text-[#737373] mt-1 max-w-xs mx-auto">
            Continue with Google to track order history, save favorites, and access your account.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

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
          <span>{isSubmitting ? 'Redirecting to Google...' : 'Continue with Google'}</span>
          {!isSubmitting && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
};
