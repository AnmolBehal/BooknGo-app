// ─── WishlistPage ───
// Dedicated page for viewing saved wishlist items.

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AIConcierge from '../components/ui/AIConcierge';
import { useWishlist } from '../context/WishlistContext';

const WishlistPage = () => {
  const { wishlist, loading, toggleWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3 font-['Space_Grotesk']">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> My Wishlist
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">Your saved movies, events, and places.</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden animate-pulse border border-zinc-200 dark:border-zinc-800 aspect-[2/3]"></div>
            ))}
          </div>
        ) : wishlist.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            <AnimatePresence>
              {wishlist.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all aspect-[2/3]"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
                      <h3 className="text-white font-bold text-center text-xl shadow-sm">{item.title}</h3>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1 block">
                      {item.type}
                    </span>
                    <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleWishlist(item)}
                    className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-rose-500 text-white backdrop-blur-md rounded-full transition-colors border border-white/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <Heart className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Your wishlist is empty</h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
              Tap the heart icon on any movie, event, or restaurant to save it here for later.
            </p>
            <Link to="/" className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-md shadow-indigo-600/20">
              Explore BooknGo
            </Link>
          </div>
        )}
      </main>

      <Footer />
      <AIConcierge />
    </div>
  );
};

export default WishlistPage;
