// ─── DiningIndex ───
// Dining page with Tasty API for recipes/restaurants and TimeSlotModal for reservations.

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Utensils, Clock, Flame, Loader2, ChefHat } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LocationModal from '../../components/modals/LocationModal';
import GlobalSearchOverlay from '../../components/modals/GlobalSearchOverlay';
import TimeSlotModal from '../../components/modals/TimeSlotModal';
import ActionButton from '../../components/ui/ActionButton';
import AIConcierge from '../../components/ui/AIConcierge';
import SmartCard from '../../components/ui/SmartCard';
import { searchRecipes } from '../../services/rapidApi';
import { useItinerary } from '../../context/ItineraryContext';
import { useLocation as useLocationCtx } from '../../context/LocationContext';
import { toast } from 'react-toastify';

const CUISINE_TAGS = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Japanese', 'Thai', 'Desserts'];

const DiningIndex = () => {
  const [recipes, setRecipes]       = useState([]);
  const [query, setQuery]           = useState('popular indian');
  const [activeTag, setActiveTag]   = useState('Indian');
  const [loading, setLoading]       = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [timeSlot, setTimeSlot]     = useState({ open: false, item: null });
  const { currentCity } = useLocationCtx();
  const { addItem } = useItinerary();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await searchRecipes(query, 0, 16);
        setRecipes(data);
      } catch {
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query]);

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    setQuery(tag.toLowerCase() + ' food recipes');
  };

  const handleReserve = (item) => {
    setTimeSlot({ open: true, item });
  };

  const handleTimeSlotConfirm = ({ time, guests, date }) => {
    const item = timeSlot.item;
    addItem({
      id:       `dining-${item.id || Date.now()}`,
      type:     'dining',
      title:    item.name || item.title || 'Restaurant Reservation',
      subtitle: `${currentCity} · ${date} · ${time} · ${guests} guests`,
      image:    item.thumbnail_url || '',
      price:    item.price || 800,
      quantity: 1,
      meta:     { time, guests, date, city: currentCity },
    });
    toast.success('Reservation added to itinerary! 🍽️');
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col transition-colors duration-300">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <LocationModal />
      <GlobalSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-3 font-['Space_Grotesk']">
            <Utensils className="w-8 h-8 text-indigo-500" /> Dining
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">Explore premium cuisines & reserve tables in {currentCity}</p>
        </div>

        {/* Cuisine Tags */}
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
          {CUISINE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border
                ${activeTag === tag
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : recipes.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <motion.div key={recipe.id} variants={itemVariants}>
                <SmartCard
                  id={`dining-${recipe.id || Date.now()}`}
                  type="dining"
                  title={recipe.name}
                  subtitle={recipe.total_time_minutes ? `${recipe.total_time_minutes} mins` : 'Dining'}
                  description={recipe.description}
                  image={recipe.thumbnail_url}
                  price={800}
                  vote_average={recipe.user_ratings?.score ? (recipe.user_ratings.score * 5).toFixed(1) : null}
                  badge="DINING"
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <ChefHat className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
            <p className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">No results found.</p>
            <p className="text-sm text-zinc-500 mt-1">Try a different cuisine or search term.</p>
          </div>
        )}
      </main>

      {/* Time Slot Modal */}
      <TimeSlotModal
        isOpen={timeSlot.open}
        onClose={() => setTimeSlot({ open: false, item: null })}
        title={timeSlot.item?.name || ''}
        onConfirm={handleTimeSlotConfirm}
      />

      <Footer />
      <AIConcierge />
    </div>
  );
};

export default DiningIndex;
