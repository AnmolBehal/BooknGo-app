// ─── Navbar ───
// Ultra-minimalist navigation. Vercel/Apple-esque: tight spacing, crisp type, zero emojis.

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useLocationCtx } from '../../context/LocationContext';
import { useItinerary } from '../../context/ItineraryContext';
import { useTheme } from '../../context/ThemeContext';
import {
  MapPin, Search, ShoppingBag, LogOut, User, Menu, X,
  Film, CalendarDays, Utensils, Trophy, Building2, Home,
  Sun, Moon, Monitor, Heart, Check
} from 'lucide-react';

const NAV_LINKS = [
  { path: '/',        label: 'Home',    icon: Home },
  { path: '/movies',  label: 'Movies',  icon: Film },
  { path: '/events',  label: 'Events',  icon: CalendarDays },
  { path: '/sports',  label: 'Sports',  icon: Trophy },
  { path: '/dining',  label: 'Dining',  icon: Utensils },
  { path: '/stays',   label: 'Stays',   icon: Building2 },
];

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

const Navbar = ({ onSearchOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const { currentCity, openLocationModal } = useLocationCtx();
  const { totalItems } = useItinerary();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef(null);

  // Close theme dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ThemeIcon = THEME_ICONS[theme] || Monitor;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300" id="main-navbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-['Space_Grotesk']">
              Book<span className="text-indigo-600 dark:text-indigo-400">n</span>Go
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {!isAdmin ? NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path ||
                (link.path !== '/' && location.pathname.startsWith(link.path));
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5
                    ${isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      style={{ zIndex: 0 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" /> {link.label}
                  </span>
                </Link>
              );
            }) : (
              <Link to="/test" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-3">
                Test API
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {!isAdmin ? (
              <>
                {/* Location */}
                <button
                  onClick={openLocationModal}
                  className="hidden sm:flex items-center gap-1.5 text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="max-w-[80px] truncate">{currentCity}</span>
                </button>

                {/* Search */}
                <button
                  onClick={onSearchOpen}
                  className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <Heart className="w-4 h-4" />
                </Link>

                {/* Itinerary */}
                <Link
                  to="/itinerary"
                  className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>

                {/* Profile */}
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-1"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {user?.firstName?.[0] || user?.displayName?.[0] || 'U'}
                  </div>
                  <span className="hidden md:inline text-[13px] text-zinc-600 dark:text-zinc-400 font-medium max-w-[70px] truncate">
                    {user?.firstName || 'User'}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/test" className="lg:hidden text-sm font-semibold text-indigo-600 dark:text-indigo-400 mr-2">Test API</Link>
                
                {/* Admin Profile linking to /admin */}
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-1"
                  title="Admin Panel"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {user?.firstName?.[0] || user?.displayName?.[0] || 'A'}
                  </div>
                  <span className="hidden md:inline text-[13px] text-zinc-600 dark:text-zinc-400 font-medium max-w-[70px] truncate">
                    Admin
                  </span>
                </Link>

                <button onClick={logout} className="text-sm text-red-500 font-semibold px-3 py-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ml-1">
                  Logout
                </button>
              </>
            )}

            {/* Theme Dropdown */}
            <div className="relative ml-1" ref={themeDropdownRef}>
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                title="Theme Settings"
              >
                <ThemeIcon className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {themeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden py-1 z-50"
                  >
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Monitor },
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => { setTheme(t.value); setThemeDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                          theme === t.value 
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' 
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <t.icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </div>
                        {theme === t.value && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>



            {/* Mobile toggle */}
            {!isAdmin && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors ml-1"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-14 left-0 right-0 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 lg:hidden"
          >
            <div className="max-w-6xl mx-auto px-4 py-4">
              <button
                onClick={() => { openLocationModal(); setMobileOpen(false); }}
                className="w-full flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-3"
              >
                <MapPin className="w-4 h-4 text-indigo-500" /> {currentCity}
              </button>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {NAV_LINKS.map((link) => {
                  const isActive = location.pathname === link.path;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-colors
                        ${isActive
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                        }`}
                    >
                      <Icon className="w-4 h-4" /> {link.label}
                    </Link>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-700 dark:text-zinc-300 text-sm font-medium border border-zinc-200 dark:border-zinc-800">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-500/20">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
