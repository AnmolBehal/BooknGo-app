// ─── ThemeContext ───
// Manages Dark / Light / System themes. Toggles Tailwind `dark` class on <html>.

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
};

function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme) {
  return theme === 'system' ? getSystemPreference() : theme;
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeRaw] = useState(() => {
    try { return localStorage.getItem('bookngo-theme') || 'dark'; } catch { return 'dark'; }
  });

  const resolved = resolveTheme(theme);
  const isDark = resolved === 'dark';

  // Apply class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setThemeRaw('system'); // triggers re-render
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((next) => {
    try { localStorage.setItem('bookngo-theme', next); } catch {}
    setThemeRaw(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
};
