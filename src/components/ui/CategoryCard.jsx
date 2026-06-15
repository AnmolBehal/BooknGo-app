// ─── CategoryCard ───
// Versatile card used across verticals for movie posters, event cards, dining cards, etc.

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TMDB_POSTER = 'https://image.tmdb.org/t/p/w500';

const CategoryCard = ({
  id,
  type = 'movie',        // movie | event | sport | dining | stay
  title,
  subtitle,
  image,
  poster_path,           // TMDB poster
  vote_average,
  price,
  badge,                 // e.g., "Trending", "Live"
  linkTo,                // custom link override
  onClick,
  children,              // slot for ActionButton or custom content
}) => {
  const imgSrc = poster_path ? `${TMDB_POSTER}${poster_path}` : image || '';
  const link = linkTo || (type === 'movie' ? `/movie/${id}` : type === 'event' ? `/event/${id}` : '#');
  const rating = vote_average ? parseFloat(vote_average).toFixed(1) : null;

  const CardWrapper = linkTo || type === 'movie' || type === 'event'
    ? ({ children: c }) => <Link to={link} className="block">{c}</Link>
    : ({ children: c }) => <div onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>{c}</div>;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group"
    >
      <CardWrapper>
        <div className="relative overflow-hidden rounded-xl glass-card hover:shadow-[0_0_25px_rgba(255,255,255,0.06)] transition-all duration-300">
          {/* Image */}
          <div className="relative aspect-[2/3] overflow-hidden bg-surface-700">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">
                {type === 'movie' ? '🎬' : type === 'event' ? '🎭' : type === 'dining' ? '🍽️' : type === 'stay' ? '🏨' : '⚽'}
              </div>
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badge */}
            {badge && (
              <div className="absolute top-2 left-2 px-2.5 py-1 bg-accent-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                {badge}
              </div>
            )}

            {/* Rating */}
            {rating && (
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-surface-900/80 backdrop-blur-sm rounded-lg">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-amber-400 text-xs font-bold">{rating}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            <h3 className="font-semibold text-white text-sm line-clamp-1 mb-0.5 group-hover:text-brand-400 transition-colors">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-400 line-clamp-1">{subtitle}</p>
            )}
            {price !== undefined && (
              <p className="text-brand-400 font-bold text-sm mt-1">₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}</p>
            )}

            {/* Action Slot */}
            {children && <div className="mt-2">{children}</div>}
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  );
};

export default CategoryCard;
