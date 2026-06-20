import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, X, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { authService } from '../../services/auth.service';

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthModalOpen, authModalTab, openAuthModal, closeAuthModal } = useUIStore();
  const { login } = useAuthStore();

  const dialogRef = useRef<HTMLDialogElement>(null);

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync internal tab state with store tab state
  useEffect(() => {
    setTab(authModalTab);
    setError('');
    setSuccess('');
  }, [authModalTab, isAuthModalOpen]);

  // Handle native dialog open/close state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isAuthModalOpen) {
      if (!dialog.open) {
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (dialog.open) {
        dialog.close();
        document.body.style.overflow = '';
      }
    }
  }, [isAuthModalOpen]);

  // Synchronize state if dialog is closed via native actions (e.g. Esc key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      if (isAuthModalOpen) closeAuthModal();
    };

    // Light-dismiss: click outside the dialog box
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isInside = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isInside) dialog.close();
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('click', handleBackdropClick);

    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(email, password);
      login(email, res.token, res.user);
      closeAuthModal();
      setEmail('');
      setPassword('');
      // Redirect to intended page if set (e.g. /checkout from Cart)
      const redirect = sessionStorage.getItem('redirectAfterLogin');
      if (redirect) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirect);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !email) {
      setError('Please enter your full name and email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register(name, email, password);
      setSuccess(res.message);
      // Don't auto-switch tab immediately — user needs to check their email first
      setTimeout(() => {
        setTab('login');
        setSuccess('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="max-w-md w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0d10] p-0 text-white shadow-2xl backdrop:bg-slate-900/70 backdrop:backdrop-blur-sm focus:outline-none animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="relative p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-full border-none bg-transparent p-1.5 text-white/55 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo and Tagline */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffcb2f] text-[#0b0d10] mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-white">
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-1 text-xs font-semibold text-white/60">
            {tab === 'login' ? 'Access your Courts account and tracking' : 'Register to unlock premium customer benefits'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="mb-6 flex gap-4 border-b border-white/10">
          <button
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            className={`pb-2.5 text-sm font-bold transition-all border-b-2 -mb-0.5 cursor-pointer border-none bg-transparent ${
              tab === 'login' ? 'border-[#ffcb2f] text-[#ffcb2f] font-black' : 'border-transparent text-white/50'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
            className={`pb-2.5 text-sm font-bold transition-all border-b-2 -mb-0.5 cursor-pointer border-none bg-transparent ${
              tab === 'register' ? 'border-[#ffcb2f] text-[#ffcb2f] font-black' : 'border-transparent text-white/50'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-2xl border border-[#f11d2b]/30 bg-[#f11d2b]/10 p-3 text-xxs font-bold text-[#ffcb2f]">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-2xl border border-[#1357d9]/30 bg-[#1357d9]/12 p-3 text-xxs font-bold text-white">
            {success}
          </div>
        )}

        {/* Forms */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/45" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-xs font-semibold text-white placeholder:text-white/35 focus:border-[#ffcb2f] focus:bg-white/8 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/45" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-xs font-semibold text-white placeholder:text-white/35 focus:border-[#ffcb2f] focus:bg-white/8 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f11d2b] to-[#ffcb2f] py-3 text-xs font-black text-[#0b0d10] shadow-lg transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-white/60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0b0d10] border-t-transparent"></span>
              ) : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/45" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-xs font-semibold text-white placeholder:text-white/35 focus:border-[#ffcb2f] focus:bg-white/8 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-white/45" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-xs font-semibold text-white placeholder:text-white/35 focus:border-[#ffcb2f] focus:bg-white/8 focus:outline-none"
              />
            </div>
            <p className="text-center text-xxs font-semibold text-white/55">
              You will receive an email with a link to set your password.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f11d2b] to-[#ffcb2f] py-3 text-xs font-black text-[#0b0d10] shadow-lg transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-white/60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0b0d10] border-t-transparent"></span>
              ) : 'Register'}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
};
