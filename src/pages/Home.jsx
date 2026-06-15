// ─── Home Page ───
// Redesigned with Vercel/Apple minimalism. Zinc scale. Zero emojis.
// Includes temporary ApiDebugger for pipeline validation.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Zap, Shield, Tag, Film, CalendarDays, Trophy, Utensils, Building2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LocationModal from '../components/modals/LocationModal';
import GlobalSearchOverlay from '../components/modals/GlobalSearchOverlay';
import AIConcierge from '../components/ui/AIConcierge';
import EntityCarousel from '../components/ui/EntityCarousel';
import HeroCarousel from '../components/ui/HeroCarousel';
import { useAuth } from '../context/AuthContext';
import { getPopularActors, getTrendingMovies } from '../services/rapidApi';

const VERTICALS = [
  { key: 'movies', label: 'Movies',  icon: Film,         desc: 'Now playing & upcoming', path: '/movies', color: 'text-red-500' },
  { key: 'events', label: 'Events',  icon: CalendarDays,  desc: 'Concerts, comedy & more', path: '/events', color: 'text-violet-500' },
  { key: 'sports', label: 'Sports',  icon: Trophy,        desc: 'Live scores & tickets',   path: '/sports', color: 'text-emerald-500' },
  { key: 'dining', label: 'Dining',  icon: Utensils,      desc: 'Restaurants & recipes',   path: '/dining', color: 'text-amber-500' },
  { key: 'stays',  label: 'Stays',   icon: Building2,     desc: 'Hotels & properties',     path: '/stays',  color: 'text-cyan-500' },
];

const Home = () => {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [actors, setActors] = useState([]);
  const [trending, setTrending] = useState([]);

  React.useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [actorsData, trendingData] = await Promise.all([
          getPopularActors(false),
          getTrendingMovies(false)
        ]);

        if (actorsData && actorsData.length > 0) {
          setActors(actorsData.slice(0, 15).map(a => ({
            id: a.id || a.title,
            name: a.title,
            profile_path: a.image?.url || a.poster_path,
            character: a.year
          })));
        }

        if (trendingData) {
          setTrending(trendingData.slice(0, 5));
        }
      } catch (err) {
        console.error("Error loading home data:", err);
      }
    };
    fetchHomeData();
  }, []);

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col transition-colors duration-300">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <LocationModal />
      <GlobalSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          <motion.div variants={stagger} initial="hidden" animate="show" className="text-center">
            <motion.p variants={fadeUp} className="text-blue-600 dark:text-blue-400 font-semibold text-sm tracking-wide mb-4">
              {user?.firstName ? `Welcome back, ${user.firstName}` : 'Your Universal Digital Planner'}
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 font-['Space_Grotesk']">
              <span className="text-gradient">Book Everything.</span>
              <br />
              <span className="text-zinc-900 dark:text-zinc-50">Go Everywhere.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Movies, events, sports, dining, and stays — planned and booked from a single interface.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Zap, text: 'Book Instantly' },
                { icon: Shield, text: '100% Secure' },
                { icon: Tag, text: 'Best Prices' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                  <badge.icon className="w-3.5 h-3.5" /> {badge.text}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── Featured Slider ── */}
        {trending.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
            <HeroCarousel items={trending} type="movie" />
          </section>
        )}

        {/* ── Verticals ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="mb-8">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Explore</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-['Space_Grotesk']">
              What would you like to do?
            </h2>
          </div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {VERTICALS.map((v) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.key} variants={fadeUp}>
                  <Link to={v.path}>
                    <div className="group bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer">
                      <Icon className={`w-6 h-6 ${v.color} mb-3`} />
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">{v.label}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{v.desc}</p>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                        Explore <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ── Trending Artists ── */}
        {actors.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
            <EntityCarousel 
              entities={actors} 
              title="Trending Celebrities" 
              type="artist" 
            />
          </section>
        )}

        {/* ── Offers ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-12 mb-8">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">Special Offers</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-['Space_Grotesk']">
              Limited Time Deals
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: '50% Off Movies', desc: 'On your first booking', gradient: 'from-red-500 to-orange-500' },
              { title: 'Free Event Pass', desc: 'Book 2, get 1 free', gradient: 'from-violet-500 to-indigo-500' },
              { title: 'Rs.500 Off Stays', desc: 'On bookings above Rs.5000', gradient: 'from-emerald-500 to-teal-500' },
            ].map((offer, i) => (
              <div key={i} className={`bg-gradient-to-br ${offer.gradient} rounded-xl p-6 text-white`}>
                <h3 className="text-lg font-bold mb-1">{offer.title}</h3>
                <p className="text-white/80 text-sm mb-4">{offer.desc}</p>
                <button className="bg-white text-zinc-900 font-semibold px-5 py-2 rounded-lg text-sm hover:shadow-lg transition-shadow">
                  Claim Offer
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <AIConcierge />
    </div>
  );
};

export default Home;
