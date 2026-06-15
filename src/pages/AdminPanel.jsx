// ─── Admin Panel ───
// Secure hidden admin dashboard for posting custom inventory to Firestore.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { addInventoryItem, getInventoryItems, deleteInventoryItem } from '../services/firestore';
import { VERTICALS } from '../utils/constants';
import { ArrowLeft, Plus, Trash2, Package, Save, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const EMPTY_FORM = {
  type: 'movie', title: '', description: '', price: '', image: '', venue: '', date: '', city: '',
};

import Navbar from '../components/layout/Navbar';

const AdminPanel = () => {
  const { user } = useAuth();
  const [form, setForm]       = useState(EMPTY_FORM);
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);

  // ── Load existing inventory ──
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getInventoryItems();
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      toast.error('Title and Price are required.');
      return;
    }
    setSaving(true);
    try {
      await addInventoryItem({
        ...form,
        price:     parseFloat(form.price),
        createdBy: user.email,
      });
      toast.success('Item successfully added to inventory!');
      setForm(EMPTY_FORM);
      loadItems();
    } catch (err) {
      toast.error('Failed to add item to inventory.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteInventoryItem(id);
      toast.success('Item successfully deleted.');
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      toast.error('Failed to delete item.');
    }
  };

  const inputClass = 'w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm backdrop-blur-md';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ═══ Add Item Form ═══ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card p-6 rounded-2xl shadow-xl shadow-black/5 dark:shadow-none">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Add Custom Inventory
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                  <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                    {Object.entries(VERTICALS).map(([key, val]) => (
                      <option key={key} value={val}>{key}</option>
                    ))}
                  </select>
                </div>
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Avengers: Secret Wars" required className={inputClass} />
                </div>
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief description..." rows={3} className={inputClass} />
                </div>
                {/* Price + Image row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="299" required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Image URL</label>
                    <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." className={inputClass} />
                  </div>
                </div>
                {/* Venue + Date + City */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Venue</label>
                    <input name="venue" value={form.venue} onChange={handleChange} placeholder="PVR Cinemas" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
                    <input name="date" type="date" value={form.date} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">City</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" className={inputClass} />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25"
                >
                  {saving ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <><Save className="w-5 h-5" /> Publish to Live Inventory</>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* ═══ Inventory List ═══ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass-card p-6 rounded-2xl h-full flex flex-col shadow-xl shadow-black/5 dark:shadow-none">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-accent-500 dark:text-accent-400" /> Custom Inventory
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 bg-black/5 dark:bg-white/10 rounded-full text-slate-600 dark:text-slate-300">
                  {items.length} Items
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-[600px] hide-scrollbar pr-2">
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-16 px-4 text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-black/10 dark:border-white/10">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-slate-600" />
                    <p className="font-medium">No custom items yet.</p>
                    <p className="text-sm mt-1">Items added will immediately appear on the frontend.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          className="group flex items-center gap-3 bg-white dark:bg-surface-800 rounded-xl p-3 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all"
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                          ) : (
                            <div className="w-14 h-14 bg-slate-100 dark:bg-surface-700 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 capitalize">{item.type} · ₹{item.price.toLocaleString('en-IN')}</p>
                            {item.city && <p className="text-[10px] text-slate-400 mt-0.5">{item.city} {item.date && `· ${item.date}`}</p>}
                          </div>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
