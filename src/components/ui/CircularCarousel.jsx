// ─── CircularCarousel ───
// Swiper carousel with circular avatar items for Artists/Celebrities.

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/free-mode';

const TMDB_PROFILE = 'https://image.tmdb.org/t/p/w185';

const CircularCarousel = ({ items = [], title = 'Popular Artists', onItemClick }) => {
  if (!items.length) return null;

  return (
    <div className="py-6">
      {title && (
        <h3 className="text-lg font-display font-bold text-white mb-4 px-1">{title}</h3>
      )}

      <Swiper
        modules={[FreeMode]}
        freeMode
        slidesPerView="auto"
        spaceBetween={16}
        className="!overflow-visible"
      >
        {items.map((person, i) => {
          const img = person.profile_path
            ? `${TMDB_PROFILE}${person.profile_path}`
            : person.primaryImage || person.image || null;
          const name = person.name || person.primaryName || 'Unknown';

          return (
            <SwiperSlide key={person.id || i} style={{ width: 'auto' }}>
              <motion.button
                whileHover={{ y: -4 }}
                onClick={() => onItemClick?.(person)}
                className="flex flex-col items-center gap-2 group w-20"
              >
                {/* Avatar */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-brand-500/50 transition-all shadow-lg">
                  {img ? (
                    <img
                      src={img}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-600 flex items-center justify-center text-lg text-slate-400 font-bold">
                      {name[0]}
                    </div>
                  )}
                  {/* Glow ring on hover */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-brand-400/30 transition-all" />
                </div>

                {/* Name */}
                <p className="text-xs text-slate-400 group-hover:text-white transition-colors text-center line-clamp-2 leading-tight">
                  {name}
                </p>
              </motion.button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default CircularCarousel;
