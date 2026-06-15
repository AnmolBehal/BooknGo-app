// ─── HeroCarousel ───
// Swiper.js hero slider for featured content with autoplay and pagination.

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/original';
const TMDB_POSTER   = 'https://image.tmdb.org/t/p/w500';

const HeroCarousel = ({ items = [], type = 'movie' }) => {
  if (!items.length) return null;

  return (
    <Swiper
      modules={[Autoplay, Pagination, EffectFade, Navigation]}
      effect="fade"
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation={true}
      loop={items.length > 1}
      className="w-full h-[35vh] sm:h-[65vh] rounded-2xl overflow-hidden group/hero-swiper"
    >
      {items.slice(0, 6).map((item) => {
        const backdrop = item.backdrop_path
          ? `${TMDB_BACKDROP}${item.backdrop_path}`
          : item.image || '';
        const poster = item.poster_path
          ? `${TMDB_POSTER}${item.poster_path}`
          : item.image || '';
        const link = type === 'movie' ? `/movie/${item.id}` : `/event/${item.id}`;

        return (
          <SwiperSlide key={item.id}>
            <Link to={link} className="block relative w-full h-full group">
              {/* Backdrop */}
              {backdrop && (
                <img
                  src={backdrop}
                  alt={item.title || item.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-900/80 via-transparent to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <div className="flex items-end gap-4 sm:gap-6 max-w-4xl">
                  {/* Poster */}
                  {poster && (
                    <img
                      src={poster}
                      alt={item.title || item.name}
                      className="hidden sm:block w-28 md:w-36 rounded-xl shadow-2xl border border-white/10 flex-shrink-0"
                      loading="lazy"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Rating */}
                    {item.vote_average > 0 && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-amber-400 font-bold text-sm">{item.vote_average?.toFixed(1)}</span>
                        <span className="text-slate-400 text-xs">/ 10</span>
                      </div>
                    )}

                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-2 line-clamp-2">
                      {item.title || item.name}
                    </h2>

                    <p className="text-slate-300 text-sm sm:text-base line-clamp-2 max-w-lg mb-4">
                      {item.overview}
                    </p>

                    <div className="flex items-center gap-3">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-glow-blue"
                      >
                        <Play className="w-4 h-4 fill-white" /> Book Now
                      </motion.span>
                      {item.release_date && (
                        <span className="text-slate-400 text-xs">
                          {new Date(item.release_date).getFullYear()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default HeroCarousel;
