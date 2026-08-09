import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  AlertCircle,
  Save,
  RefreshCw,
} from 'lucide-react';

// Zod Validation Schema for Task Form
const taskSchema = z.object({
  title: z.string().min(3, 'Task Title must be at least 3 characters'),
  type: z.enum([
    'Main Task',
    'Special Task',
    'Rapid Fire',
    'MCQ',
    'Puzzle',
    'Boss Fight',
    'Bonus Quest',
    'Main',
    'Special',
  ]),
  points: z
    .number({ invalid_type_error: 'Points must be a valid number' })
    .min(5, 'Points must be at least 5 PTS'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  visibility: z.boolean(),
  description: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  points: number;
  startTime: string;
  endTime: string;
  visibility: boolean;
  status: 'Live' | 'Upcoming' | 'Completed';
  category?: string;
  dayNumber?: number;
}

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Fetch tasks from DB via GET /api/admin/tasks (or fallback GET /api/tasks)
  const fetchTasksFromDB = async () => {
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
          const mapped: TaskItem[] = rawList.map((t: any, idx: number) => {
            const startIso = t.startTime ? new Date(t.startTime).toISOString().slice(0, 16) : '';
            const endIso = t.endTime ? new Date(t.endTime).toISOString().slice(0, 16) : '';

            return {
              id: t._id || t.id || `task-${idx + 1}`,
              title: t.title || (t.category ? `[${t.category}] Day ${t.dayNumber || 1} Task` : `Task #${idx + 1}`),
              description: t.description || t.taskDescription || '',
              type: t.type || (t.category ? 'Special Task' : 'Main Task'),
              points: typeof t.points === 'number' ? t.points : 100,
              startTime: startIso || '2026-08-06T10:00',
              endTime: endIso || '2026-08-06T18:00',
              visibility: t.visibility ?? true,
              status: t.visibility ? 'Live' : 'Upcoming',
              category: t.category,
              dayNumber: t.dayNumber,
            };
          });
          setTasks(mapped);
        }
      } else {
        // Fallback public endpoint fetch
        const pubRes = await fetch('/api/tasks');
        if (pubRes.ok) {
          const pubData = await pubRes.json();
          const rawList = pubData.tasks || pubData;
          if (Array.isArray(rawList)) {
            const mapped: TaskItem[] = rawList.map((t: any, idx: number) => ({
              id: t._id || t.id || `task-${idx + 1}`,
              title: t.title || `Task #${idx + 1}`,
              description: t.description || t.taskDescription || '',
              type: t.type || 'Main Task',
              points: typeof t.points === 'number' ? t.points : 100,
              startTime: t.startTime ? new Date(t.startTime).toISOString().slice(0, 16) : '2026-08-06T10:00',
              endTime: t.endTime ? new Date(t.endTime).toISOString().slice(0, 16) : '2026-08-06T18:00',
              visibility: t.visibility ?? true,
              status: t.visibility ? 'Live' : 'Upcoming',
            }));
            setTasks(mapped);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch tasks from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksFromDB();
  }, []);

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      type: 'Main Task',
      points: 100,
      startTime: '2026-08-06T10:00',
      endTime: '2026-08-06T18:00',
      visibility: true,
      description: '',
    },
  });

  const isVisibilityPublished = watch('visibility');

  // Submit Handler for Create or Edit against MongoDB APIs
  const onSubmit = async (data: TaskFormData) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const payload = {
      ...data,
      startTime: data.startTime ? new Date(data.startTime).toISOString() : new Date().toISOString(),
      endTime: data.endTime ? new Date(data.endTime).toISOString() : new Date(Date.now() + 86400000).toISOString(),
    };

    try {
      let res;
      if (editingTaskId) {
        // Edit mode API call (PUT /api/admin/tasks/:id)
        res = await fetch(`/api/admin/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // Create mode API call (POST /api/admin/tasks)
        res = await fetch('/api/admin/tasks', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        await fetchTasksFromDB();
        reset();
        setShowForm(false);
        setEditingTaskId(null);
      } else {
        const errData = await res.json();
        alert(`Failed to save task: ${errData.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Error saving task to DB:', err);
      alert('Network error while saving task to database');
    }
  };

  const handleEditClick = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setValue('title', task.title);
    setValue('type', (task.type as any) || 'Main Task');
    setValue('points', task.points);
    setValue('startTime', task.startTime);
    setValue('endTime', task.endTime);
    setValue('visibility', task.visibility);
    setValue('description', task.description || '');
    setShowForm(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task from the database?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        const errData = await res.json();
        alert(`Failed to delete task: ${errData.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Network error while deleting task');
    }
  };

  const toggleVisibility = async (task: TaskItem) => {
    const newVisibility = !task.visibility;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ visibility: newVisibility }),
      });

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, visibility: newVisibility, status: newVisibility ? 'Live' : 'Upcoming' }
              : t
          )
        );
      } else {
        alert('Failed to update task visibility in database');
      }
    } catch (err) {
      console.error('Failed to toggle task visibility:', err);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
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
      case 'MCQ':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Puzzle':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Bonus Quest':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-carnival-purple/40 shadow-sm dark:shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-carnival-purple/20 text-purple-700 dark:text-carnival-purple text-xs font-mono font-bold border border-purple-500/30 dark:border-carnival-purple/30 mb-2">
            <CheckSquare className="w-4 h-4" />
            <span>TASK SCHEDULER & ARENA CREATOR (LIVE MONGODB)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Task Management View
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1">
            Real-time MongoDB task scheduling with Zod validation. Create, edit, publish, and sync daily tasks live.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTasksFromDB}
            disabled={loading}
            className="p-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
            title="Refresh database tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingTaskId(null);
                reset();
              } else {
                setEditingTaskId(null);
                reset();
                setShowForm(true);
              }
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 dark:from-carnival-purple dark:to-carnival-crimson text-white font-black text-xs uppercase tracking-wider shadow-md dark:shadow-neon-purple hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Close Builder' : 'Create New Task'}</span>
          </button>
        </div>
      </div>

      {/* Task Creation / Edit Form (Validated via react-hook-form + Zod) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-[#18122B] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-carnival-gold/40 shadow-xl dark:shadow-2xl space-y-6 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                <Sparkles className="w-5 h-5 text-amber-500 dark:text-carnival-gold" />
                {editingTaskId ? 'Edit Task Details' : 'Rich Task Creator Form (Live MongoDB Sync)'}
              </h3>
              <span className="text-xs font-mono text-amber-600 dark:text-carnival-gold font-bold">
                Fastify Backend Live
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Field 1: Title */}
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-mono text-slate-700 dark:text-slate-300">Task Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Day 6: Rapid Fire MCQ Arena"
                    {...register('title')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold font-mono transition-all"
                  />
                  {errors.title && (
                    <p className="text-xs text-rose-500 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.title.message}</span>
                    </p>
                  )}
                </div>

                {/* Field 2: Task Type */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-700 dark:text-slate-300">Task Type *</label>
                  <select
                    {...register('type')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1A1228] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold transition-all font-mono cursor-pointer"
                  >
                    <option value="Main Task">Main Task 🎯</option>
                    <option value="Special Task">Special Task ✨</option>
                    <option value="Rapid Fire">Rapid Fire ⚡</option>
                    <option value="MCQ">MCQ Quiz 🧠</option>
                    <option value="Puzzle">Puzzle Quest 🧩</option>
                    <option value="Boss Fight">Boss Fight ⚔️</option>
                    <option value="Bonus Quest">Bonus Quest 🎁</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-700 dark:text-slate-300">Task Description & Rules</label>
                <textarea
                  rows={3}
                  placeholder="Describe challenge instructions, evaluation metrics, and submission steps..."
                  {...register('description')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Field 3: Points Available */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-700 dark:text-slate-300">Points Available *</label>
                  <div className="relative">
                    <Award className="w-4 h-4 absolute left-3 top-3.5 text-amber-500 dark:text-carnival-gold" />
                    <input
                      type="number"
                      step={10}
                      {...register('points', { valueAsNumber: true })}
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold"
                    />
                  </div>
                  {errors.points && (
                    <p className="text-xs text-rose-500 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.points.message}</span>
                    </p>
                  )}
                </div>

                {/* Field 4: Start Time */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-700 dark:text-slate-300">Start Time</label>
                  <input
                    type="datetime-local"
                    {...register('startTime')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1A1228] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold"
                  />
                </div>

                {/* Field 5: End Time */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-700 dark:text-slate-300">End Time</label>
                  <input
                    type="datetime-local"
                    {...register('endTime')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1A1228] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold"
                  />
                </div>
              </div>

              {/* Field 6: Visibility Toggle (Draft vs. Published) */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  {isVisibilityPublished ? (
                    <Eye className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <div className="font-mono text-xs text-slate-900 dark:text-white font-bold">
                      Visibility Toggle: {isVisibilityPublished ? 'PUBLISHED' : 'DRAFT'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isVisibilityPublished
                        ? 'Published tasks are visible to all students on their dashboards.'
                        : 'Draft tasks remain hidden until published by an admin.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setValue('visibility', !isVisibilityPublished)}
                  className={`w-14 h-7 rounded-full transition-colors relative p-1 cursor-pointer ${
                    isVisibilityPublished ? 'bg-emerald-500 shadow-sm dark:shadow-neon-cyan' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isVisibilityPublished ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTaskId(null);
                    reset();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 dark:from-carnival-gold dark:to-carnival-amber text-slate-950 font-black text-xs uppercase tracking-wider shadow-md dark:shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>{editingTaskId ? 'Save Task Changes' : 'Publish Task to DB'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List Section */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white font-mono flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600 dark:text-carnival-gold" />
          Database Scheduled Tasks ({tasks.length})
        </h3>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs bg-white dark:bg-[#18122B] rounded-2xl border border-slate-200 dark:border-white/10">
            <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
            <span>Loading tasks from MongoDB...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs bg-white dark:bg-[#18122B] rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
            <CheckSquare className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">No Scheduled Tasks Found in Database</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Click &quot;Create New Task&quot; above to add a new task to MongoDB.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ y: -3 }}
                className="bg-white dark:bg-[#18122B] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${getTypeBadge(task.type)}`}>
                        {task.type}
                      </span>

                      {task.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                          {task.category}
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          task.visibility
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {task.visibility ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">{task.title}</h4>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-amber-600 dark:text-carnival-gold font-mono">+{task.points}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">PTS</div>
                  </div>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-sans line-clamp-2">{task.description}</p>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-carnival-cyan" />
                    <span>
                      {task.startTime.replace('T', ' ')} - {task.endTime.replace('T', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(task)}
                      className="p-1.5 rounded-lg bg-amber-100 dark:bg-carnival-gold/10 hover:bg-amber-200 dark:hover:bg-carnival-gold/20 text-amber-800 dark:text-carnival-gold transition-all cursor-pointer"
                      title="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleVisibility(task)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                      title={task.visibility ? 'Switch to Draft' : 'Publish Task'}
                    >
                      {task.visibility ? (
                        <Eye className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
                      title="Delete task from database"
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

export default Tasks;
