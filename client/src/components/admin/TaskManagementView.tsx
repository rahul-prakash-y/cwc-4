import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  Award,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export type TaskType =
  | 'Main Task'
  | 'Special Task'
  | 'Rapid Fire'
  | 'Boss Fight'
  | 'Bonus Quest'
  | 'Quiz';

export interface AdminTaskItem {
  id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  startTime: string;
  endTime: string;
  visibility: boolean;
  status: 'Live' | 'Upcoming' | 'Completed';
  category?: string;
  dayNumber?: number;
}

export const TaskManagementView: React.FC = () => {
  const [tasks, setTasks] = useState<AdminTaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('Main Task');
  const [points, setPoints] = useState<number>(100);
  const [startTime, setStartTime] = useState('2026-08-06T10:00');
  const [endTime, setEndTime] = useState('2026-08-06T18:00');
  const [visibility, setVisibility] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/tasks', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        const rawList = data.tasks || data;
        if (Array.isArray(rawList)) {
          const mapped: AdminTaskItem[] = rawList.map((t: any, idx: number) => ({
            id: t._id || t.id || `task-${idx + 1}`,
            title: t.title || (t.category ? `[${t.category}] Day ${t.dayNumber || 1} Task` : `Task #${idx + 1}`),
            description: t.description || t.taskDescription || '',
            type: t.type || (t.category ? 'Special Task' : 'Main Task'),
            points: typeof t.points === 'number' ? t.points : 100,
            startTime: t.startTime ? new Date(t.startTime).toISOString().slice(0, 16) : '2026-08-06T10:00',
            endTime: t.endTime ? new Date(t.endTime).toISOString().slice(0, 16) : '2026-08-06T18:00',
            visibility: t.visibility ?? true,
            status: t.visibility ? 'Live' : 'Upcoming',
            category: t.category,
            dayNumber: t.dayNumber,
          }));
          setTasks(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const payload = {
      title,
      description,
      type,
      points: Number(points),
      startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : new Date(Date.now() + 86400000).toISOString(),
      visibility,
    };

    try {
      let res;
      if (editingTaskId) {
        res = await fetch(`/api/admin/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/tasks', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        await fetchTasks();
        resetForm();
      } else {
        const errData = await res.json();
        alert(`Failed to save task: ${errData.message || 'Error'}`);
      }
    } catch (err) {
      console.error('Task save error:', err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPoints(100);
    setShowForm(false);
    setEditingTaskId(null);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Delete task from database?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const toggleVisibility = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newVisibility = !task.visibility;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ visibility: newVisibility }),
      });
      if (res.ok) {
        setTasks(tasks.map((t) => (t.id === id ? { ...t, visibility: newVisibility } : t)));
      }
    } catch (err) {
      console.error('Toggle visibility error:', err);
    }
  };

  const getTypeBadge = (taskType: string) => {
    switch (taskType) {
      case 'Main Task':
      case 'Main':
        return 'bg-carnival-gold/20 text-carnival-gold border-carnival-gold/40';
      case 'Special Task':
      case 'Special':
        return 'bg-carnival-purple/20 text-carnival-purple border-carnival-purple/40';
      case 'Boss Fight':
        return 'bg-carnival-crimson/20 text-carnival-crimson border-carnival-crimson/40';
      case 'Rapid Fire':
        return 'bg-carnival-cyan/20 text-carnival-cyan border-carnival-cyan/40';
      case 'Bonus Quest':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-carnival-purple/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-purple/20 text-carnival-purple text-xs font-mono font-bold border border-carnival-purple/30 mb-2">
            <CheckSquare className="w-4 h-4" />
            <span>TASK SCHEDULER & ARENA CREATOR (LIVE MONGODB)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Task Management View</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Build and schedule Main Tasks, Rapid Fire events, Special Tasks, and Boss Fights with points and live database sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="p-3 rounded-xl bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-all cursor-pointer"
            title="Refresh database tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-carnival-purple to-carnival-crimson text-white font-black text-xs shadow-neon-purple hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Close Task Builder' : 'Create New Task'}</span>
          </button>
        </div>
      </div>

      {/* Task Creation Rich Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 rounded-2xl border border-carnival-gold/40 shadow-2xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <Sparkles className="w-5 h-5 text-carnival-gold" />
              {editingTaskId ? 'Edit Task Details' : 'Rich Task Creator Form'}
            </h3>
            <span className="text-xs font-mono text-carnival-gold">Fastify Backend Connected</span>
          </div>

          <form onSubmit={handleCreateOrUpdateTask} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-mono text-slate-300">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Day 6: High Wire Microservices Challenge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">Task Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold transition-all cursor-pointer"
                >
                  <option value="Main Task">Main Task 🎯</option>
                  <option value="Special Task">Special Task ✨</option>
                  <option value="Rapid Fire">Rapid Fire ⚡</option>
                  <option value="Boss Fight">Boss Fight ⚔️</option>
                  <option value="Bonus Quest">Bonus Quest 🎁</option>
                  <option value="Quiz">Quiz 🧠</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-300">Task Description & Arena Instructions</label>
              <textarea
                rows={3}
                placeholder="Describe challenge objectives, submission requirements, and rules..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">Points Awarded *</label>
                <div className="relative">
                  <Award className="w-4 h-4 absolute left-3 top-3.5 text-carnival-gold" />
                  <input
                    type="number"
                    required
                    min={10}
                    step={10}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-carnival-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">Start Time Schedule</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-carnival-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">End Time Schedule</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-carnival-gold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                {visibility ? <Eye className="w-5 h-5 text-emerald-400" /> : <EyeOff className="w-5 h-5 text-slate-400" />}
                <div>
                  <div className="font-mono text-xs text-white font-bold">
                    Student Dashboard Visibility: {visibility ? 'PUBLIC' : 'HIDDEN DRAFT'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {visibility ? 'Students can view and submit repo links.' : 'Task is hidden until Ringmaster publishes.'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVisibility(!visibility)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                  visibility ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    visibility ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-mono font-bold hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-carnival-gold to-carnival-amber text-slate-950 font-black text-xs shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Task to MongoDB</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Task List / Grid View */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-white font-mono flex items-center gap-2">
          <Calendar className="w-5 h-5 text-carnival-gold" />
          Scheduled Arena Tasks ({tasks.length})
        </h3>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs glass-card rounded-2xl border border-white/10">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-carnival-gold" />
            <span>Loading tasks from database...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs glass-card rounded-2xl border border-white/10 space-y-2">
            <CheckSquare className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-white font-bold text-sm">No Scheduled Tasks in Database</p>
            <p className="text-slate-400 text-xs">Click &quot;Create New Task&quot; to publish a task.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ y: -3 }}
                className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${getTypeBadge(task.type)}`}>
                        {task.type}
                      </span>
                      {task.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {task.category}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          task.visibility
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {task.visibility ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-white text-base leading-snug">{task.title}</h4>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-carnival-gold font-mono">+{task.points}</div>
                    <div className="text-[10px] text-slate-400 font-mono">PTS</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans line-clamp-2">{task.description}</p>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-carnival-cyan" />
                    <span>
                      {task.startTime.replace('T', ' ')} - {task.endTime.replace('T', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(task.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                      title={task.visibility ? 'Hide from students' : 'Publish to students'}
                    >
                      {task.visibility ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
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

export default TaskManagementView;
