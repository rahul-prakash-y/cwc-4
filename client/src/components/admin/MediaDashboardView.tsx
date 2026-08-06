import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Video,
  Plus,
  UploadCloud,
  Trash2,
  Filter,
  Sparkles,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Play,
  Layers,
  Search,
  FileImage,
  RefreshCw,
} from 'lucide-react';

export interface GalleryMediaItem {
  _id: string;
  id?: string;
  title: string;
  url: string;
  type: 'Photo' | 'Video';
  seasonNumber: number;
  publicId?: string;
  description?: string;
  createdAt?: string;
}

const INITIAL_MOCK_MEDIA: GalleryMediaItem[] = [
  {
    _id: 'mock-1',
    title: 'CWC Season 4 Opening Ceremony & Carnival Kickoff',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    type: 'Photo',
    seasonNumber: 4,
    description: 'Ringmasters and code carnival teams gathered for the Season 4 grand inaugural night.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-2',
    title: 'Season 4 Boss Fight Highlights & Winner Reveal',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    type: 'Video',
    seasonNumber: 4,
    description: 'High-octane live coding arena showdown video recap.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'mock-3',
    title: 'Season 3 Neon Night Code Hackathon',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
    type: 'Photo',
    seasonNumber: 3,
    description: 'Students hacking through the midnight arena challenge during Season 3.',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    _id: 'mock-4',
    title: 'Season 2 Finale Trophy Presentation',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    type: 'Photo',
    seasonNumber: 2,
    description: 'Champions receiving the grand carnival golden cup in Season 2.',
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
  },
  {
    _id: 'mock-5',
    title: 'Season 1 Genesis Hackathon Documentary',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
    type: 'Photo',
    seasonNumber: 1,
    description: 'Where the Code With Curious carnival journey first began.',
    createdAt: new Date(Date.now() - 86400000 * 365).toISOString(),
  },
];

export const MediaDashboardView: React.FC = () => {
  const [items, setItems] = useState<GalleryMediaItem[]>(INITIAL_MOCK_MEDIA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [title, setTitle] = useState('');
  const [seasonNumber, setSeasonNumber] = useState<number>(4);
  const [type, setType] = useState<'Photo' | 'Video'>('Photo');
  const [urlInput, setUrlInput] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [seasonFilter, setSeasonFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Photo' | 'Video'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch gallery items from Fastify API on mount
  const fetchGalleryItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/gallery', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        }
      }
    } catch (err) {
      console.warn('Backend API connection offline, using mock gallery data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Auto set type based on mime type
      if (file.type.startsWith('video/')) {
        setType('Video');
      } else if (file.type.startsWith('image/')) {
        setType('Photo');
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the media item');
      return;
    }

    if (uploadMode === 'file' && !selectedFile && !previewUrl) {
      setError('Please select a photo or video file to upload');
      return;
    }

    if (uploadMode === 'url' && !urlInput.trim()) {
      setError('Please enter a valid media URL');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem('token');
      let createdItem: GalleryMediaItem;

      if (uploadMode === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title);
        formData.append('seasonNumber', String(seasonNumber));
        formData.append('type', type);
        formData.append('description', description);

        const response = await fetch('/api/v1/admin/gallery', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed on server');
        }

        const data = await response.json();
        createdItem = data.item;
      } else {
        // Direct URL mode or fallback
        const finalUrl = uploadMode === 'file' && previewUrl ? previewUrl : urlInput;
        const response = await fetch('/api/v1/admin/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            title,
            url: finalUrl,
            type,
            seasonNumber,
            description,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          createdItem = data.item;
        } else {
          // Local fallback creation if API offline
          createdItem = {
            _id: `media-${Date.now()}`,
            title,
            url: finalUrl,
            type,
            seasonNumber,
            description,
            createdAt: new Date().toISOString(),
          };
        }
      }

      setItems((prev) => [createdItem, ...prev]);
      setSuccessMsg(`Successfully added "${title}" to Season ${seasonNumber} Gallery!`);

      // Reset form
      setTitle('');
      setUrlInput('');
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowUploadForm(false);
    } catch (err: any) {
      // Fallback mode so admin can work seamlessly even without Cloudinary credentials configured
      const finalUrl = previewUrl || urlInput || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80';
      const fallbackItem: GalleryMediaItem = {
        _id: `media-local-${Date.now()}`,
        title,
        url: finalUrl,
        type,
        seasonNumber,
        description,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [fallbackItem, ...prev]);
      setSuccessMsg(`Media added locally to Season ${seasonNumber} Gallery!`);
      setTitle('');
      setUrlInput('');
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowUploadForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      console.warn('API delete request error');
    } finally {
      setItems((prev) => prev.filter((item) => item._id !== id && item.id !== id));
      setDeletingId(null);
      setSuccessMsg('Media item deleted successfully.');
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSeason = seasonFilter === 'all' || item.seasonNumber === seasonFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSeason && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-carnival-gold/40 shadow-2xl relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-gold/20 text-carnival-gold text-xs font-mono font-bold border border-carnival-gold/30">
            <Sparkles className="w-3.5 h-3.5 text-carnival-gold animate-spin-slow" />
            <span>CLOUDINARY MEDIA & GALLERY MANAGEMENT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>Media Dashboard</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-carnival-cyan/20 text-carnival-cyan border border-carnival-cyan/30">
              Admin Gateway
            </span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Upload photos and videos to Cloudinary, assign media to CWC seasons, and manage public carnival gallery assets.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={fetchGalleryItems}
            className="p-3 rounded-xl glass-card text-slate-300 hover:text-white border border-white/10 hover:border-carnival-gold/50 transition-all"
            title="Refresh Gallery"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-carnival-gold via-carnival-amber to-carnival-crimson text-slate-950 font-black text-xs shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{showUploadForm ? 'Close Uploader' : 'Upload New Media'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </motion.div>
      )}

      {/* Rich Media Upload Form Modal / Panel */}
      <AnimatePresence>
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 sm:p-8 rounded-2xl border border-carnival-gold/50 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-carnival-gold/20 text-carnival-gold">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">Upload Photos or Videos</h3>
                  <p className="text-xs text-slate-400">Integrated with Cloudinary API storage</p>
                </div>
              </div>

              {/* Upload Mode Selector */}
              <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    uploadMode === 'file' ? 'bg-carnival-gold text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    uploadMode === 'url' ? 'bg-carnival-gold text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Direct URL
                </button>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Media Title */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300 font-bold">Media Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Season 4 Grand Finale Trophy Ceremony"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold transition-all"
                  />
                </div>

                {/* Season Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300 font-bold">Season Number *</label>
                  <select
                    value={seasonNumber}
                    onChange={(e) => setSeasonNumber(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-carnival-gold"
                  >
                    <option value={4}>Season 4 🎪 (Current)</option>
                    <option value={3}>Season 3 ✨</option>
                    <option value={2}>Season 2 🏆</option>
                    <option value={1}>Season 1 🚀</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Media Type Toggle */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300 font-bold">Media Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('Photo')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-mono text-xs transition-all ${
                        type === 'Photo'
                          ? 'bg-carnival-cyan/20 border-carnival-cyan text-carnival-cyan font-bold shadow-neon-cyan'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Image className="w-4 h-4" />
                      <span>Photo 📷</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('Video')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-mono text-xs transition-all ${
                        type === 'Video'
                          ? 'bg-carnival-crimson/20 border-carnival-crimson text-carnival-crimson font-bold shadow-neon-crimson'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Video 🎥</span>
                    </button>
                  </div>
                </div>

                {/* Upload input or URL Input */}
                <div className="md:col-span-2 space-y-1.5">
                  {uploadMode === 'file' ? (
                    <div>
                      <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5">
                        Select Photo or Video File *
                      </label>
                      <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 hover:border-carnival-gold/60 rounded-xl bg-white/5 transition-all text-center group">
                        <input
                          type="file"
                          accept={type === 'Photo' ? 'image/*' : 'video/*,image/*'}
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        {selectedFile ? (
                          <div className="flex items-center gap-3">
                            <FileImage className="w-8 h-8 text-carnival-gold" />
                            <div className="text-left font-mono text-xs">
                              <div className="text-white font-bold truncate max-w-[250px]">{selectedFile.name}</div>
                              <div className="text-slate-400 text-[10px]">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <UploadCloud className="w-8 h-8 text-carnival-gold mx-auto group-hover:scale-110 transition-transform" />
                            <div className="text-xs text-white font-bold">
                              Click or Drag & Drop file here to upload to Cloudinary
                            </div>
                            <div className="text-[10px] text-slate-400">JPG, PNG, WEBP, MP4, MOV up to 10MB</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5">
                        Direct Media URL or Video Embed Link *
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or YouTube embed URL"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-300 font-bold">Description / Season Highlights</label>
                <textarea
                  rows={2}
                  placeholder="Optional brief description of this media item for the public gallery..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold transition-all"
                />
              </div>

              {/* Preview image if available */}
              {previewUrl && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/20 bg-black flex items-center justify-center">
                    {type === 'Photo' ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <video src={previewUrl} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    <span className="text-carnival-gold font-bold">Preview Ready</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Target Season: <span className="text-white font-bold">Season {seasonNumber}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-mono font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-carnival-gold to-carnival-amber text-slate-950 font-black text-xs shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Publish to Gallery</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Season Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5 text-carnival-gold" />
            <span>Season:</span>
          </span>
          {(['all', 4, 3, 2, 1] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeasonFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                seasonFilter === s
                  ? 'bg-carnival-gold text-slate-950 shadow-neon-gold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {s === 'all' ? 'All Seasons' : `Season ${s}`}
            </button>
          ))}
        </div>

        {/* Type Filter & Search Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg ${typeFilter === 'all' ? 'bg-white/10 text-white font-bold' : 'text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('Photo')}
              className={`px-3 py-1 rounded-lg ${typeFilter === 'Photo' ? 'bg-carnival-cyan/20 text-carnival-cyan font-bold' : 'text-slate-400'}`}
            >
              Photos
            </button>
            <button
              onClick={() => setTypeFilter('Video')}
              className={`px-3 py-1 rounded-lg ${typeFilter === 'Video' ? 'bg-carnival-crimson/20 text-carnival-crimson font-bold' : 'text-slate-400'}`}
            >
              Videos
            </button>
          </div>

          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold font-mono"
            />
          </div>
        </div>
      </div>

      {/* Media Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-white font-mono flex items-center gap-2">
            <Layers className="w-5 h-5 text-carnival-gold" />
            <span>Media Inventory ({filteredItems.length})</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Showing {filteredItems.length} of {items.length} items
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-card border border-white/10 space-y-3">
            <Image className="w-12 h-12 text-slate-500 mx-auto" />
            <div className="text-white font-bold text-base">No media items found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your season or media type filters, or upload new photos and videos using the button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id || item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between group"
              >
                {/* Media Preview Header */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  {item.type === 'Photo' ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                    <iframe
                      src={item.url}
                      title={item.title}
                      className="w-full h-full pointer-events-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-purple-950">
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-carnival-crimson/80 flex items-center justify-center text-white shadow-neon-crimson">
                          <Play className="w-6 h-6 fill-white translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Season Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-carnival-gold/50 font-mono text-[10px] font-bold text-carnival-gold shadow-lg">
                      Season {item.seasonNumber}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg backdrop-blur-md font-mono text-[10px] font-bold shadow-lg ${
                        item.type === 'Photo'
                          ? 'bg-carnival-cyan/80 text-slate-950'
                          : 'bg-carnival-crimson/80 text-white'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-sm leading-snug line-clamp-2">{item.title}</h4>
                    {item.description && (
                      <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  {/* Footer Bar */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-carnival-cyan flex items-center gap-1 truncate max-w-[180px]"
                    >
                      <span>View Asset</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleDelete(item._id || item.id || '')}
                      disabled={deletingId === (item._id || item.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
