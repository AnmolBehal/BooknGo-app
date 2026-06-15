// ─── MoviesIndex ───
// Density & Region focused movie listing using Swiper.js and massive data fetching.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Clock, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LocationModal from '../../components/modals/LocationModal';
import GlobalSearchOverlay from '../../components/modals/GlobalSearchOverlay';
import HeroCarousel from '../../components/ui/HeroCarousel';
import EntityCarousel from '../../components/ui/EntityCarousel';
import SmartCard from '../../components/ui/SmartCard';
import AIConcierge from '../../components/ui/AIConcierge';
import { getTrendingMovies, getNowPlayingMovies, getUpcomingMovies, searchMovies, getPopularActors } from '../../services/rapidApi';
import { useLocation as useLocationCtx } from '../../context/LocationContext';

const MoviesIndex = () => {
  const [trending, setTrending]       = useState([]);
  const [nowPlaying, setNowPlaying]   = useState([]);
  const [upcoming, setUpcoming]       = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setResults]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searching, setSearching]     = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  
  const [pageTrending, setPageTrending] = useState(1);
  const [loadingMoreTrending, setLoadingMoreTrending] = useState(false);
  const [expandedMovie, setExpandedMovie] = useState(null);

  const { currentCity } = useLocationCtx();
  const navigate = useNavigate();

  // ── Load initial massive data arrays ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetching page 1 for everything
        // Fetching sequentially to avoid 429 Rate Limit on RapidAPI
        const t = await getTrendingMovies(false);
        const np = await getNowPlayingMovies(false);
        const up = await getUpcomingMovies(false);
        
        setTrending(t || []);
        setNowPlaying(np || []);
        setUpcoming(up || []);

      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Endless Scroll / Load More Logic ──
  const handleLoadMoreTrending = async () => {
    setLoadingMoreTrending(true);
    try {
      // In a real API, pass pageTrending + 1. Here we just fetch again and duplicate for demonstration of density.
      const more = await getTrendingMovies(true); 
      setTrending(prev => [...prev, ...(more || []).map(m => ({...m, id: `${m.id}-${Date.now()}`}))]);
      setPageTrending(p => p + 1);
    } finally {
      setLoadingMoreTrending(false);
    }
  };

  // ── Search ──
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchMovies(searchQuery);
      setResults(results || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const renderMovieGrid = (movies, badgeTitle) => (
    <motion.div 
      initial="hidden" animate="show" 
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 w-full"
    >
      {movies.map((m, idx) => {
        return (
          <motion.div 
            key={`${m.id}-${idx}`} 
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="col-span-1"
          >
            <SmartCard
              id={m.id} 
              type="movie" 
              title={m.title}
              subtitle={m.category || 'Movie'}
              description={m.description || m.overview}
              image={m.image}
              poster_path={m.poster_path}
              vote_average={m.vote_average}
              price={m.price}
              badge={badgeTitle}
              isExpandedProp={false}
              onToggleProp={() => setExpandedMovie(m)}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col transition-colors duration-300">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <LocationModal />
      <GlobalSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <main className="flex-1">
          {/* Hero */}
          <div className="w-full">
            <HeroCarousel items={trending.slice(0, 5)} type="movie" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Search Bar */}
            <div className="py-10">
              <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  id="movie-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search movies playing in ${currentCity}...`}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg shadow-zinc-200/50 dark:shadow-none transition-all text-lg font-medium"
                />
                {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-indigo-500" />}
              </form>
            </div>



            {/* Search Results */}
            {searchResults.length > 0 && (
              <section className="pb-12">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2 font-['Space_Grotesk']">
                  <Search className="w-5 h-5 text-indigo-500" /> Results for "{searchQuery}"
                </h2>
                {renderMovieGrid(searchResults)}
              </section>
            )}

            {/* Trending Section */}
            <section className="pb-12 border-t border-zinc-200 dark:border-zinc-800 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 font-['Space_Grotesk']">
                  <TrendingUp className="w-6 h-6 text-rose-500" /> Trending in {currentCity}
                </h2>
                <button 
                  onClick={handleLoadMoreTrending}
                  disabled={loadingMoreTrending}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                >
                  {loadingMoreTrending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Load More
                </button>
              </div>
              {renderMovieGrid(trending, "Trending")}
            </section>

            {/* Now Playing */}
            <section className="pb-12 border-t border-zinc-200 dark:border-zinc-800 pt-8">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2 font-['Space_Grotesk']">
                <Clock className="w-6 h-6 text-emerald-500" /> Now Playing
              </h2>
              {renderMovieGrid(nowPlaying)}
            </section>

            {/* Upcoming */}
            <section className="pb-16 border-t border-zinc-200 dark:border-zinc-800 pt-8">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2 font-['Space_Grotesk']">
                <Sparkles className="w-6 h-6 text-purple-500" /> Coming Soon
              </h2>
              {renderMovieGrid(upcoming, "Upcoming")}
            </section>
          </div>
        </main>
      )}

      <Footer />
      <AIConcierge />

      <AnimatePresence>
        {expandedMovie && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6"
            onClick={() => setExpandedMovie(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-[95vw] max-w-sm sm:max-w-5xl lg:max-w-6xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <SmartCard
                id={expandedMovie.id} 
                type="movie" 
                title={expandedMovie.title}
                subtitle={expandedMovie.category || 'Movie'}
                description={expandedMovie.description || expandedMovie.overview}
                image={expandedMovie.image}
                poster_path={expandedMovie.poster_path}
                vote_average={expandedMovie.vote_average}
                price={expandedMovie.price}
                isExpandedProp={true}
                onToggleProp={() => setExpandedMovie(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoviesIndex;
