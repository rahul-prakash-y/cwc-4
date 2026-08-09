import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Video as VideoIcon,
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
  Table as TableIcon,
  Grid as GridIcon,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface GalleryMediaItem {
  _id: string;
  id?: string;
  title: string;
  url: string;
  type: 'Photo' | 'Video';
  seasonNumber: 1 | 2 | 3 | 4 | number;
  publicId?: string;
  description?: string;
  createdAt?: string;
}

export const Media: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();

  const [items, setItems] = useState<GalleryMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [title, setTitle] = useState('');
  const [seasonNumber, setSeasonNumber] = useState<number>(4);
  const [type, setType] = useState<'Photo' | 'Video'>('Photo');
  const [urlInput, setUrlInput] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [seasonFilter, setSeasonFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Photo' | 'Video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch gallery items from API
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/gallery', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch (err) {
      console.warn('Failed to fetch media list:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Drag and Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      if (file.type.startsWith('video/')) {
        setType('Video');
      } else {
        setType('Photo');
      }
    }
  }, []);

  // Task 3: Enforce strict SuperAdmin guard on Media Management page
  if (!isSuperAdmin && user?.role !== 'superadmin') {
    return (
      <div className="max-w-4xl mx-auto p-6 sm:p-12 my-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 sm:p-12 border-2 border-rose-500/40 shadow-2xl text-center space-y-6 bg-slate-950/90 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-neon-crimson">
            <ShieldAlert className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30 uppercase tracking-widest">
              Access Restricted
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-display">
              SuperAdmin Privileges Required
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Gallery media management (uploading, editing, and deleting photo/video assets) is strictly restricted to <span className="text-cwc-gold font-bold font-mono">SuperAdmin</span> accounts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 font-mono text-xs text-slate-400 max-w-md mx-auto flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Current Role: <strong className="text-white uppercase">{user?.role || 'Guest'}</strong> (Standard Admin)</span>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      if (file.type.startsWith('video/')) {
        setType('Video');
      } else {
        setType('Photo');
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Media title is required.');
      return;
    }

    if (uploadMode === 'file' && !selectedFile && !previewUrl) {
      setError('Please select or drop a media file to upload.');
      return;
    }

    if (uploadMode === 'url' && !urlInput.trim()) {
      setError('Please enter a valid media URL.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem('token');
      let newItem: GalleryMediaItem;

      if (uploadMode === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title);
        formData.append('seasonNumber', String(seasonNumber));
        formData.append('type', type);
        formData.append('description', description);

        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newItem = data.item;
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Upload error from server');
        }
      } else {
        const finalUrl = uploadMode === 'file' && previewUrl ? previewUrl : urlInput;
        const res = await fetch('/api/admin/gallery', {
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

        if (res.ok) {
          const data = await res.json();
          newItem = data.item;
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to save media URL');
        }
      }

      setItems((prev) => [newItem, ...prev]);
      setSuccessMsg(`Media "${title}" added to Season ${seasonNumber} successfully!`);
      setTitle('');
      setUrlInput('');
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowUploadModal(false);
    } catch (err: any) {
      setError(err.message || 'Media upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this media item?')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item._id !== id && item.id !== id));
        setSuccessMsg('Media asset removed successfully.');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to delete media asset');
      }
    } catch (err) {
      setError('Error deleting media asset.');
    } finally {
      setDeletingId(null);
    }
  };

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
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-carnival-gold/40 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-gold/20 text-carnival-gold text-xs font-mono font-bold border border-carnival-gold/30">
            <Sparkles className="w-3.5 h-3.5 text-carnival-gold" />
            <span>SUPERADMIN MEDIA COMMAND CENTER</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>SuperAdmin Media Management</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/30">
              Season 1 - 4
            </span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Drag and drop images and videos to upload directly to Cloudinary, assign to seasons, and manage gallery assets.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={fetchItems}
            className="p-3 rounded-xl glass-card text-slate-300 hover:text-white border border-white/10 hover:border-carnival-gold/50 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowUploadModal(!showUploadModal)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-carnival-gold via-carnival-amber to-carnival-crimson text-slate-950 font-black text-xs shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{showUploadModal ? 'Close Form' : 'Upload Media'}</span>
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

      {/* Drag & Drop Upload Modal / Interface */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 sm:p-8 rounded-2xl border border-carnival-gold/50 shadow-2xl space-y-6 bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/30">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">Upload New Media Asset</h3>
                  <p className="text-xs text-slate-400">Drag & drop photos or videos directly into Cloudinary CDN</p>
                </div>
              </div>

              <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    uploadMode === 'file' ? 'bg-carnival-gold text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    uploadMode === 'url' ? 'bg-carnival-gold text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  URL Input
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

                {/* Season Selection Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300 font-bold">Season Number *</label>
                  <select
                    value={seasonNumber}
                    onChange={(e) => setSeasonNumber(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-[#130E26] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-carnival-gold"
                  >
                    <option value={4}>Season 4 🎪 (Current)</option>
                    <option value={3}>Season 3 ✨</option>
                    <option value={2}>Season 2 🏆</option>
                    <option value={1}>Season 1 🚀</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Media Type Dropdown / Toggle */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-300 font-bold">Media Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Photo' | 'Video')}
                    className="w-full px-4 py-3 rounded-xl bg-[#130E26] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-carnival-gold"
                  >
                    <option value="Photo">Photo 📷</option>
                    <option value="Video">Video 🎥</option>
                  </select>
                </div>

                {/* Drag and Drop Container */}
                <div className="md:col-span-2 space-y-1.5">
                  {uploadMode === 'file' ? (
                    <div>
                      <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5">
                        Drag & Drop Media File *
                      </label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all text-center group cursor-pointer ${
                          isDragging
                            ? 'border-carnival-gold bg-carnival-gold/10 scale-[1.01]'
                            : 'border-white/20 hover:border-carnival-gold/60 bg-white/5'
                        }`}
                      >
                        <input
                          type="file"
                          accept={type === 'Photo' ? 'image/*' : 'video/*,image/*'}
                          onChange={handleFileInputChange}
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
                              Drag and drop photo or video file here, or click to browse
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Cloudinary direct upload • Supports JPG, PNG, WEBP, MP4, MOV
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5">
                        Direct Media URL *
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or video link"
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
                <label className="block text-xs font-mono text-slate-300 font-bold">Description / Caption</label>
                <textarea
                  rows={2}
                  placeholder="Optional brief media description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold transition-all"
                />
              </div>

              {/* Submit Controls */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
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
                      <span>Upload Asset</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar & View Mode Selector */}
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

        {/* View Mode (Grid / Data Table) & Search Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-carnival-gold text-slate-950 font-bold' : 'text-slate-400'}`}
              title="Grid View"
            >
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-carnival-gold text-slate-950 font-bold' : 'text-slate-400'}`}
              title="Data Table View"
            >
              <TableIcon className="w-4 h-4" />
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

      {/* Render Assets View (Grid or Data Table with Delete Button) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-white font-mono flex items-center gap-2">
            <Layers className="w-5 h-5 text-carnival-gold" />
            <span>Uploaded Assets ({filteredItems.length})</span>
          </h3>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-16 text-center rounded-3xl glass-card border border-white/10 space-y-4 bg-slate-950/60">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center mx-auto">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold text-lg font-mono">No gallery media uploaded yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No items found for the selected season filter. Click the "Upload Media" button above to add media assets to the database.
              </p>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* Data Table View */
          <div className="overflow-x-auto rounded-2xl glass-card border border-white/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 font-mono text-xs text-carnival-gold">
                  <th className="p-4">Preview</th>
                  <th className="p-4">Title & Description</th>
                  <th className="p-4">Season</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-sans">
                {filteredItems.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-12 rounded-lg bg-black overflow-hidden border border-white/10 flex items-center justify-center">
                        {item.type === 'Photo' ? (
                          <img src={item.url} crossOrigin="anonymous" alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="relative w-full h-full bg-purple-950 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="font-bold text-white truncate">{item.title}</div>
                      {item.description && <div className="text-[11px] text-slate-400 truncate">{item.description}</div>}
                    </td>
                    <td className="p-4 font-mono">
                      <span className="px-2.5 py-1 rounded-md bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/30 font-bold">
                        Season {item.seasonNumber}
                      </span>
                    </td>
                    <td className="p-4 font-mono">
                      <span
                        className={`px-2.5 py-1 rounded-md font-bold ${
                          item.type === 'Photo' ? 'bg-carnival-cyan/20 text-carnival-cyan' : 'bg-carnival-crimson/20 text-carnival-crimson'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id || item.id || '')}
                        disabled={deletingId === (item._id || item.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-all font-mono text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id || item.id}
                layout
                className="glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  {item.type === 'Photo' ? (
                    <img src={item.url} crossOrigin="anonymous" alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-purple-950">
                      <img src={item.url} crossOrigin="anonymous" alt={item.title} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-carnival-crimson flex items-center justify-center text-white">
                          <Play className="w-5 h-5 fill-white translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-carnival-gold/50 font-mono text-[10px] text-carnival-gold font-bold">
                      Season {item.seasonNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${item.type === 'Photo' ? 'bg-carnival-cyan/80 text-slate-950' : 'bg-carnival-crimson/80 text-white'}`}>
                      {item.type}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{item.title}</h4>
                    {item.description && <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-carnival-gold hover:underline flex items-center gap-1">
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleDelete(item._id || item.id || '')}
                      disabled={deletingId === (item._id || item.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-all font-mono text-xs flex items-center gap-1 cursor-pointer"
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

export default Media;
