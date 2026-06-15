// ─── GlobalSearchOverlay ───
// Full-screen frosted glass search with categorical filter pills and live results.
// Defaults to Trending Recommendations using cached API data before typing.

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, X, Film, CalendarDays, Utensils, Globe, Loader2, TrendingUp } from 'lucide-react';
import { realTimeSearch, getTrendingMovies, getUpcomingEvents } from '../../services/rapidApi';

const FILTERS = [
  { key: 'all',    label: 'All',    icon: Globe },
  { key: 'movie',  label: 'Movies', icon: Film },
  { key: 'event',  label: 'Events', icon: CalendarDays },
  { key: 'dining', label: 'Dining', icon: Utensils },
];

const GlobalSearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery]         = useState('');
  const [activeFilter, setFilter] = useState('all');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [trending, setTrending]   = useState({ movies: [], events: [] });
  const [loadingTrending, setLoadingTrending] = useState(false);
  
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Load Trending Data initially
  useEffect(() => {
    if (isOpen && trending.movies.length === 0) {
      setLoadingTrending(true);
      Promise.all([
        getTrendingMovies(),
        getUpcomingEvents('football', 1)
      ]).then(([moviesData, eventsData]) => {
        setTrending({
          movies: (moviesData || []).slice(0, 4),
          events: (eventsData || []).slice(0, 4)
        });
        setLoadingTrending(false);
      }).catch(() => {
        setLoadingTrending(false);
      });
    }
  }, [isOpen]);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setFilter('all');
    }
  }, [isOpen]);

  // Debounced search
  const doSearch = useCallback(async (q, filter) => {
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const searchQuery = filter === 'all' ? q : `${q} ${filter}`;
      const data = await realTimeSearch(searchQuery, 8);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val, activeFilter), 400);
  };

  const handleFilterChange = (key) => {
    setFilter(key);
    if (query.trim()) {
      clearTimeout(debounceRef.current);
      doSearch(query, key);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const TMDB_POSTER = 'https://image.tmdb.org/t/p/w200';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl flex flex-col"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-3xl mx-auto mt-16 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-500" />
              <input
                ref={inputRef}
                id="global-search-input"
                type="text"
                value={query}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Search movies, events, dining..."
                className="w-full pl-14 pr-14 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xl font-semibold shadow-lg shadow-zinc-200/50 dark:shadow-none transition-all"
              />
              <button
                onClick={onClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
              {FILTERS.map((f) => {
                const Icon = f.icon;
                const active = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => handleFilterChange(f.key)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap
                      ${active
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Results / Trending */}
            <div className="max-h-[60vh] overflow-y-auto hide-scrollbar pb-10">
              {query.length > 0 ? (
                // Search Results
                loading ? (
                  <div className="flex items-center justify-center py-12 text-zinc-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" /> Searching BooknGo...
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-3">
                    {results.map((result, i) => (
                      <motion.a
                        key={i}
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="block p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-2xl transition-all shadow-sm hover:shadow-md group"
                        onClick={onClose}
                      >
                        <h4 className="text-zinc-900 dark:text-zinc-50 font-semibold text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {result.title}
                        </h4>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 line-clamp-2">
                          {result.snippet || result.description}
                        </p>
                        <p className="text-xs text-zinc-400 mt-2 font-mono truncate">{result.url}</p>
                      </motion.a>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-zinc-500 py-12 text-base font-medium">No results found for "{query}".</p>
                )
              ) : (
                // Default Trending Recommendations
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Trending Right Now</h3>
                  </div>
                  
                  {loadingTrending ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Trending Movies */}
                      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2 uppercase tracking-wider">
                          <Film className="w-4 h-4 text-zinc-400" /> Top Movies
                        </h4>
                        <div className="space-y-4">
                          {trending.movies.map(movie => (
                            <div key={movie.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => { onClose(); navigate(`/movie/${movie.id}`); }}>
                              <img 
                                src={movie.poster_path ? `${TMDB_POSTER}${movie.poster_path}` : ''} 
                                alt={movie.title}
                                className="w-12 h-16 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800"
                              />
                              <div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 transition-colors line-clamp-1">{movie.title}</p>
                                <p className="text-xs text-zinc-500">{movie.release_date?.split('-')[0] || 'Unknown'} · {movie.vote_average?.toFixed(1)} ⭐</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Trending Events */}
                      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2 uppercase tracking-wider">
                          <CalendarDays className="w-4 h-4 text-zinc-400" /> Live Sports
                        </h4>
                        <div className="space-y-4">
                          {trending.events.map(event => (
                            <div key={event.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => { onClose(); navigate(`/events`); }}>
                              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Trophy className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 transition-colors line-clamp-1">{event.name}</p>
                                <p className="text-xs text-zinc-500">{new Date(event.start_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearchOverlay;
