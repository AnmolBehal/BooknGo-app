// ─── MovieDetail ───
// Deep page: massive backdrop, YouTube trailer, cast carousel, streaming, showtimes, seat map.

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  ArrowLeft, Star, Clock, Calendar, Play, Globe,
  Film, Users, Award, Loader2,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LocationModal from '../../components/modals/LocationModal';
import GlobalSearchOverlay from '../../components/modals/GlobalSearchOverlay';
import SeatMapModal from '../../components/modals/SeatMapModal';
import CircularCarousel from '../../components/ui/CircularCarousel';
import AccordionSection from '../../components/ui/AccordionSection';
import AIConcierge from '../../components/ui/AIConcierge';
import { getMovieDetails, searchYouTubeTrailer } from '../../services/rapidApi';
import { generateShowtimes } from '../../utils/showtimeGenerator';
import { useLocation as useLocationCtx } from '../../context/LocationContext';
import { useItinerary } from '../../context/ItineraryContext';
import { TMDB_IMG } from '../../utils/constants';

const MovieDetail = () => {
  const { id } = useParams();
  const { currentCity } = useLocationCtx();
  const { addItem } = useItinerary();

  const [movie, setMovie]               = useState(null);
  const [trailerVideoId, setTrailerId]  = useState(null);
  const [loading, setLoading]           = useState(true);
  const [searchOpen, setSearchOpen]     = useState(false);

  // Seat map modal state
  const [seatModal, setSeatModal] = useState({ open: false, cinema: '', showtime: '' });

  // ── Load movie details + trailer ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMovieDetails(id);
        setMovie(data);

        // Try TMDB embedded videos first, then YouTube search
        const tmdbTrailer = data?.videos?.results?.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        );
        if (tmdbTrailer) {
          setTrailerId(tmdbTrailer.key);
        } else if (data?.title || data?.name) {
          const yt = await searchYouTubeTrailer((data?.title || data?.name) + " official trailer");
          if (yt && yt.length > 0 && yt[0].id) {
            setTrailerId(yt[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load movie:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Showtimes (deterministic mock) ──
  const showtimeData = useMemo(() => {
    if (!id || !currentCity) return null;
    return generateShowtimes(id, currentCity);
  }, [id, currentCity]);

  // ── Handle seat confirmation ──
  const handleSeatConfirm = (seatData) => {
    addItem({
      id:       `movie-${id}-${seatData.cinema}-${seatData.showtime}`,
      type:     'movie',
      title:    movie?.title || 'Movie Ticket',
      subtitle: `${seatData.cinema} · ${seatData.showtime} · ${seatData.seats.length} seat(s)`,
      image:    movie?.poster_path ? `${TMDB_IMG.poster}${movie.poster_path}` : '',
      price:    seatData.totalPrice,
      quantity: 1,
      meta: {
        movieId:  id,
        cinema:   seatData.cinema,
        showtime: seatData.showtime,
        seats:    seatData.seats,
        city:     currentCity,
      },
    });
    toast.success(`${seatData.seats.length} seat(s) added to itinerary! 🎬`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-surface-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-surface-900 flex flex-col items-center justify-center text-slate-400">
        <p className="text-xl mb-4">Movie not found</p>
        <Link to="/movies" className="text-brand-400 hover:underline">← Back to Movies</Link>
      </div>
    );
  }

  const backdrop = movie.backdrop_path ? `${TMDB_IMG.backdrop}${movie.backdrop_path}` : '';
  const poster   = movie.poster_path   ? `${TMDB_IMG.poster}${movie.poster_path}`     : '';
  const cast     = movie.credits?.cast?.slice(0, 20) || [];
  const crew     = movie.credits?.crew || [];
  const director = crew.find((c) => c.job === 'Director');
  const genres   = movie.genres?.map((g) => g.name) || [];
  const runtime  = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';

  // Streaming providers
  const streaming = movie['watch/providers']?.results?.IN?.flatrate || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 text-slate-900 dark:text-slate-100  flex flex-col">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <LocationModal />
      <GlobalSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ═══ Backdrop Hero ═══ */}
      <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        {backdrop && (
          <img src={backdrop} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/70 to-surface-900/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-900/80 via-transparent to-transparent" />

        {/* Back */}
        <Link to="/movies" className="absolute top-4 left-4 z-10 p-2 glass-card rounded-lg text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto flex items-end gap-6">
            {poster && (
              <img src={poster} alt={movie.title} className="hidden sm:block w-36 md:w-44 rounded-xl shadow-2xl border border-white/10" loading="lazy" />
            )}
            <div className="flex-1">
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-amber-400 font-bold">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-slate-400 text-sm">/ 10</span>
                  {movie.vote_count && <span className="text-slate-500 text-xs ml-2">({movie.vote_count.toLocaleString()} votes)</span>}
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-3">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                {movie.release_date && (
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(movie.release_date).getFullYear()}</span>
                )}
                {runtime && (
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {runtime}</span>
                )}
                {genres.length > 0 && (
                  <div className="flex gap-1.5">
                    {genres.map((g) => (
                      <span key={g} className="px-2 py-0.5 bg-white/10 rounded-full text-xs">{g}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">Overview</h2>
              <p className="text-slate-300 leading-relaxed">{movie.overview}</p>
              {director && (
                <p className="mt-3 text-sm text-slate-400">
                  <span className="text-white font-medium">Director:</span> {director.name}
                </p>
              )}
            </section>

            {/* Trailer */}
            {trailerVideoId && (
              <section>
                <h2 className="text-xl font-display font-bold text-white mb-3 flex items-center gap-2">
                  <Play className="w-5 h-5 text-red-400" /> Official Trailer
                </h2>
                <div className="relative aspect-video rounded-xl overflow-hidden glass-card">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerVideoId}`}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </section>
            )}

            {/* Cast Carousel */}
            {cast.length > 0 && (
              <section>
                <h2 className="text-xl font-display font-bold text-white mb-1 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" /> Cast
                </h2>
                <CircularCarousel
                  items={cast}
                  title=""
                />
              </section>
            )}

            {/* Things to Know */}
            <AccordionSection
              title="Things to Know"
              items={[
                {
                  title: 'Age Rating & Certification',
                  content: movie.adult ? 'This film is rated for adults (18+) only.' : 'Suitable for all audiences. Parental guidance recommended for children.',
                },
                {
                  title: 'Cancellation Policy',
                  content: 'Free cancellation up to 2 hours before showtime. 50% refund for cancellations within 2 hours. No refund after showtime.',
                },
                {
                  title: 'Food & Beverages',
                  content: 'Outside food and beverages are not permitted. A wide variety of snacks and drinks are available at the cinema counter.',
                },
                {
                  title: 'COVID-19 Guidelines',
                  content: 'Masks are recommended. Sanitization facilities available at the venue. Temperature checks may be conducted at entry.',
                },
              ]}
            />
          </div>

          {/* Right Column (1/3) — Showtimes + Streaming */}
          <div className="space-y-6">
            {/* Streaming */}
            {streaming.length > 0 && (
              <div className="glass-card rounded-xl p-5">
                <h3 className="font-display font-bold text-white text-lg mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" /> Streaming On
                </h3>
                <div className="flex flex-wrap gap-2">
                  {streaming.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 bg-surface-700/50 rounded-lg px-3 py-2 border border-white/5">
                      {s.logo_path && (
                        <img src={`https://image.tmdb.org/t/p/w45${s.logo_path}`} alt={s.provider_name} className="w-6 h-6 rounded" />
                      )}
                      <span className="text-sm text-slate-300">{s.provider_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Showtimes */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-display font-bold text-white text-lg mb-1 flex items-center gap-2">
                <Film className="w-5 h-5 text-brand-400" /> Showtimes
              </h3>
              <p className="text-xs text-slate-400 mb-4">in {currentCity}</p>

              {showtimeData?.cinemas?.length > 0 ? (
                <div className="space-y-4">
                  {showtimeData.cinemas.map((cinema) => (
                    <div key={cinema.name} className="bg-surface-700/50 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white text-sm">{cinema.name}</p>
                        <span className="text-[11px] text-slate-500">{cinema.distance}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cinema.showtimes.map((time) => (
                          <motion.button
                            key={time}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSeatModal({ open: true, cinema: cinema.name, showtime: time })}
                            className="px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600/40 border border-brand-500/30 rounded-lg text-brand-400 text-xs font-medium transition-all"
                          >
                            {time}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">No showtimes available for this city.</p>
              )}
            </div>

            {/* Movie Info */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-display font-bold text-white text-lg mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Details
              </h3>
              <div className="space-y-2 text-sm">
                {movie.original_language && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Language</span>
                    <span className="text-white">{movie.original_language.toUpperCase()}</span>
                  </div>
                )}
                {movie.budget > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Budget</span>
                    <span className="text-white">${(movie.budget / 1_000_000).toFixed(0)}M</span>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Revenue</span>
                    <span className="text-white">${(movie.revenue / 1_000_000).toFixed(0)}M</span>
                  </div>
                )}
                {movie.production_companies?.length > 0 && (
                  <div>
                    <span className="text-slate-400">Production</span>
                    <p className="text-white text-xs mt-1">{movie.production_companies.map((p) => p.name).join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Seat Map Modal */}
      <SeatMapModal
        isOpen={seatModal.open}
        onClose={() => setSeatModal({ open: false, cinema: '', showtime: '' })}
        movieId={id}
        cinemaName={seatModal.cinema}
        showtime={seatModal.showtime}
        onConfirm={handleSeatConfirm}
      />

      <Footer />
      <AIConcierge />
    </div>
  );
};

export default MovieDetail;
