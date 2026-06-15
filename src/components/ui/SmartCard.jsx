// ─── SmartCard ───
// Highly interactive, state-based progressive disclosure component replacing standard category cards.
// Implements 4 states: Default, Hover (Quick Actions), Inline Expand (Showtimes/Info), and Full Route CTA.

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, ShoppingBag, Heart, Share2, ChevronDown, 
  Clock, MapPin, Film, Calendar, Trophy, ImageOff, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useItinerary } from '../../context/ItineraryContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLocation as useLocationCtx } from '../../context/LocationContext';
import { generateShowtimes } from '../../utils/showtimeGenerator';
import { getMovieCredits } from '../../services/rapidApi';
import EntityCarousel from './EntityCarousel';

const TMDB_POSTER = 'https://image.tmdb.org/t/p/w500';

const SmartCard = ({
  id,
  type = 'movie',
  title,
  subtitle,
  description,
  image,
  poster_path,
  vote_average,
  price,
  badge,
  isExpandedProp,
  onToggleProp
}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : localExpanded;

  const handleToggle = () => {
    if (onToggleProp) onToggleProp();
    else setLocalExpanded(!localExpanded);
  };
  const navigate = useNavigate();
  const { addItem } = useItinerary();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { currentCity } = useLocationCtx();

  const imgSrc = poster_path ? `${TMDB_POSTER}${poster_path}` : image || '';
  const rating = vote_average ? parseFloat(vote_average).toFixed(1) : null;
  const linkTo = type === 'movie' ? `/movie/${id}` : type === 'event' ? `/event/${id}` : `/${type}`;

  // Deterministic mock showtimes for expansion
  const showtimeData = useMemo(() => {
    if (!isExpanded || !id || !currentCity) return null;
    if (type === 'movie' || type === 'event') {
      return generateShowtimes(id, currentCity);
    }
    return null;
  }, [isExpanded, id, currentCity, type]);

  const [movieCast, setMovieCast] = useState([]);

  useEffect(() => {
    if (isExpanded && type === 'movie' && movieCast.length === 0) {
      const fetchCast = async () => {
        const credits = await getMovieCredits(id);
        if (credits && credits.cast) {
          setMovieCast(credits.cast.slice(0, 10));
        }
      };
      fetchCast();
    }
  }, [isExpanded, type, id]);

  // Actions
  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addItem({
      id: `${type}-${id}-${Date.now()}`,
      type,
      title,
      subtitle: `${currentCity} · ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      image: imgSrc,
      price: price || 500, // Fallback price
      quantity: 1,
    });
    toast.success(`${title} added to bag!`);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    toggleWishlist({
      id,
      type,
      title,
      subtitle: `${currentCity} · ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      image: imgSrc,
      price: price || 500,
    });
  };

  const isSaved = isInWishlist(id);

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title, url: window.location.origin + linkTo });
    } else {
      toast.success('Link copied to clipboard!');
    }
  };

  const navigateToDetail = (e) => {
    e.stopPropagation();
    navigate(linkTo);
  };

  // Get icon placeholder if no image
  const PlaceholderIcon = type === 'movie' ? Film : type === 'event' ? Calendar : type === 'sport' ? Trophy : ImageOff;

  return (
    <motion.div
      layout
      whileHover={{ y: isExpanded ? 0 : -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative"
    >
      <div 
        onClick={handleToggle}
        className={`relative overflow-hidden rounded-xl glass-card transition-all duration-300 h-full flex
          ${isExpanded ? 'flex-col sm:flex-row shadow-[0_0_40px_rgba(51,109,255,0.2)] border-brand-500/40 cursor-default' : 'flex-col hover:shadow-[0_0_25px_rgba(255,255,255,0.06)] cursor-pointer'}`}
      >
        
        {/* ── STATE 1 & 2: Image & Hover Quick Actions ── */}
        <div 
          className={`relative bg-slate-200 dark:bg-zinc-800 transition-all duration-500 flex-shrink-0 
            ${isExpanded ? 'w-full sm:w-[45%] md:w-[40%] aspect-video sm:aspect-square md:aspect-[3/4] cursor-pointer group/poster' : 'w-full aspect-[2/3]'}`}
          onClick={(e) => {
            if (isExpanded) {
              e.stopPropagation();
              navigateToDetail(e);
            }
          }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/10" style={{ display: imgSrc ? 'none' : 'flex' }}>
            <PlaceholderIcon className="w-12 h-12 text-indigo-400/50 mb-2" />
            <span className="text-xs font-bold text-indigo-400/50 font-['Space_Grotesk'] tracking-widest uppercase">BooknGo</span>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80" />

          {/* Badge & Rating */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            {badge && (
              <div className="px-2.5 py-1 bg-accent-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg">
                {badge}
              </div>
            )}
          </div>
          {rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg z-10 border border-white/10 shadow-lg">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-amber-400 text-xs font-bold">{rating}</span>
            </div>
          )}

          {/* ── Hover Quick Actions (STATE 2) ── */}
          <div className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-sm z-20 
            transition-all duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleQuickAdd} className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg hover:shadow-brand-500/50 transition-all" title="Add to Bag">
              <ShoppingBag className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleBookmark} className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center shadow-lg hover:bg-white/30 backdrop-blur-md border border-white/10 transition-all" title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}>
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleShare} className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center shadow-lg hover:bg-white/30 backdrop-blur-md border border-white/10 transition-all" title="Share">
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Bottom Info (Always visible in Default state) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <h3 className="font-display font-bold text-white text-base leading-tight mb-1 group-hover:text-brand-400 transition-colors drop-shadow-md">
              {title}
            </h3>
            <p className="text-xs text-slate-300 line-clamp-1 drop-shadow-md">
              {subtitle || 'Click to expand details'}
            </p>
          </div>
        </div>

        {/* ── STATE 3: Inline Expand Details ── */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex-1 flex flex-col bg-white/5 dark:bg-black/20 
                ${isExpanded ? 'border-t sm:border-t-0 sm:border-l' : 'border-t'} 
                border-black/5 dark:border-white/5`}
            >
              <div className="flex-1 p-5 sm:p-8 flex flex-col gap-4 sm:gap-6 relative justify-center">
                {/* Close Button */}
                {onToggleProp && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {/* Title (Only visible in landscape/expanded) */}
                <div className="pr-10">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">{title}</h2>
                  <p className="text-sm text-brand-400 font-medium">{subtitle}</p>
                </div>
                
                {/* Full Description */}
                {description && (
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                    {description}
                  </p>
                )}

                {/* Cast Carousel for Movies */}
                {type === 'movie' && movieCast.length > 0 && (
                  <div className="mt-2">
                    <EntityCarousel entities={movieCast} title="Cast" type="artist" small={true} />
                  </div>
                )}

                {/* Showtimes & Cinemas */}
                {showtimeData?.cinemas?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                      <Clock className="w-4 h-4" /> Showtimes near {currentCity}
                    </div>
                    {showtimeData.cinemas.slice(0, 2).map((cinema) => (
                      <div key={cinema.name} className="bg-slate-100 dark:bg-surface-800 rounded-xl p-4 border border-black/5 dark:border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-brand-500" /> {cinema.name}
                          </span>
                          <span className="text-xs text-slate-500">{cinema.distance}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cinema.showtimes.slice(0, 3).map((time) => (
                            <button 
                              key={time} 
                              onClick={navigateToDetail}
                              className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 rounded-lg border border-brand-200 dark:border-brand-500/20 transition-colors cursor-pointer"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sticky Footer for CTA */}
              <div className="p-4 sm:p-6 bg-slate-100/50 dark:bg-surface-800/80 backdrop-blur-lg border-t border-black/5 dark:border-white/5 mt-auto">
                {/* ── STATE 4: Full Page Route CTA ── */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={navigateToDetail}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl text-base sm:text-lg font-bold shadow-lg shadow-brand-500/25 transition-all group/btn"
                >
                  Book Now
                  <motion.div animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <ChevronDown className="w-5 h-5 -rotate-90 group-hover/btn:translate-x-1 transition-transform" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SmartCard;
