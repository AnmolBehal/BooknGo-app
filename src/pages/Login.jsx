// ─── Login Page (Stub) ───
// Will be replaced with full split-screen Firebase login in Step 3.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-surface-900">
      {/* ── Left: Brand Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-surface-900" />
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-brand-600/20 blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-accent-500/15 blur-[120px]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12"
        >
          <h1 className="text-6xl font-display font-bold text-gradient mb-6">BooknGo</h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-md">
            Your unified digital planner. Book Movies, Events, Sports, Dining & Stays — all in one place.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            {['🎬', '🎭', '⚽', '🍽️', '🏨'].map((emoji, i) => (
              <motion.span
                key={i}
                className="text-3xl bg-white/5 backdrop-blur-sm rounded-2xl w-14 h-14 flex items-center justify-center border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-4xl font-display font-bold text-gradient mb-2">BooknGo</h1>
          </div>

          <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h2>
          <p className="text-slate-400 mb-8">Sign in to access your bookings and itinerary.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-surface-700 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-surface-700 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              id="login-submit"
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
