// ─── AIConcierge ───
// Floating ChatGPT-4 chat bubble for the AI concierge.

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { askConcierge } from '../../services/rapidApi';

const AIConcierge = () => {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([
    { role: 'assistant', content: "Hi! I'm your BooknGo Concierge 🎫. Ask me about movies, events, restaurants, or hotels in any Indian city!" },
  ]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Send conversation history (last 10 messages for context)
      const history = messages.slice(-10).map(({ role, content }) => ({ role, content }));
      const reply = await askConcierge(msg, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I couldn't connect. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Chat Window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[55] w-[360px] max-w-[calc(100vw-2rem)] glass-card rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ maxHeight: 'min(500px, 70vh)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-brand-600/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">BooknGo Concierge</p>
                  <p className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3 min-h-[200px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-br-md'
                        : 'bg-surface-700 text-slate-200 rounded-bl-md border border-white/5'
                      }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface-700 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <input
                  id="concierge-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3.5 py-2.5 bg-surface-700 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="p-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ── */}
      <motion.button
        id="ai-concierge-fab"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-4 sm:right-6 z-[55] w-14 h-14 rounded-full text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900 border border-indigo-600 dark:border-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-shadow"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default AIConcierge;
