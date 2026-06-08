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
      className="p-0 border-none rounded-3xl bg-white shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm max-w-md w-full focus:outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="relative p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer border-none bg-transparent"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo and Tagline */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-slate-800">
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {tab === 'login' ? 'Access your Courts account and tracking' : 'Register to unlock premium customer benefits'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-150 gap-4 mb-6">
          <button
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            className={`pb-2.5 text-sm font-bold transition-all border-b-2 -mb-0.5 cursor-pointer border-none bg-transparent ${
              tab === 'login' ? 'border-[#0060a9] text-[#0060a9] font-black' : 'border-transparent text-slate-400'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
            className={`pb-2.5 text-sm font-bold transition-all border-b-2 -mb-0.5 cursor-pointer border-none bg-transparent ${
              tab === 'register' ? 'border-[#0060a9] text-[#0060a9] font-black' : 'border-transparent text-slate-400'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-150 rounded-xl p-3 text-xxs font-bold text-red-650">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-150 rounded-xl p-3 text-xxs font-bold text-emerald-700">
            {success}
          </div>
        )}

        {/* Forms */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#0060a9] hover:bg-[#005596] py-3 text-xs font-bold text-white transition-all shadow-md hover:shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
            <p className="text-xxs font-semibold text-slate-400 text-center">
              You will receive an email with a link to set your password.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#0060a9] hover:bg-[#005596] py-3 text-xs font-bold text-white transition-all shadow-md hover:shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : 'Register'}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
};
