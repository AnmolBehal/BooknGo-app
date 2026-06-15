// ─── Constants ───
// Central source of truth for cities, seat tiers, pricing, and configuration.

// ── Indian Cities ──
export const CITIES = [
  { name: 'Delhi NCR',    state: 'Delhi',         emoji: '🏛️' },
  { name: 'Mumbai',       state: 'Maharashtra',   emoji: '🌊' },
  { name: 'Bengaluru',    state: 'Karnataka',     emoji: '💻' },
  { name: 'Hyderabad',    state: 'Telangana',     emoji: '🕌' },
  { name: 'Chennai',      state: 'Tamil Nadu',    emoji: '🎭' },
  { name: 'Kolkata',      state: 'West Bengal',   emoji: '🌉' },
  { name: 'Pune',         state: 'Maharashtra',   emoji: '📚' },
  { name: 'Ahmedabad',    state: 'Gujarat',       emoji: '🏗️' },
  { name: 'Jaipur',       state: 'Rajasthan',     emoji: '🏰' },
  { name: 'Chandigarh',   state: 'Punjab',        emoji: '🌳' },
  { name: 'Lucknow',      state: 'Uttar Pradesh', emoji: '🍽️' },
  { name: 'Kochi',        state: 'Kerala',        emoji: '⛵' },
  { name: 'Indore',       state: 'Madhya Pradesh',emoji: '🏙️' },
  { name: 'Goa',          state: 'Goa',           emoji: '🏖️' },
  { name: 'Amritsar',     state: 'Punjab',        emoji: '🛕' },
  { name: 'Bhopal',       state: 'Madhya Pradesh',emoji: '🏞️' },
  { name: 'Coimbatore',   state: 'Tamil Nadu',    emoji: '⚙️' },
  { name: 'Guwahati',     state: 'Assam',         emoji: '🐘' },
  { name: 'Patna',        state: 'Bihar',         emoji: '📜' },
  { name: 'Nagpur',       state: 'Maharashtra',   emoji: '🍊' },
  { name: 'Thiruvananthapuram', state: 'Kerala',   emoji: '🌴' },
  { name: 'Visakhapatnam',state: 'Andhra Pradesh', emoji: '🚢' },
  { name: 'Surat',        state: 'Gujarat',       emoji: '💎' },
  { name: 'Vadodara',     state: 'Gujarat',       emoji: '🎨' },
];

// ── Seat Tiers ──
export const SEAT_TIERS = {
  VIP:      { label: 'VIP Recliner',    price: 600, color: '#f59e0b', rows: 2, seatsPerRow: 10 },
  PREMIUM:  { label: 'Premium',         price: 350, color: '#336dff', rows: 4, seatsPerRow: 14 },
  STANDARD: { label: 'Standard',        price: 180, color: '#6b7280', rows: 5, seatsPerRow: 16 },
};

// ── Vertical Types ──
export const VERTICALS = {
  MOVIE:  'movie',
  EVENT:  'event',
  SPORT:  'sport',
  DINING: 'dining',
  STAY:   'stay',
};

// ── Vertical Labels & Colors ──
export const VERTICAL_META = {
  movie:  { label: 'Movies',  icon: '🎬', gradient: 'from-red-500 via-pink-500 to-rose-500',    bgGlow: 'rgba(239, 68, 68, 0.15)' },
  event:  { label: 'Events',  icon: '🎭', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500', bgGlow: 'rgba(139, 92, 246, 0.15)' },
  sport:  { label: 'Sports',  icon: '⚽', gradient: 'from-emerald-500 via-green-500 to-teal-500', bgGlow: 'rgba(16, 185, 129, 0.15)' },
  dining: { label: 'Dining',  icon: '🍽️', gradient: 'from-amber-500 via-orange-500 to-yellow-500', bgGlow: 'rgba(245, 158, 11, 0.15)' },
  stay:   { label: 'Stays',   icon: '🏨', gradient: 'from-cyan-500 via-sky-500 to-blue-500',     bgGlow: 'rgba(6, 182, 212, 0.15)' },
};

// ── Admin Config ──
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@bookngo.com';

// ── TMDB Image Base URLs ──
export const TMDB_IMG = {
  poster:   'https://image.tmdb.org/t/p/w500',
  backdrop: 'https://image.tmdb.org/t/p/original',
  profile:  'https://image.tmdb.org/t/p/w185',
};
