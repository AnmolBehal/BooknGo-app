// ─── EventsIndex ───
// Events listing page fetching custom_inventory from Firestore. No mock data.

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Loader2, TrendingUp, Music, Theater, Ticket, MapPin } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LocationModal from '../../components/modals/LocationModal';
import GlobalSearchOverlay from '../../components/modals/GlobalSearchOverlay';
import AIConcierge from '../../components/ui/AIConcierge';
import SmartCard from '../../components/ui/SmartCard';
import EntityCarousel from '../../components/ui/EntityCarousel';
import { useLocation as useLocationCtx } from '../../context/LocationContext';
import { getInventoryItems } from '../../services/firestore';
import { getPopularActors } from '../../services/rapidApi';

const CATEGORIES = [
  { key: 'all', label: 'All Events', icon: Ticket },
  { key: 'concert', label: 'Concerts', icon: Music },
  { key: 'festival', label: 'Festivals', icon: TrendingUp },
  { key: 'comedy', label: 'Comedy', icon: Theater },
];

const EventsIndex = () => {
  const [events, setEvents]       = useState([]);
  const [filter, setFilter]       = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading]     = useState(true);
  const { currentCity }           = useLocationCtx();
  const [actors, setActors]       = useState([]);

  // Load custom inventory events only (No mocks)
  useEffect(() => {
    const loadCustom = async () => {
      setLoading(true);
      try {
        const custom = await getInventoryItems('event');
        const mapped = custom.map((c) => ({
          id: c.id,
          title: c.title,
          subtitle: c.venue || c.city || 'Various Venues',
          description: c.description || 'Join us for this spectacular event.',
          date: c.date || '',
          price: c.price || 1000,
          image: c.image || '',
          category: c.category || 'cultural',
        }));
        setEvents(mapped);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchActors = async () => {
      const data = await getPopularActors(false);
      if (data && data.length > 0) {
        setActors(data.slice(0, 15).map(a => ({
          id: a.id || a.title,
          name: a.title,
          profile_path: a.image?.url || a.poster_path,
          character: a.year
        })));
      }
    };

    loadCustom();
    fetchActors();
  }, []);

  const filtered = filter === 'all' ? events : events.filter((e) => e.category === filter);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 flex flex-col">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <LocationModal />
      <GlobalSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-brand-500" /> Events in {currentCity}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Discover concerts, festivals, comedy shows & cultural events</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = filter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${active 
                    ? 'bg-brand-100 dark:bg-brand-600/30 text-brand-700 dark:text-brand-400 border border-brand-300 dark:border-brand-500/40' 
                    : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10'}`}
              >
                <Icon className="w-4 h-4" /> {cat.label}
              </button>
            );
          })}
        </div>

        {/* Loading State with Shimmer Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="glass-card rounded-xl overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-200 dark:bg-surface-700 w-full"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-surface-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-surface-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ── Trending Artists ── */}
            {actors.length > 0 && (
              <div className="mb-12">
                <EntityCarousel 
                  entities={actors} 
                  title="Trending Celebrities" 
                  type="artist" 
                />
              </div>
            )}

            {/* Events Grid */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((event) => (
                <motion.div key={event.id} variants={itemVariants}>
                  <SmartCard
                    id={event.id}
                    type="event"
                    title={event.title}
                    subtitle={event.subtitle}
                    description={event.description}
                    image={event.image}
                    price={event.price}
                    badge={event.category}
                  />
                </motion.div>
              ))}
            </motion.div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <p>No live events found for this category right now.</p>
                <p className="text-sm mt-2">Check back later or add custom events via the Admin panel.</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
      <AIConcierge />
    </div>
  );
};

export default EventsIndex;
