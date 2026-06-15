// ─── Profile Dashboard ───
// Account management and bookings overview.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Calendar, ArrowLeft, LogOut, Settings, Package, Loader2, Lock, Save } from 'lucide-react';
import { getUserBookings, updateUserProfile } from '../services/firestore';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, logout, auth } = useAuth();
  const [activeTab, setActiveTab] = useState('settings');
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);

  // Settings form state
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    newPassword: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getUserBookings(user.uid);
        setBookings(data || []);
      } catch (err) {
        console.error('Failed to load bookings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update Firebase Auth Profile (Username)
      if (formData.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: formData.displayName });
      }

      // 2. Update Auth Email
      if (formData.email !== user.email) {
        await updateEmail(auth.currentUser, formData.email);
      }

      // 3. Update Password
      if (formData.newPassword) {
        await updatePassword(auth.currentUser, formData.newPassword);
      }

      // 4. Update Firestore extra details
      await updateUserProfile(user.uid, {
        firstName: formData.displayName.split(' ')[0],
        lastName: formData.displayName.split(' ').slice(1).join(' '),
        phone: formData.phone,
        email: formData.email,
      });

      toast.success('Profile updated successfully!');
      setFormData(prev => ({ ...prev, newPassword: '' })); // clear password field
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update profile. You may need to re-login to change password or email.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium';
  const labelClass = 'block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-indigo-500/20 shrink-0">
            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="text-center md:text-left pt-2">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 font-['Space_Grotesk'] mb-1">
              {user?.displayName || 'User'}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-4">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                Role: {user?.role || 'User'}
              </span>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold uppercase tracking-wider">
                Active Member
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}
          >
            <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Settings</span>
            {activeTab === 'settings' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'bookings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'}`}
          >
            <span className="flex items-center gap-2"><Package className="w-4 h-4" /> My Bookings</span>
            {activeTab === 'bookings' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-2xl">
                <div className="space-y-6">
                  
                  <div>
                    <label className={labelClass}>Display Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <label className={labelClass}>New Password (Optional)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="password"
                        placeholder="Leave blank to keep current password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        className={inputClass}
                      />
                    </div>
                  </div>

                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
                  <Package className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                  <p className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">No bookings yet.</p>
                  <p className="text-sm text-zinc-500 mt-1 mb-6">Your travel adventures will appear here.</p>
                  <Link to="/" className="px-6 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl transition-colors">
                    Start Exploring
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div>
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Booking ID</p>
                          <p className="text-sm font-mono text-zinc-900 dark:text-zinc-50">{booking.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Date</p>
                          <p className="text-sm text-zinc-900 dark:text-zinc-50">
                            {booking.createdAt?.toDate ? booking.createdAt.toDate().toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total</p>
                          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{(booking.totalPrice || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {booking.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2">
                            <div>
                              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</p>
                              <p className="text-xs text-zinc-500">Qty: {item.quantity} · {item.type.toUpperCase()}</p>
                            </div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-50">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
