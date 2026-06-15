// ─── StaysIndex ───
// Hotels/Stays page with Booking.com API integration mapped into SmartCard.

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, MapPin, Calendar, Users, Loader2, BedDouble, Hotel } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LocationModal from '../../components/modals/LocationModal';
import GlobalSearchOverlay from '../../components/modals/GlobalSearchOverlay';
import AIConcierge from '../../components/ui/AIConcierge';
import SmartCard from '../../components/ui/SmartCard';
import { searchHotels } from '../../services/rapidApi';
import { useLocation as useLocationCtx } from '../../context/LocationContext';

const StaysIndex = () => {
  const { currentCity } = useLocationCtx();
  const [hotels, setHotels]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Form state
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [form, setForm] = useState({
    checkin:  today,
    checkout: tomorrow,
    adults:   2,
  });

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchHotels({
        city:     currentCity,
        checkin:  form.checkin,
        checkout: form.checkout,
        adults:   form.adults,
      });
      setHotels(results || []);
    } catch {
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [currentCity]);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const inputClass = 'px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-sm';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col transition-colors duration-300">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <LocationModal />
      <GlobalSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-3 font-['Space_Grotesk']">
            <Building2 className="w-8 h-8 text-indigo-500" /> Stays
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">Find premium hotels & properties in {currentCity}</p>
        </div>

        {/* Search Form */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-5 mb-10 shadow-sm border border-zinc-200 dark:border-zinc-800"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* City */}
            <div className="lg:col-span-1">
              <label className="flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" /> City
              </label>
              <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm font-medium">
                {currentCity}
              </div>
            </div>

            {/* Check-in */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Check-in
              </label>
              <input
                type="date"
                value={form.checkin}
                onChange={(e) => setForm({ ...form, checkin: e.target.value })}
                min={today}
                className={inputClass + ' w-full text-slate-900 dark:text-white'}
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Check-out
              </label>
              <input
                type="date"
                value={form.checkout}
                onChange={(e) => setForm({ ...form, checkout: e.target.value })}
                min={form.checkin}
                className={inputClass + ' w-full text-slate-900 dark:text-white'}
              />
            </div>

            {/* Adults */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <Users className="w-3.5 h-3.5" /> Adults
              </label>
              <select
                value={form.adults}
                onChange={(e) => setForm({ ...form, adults: parseInt(e.target.value) })}
                className={inputClass + ' w-full text-slate-900 dark:text-white'}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5" /> Search Stays</>}
              </motion.button>
            </div>
          </div>
        </motion.form>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden animate-pulse border border-zinc-200 dark:border-zinc-800">
                <div className="h-48 bg-zinc-200 dark:bg-zinc-800 w-full"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hotels.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {hotels.map((hotel, i) => {
              const name = hotel.hotel_name || hotel.property?.name || hotel.accessibilityLabel || 'Hotel';
              const image = hotel.max_photo_url || hotel.property?.photoUrls?.[0] || '';
              const price = hotel.min_total_price || hotel.property?.priceBreakdown?.grossPrice?.value || 5000;
              const rating = hotel.review_score || hotel.property?.reviewScore || null;
              const address = hotel.address || hotel.property?.wishlistName || '';

              return (
                <motion.div key={hotel.hotel_id || i} variants={itemVariants}>
                  <SmartCard
                    id={`stay-${hotel.hotel_id || i}`}
                    type="stay"
                    title={name}
                    subtitle={address || currentCity}
                    description={`Booking from ${form.checkin} to ${form.checkout} for ${form.adults} Adults. Enjoy a comfortable stay at ${name}.`}
                    image={image}
                    price={Math.round(price)}
                    vote_average={rating}
                    badge="HOTEL"
                  />
                </motion.div>
              );
            })}
          </motion.div>
        ) : searched ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <BedDouble className="w-12 h-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-600" />
            <p className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">No hotels found.</p>
            <p className="text-sm text-zinc-500 mt-1">Try adjusting your dates or searching a different city.</p>
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <Hotel className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
            <p className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">Search for premium stays.</p>
            <p className="text-sm text-zinc-500 mt-1">Enter your dates and hit search.</p>
          </div>
        )}
      </main>

      <Footer />
      <AIConcierge />
    </div>
  );
};

export default StaysIndex;
