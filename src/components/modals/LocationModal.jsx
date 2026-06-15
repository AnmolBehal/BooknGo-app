// ─── LocationModal ───
// City picker with search, "Use Current Location", and alphabetical grid.

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation as useLocationCtx } from '../../context/LocationContext';
import { X, Search, MapPin, Navigation } from 'lucide-react';

const LocationModal = () => {
  const {
    showLocationModal, closeLocationModal,
    setCurrentCity, currentCity, detectLocation, allCities,
  } = useLocationCtx();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return allCities;
    const q = search.toLowerCase();
    return allCities.filter(
      (c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
    );
  }, [search, allCities]);

  // Group alphabetically
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((c) => {
      const letter = c.name[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(c);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (!showLocationModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="location-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] glass-overlay flex items-start justify-center pt-20 px-4"
        onClick={closeLocationModal}
      >
        <motion.div
          key="location-modal"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-lg glass-card rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="font-display font-bold text-white text-lg">Select Your City</h2>
            <button
              onClick={closeLocationModal}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="location-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city or state..."
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-surface-700 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Use Current Location */}
          <div className="px-5 pt-3">
            <button
              id="detect-location-btn"
              onClick={detectLocation}
              className="w-full flex items-center gap-3 py-3 px-4 bg-brand-600/10 hover:bg-brand-600/20 border border-brand-500/20 rounded-xl text-brand-400 text-sm font-medium transition-all group"
            >
              <Navigation className="w-5 h-5 group-hover:animate-pulse" />
              Use Current Location
              <span className="ml-auto text-xs text-slate-500">GPS</span>
            </button>
          </div>

          {/* City Grid */}
          <div className="p-5 max-h-[400px] overflow-y-auto hide-scrollbar">
            {grouped.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">No cities found for "{search}"</p>
            ) : (
              grouped.map(([letter, cities]) => (
                <div key={letter} className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{letter}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {cities.map((city) => {
                      const isSelected = currentCity === city.name;
                      return (
                        <button
                          key={city.name}
                          onClick={() => setCurrentCity(city.name)}
                          className={`flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all text-left
                            ${isSelected
                              ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                              : 'text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/10'
                            }`}
                        >
                          <span className="text-base">{city.emoji}</span>
                          <div className="min-w-0">
                            <p className="truncate">{city.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{city.state}</p>
                          </div>
                          {isSelected && (
                            <MapPin className="w-3.5 h-3.5 text-brand-400 ml-auto flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LocationModal;
