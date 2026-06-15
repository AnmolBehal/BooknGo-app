// ─── Showtime Generator ───
// Deterministic mock generator for Indian cinemas and showtimes.
// Takes a movieId + city and produces consistent (seeded) results.

import { SEAT_TIERS } from './constants';

// ── Deterministic seeded random (Mulberry32) ──
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ── Cinema chains per city ──
const CINEMA_CHAINS = {
  'Delhi NCR':   ['PVR Select Citywalk', 'INOX Nehru Place', 'Cinepolis DLF Noida', 'PVR Priya Vasant Vihar', 'Carnival Dwarka'],
  'Mumbai':      ['PVR Phoenix Palladium', 'INOX R-City Ghatkopar', 'Cinepolis Andheri', 'PVR ICON Versova', 'Carnival Imax Wadala'],
  'Bengaluru':   ['PVR Orion Mall', 'INOX Garuda Mall', 'Cinepolis Royal Meenakshi', 'PVR Forum Koramangala', 'Innovative Multiplex'],
  'Hyderabad':   ['PVR Next Galleria', 'INOX GVK One', 'Cinepolis Sudha Multiplex', 'AMB Cinemas Gachibowli', 'PVR Forum Sujana'],
  'Chennai':     ['PVR VR Mall', 'INOX National', 'SPI Palazzo Forum', 'Luxe Cinemas Phoenix', 'Carnival ECR'],
  'Kolkata':     ['PVR Avani Mall', 'INOX Forum Courtyard', 'Cinepolis Lake Town', 'PVR Acropolis', 'Carnival South City'],
  'Pune':        ['PVR Phoenix Market City', 'INOX Bund Garden', 'Cinepolis Seasons Mall', 'E-Square Multiplex', 'PVR Amanora'],
  'Ahmedabad':   ['PVR Acropolis', 'INOX Raghuleela', 'Cinepolis Alpha One', 'Carnival Ahmedabad', 'Wide Angle Multiplex'],
  'Jaipur':      ['PVR World Trade Park', 'INOX Crystal Palm', 'Cinepolis Malviya Nagar', 'Raj Mandir Cinema', 'Carnival Jaipur'],
  'Chandigarh':  ['PVR Elante Mall', 'Cinepolis VR Punjab', 'PVR North Country', 'INOX Bestech Mohali', 'Fun Republic'],
  'Lucknow':     ['PVR Sahara Ganj', 'INOX Riverside', 'Cinepolis Lulu Mall', 'Carnival Phoenix United', 'PVR Shalimar'],
  'Kochi':       ['PVR Lulu Mall', 'INOX Centre Square', 'Cinepolis Oberon Mall', 'Carnival Kochi', 'PVR Gold Kochi'],
};

// Fallback cinemas for unlisted cities
const DEFAULT_CINEMAS = ['PVR Cinemas', 'INOX Multiplex', 'Cinepolis', 'Carnival Cinemas', 'Fun Republic'];

// ── Showtime slots ──
const TIME_SLOTS = ['09:30 AM', '12:15 PM', '03:00 PM', '06:30 PM', '09:45 PM', '11:00 PM'];

/**
 * Generate deterministic cinemas + showtimes for a movie in a city.
 * @param {string|number} movieId
 * @param {string} city
 * @returns {{ cinemas: Array<{ name: string, showtimes: string[], distance: string }> }}
 */
export function generateShowtimes(movieId, city) {
  const seed = hashString(`${movieId}-${city}`);
  const rand = mulberry32(seed);

  const cinemaPool = CINEMA_CHAINS[city] || DEFAULT_CINEMAS;

  // Pick 3-5 cinemas
  const count = 3 + Math.floor(rand() * 3);
  const shuffled = [...cinemaPool].sort(() => rand() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return {
    cinemas: selected.map((name, idx) => {
      // Each cinema gets 3-5 showtimes
      const numTimes = 3 + Math.floor(rand() * 3);
      const times = TIME_SLOTS.sort(() => rand() - 0.5).slice(0, numTimes).sort();
      const distance = (1.5 + rand() * 14).toFixed(1);

      return { name, showtimes: times, distance: `${distance} km` };
    }),
  };
}

/**
 * Generate a deterministic seat map for a specific cinema + showtime.
 * 30% of seats are randomly disabled (already booked).
 * @param {string|number} movieId
 * @param {string} cinemaName
 * @param {string} showtime
 * @returns {{ tiers: Array<{ tierKey: string, label: string, price: number, color: string, rows: Array<Array<{ id: string, row: number, col: number, disabled: boolean }>> }> }}
 */
export function generateSeatMap(movieId, cinemaName, showtime) {
  const seed = hashString(`${movieId}-${cinemaName}-${showtime}`);
  const rand = mulberry32(seed);

  const tiers = Object.entries(SEAT_TIERS).map(([tierKey, config]) => {
    const rows = [];
    for (let r = 0; r < config.rows; r++) {
      const row = [];
      for (let c = 0; c < config.seatsPerRow; c++) {
        row.push({
          id:       `${tierKey}-${r}-${c}`,
          row:      r,
          col:      c,
          disabled: rand() < 0.3, // 30% chance of being unavailable
        });
      }
      rows.push(row);
    }
    return {
      tierKey,
      label: config.label,
      price: config.price,
      color: config.color,
      rows,
    };
  });

  return { tiers };
}
