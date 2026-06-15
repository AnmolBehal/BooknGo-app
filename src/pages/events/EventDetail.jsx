// ─── EventDetail ───
// Deep page for individual events.

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Ticket } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LocationModal from '../../components/modals/LocationModal';
import AccordionSection from '../../components/ui/AccordionSection';
import ActionButton from '../../components/ui/ActionButton';
import AIConcierge from '../../components/ui/AIConcierge';
import { useItinerary } from '../../context/ItineraryContext';
import { toast } from 'react-toastify';

const EventDetail = () => {
  const { id } = useParams();
  const { addItem } = useItinerary();

  // Mock event data (in production, fetch from Firestore or API)
  const event = {
    id,
    title: 'Live Music Experience',
    subtitle: 'An unforgettable evening of music and entertainment',
    venue: 'JLN Stadium, New Delhi',
    date: '2026-08-15',
    time: '07:00 PM',
    price: 1500,
    emoji: '🎤',
    description: 'Join us for an incredible live music experience featuring top Indian artists. This is a night you won\'t want to miss with state-of-the-art sound and lighting.',
  };

  const handleAdd = (item) => {
    addItem({
      id:       `event-${id}`,
      type:     'event',
      title:    event.title,
      subtitle: `${event.venue} · ${event.date}`,
      image:    '',
      price:    event.price,
      quantity: item.quantity || 1,
    });
    toast.success(`${event.title} added to itinerary! 🎭`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 text-slate-900 dark:text-slate-100  flex flex-col">
      <Navbar onSearchOpen={() => {}} />
      <LocationModal />

      {/* Hero */}
      <div className="relative h-[40vh] overflow-hidden bg-gradient-to-br from-violet-900/50 to-purple-900/50 flex items-center justify-center">
        <span className="text-8xl">{event.emoji}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent" />
        <Link to="/events" className="absolute top-4 left-4 z-10 p-2 glass-card rounded-lg text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full -mt-16 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-3">{event.title}</h1>
          <p className="text-slate-400 mb-6">{event.subtitle}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: <Calendar className="w-4 h-4" />, label: 'Date', value: new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
              { icon: <Clock className="w-4 h-4" />, label: 'Time', value: event.time },
              { icon: <MapPin className="w-4 h-4" />, label: 'Venue', value: event.venue },
              { icon: <Ticket className="w-4 h-4" />, label: 'Price', value: `₹${event.price}` },
            ].map((item, i) => (
              <div key={i} className="bg-surface-700/50 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">{item.icon} {item.label}</div>
                <p className="text-white font-medium text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="text-slate-300 leading-relaxed mb-6">{event.description}</p>

          <div className="flex items-center gap-4">
            <ActionButton type="event" item={event} onAction={handleAdd} />
            <span className="text-brand-400 font-bold text-lg">₹{event.price.toLocaleString('en-IN')}</span>
          </div>
        </motion.div>

        <AccordionSection
          title="Things to Know"
          items={[
            { title: 'Entry Guidelines', content: 'Carry a valid photo ID along with your ticket. Gates open 1 hour before the event.' },
            { title: 'Age Restriction', content: 'This event is open to all ages. However, children below 12 must be accompanied by an adult.' },
            { title: 'Refund Policy', content: 'Full refund available up to 48 hours before the event. 50% refund within 48 hours. No refund on event day.' },
          ]}
        />
      </main>

      <Footer />
      <AIConcierge />
    </div>
  );
};

export default EventDetail;
