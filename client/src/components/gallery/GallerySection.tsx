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
  Calendar,
  Layers,
  ExternalLink,
  Film,
} from 'lucide-react';

import apiClient from '../../api/axios';

export interface PublicGalleryItem {
  _id: string;
  id?: string;
  title: string;
  url: string;
  type: 'Photo' | 'Video';
  seasonNumber: number;
  description?: string;
  createdAt?: string;
}

const FALLBACK_PUBLIC_GALLERY: PublicGalleryItem[] = [
  // Season 4 items
  {
    _id: 's4-1',
    title: 'CWC Season 4 Carnival Opening Gala & Stage Show',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    type: 'Photo',
    seasonNumber: 4,
    description: 'Ringmasters and student teams kicking off Code With Curious Season 4 under the grand carnival marquee.',
  },
  {
    _id: 's4-2',
    title: 'Mid-Season Arena Boss Fight Highlights',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    type: 'Video',
    seasonNumber: 4,
    description: 'High-speed live coding combat where top teams fought for immunity and bonus points.',
  },
  {
    _id: 's4-3',
    title: 'Night Arena Glassmorphism Hackathon',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    type: 'Photo',
    seasonNumber: 4,
    description: 'Student developers crafting vibrant carnival interfaces during the 24-hour design sprint.',
  },
  {
    _id: 's4-4',
    title: 'Ringmaster Live Keynote & Tournament Briefing',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    type: 'Photo',
    seasonNumber: 4,
    description: 'Announcing rulebook updates and task schedules for Season 4 arena participants.',
  },

  // Season 3 items
  {
    _id: 's3-1',
    title: 'Season 3 Cyber Circus Night Arena',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    type: 'Photo',
    seasonNumber: 3,
    description: 'Electric neon lights and algorithm battlegrounds during Season 3.',
  },
  {
    _id: 's3-2',
    title: 'Season 3 Grand Champion Trophy Reveal',
    url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1200&q=80',
    type: 'Photo',
    seasonNumber: 3,
    description: 'Unveiling the customized neon gold trophy for the Season 3 winning team.',
  },
  {
    _id: 's3-3',
    title: 'Season 3 Code Sprints & Team Mentorship',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    type: 'Photo',
    seasonNumber: 3,
    description: 'Mentors guiding student teams through complex system architectures.',
  },

  // Season 2 items
  {
    _id: 's2-1',
    title: 'Season 2 Finale Celebrations & Award Ceremony',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    type: 'Photo',
    seasonNumber: 2,
    description: 'Confetti explosion as team ByteBusters claimed victory in Season 2.',
  },
  {
    _id: 's2-2',
    title: 'Season 2 Rapid Fire Challenge Sprints',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    type: 'Photo',
    seasonNumber: 2,
    description: 'Intense 30-minute bug fixing rounds that decided leaderboard rankings.',
  },

  // Season 1 items
  {
    _id: 's1-1',
    title: 'Season 1 Inception Hackathon & Inaugural Meet',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    type: 'Photo',
    seasonNumber: 1,
    description: 'The foundation of Code With Curious carnival gaming culture.',
  },
  {
    _id: 's1-2',
    title: 'Season 1 Pioneer Teams Group Photo',
    url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
    type: 'Photo',
    seasonNumber: 1,
    description: 'Our inaugural batch of student coders and event organizers.',
  },
];

export const GallerySection: React.FC = () => {
  const [activeSeason, setActiveSeason] = useState<number | 'all'>(4);
  const [activeType, setActiveType] = useState<'all' | 'Photo' | 'Video'>('all');
  const [items, setItems] = useState<PublicGalleryItem[]>(FALLBACK_PUBLIC_GALLERY);
  const [loading, setLoading] = useState(false);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch from public backend API
  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/v1/public/gallery');
      if (response.data && response.data.items && response.data.items.length > 0) {
        setItems(response.data.items);
      }
    } catch (err) {
      console.warn('Backend API connection offline, displaying curated carnival gallery fallback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Filter items based on active season tab and media type
  const filteredItems = items.filter((item) => {
    const matchesSeason = activeSeason === 'all' || item.seasonNumber === activeSeason;
    const matchesType = activeType === 'all' || item.type === activeType;
    return matchesSeason && matchesType;
  });

  // Lightbox Navigation Handlers
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

  // Keyboard navigation for Lightbox (ESC, Left, Right)
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
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-carnival-gold/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-carnival-gold/20 via-carnival-amber/20 to-carnival-crimson/20 border border-carnival-gold/40 text-carnival-gold text-xs font-mono font-extrabold shadow-neon-gold">
          <Sparkles className="w-4 h-4 text-carnival-gold" />
          <span>CWC MEDIA VAULT & MEMORIES</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Carnival <span className="text-gradient-carnival">Gallery</span>
        </h2>

        <p className="text-slate-300 text-sm sm:text-base font-sans">
          Relive unforgettable highlights, code arena battles, keynotes, and victory moments across all four seasons of Code With Curious.
        </p>
      </div>

      {/* Filter and Tab Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl glass-card border border-white/10 shadow-2xl">
        {/* Season Tabs (Task 4 requirement: Season 1, Season 2, Season 3, Season 4) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 4, label: 'Season 4 🎪', badge: 'Current' },
            { id: 3, label: 'Season 3 ✨' },
            { id: 2, label: 'Season 2 🏆' },
            { id: 1, label: 'Season 1 🚀' },
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
                    ? 'bg-gradient-to-r from-carnival-gold via-carnival-amber to-carnival-crimson text-slate-950 shadow-neon-gold scale-105'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
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

        {/* Media Type Filters: Photo / Video */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs w-full md:w-auto justify-center sm:justify-end">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeType === 'all' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Media ({items.length})
          </button>
          <button
            onClick={() => setActiveType('Photo')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeType === 'Photo' ? 'bg-carnival-cyan/20 text-carnival-cyan font-bold border border-carnival-cyan/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos</span>
          </button>
          <button
            onClick={() => setActiveType('Video')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeType === 'Video' ? 'bg-carnival-crimson/20 text-carnival-crimson font-bold border border-carnival-crimson/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Videos</span>
          </button>
        </div>
      </div>

      {/* Responsive Masonry Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-16 text-center rounded-3xl glass-card border border-white/10 space-y-3">
          <Layers className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-white font-bold text-lg">No gallery items in this filter</h3>
          <p className="text-xs text-slate-400">Switch tabs above to view media from other seasons.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id || item.id || index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => setLightboxIndex(index)}
              className="glass-card rounded-2xl border border-white/10 overflow-hidden group cursor-pointer hover:border-carnival-gold/60 transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between"
            >
              {/* Media Aspect Container */}
              <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                {item.type === 'Photo' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                ) : item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                  <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
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
                  <div className="relative w-full h-full bg-gradient-to-tr from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
                    <img src={item.url} crossOrigin="anonymous" alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-carnival-crimson text-white flex items-center justify-center shadow-neon-crimson group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 fill-white translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlaid Badges */}
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

                {/* Expand / Lightbox Hover Indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-carnival-gold border border-carnival-gold/40 shadow-lg">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Gradient Hover Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
              </div>

              {/* Title & Description Footer */}
              <div className="p-5 space-y-2 relative bg-slate-950/40 border-t border-white/5">
                <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-carnival-gold transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-carnival-gold/80">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-carnival-gold" />
                    Click for Lightbox View
                  </span>
                  <span className="text-slate-400">CWC Gallery</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Interactive Lightbox Modal */}
      <AnimatePresence>
        {currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B0A16]/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Modal Content Window */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[90vh] glass-card rounded-3xl border border-carnival-gold/50 shadow-2xl overflow-hidden flex flex-col justify-between bg-slate-950"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox Header Bar */}
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
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

                {/* Close Button */}
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                  title="Close Lightbox (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lightbox Media Body Viewport */}
              <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 bg-black min-h-[300px] sm:min-h-[450px]">
                {/* Previous Button */}
                <button
                  onClick={handlePrevLightbox}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-carnival-gold text-slate-200 hover:text-slate-950 border border-white/20 transition-all shadow-2xl cursor-pointer"
                  title="Previous Media (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[3]" />
                </button>

                {/* Next Button */}
                <button
                  onClick={handleNextLightbox}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-carnival-gold text-slate-200 hover:text-slate-950 border border-white/20 transition-all shadow-2xl cursor-pointer"
                  title="Next Media (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6 stroke-[3]" />
                </button>

                {/* Media Element */}
                {currentItem.type === 'Photo' ? (
                  <img
                    src={currentItem.url}
                    alt={currentItem.title}
                    crossOrigin="anonymous"
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

              {/* Lightbox Footer Bar */}
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
                      <span>Full Resolution</span>
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
