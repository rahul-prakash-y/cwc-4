import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Edit2, RefreshCw, GraduationCap, User, Phone, Mail, Building2, Plus, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface CoordinatorItem {
  _id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  type: string;
  order?: number;
}

export const CoordinatorsCMS: React.FC = () => {
  const { apiFetch } = useAuth();
  const [coordinators, setCoordinators] = useState<CoordinatorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSearchingEmail, setIsSearchingEmail] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Student Incharge',
    department: '',
    phone: '',
    email: '',
    type: 'Student Lead',
    order: 0,
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCoordinators = async () => {
    setLoading(true);
    try {
      let res = await apiFetch('/superadmin/coordinators');
      if (!res.ok) {
        res = await apiFetch('/admin/coordinators');
      }
      if (!res.ok) {
        res = await fetch('/api/public/coordinators');
      }
      if (res.ok) {
        const data = await res.json();
        setCoordinators(data.coordinators || []);
      }
    } catch (err) {
      console.error('Failed to fetch coordinators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const handleEmailChange = async (emailVal: string) => {
    setFormData((prev) => ({ ...prev, email: emailVal }));
    const trimmed = emailVal.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || trimmed.length < 5) return;

    try {
      setIsSearchingEmail(true);
      let res = await apiFetch(`/superadmin/lookup-user?email=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        res = await apiFetch(`/admin/lookup-user?email=${encodeURIComponent(trimmed)}`);
      }
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.name) {
          setFormData((prev) => ({
            ...prev,
            name: data.name,
            phone: data.phone || prev.phone,
            department: data.department || prev.department,
          }));
        }
      }
    } catch (err) {
      console.log('Email lookup error:', err);
    } finally {
      setIsSearchingEmail(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: 'Student Incharge',
      department: '',
      phone: '',
      email: '',
      type: 'Student Lead',
      order: coordinators.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CoordinatorItem) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      role: item.role,
      department: item.department,
      phone: item.phone,
      email: item.email,
      type: item.type,
      order: item.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.department || !formData.phone || !formData.email) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const endpoint = editingId ? `/superadmin/coordinators/${editingId}` : '/superadmin/coordinators';
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || `Coordinator ${editingId ? 'updated' : 'added'} successfully!` });
        setIsModalOpen(false);
        fetchCoordinators();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save coordinator details.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Server error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete coordinator "${name}"?`)) return;

    try {
      const res = await apiFetch(`/superadmin/coordinators/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Coordinator deleted successfully.' });
        fetchCoordinators();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete coordinator.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Server error.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#18122B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
              👥 CONTACT & EVENT LEADS
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Live DB Coordinators CMS</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            Coordinator Management
          </h3>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 text-white font-mono text-xs font-black shadow-md dark:shadow-neon-purple hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Coordinator</span>
        </button>
      </div>

      {/* Notice Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between font-mono text-xs font-bold border ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-500 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-rose-500" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Coordinators Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-xs bg-white dark:bg-[#18122B] rounded-3xl border border-slate-200 dark:border-white/10">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
          <span>Loading coordinators from database...</span>
        </div>
      ) : coordinators.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-mono text-xs bg-white dark:bg-[#18122B] rounded-3xl border border-slate-200 dark:border-white/10">
          <span>No coordinators added yet. Click "Add Coordinator" to create one.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coordinators.map((person) => (
            <motion.div
              key={person._id}
              layout
              className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#18122B] hover:border-purple-400 dark:hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm dark:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border ${
                        person.type === 'faculty'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-carnival-gold border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-600 dark:text-carnival-cyan border-cyan-500/40'
                      }`}
                    >
                      {person.type === 'faculty' ? <GraduationCap className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">{person.name}</h4>
                      <p className="text-[11px] text-cyan-600 dark:text-carnival-cyan font-mono">{person.role}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      person.type === 'faculty'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-carnival-gold border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-700 dark:text-carnival-cyan border-cyan-500/30'
                    }`}
                  >
                    {person.type}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono">
                  <p className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{person.department}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{person.phone}</span>
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span className="truncate">{person.email}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(person)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(person._id, person.name)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Create or Edit Coordinator */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-3xl border border-purple-300 dark:border-purple-500/40 shadow-2xl bg-white dark:bg-[#170E28] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-mono flex items-center gap-2">
                  <span>{editingId ? 'Edit Coordinator Details' : 'Add New Coordinator'}</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 dark:text-slate-300">Email Address *</label>
                    {isSearchingEmail && (
                      <span className="text-[10px] text-purple-500 font-mono animate-pulse">Checking database...</span>
                    )}
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="student.cs23@bitsathy.ac.in"
                    className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Auto-filled from email or enter full name"
                    className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Designation / Role *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="Student Incharge">Student Incharge</option>
                    <option value="Student Coordinator">Student Coordinator</option>
                    <option value="Student Lead">Student Lead</option>
                    <option value="Faculty Head">Faculty Head</option>
                    <option value="Faculty Convener">Faculty Convener</option>
                    <option value="Faculty Coordinator">Faculty Coordinator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Department / Academic Year *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Dept of Computer Science & Engineering"
                    className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
                    >
                      <option value="Student Lead">Student Lead</option>
                      <option value="Student Coordinator">Student Coordinator</option>
                      <option value="Student Incharge">Student Incharge</option>
                      <option value="Faculty Head">Faculty Head</option>
                      <option value="Faculty Convener">Faculty Convener</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-white font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-white font-black shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : editingId ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoordinatorsCMS;
