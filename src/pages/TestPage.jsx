import React from 'react';
import { Link } from 'react-router-dom';
import ApiDebugger from '../components/debug/ApiDebugger';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">API Testing Ground</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Run direct queries against RapidAPI to verify connectivity and view JSON shapes.</p>
        </div>
        <ApiDebugger />
      </main>
    </div>
  );
};

export default TestPage;
