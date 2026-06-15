import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { User, ImageOff } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/free-mode';

const IMDB_POSTER = 'https://image.tmdb.org/t/p/w200'; // Or whatever image host is preferred

const EntityCarousel = ({ 
  entities = [], 
  title = "Trending Artists", 
  type = "artist" // "artist" or "cast"
}) => {
  const navigate = useNavigate();

  if (!entities || entities.length === 0) return null;

  return (
    <div className="my-8">
      {title && (
        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 font-['Space_Grotesk']">
          {title}
        </h3>
      )}
      
      <Swiper
        slidesPerView="auto"
        spaceBetween={20}
        freeMode={true}
        modules={[FreeMode]}
        className="w-full"
      >
        {entities.map((entity, idx) => {
          // Handle various API shapes
          const name = entity.name || entity.original_name || entity.title || 'Unknown';
          const imagePath = entity.profile_path || entity.poster_path || entity.image?.url;
          const imgSrc = imagePath && !imagePath.startsWith('http') 
            ? `${IMDB_POSTER}${imagePath}` 
            : imagePath;
          const role = entity.character || entity.job || entity.known_for_department;
          
          return (
            <SwiperSlide key={entity.id || idx} className="w-auto">
              <div 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => {
                  if (type === 'artist') navigate(`/artist/${entity.id || name}`);
                }}
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-indigo-500 transition-all shadow-md group-hover:shadow-indigo-500/20 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  {imgSrc ? (
                    <img 
                      src={imgSrc} 
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <User className="w-10 h-10 text-zinc-400" />
                  )}
                </div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 max-w-[100px] text-center truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {name}
                </h4>
                {role && (
                  <p className="text-[11px] text-zinc-500 text-center max-w-[100px] truncate mt-0.5">
                    {role}
                  </p>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default EntityCarousel;
