// ─── ApiDebugger ───
// Temporary diagnostic component. Fires one test request per RapidAPI endpoint.
// Shows: status pill (Success/Failed/Loading), HTTP status, and raw JSON preview.
// Hosts here MUST match the hosts in rapidApi.js exactly.

import React, { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Loader2, Play, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || '';

const API_TESTS = [
  {
    name: 'TMDB - Random Movies',
    host: 'tmdb-movies-and-tv-shows-api-by-apirobots.p.rapidapi.com',
    url: 'https://tmdb-movies-and-tv-shows-api-by-apirobots.p.rapidapi.com/v1/tmdb/random',
    method: 'GET',
    params: {},
  },
  {
    name: 'IMDb - Actor Titles',
    host: 'imdb236.p.rapidapi.com',
    url: 'https://imdb236.p.rapidapi.com/api/imdb/cast/nm0000190/titles',
    method: 'GET',
    params: {},
  },
  {
    name: 'Booking.com - Search Hotels',
    host: 'booking-com15.p.rapidapi.com',
    url: 'https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels',
    method: 'GET',
    params: {
      dest_id: '-2092174',
      search_type: 'CITY',
      arrival_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      departure_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      adults: 2,
      page_number: 1,
      currency_code: 'INR',
    },
  },
  {
    name: 'Tasty - Search Recipes',
    host: 'tasty.p.rapidapi.com',
    url: 'https://tasty.p.rapidapi.com/recipes/list',
    method: 'GET',
    params: { from: 0, size: 3, q: 'chicken' },
  },
  {
    name: 'Sportscore - Football Live',
    host: 'sportscore1.p.rapidapi.com',
    url: 'https://sportscore1.p.rapidapi.com/sports/1/events/live',
    method: 'GET',
    params: { page: 1 },
  },
  {
    name: 'Streaming Availability',
    host: 'streaming-availability.p.rapidapi.com',
    url: 'https://streaming-availability.p.rapidapi.com/shows/search/filters',
    method: 'GET',
    params: { country: 'in', output_language: 'en' },
  },
  {
    name: 'YouTube - Search Trailer',
    host: 'youtube138.p.rapidapi.com',
    url: 'https://youtube138.p.rapidapi.com/search/',
    method: 'GET',
    params: { q: 'Avengers Endgame trailer', hl: 'en', gl: 'IN' },
  },
  {
    name: 'Real-Time Web Search',
    host: 'real-time-web-search.p.rapidapi.com',
    url: 'https://real-time-web-search.p.rapidapi.com/search',
    method: 'GET',
    params: { q: 'BookMyShow movies', limit: 3 },
  },
  {
    name: 'ChatGPT-4 Concierge',
    host: 'chatgpt-42.p.rapidapi.com',
    url: 'https://chatgpt-42.p.rapidapi.com/conversationgpt4-2',
    method: 'POST',
    body: {
      messages: [
        { role: 'system', content: 'You are a test assistant.' },
        { role: 'user', content: 'Say hello in one word.' },
      ],
      web_access: false,
    },
  },
];

const StatusPill = ({ status }) => {
  if (status === 'loading') return <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-medium"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading</span>;
  if (status === 'success') return <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Success</span>;
  if (status === 'error')   return <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-medium"><XCircle className="w-3.5 h-3.5" /> Failed</span>;
  return <span className="text-zinc-400 text-xs font-medium">Idle</span>;
};

const ApiDebugger = () => {
  const [results, setResults] = useState({});
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [running, setRunning] = useState(false);

  const runTest = useCallback(async (test, idx) => {
    setResults((prev) => ({ ...prev, [idx]: { status: 'loading' } }));

    try {
      const config = {
        method: test.method,
        url: test.url,
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': test.host,
        },
      };

      if (test.method === 'GET') {
        config.params = test.params;
      } else {
        config.data = test.body;
        config.headers['Content-Type'] = 'application/json';
      }

      const response = await axios(config);

      setResults((prev) => ({
        ...prev,
        [idx]: {
          status: 'success',
          httpStatus: response.status,
          data: response.data,
          topKeys: Object.keys(response.data || {}),
        },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [idx]: {
          status: 'error',
          httpStatus: err.response?.status || 'N/A',
          errorMessage: err.response?.data?.message || err.message || 'Unknown error',
          errorData: err.response?.data || null,
        },
      }));
    }
  }, []);

  const runAll = useCallback(async () => {
    setRunning(true);
    for (let i = 0; i < API_TESTS.length; i++) {
      await runTest(API_TESTS[i], i);
    }
    setRunning(false);
  }, [runTest]);

  const truncateJSON = (obj, depth = 0) => {
    if (depth >= 2) return typeof obj === 'object' && obj !== null ? (Array.isArray(obj) ? `[Array(${obj.length})]` : '{...}') : obj;
    if (Array.isArray(obj)) return obj.slice(0, 3).map((item) => truncateJSON(item, depth + 1));
    if (typeof obj === 'object' && obj !== null) {
      const result = {};
      for (const [key, val] of Object.entries(obj).slice(0, 10)) {
        result[key] = truncateJSON(val, depth + 1);
      }
      return result;
    }
    return obj;
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">API Diagnostics</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Key: <code className="text-[11px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">{RAPIDAPI_KEY ? `${RAPIDAPI_KEY.slice(0, 8)}...${RAPIDAPI_KEY.slice(-4)}` : 'MISSING'}</code>
          </p>
        </div>
        <button
          onClick={runAll}
          disabled={running}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {running ? 'Running...' : 'Run All Tests'}
        </button>
      </div>

      <div className="space-y-2">
        {API_TESTS.map((test, idx) => {
          const result = results[idx];
          const isExpanded = expandedIdx === idx;

          return (
            <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50 truncate">{test.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono flex-shrink-0 hidden sm:inline">{test.host}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {result?.httpStatus && (
                    <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      result.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                    }`}>
                      {result.httpStatus}
                    </span>
                  )}
                  <StatusPill status={result?.status} />
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </div>
              </button>

              {isExpanded && result && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
                  {result.status === 'success' && (
                    <>
                      <p className="text-[11px] text-zinc-500 mb-2 font-mono">
                        Top-level keys: [{result.topKeys?.join(', ')}]
                      </p>
                      <pre className="text-[11px] text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg overflow-auto max-h-64 font-mono leading-relaxed">
                        {JSON.stringify(truncateJSON(result.data), null, 2)}
                      </pre>
                    </>
                  )}
                  {result.status === 'error' && (
                    <>
                      <p className="text-[13px] text-red-600 dark:text-red-400 font-medium mb-2">
                        HTTP {result.httpStatus}: {result.errorMessage}
                      </p>
                      {result.errorData && (
                        <pre className="text-[11px] text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/5 p-3 rounded-lg overflow-auto max-h-40 font-mono">
                          {JSON.stringify(result.errorData, null, 2)}
                        </pre>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApiDebugger;
