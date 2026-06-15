// ─── Signup Page ───
// Split-screen Firebase signup with first name, last name, phone, email, password.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '',
  });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate    = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup({
        email:     form.email,
        password:  form.password,
        firstName: form.firstName,
        lastName:  form.lastName,
        phone:     form.phone,
      });
      toast.success('Account created! Welcome to BooknGo 🚀');
      navigate('/');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : err.message || 'Signup failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full pl-11 pr-4 py-3 bg-surface-700 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all';

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-surface-900">
      {/* ── Left: Brand Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-brand-950 to-accent-950" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-accent-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-600/20 blur-[120px]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12"
        >
          <h1 className="text-6xl font-display font-bold text-gradient mb-6">BooknGo</h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-md">
            Join thousands of users who plan their entire week on one platform.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {[
              { emoji: '🎬', label: 'Movies' },
              { emoji: '🎭', label: 'Events' },
              { emoji: '⚽', label: 'Sports' },
              { emoji: '🍽️', label: 'Dining' },
              { emoji: '🏨', label: 'Stays' },
              { emoji: '🎫', label: 'Tickets' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white/5 backdrop-blur-sm rounded-2xl py-3 px-2 border border-white/10 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <span className="text-2xl block mb-1">{item.emoji}</span>
                <span className="text-xs text-slate-400">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right: Signup Form ── */}
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

          <h2 className="text-3xl font-display font-bold text-white mb-2">Create account</h2>
          <p className="text-slate-400 mb-8">Start booking your perfect experiences today.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input id="signup-firstname" name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" required className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input id="signup-lastname" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" required className={inputClass} />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input id="signup-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input id="signup-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input id="signup-password" name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input id="signup-confirm" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required className={inputClass} />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              id="signup-submit"
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-glow-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
