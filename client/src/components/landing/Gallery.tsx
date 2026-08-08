import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Maximize2,
  Layers,
  ExternalLink,
} from 'lucide-react';

import apiClient from '../../api/axios';

export interface GalleryItem {
  _id: string;
  id?: string;
  title: string;
  url: string;
  type: 'Photo' | 'Video';
  seasonNumber: 1 | 2 | 3 | 4 | number;
  description?: string;
  createdAt?: string;
}

export const Gallery: React.FC = () => {
  // Season tabs (Season 1, Season 2, Season 3, Season 4)
  const [activeSeason, setActiveSeason] = useState<number | 'all'>(4);
  const [activeType, setActiveType] = useState<'all' | 'Photo' | 'Video'>('all');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Lightbox Modal State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch gallery media from GET /api/admin/gallery or public endpoint
  const fetchGalleryMedia = async (seasonParam?: number | 'all') => {
    setLoading(true);
    try {
      let queryUrl = '/v1/public/gallery';
      if (seasonParam && seasonParam !== 'all') {
        queryUrl += `?season=${seasonParam}`;
      }
      const res = await apiClient.get(queryUrl).catch(() => null);
      if (res && res.data && res.data.items && Array.isArray(res.data.items)) {
        setItems(res.data.items);
      } else {
        // Fallback to GET /api/admin/gallery
        const token = localStorage.getItem('token');
        const fetchRes = await fetch('/api/admin/gallery', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => null);
        if (fetchRes && fetchRes.ok) {
          const data = await fetchRes.json();
          if (data.items && Array.isArray(data.items)) {
            setItems(data.items);
          } else {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch gallery items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryMedia(activeSeason);
  }, [activeSeason]);

  // Filter items based on active season tab and media type
  const filteredItems = items.filter((item) => {
    const matchesSeason = activeSeason === 'all' || item.seasonNumber === activeSeason;
    const matchesType = activeType === 'all' || item.type === activeType;
    return matchesSeason && matchesType;
  });

  // Lightbox navigation handlers
  const handlePrevLightbox = useCallback(() => {
    if (lightboxIndex !== null && filteredItems.length > 0) {
      setLightboxIndex((prev) => (prev === null || prev === 0 ? filteredItems.length - 1 : prev - 1));
    }
  }, [lightboxIndex, filteredItems.length]);

  const handleNextLightbox = useCallback(() => {
    if (lightboxIndex !== null && filteredItems.length > 0) {
      setLightboxIndex((prev) => (prev === null || prev === filteredItems.length - 1 ? 0 : prev + 1));
    }
  }, [lightboxIndex, filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') handlePrevLightbox();
      if (e.key === 'ArrowRight') handleNextLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handlePrevLightbox, handleNextLightbox]);

  const currentItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <section id="gallery" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-carnival-gold/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-carnival-amber/20 to-carnival-crimson/20 border border-amber-500/40 dark:border-carnival-gold/40 text-amber-700 dark:text-carnival-gold text-xs font-mono font-extrabold shadow-sm dark:shadow-neon-gold">
          <Sparkles className="w-4 h-4 text-amber-500 dark:text-carnival-gold" />
          <span>CWC MEDIA VAULT & MEMORIES</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Carnival <span className="text-gradient-carnival">Gallery</span>
        </h2>

        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-sans">
          Relive unforgettable highlights, code arena battles, keynotes, and victory moments across all four seasons of Code With Curious.
        </p>
      </div>

      {/* Tabbed Navigation Filtering (Task 4 requirement: Season 1, Season 2, Season 3, Season 4) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl glass-card bg-white/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-2xl">
        {/* Season Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 1, label: 'Season 1 🚀' },
            { id: 2, label: 'Season 2 🏆' },
            { id: 3, label: 'Season 3 ✨' },
            { id: 4, label: 'Season 4 🎪', badge: 'Current' },
            { id: 'all', label: 'All Seasons 🌟' },
          ].map((tab) => {
            const isActive = activeSeason === tab.id;
            return (
              <button
                key={String(tab.id)}
                onClick={() => {
                  setActiveSeason(tab.id as any);
                  setLightboxIndex(null);
                }}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-carnival-gold via-carnival-amber to-carnival-crimson text-slate-950 shadow-neon-gold scale-105 font-black'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950/80 text-carnival-gold font-mono uppercase">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Media Type Filter Pills */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-xs w-full md:w-auto justify-center sm:justify-end">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeType === 'all' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Media
          </button>
          <button
            onClick={() => setActiveType('Photo')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeType === 'Photo'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-carnival-cyan font-bold border border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos</span>
          </button>
          <button
            onClick={() => setActiveType('Video')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeType === 'Video'
                ? 'bg-rose-500/20 text-rose-700 dark:text-carnival-crimson font-bold border border-rose-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Videos</span>
          </button>
        </div>
      </div>

      {/* Responsive CSS Masonry Grid (Task 4 requirement) */}
      {filteredItems.length === 0 ? (
        <div className="p-16 text-center rounded-3xl glass-card bg-white/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
          <Layers className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-slate-900 dark:text-white font-bold text-lg">No media items in this season tab</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Switch tabs above to view photos and videos from other seasons.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id || item.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => setLightboxIndex(index)}
              className="break-inside-avoid glass-card bg-white/90 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden group cursor-pointer hover:border-amber-500/60 dark:hover:border-carnival-gold/60 transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between"
            >
              {/* Media Preview Container */}
              <div className="relative bg-slate-950 overflow-hidden">
                {item.type === 'Photo' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                ) : item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                  <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center">
                    <iframe
                      src={item.url}
                      title={item.title}
                      className="w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-carnival-crimson text-white flex items-center justify-center shadow-neon-crimson group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 fill-white translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-video bg-gradient-to-tr from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-carnival-crimson text-white flex items-center justify-center shadow-neon-crimson group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 fill-white translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlaid Season & Type Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-carnival-gold/40 text-carnival-gold font-mono text-[10px] font-bold shadow-lg">
                    Season {item.seasonNumber}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg backdrop-blur-md font-mono text-[10px] font-bold shadow-lg ${
                      item.type === 'Photo' ? 'bg-carnival-cyan/80 text-slate-950' : 'bg-carnival-crimson/80 text-white'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                {/* Expand Indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-carnival-gold border border-carnival-gold/40 shadow-lg">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Title & Description Footer */}
              <div className="p-5 space-y-2 relative bg-white dark:bg-slate-950/40 border-t border-slate-200 dark:border-white/5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug group-hover:text-amber-600 dark:group-hover:text-carnival-gold transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-sans line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-amber-600 dark:text-carnival-gold/80">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500 dark:text-carnival-gold" />
                    Click for Lightbox View
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">Season {item.seasonNumber}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Task 4 Lightbox Effect Modal */}
      <AnimatePresence>
        {currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B0A16]/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Expanded Full-screen Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[90vh] glass-card rounded-3xl border border-carnival-gold/50 shadow-2xl overflow-hidden flex flex-col justify-between bg-slate-950"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Carnival-themed Header with Close Button */}
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-3 pr-4">
                  <span className="px-3 py-1 rounded-xl bg-carnival-gold/20 text-carnival-gold font-mono text-xs font-bold border border-carnival-gold/40">
                    Season {currentItem.seasonNumber}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-xl font-mono text-xs font-bold ${
                      currentItem.type === 'Photo'
                        ? 'bg-carnival-cyan/20 text-carnival-cyan border border-carnival-cyan/40'
                        : 'bg-carnival-crimson/20 text-carnival-crimson border border-carnival-crimson/40'
                    }`}
                  >
                    {currentItem.type}
                  </span>
                  <h3 className="font-extrabold text-white text-sm sm:text-lg truncate hidden sm:block">
                    {currentItem.title}
                  </h3>
                </div>

                {/* Carnival-themed Close Button */}
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2.5 rounded-xl bg-carnival-crimson/20 hover:bg-carnival-crimson text-carnival-crimson hover:text-white border border-carnival-crimson/50 transition-all cursor-pointer shadow-neon-crimson flex items-center gap-1.5 font-mono text-xs font-bold"
                  title="Close Lightbox (ESC)"
                >
                  <X className="w-5 h-5" />
                  <span className="hidden sm:inline">Close 🎪</span>
                </button>
              </div>

              {/* Lightbox Main Media Container */}
              <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 bg-black min-h-[300px] sm:min-h-[450px]">
                {/* Previous Media Arrow */}
                <button
                  onClick={handlePrevLightbox}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-carnival-gold text-slate-200 hover:text-slate-950 border border-white/20 transition-all shadow-2xl cursor-pointer"
                  title="Previous Media"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[3]" />
                </button>

                {/* Next Media Arrow */}
                <button
                  onClick={handleNextLightbox}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-carnival-gold text-slate-200 hover:text-slate-950 border border-white/20 transition-all shadow-2xl cursor-pointer"
                  title="Next Media"
                >
                  <ChevronRight className="w-6 h-6 stroke-[3]" />
                </button>

                {/* Expanded Photo or Video */}
                {currentItem.type === 'Photo' ? (
                  <img
                    src={currentItem.url}
                    alt={currentItem.title}
                    className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                  />
                ) : currentItem.url.includes('youtube.com') || currentItem.url.includes('youtu.be') ? (
                  <iframe
                    src={currentItem.url.includes('autoplay') ? currentItem.url : `${currentItem.url}?autoplay=1`}
                    title={currentItem.title}
                    className="w-full h-[55vh] rounded-xl shadow-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={currentItem.url}
                    controls
                    autoPlay
                    className="max-h-[65vh] w-auto max-w-full rounded-xl shadow-2xl"
                  />
                )}
              </div>

              {/* Lightbox Footer Details */}
              <div className="p-4 sm:p-6 border-t border-white/10 bg-slate-900/90 space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-white text-base sm:text-lg">{currentItem.title}</h4>
                    {currentItem.description && (
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                        {currentItem.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                    <span>
                      {(lightboxIndex ?? 0) + 1} of {filteredItems.length}
                    </span>

                    <a
                      href={currentItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-carnival-gold hover:text-white border border-carnival-gold/30 transition-all flex items-center gap-1.5"
                    >
                      <span>Full Quality</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
