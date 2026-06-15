// ─── Footer ───
// Minimalist footer. Pure lucide-react. Zinc scale contrast.

import React from 'react';
import { Link } from 'react-router-dom';
import { Film, CalendarDays, Trophy, Utensils, Building2, HelpCircle, Mail, MessageSquare, Shield, FileText, RefreshCw, Heart } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 mt-auto transition-colors duration-300">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 mb-8">
        <div>
          <p className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-['Space_Grotesk'] mb-2">
            Book<span className="text-blue-600 dark:text-blue-400">n</span>Go
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-xs">
            Your unified digital planner for movies, events, sports, dining & stays.
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-zinc-400 dark:text-zinc-500 text-sm">
          {new Date().getFullYear()} BooknGo. All rights reserved.
        </p>
        <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-sm">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>by Anmol</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
