// ─── SportsIndex ───
// Sports events page mapping live RapidAPI sportscore data to the SmartCard component. No emojis.

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Radio, Calendar, Loader2, Zap, Target, CircleDot } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LocationModal from '../../components/modals/LocationModal';
import GlobalSearchOverlay from '../../components/modals/GlobalSearchOverlay';
import AIConcierge from '../../components/ui/AIConcierge';
import SmartCard from '../../components/ui/SmartCard';
import { getLiveEvents, getUpcomingEvents } from '../../services/rapidApi';
import { useItinerary } from '../../context/ItineraryContext';

const SPORTS = [
  { key: 'football', label: 'Football', icon: CircleDot },
  { key: 'cricket',  label: 'Cricket',  icon: Target },
];

const SportsIndex = () => {
  const [sport, setSport]           = useState('football');
  const [live, setLive]             = useState([]);
  const [upcoming, setUpcoming]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const { addItem } = useItinerary();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const l = await getLiveEvents(sport);
        const u = await getUpcomingEvents(sport);
        setLive(l);
        setUpcoming(u);
      } catch {
        setLive([]);
        setUpcoming([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sport]);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 flex flex-col">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <LocationModal />
      <GlobalSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-brand-500" /> Sports
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Stay updated with real-time sports action and upcoming matches.</p>
        </div>

        {/* Sport Tabs */}
        <div className="flex gap-3 mb-8">
          {SPORTS.map((s) => {
            const Icon = s.icon;
            const isActive = sport === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSport(s.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-brand-100 dark:bg-brand-600/30 text-brand-700 dark:text-brand-400 border border-brand-300 dark:border-brand-500/40'
                    : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
              >
                <Icon className="w-5 h-5" /> {s.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="glass-card rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-surface-700 w-full"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-surface-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-surface-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Live Events */}
            <section className="mb-10">
              <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" /> Live Now
              </h2>
              {live.length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {live.slice(0, 8).map((e, idx) => {
                    return (
                      <motion.div key={`live-${e.id}-${idx}`} variants={itemVariants}>
                        <SmartCard
                          id={e.id}
                          type="event"
                          title={e.title}
                          subtitle={e.category || 'Live Match'}
                          description={e.description}
                          image={e.image}
                          price={e.price}
                          badge="Live"
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-32 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700">
                  <p className="text-slate-500 font-medium">No live events matching your criteria right now.</p>
                </div>
              )}
            </section>

            {/* Upcoming Section */}
            <section className="pb-16 pt-8 border-t border-slate-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2 font-display">
                <Trophy className="w-6 h-6 text-indigo-500" /> Upcoming Showdowns
              </h2>
              {upcoming.length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {upcoming.slice(0, 12).map((e, idx) => {
                    return (
                      <motion.div key={`up-${e.id}-${idx}`} variants={itemVariants}>
                        <SmartCard
                          id={e.id}
                          type="event"
                          title={e.title}
                          subtitle={e.category || 'Upcoming'}
                          description={e.description}
                          image={e.image}
                          price={e.price}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                  <Zap className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p>No upcoming events found. Try a different sport.</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
      <AIConcierge />
    </div>
  );
};

export default SportsIndex;
