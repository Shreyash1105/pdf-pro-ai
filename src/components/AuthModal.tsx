import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle,
  FileCheck2
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (message: string) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (isSignUp && !displayName.trim()) {
      setError('Please enter your name.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile display name
        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        });
        onAuthSuccess(`Welcome to PDF Pro, ${displayName.trim()}! Your account has been created successfully.`);
      } else {
        // Log In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const name = userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User';
        onAuthSuccess(`Welcome back, ${name}! Logged in successfully.`);
      }
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Firebase Authentication error:', err);
      let friendlyError = err.message || 'Authentication failed. Please check your credentials and try again.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'This email is already registered. Please login instead.';
      } else if (err.code === 'auth/invalid-credential') {
        friendlyError = 'Incorrect email or password. Please try again.';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Invalid email address format.';
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyError = 'Email/Password registration is not enabled in your Firebase Console. Please Sign In with Google instead, or enable the Email/Password sign-in provider in your Firebase project Console.';
      }
      setError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const name = userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User';
      onAuthSuccess(`Welcome back, ${name}! Logged in successfully with Google.`);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      let friendlyError = err.message || 'Google authentication failed. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        friendlyError = 'Google sign-in popup was closed before completion.';
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyError = 'Google Sign-In is not enabled in your Firebase project Auth settings.';
      }
      setError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setIsLoading(false);
    setShowPassword(false);
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-md bg-white dark:bg-[#12151C] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden z-10"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-red-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-red-500/25">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="font-display font-black text-2xl text-slate-800 dark:text-slate-100 tracking-tight">
            {isSignUp ? 'Create Your Account' : 'Welcome to PDF Pro'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            {isSignUp 
              ? 'Join to save your conversion history and access files.' 
              : 'Login to access your converted documents and options.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { if (isSignUp) switchMode(); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isSignUp 
                ? 'bg-white dark:bg-[#1C202B] text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { if (!isSignUp) switchMode(); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isSignUp 
                ? 'bg-white dark:bg-[#1C202B] text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-500/20 rounded-xl text-rose-800 dark:text-rose-200 text-xs font-medium leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span className="text-sm">👋</span>
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none text-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all outline-none text-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Free Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to PDF Pro</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-slate-100 dark:bg-white/5" />
          <span className="relative px-3 bg-white dark:bg-[#12151C] text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
            Or Continue With
          </span>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-base select-none">🌐</span>
          <span>Sign In with Google</span>
        </button>

        {/* Footer switch prompt */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 text-center text-xs text-slate-400 dark:text-slate-500">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-red-500 dark:text-red-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-red-500 dark:text-red-400 font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
