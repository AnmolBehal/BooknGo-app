import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Info = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const topic = pathParts[pathParts.length - 1] || 'Information';
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col transition-colors duration-300">
      <Navbar onSearchOpen={() => {}} />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-16 w-full text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4 capitalize">
          {topic.replace('-', ' ')}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          This page is currently under construction. Please check back later.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Info;
