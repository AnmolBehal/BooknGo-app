// ─── LocationContext ───
// Manages the user's selected city for location-aware content.
// Provides: currentCity, setCurrentCity, showLocationModal toggle, allCities list.

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CITIES } from '../utils/constants';

const LocationContext = createContext(null);

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside <LocationProvider>');
  return ctx;
};

export const LocationProvider = ({ children }) => {
  const [currentCity, setCurrentCity]             = useState('Delhi NCR');
  const [showLocationModal, setShowLocationModal] = useState(false);

  // ── Attempt browser geolocation → reverse geocode to nearest supported city ──
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Free reverse geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            data.address?.state ||
            'Delhi NCR';

          // Match against our supported city list (fuzzy match on first word)
          const match = CITIES.find(
            (c) =>
              c.name.toLowerCase().includes(detectedCity.toLowerCase()) ||
              detectedCity.toLowerCase().includes(c.name.split(' ')[0].toLowerCase())
          );
          setCurrentCity(match ? match.name : detectedCity);
          setShowLocationModal(false);
        } catch {
          // Fallback to default
          setCurrentCity('Delhi NCR');
        }
      },
      () => {
        // Geolocation denied — keep current city
      }
    );
  }, []);

  const value = {
    currentCity,
    setCurrentCity: (city) => {
      setCurrentCity(city);
      setShowLocationModal(false);
    },
    showLocationModal,
    openLocationModal:  () => setShowLocationModal(true),
    closeLocationModal: () => setShowLocationModal(false),
    detectLocation,
    allCities: CITIES,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
