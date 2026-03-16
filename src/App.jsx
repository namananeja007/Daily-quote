import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Loader2, Trash2, Copy, Share2, TrendingUp, Calendar } from 'lucide-react';

const RANDOM_QUOTE_URL = 'https://api.quotable.io/random?maxLength=100';

const FALLBACK_QUOTES = [
  { _id: '1', content: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { _id: '2', content: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
  { _id: '3', content: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
  { _id: '4', content: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { _id: '5', content: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
  { _id: '6', content: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins' },
  { _id: '7', content: 'Success is not final, failure is not fatal.', author: 'Winston Churchill' },
  { _id: '8', content: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
];

function App() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [likedQuotes, setLikedQuotes] = useState([]);
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [dailyStreak, setDailyStreak] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('likedQuotes');
    const streak = localStorage.getItem('dailyStreak') || 0;
    const views = localStorage.getItem('viewCount') || 0;
    if (stored) {
      try {
        setLikedQuotes(JSON.parse(stored));
      } catch {
        setLikedQuotes([]);
      }
    }
    setDailyStreak(parseInt(streak));
    setViewCount(parseInt(views));
  }, []);

  useEffect(() => {
    localStorage.setItem('likedQuotes', JSON.stringify(likedQuotes));
  }, [likedQuotes]);

  useEffect(() => {
    localStorage.setItem('dailyStreak', dailyStreak);
    localStorage.setItem('viewCount', viewCount);
  }, [dailyStreak, viewCount]);

  useEffect(() => {
    fetchNewQuote();
  }, []);

  const fetchNewQuote = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(RANDOM_QUOTE_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('API Error: ' + res.status);
      const data = await res.json();
      setQuote({ text: data.content, author: data.author, id: data._id });
      setViewCount(viewCount + 1);
      setDailyStreak(dailyStreak + 1);
    } catch (e) {
      console.error('API Fetch error:', e);
      const fallbackQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setQuote({ text: fallbackQuote.content, author: fallbackQuote.author, id: fallbackQuote._id });
      setViewCount(viewCount + 1);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = () => {
    if (!quote) return;
    const exists = likedQuotes.find((item) => item.id === quote.id);
    if (exists) {
      setLikedQuotes((prev) => prev.filter((item) => item.id !== quote.id));
      return;
    }
    setLikedQuotes((prev) => [quote, ...(prev ?? [])]);
  };

  const removeQuote = (id) => {
    setLikedQuotes((prev) => prev.filter((item) => item.id !== id));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareQuote = () => {
    if (!quote) return;
    const text = `"${quote.text}" — ${quote.author}`;
    if (navigator.share) {
      navigator.share({ text, title: 'Check out this quote!' });
    } else {
      copyToClipboard(text, 'share');
    }
  };

  const isLiked = useMemo(() => {
    if (!quote) return false;
    return likedQuotes.some((item) => item.id === quote.id);
  }, [likedQuotes, quote]);

  const filteredQuotes = useMemo(() => {
    if (!searchTerm) return likedQuotes;
    return likedQuotes.filter(
      (item) =>
        item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [likedQuotes, searchTerm]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen w-full text-white px-4 py-8 md:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 25%, #2d2d2d 50%, #1a1a1a 75%, #0a0a0a 100%)' }}>
      <div className="pointer-events-none fixed w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)', left: `${mousePos.x - 192}px`, top: `${mousePos.y - 192}px`, transition: 'left 0.1s ease-out, top 0.1s ease-out', zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-cyan-400/20" animate={{ y: [0, -400, 0], x: [0, Math.sin(i) * 100, 0], opacity: [0, 0.8, 0] }} transition={{ duration: 15 + i * 2, repeat: Infinity, ease: 'linear' }} style={{ left: `${20 + i * 15}%`, top: `${Math.random() * 100}%` }} />
        ))}
      </div>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 mx-auto flex min-h-[90vh] w-full max-w-6xl flex-col rounded-3xl border border-gray-700/50 bg-gray-900/40 p-4 shadow-2xl backdrop-blur-md md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_30%)] rounded-3xl pointer-events-none" />
        <motion.div variants={itemVariants} className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Daily Motivation</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>One Quote, Infinite Possibilities</h1>
          </div>
          <div className="rounded-full border border-gray-600/50 bg-gray-800/60 px-3 py-2 text-sm text-gray-100 backdrop-blur-sm">❤️ Liked: <span className="font-semibold text-gray-300">{likedQuotes.length}</span></div>
        </motion.div>
        <motion.div variants={itemVariants} className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-gray-700/50 bg-gray-800/30 p-3 text-center backdrop-blur">
            <div className="flex items-center justify-center gap-1"><TrendingUp className="h-4 w-4 text-cyan-400" /><span className="text-2xl font-bold text-cyan-400">{viewCount}</span></div>
            <p className="mt-1 text-xs text-gray-400">Views Today</p>
          </div>
          <div className="rounded-2xl border border-gray-700/50 bg-gray-800/30 p-3 text-center backdrop-blur">
            <div className="flex items-center justify-center gap-1"><Calendar className="h-4 w-4 text-red-400" /><span className="text-2xl font-bold text-red-400">{dailyStreak}</span></div>
            <p className="mt-1 text-xs text-gray-400">Daily Streak</p>
          </div>
          <div className="rounded-2xl border border-gray-700/50 bg-gray-800/30 p-3 text-center backdrop-blur">
            <div className="flex items-center justify-center gap-1"><Heart className="h-4 w-4 text-pink-400" /><span className="text-2xl font-bold text-pink-400">{likedQuotes.length}</span></div>
            <p className="mt-1 text-xs text-gray-400">Favorites</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="relative mt-6 flex-1 rounded-3xl border border-gray-700/50 bg-gray-800/20 p-4 shadow-2xl backdrop-blur-lg md:p-6">
          <div className="absolute inset-0 rounded-3xl border border-gray-700/30 bg-gradient-to-br from-gray-800/10 via-gray-900/5 to-gray-900/5" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Good morning, champion.</p>
                <p className="text-gray-400 text-xs">Keep your focus. Keep creating.</p>
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={toggleLike} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition duration-300 ${isLiked ? 'bg-red-900/70 text-white shadow-lg shadow-red-900/40 hover:bg-red-900/90 hover:shadow-red-900/60' : 'bg-gray-700/40 text-gray-100 border border-gray-600/50 hover:bg-gray-700/70 hover:border-gray-500/70'}`}>
                <Heart className={`h-4 w-4 ${isLiked ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
                {isLiked ? 'Liked' : 'Like'}
              </motion.button>
            </div>
            <div className="mt-3 flex-1">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-700/50 bg-gray-800/20 p-5 text-center text-gray-400">
                    <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
                    <p className="text-sm text-gray-300">Fetching your next inspirational message…</p>
                  </motion.div>
                ) : quote ? (
                  <motion.div key={quote.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)' }} className="flex h-72 flex-col justify-between rounded-2xl border border-gray-600/50 bg-gray-800/40 p-6 transition-all duration-300 cursor-default hover:border-cyan-500/40 hover:bg-gray-800/60">
                    <blockquote className="text-3xl font-italic leading-tight text-gray-100 md:text-5xl" style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>"{quote.text}"</blockquote>
                    <p className="mt-4 text-right text-sm font-medium uppercase tracking-wider text-gray-400 md:text-base">— {quote.author}</p>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-gray-700/50 bg-gray-800/20 p-4 text-center text-gray-400">
                    <p className="italic text-gray-500">No quote yet. Click New Quote to start your day.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <motion.button whileHover={{ scale: 1.08, boxShadow: '0 20px 50px rgba(236, 72, 153, 0.5)' }} whileTap={{ scale: 0.94 }} onClick={fetchNewQuote} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-pink-600/30 transition duration-300 hover:shadow-2xl hover:shadow-pink-500/50 disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                New Quote
              </motion.button>
              {quote && (
                <>
                  <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} onClick={() => copyToClipboard(`"${quote.text}" — ${quote.author}`, quote.id)} className="inline-flex items-center gap-2 rounded-full border border-gray-600/50 bg-gray-700/30 px-3 py-2.5 text-xs font-semibold text-gray-100 transition duration-300 hover:bg-gray-700/60">
                    <Copy className="h-4 w-4" />
                    {copiedId === quote.id ? 'Copied!' : 'Copy'}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} onClick={shareQuote} className="inline-flex items-center gap-2 rounded-full border border-cyan-600/50 bg-cyan-900/20 px-3 py-2.5 text-xs font-semibold text-cyan-100 transition duration-300 hover:bg-cyan-900/40">
                    <Share2 className="h-4 w-4" />
                    Share
                  </motion.button>
                </>
              )}
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }} onClick={() => setQuote(null)} className="ml-auto rounded-full border border-gray-600/50 bg-gray-700/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gray-100 transition duration-300 hover:bg-gray-700/60 hover:border-gray-500/70">Reset</motion.button>
            </div>
            {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="mt-5 rounded-3xl border border-gray-700/50 bg-gray-900/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Favorites</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Saved Liked Quotes</h2>
            </div>
            <span className="rounded-full bg-gray-700/40 px-2 py-1 text-xs text-gray-200">{filteredQuotes.length} / {likedQuotes.length}</span>
          </div>
          {likedQuotes.length > 0 && (
            <motion.div variants={itemVariants} className="mb-3">
              <input type="text" placeholder="🔍 Search quotes or authors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-gray-600/50 bg-gray-800/40 px-3 py-2 text-sm text-white placeholder-gray-500 transition hover:border-cyan-600/50 focus:border-cyan-500 focus:outline-none" style={{ fontFamily: 'Poppins, sans-serif' }} />
            </motion.div>
          )}
          <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredQuotes.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="col-span-full rounded-2xl border border-dashed border-gray-700/50 bg-gray-800/20 p-4 text-center text-gray-400">
                  <p className="italic text-gray-500">{likedQuotes.length === 0 ? 'No liked quotes yet. Tap the heart on a quote to save it.' : 'No results found. Try a different search.'}</p>
                </motion.div>
              ) : (
                filteredQuotes.map((item, idx) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(20, 184, 166, 0.2)' }} className="relative rounded-2xl border border-gray-700/50 bg-gray-800/40 p-3 shadow-lg transition-all duration-300 hover:border-teal-500/40 hover:bg-gray-800/60">
                    <p className="text-sm text-gray-200">"{item.text}"</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-300">
                      <span className="font-semibold">— {item.author}</span>
                      <div className="flex gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => copyToClipboard(`"${item.text}" — ${item.author}`, item.id)} className="inline-flex items-center gap-1 rounded-md bg-cyan-900/30 px-1.5 py-1 text-cyan-300 transition duration-300 hover:bg-cyan-900/60">
                          <Copy className="h-3 w-3" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => removeQuote(item.id)} className="inline-flex items-center gap-1 rounded-md bg-red-900/30 px-1.5 py-1 text-red-300 transition duration-300 hover:bg-red-900/60">
                          <Trash2 className="h-3 w-3" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default App;
