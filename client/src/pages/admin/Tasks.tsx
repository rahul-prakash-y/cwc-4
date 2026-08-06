import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckSquare, Plus, Clock, Calendar, Award, Trash2, Edit3, Eye, EyeOff, Sparkles, AlertCircle, Save, X } from 'lucide-react';

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
  ]),
  points: z
    .number({ invalid_type_error: 'Points must be a valid number' })
    .min(5, 'Points must be at least 5 PTS'),
  startTime: z.string().min(1, 'Start Time is required'),
  endTime: z.string().min(1, 'End Time is required'),
  visibility: z.boolean(),
  description: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  type: 'Main Task' | 'Special Task' | 'Rapid Fire' | 'MCQ' | 'Puzzle' | 'Boss Fight' | 'Bonus Quest';
  points: number;
  startTime: string;
  endTime: string;
  visibility: boolean; // true = Published, false = Draft
  status: 'Live' | 'Upcoming' | 'Completed';
}

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      title: 'Day 5: Mid-Season Arena Boss Fight',
      description: 'Build a dynamic real-time multiplayer mini-game within 4 hours using WebSockets.',
      type: 'Boss Fight',
      points: 500,
      startTime: '2026-08-05T10:00',
      endTime: '2026-08-05T14:00',
      visibility: true,
      status: 'Live',
    },
    {
      id: 'task-2',
      title: 'Day 6: Magic Illusion UI Hackathon',
      description: 'Create mind-bending glassmorphism web apps with smooth Framer Motion micro-interactions.',
      type: 'Special Task',
      points: 350,
      startTime: '2026-08-06T09:00',
      endTime: '2026-08-06T18:00',
      visibility: true,
      status: 'Upcoming',
    },
    {
      id: 'task-3',
      title: 'MCQ Challenge: Fastify & JWT Internals',
      description: 'Solve 15 rapid fire questions regarding Fastify plugin lifecycle and JWT signature algorithms.',
      type: 'MCQ',
      points: 150,
      startTime: '2026-08-06T12:00',
      endTime: '2026-08-06T13:00',
      visibility: true,
      status: 'Upcoming',
    },
    {
      id: 'task-4',
      title: 'Puzzle Quest: Cryptic Carnival Cipher',
      description: 'Decrypt the 4-stage stegano riddle hidden inside the carnival venue audio files.',
      type: 'Puzzle',
      points: 200,
      startTime: '2026-08-07T10:00',
      endTime: '2026-08-07T20:00',
      visibility: false,
      status: 'Upcoming',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

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

  // Submit Handler for Create or Edit
  const onSubmit = async (data: TaskFormData) => {
    if (editingTaskId) {
      // Edit mode
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTaskId
            ? {
                ...t,
                title: data.title,
                type: data.type,
                points: data.points,
                startTime: data.startTime,
                endTime: data.endTime,
                visibility: data.visibility,
                description: data.description,
              }
            : t
        )
      );
      setEditingTaskId(null);
    } else {
      // Create mode
      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        title: data.title,
        description: data.description,
        type: data.type,
        points: data.points,
        startTime: data.startTime,
        endTime: data.endTime,
        visibility: data.visibility,
        status: 'Upcoming',
      };
      setTasks([newTask, ...tasks]);
    }

    try {
      await fetch('/api/admin/tasks', {
        method: editingTaskId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.log('Task saved locally & API notified');
    }

    reset();
    setShowForm(false);
  };

  const handleEditClick = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setValue('title', task.title);
    setValue('type', task.type);
    setValue('points', task.points);
    setValue('startTime', task.startTime);
    setValue('endTime', task.endTime);
    setValue('visibility', task.visibility);
    setValue('description', task.description || '');
    setShowForm(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const toggleVisibility = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visibility: !t.visibility } : t))
    );
  };

  const getTypeBadge = (type: TaskItem['type']) => {
    switch (type) {
      case 'Main Task':
        return 'bg-carnival-gold/20 text-carnival-gold border-carnival-gold/40';
      case 'Special Task':
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-carnival-purple/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-purple/20 text-carnival-purple text-xs font-mono font-bold border border-carnival-purple/30 mb-2">
            <CheckSquare className="w-4 h-4" />
            <span>TASK SCHEDULER & ARENA CREATOR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Task Management View</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Create, Edit, and Delete tasks powered by react-hook-form and Zod validation. Supports Main Tasks, Special Tasks, Rapid Fire, MCQ, Puzzles, and Boss Fights.
          </p>
        </div>

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
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-carnival-purple to-carnival-crimson text-white font-black text-xs uppercase tracking-wider shadow-neon-purple hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Close Builder' : 'Create New Task'}</span>
        </button>
      </div>

      {/* Task Creation / Edit Form (Validated via react-hook-form + Zod) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 sm:p-8 rounded-2xl border border-carnival-gold/40 shadow-2xl space-y-6 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                <Sparkles className="w-5 h-5 text-carnival-gold" />
                {editingTaskId ? 'Edit Task Details' : 'Rich Task Creator Form (React Hook Form + Zod)'}
              </h3>
              <span className="text-xs font-mono text-carnival-gold font-bold">Fastify Backend Ready</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Field 1: Title */}
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-mono text-slate-300">Task Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Day 6: Rapid Fire MCQ Arena"
                    {...register('title')}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold font-mono transition-all"
                  />
                  {errors.title && (
                    <p className="text-xs text-rose-400 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.title.message}</span>
                    </p>
                  )}
                </div>

                {/* Field 2: Task Type */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-300">Task Type *</label>
                  <select
                    {...register('type')}
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold transition-all font-mono cursor-pointer"
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
                <label className="block text-xs font-mono text-slate-300">Task Description & Rules</label>
                <textarea
                  rows={3}
                  placeholder="Describe the challenge instructions, evaluation metrics, and submission steps..."
                  {...register('description')}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Field 3: Points Available */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-300">Points Available *</label>
                  <div className="relative">
                    <Award className="w-4 h-4 absolute left-3 top-3.5 text-carnival-gold" />
                    <input
                      type="number"
                      step={10}
                      {...register('points', { valueAsNumber: true })}
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-carnival-gold"
                    />
                  </div>
                  {errors.points && (
                    <p className="text-xs text-rose-400 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.points.message}</span>
                    </p>
                  )}
                </div>

                {/* Field 4: Start Time */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-300">Start Time *</label>
                  <input
                    type="datetime-local"
                    {...register('startTime')}
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-carnival-gold"
                  />
                  {errors.startTime && (
                    <p className="text-xs text-rose-400 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.startTime.message}</span>
                    </p>
                  )}
                </div>

                {/* Field 5: End Time */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-300">End Time *</label>
                  <input
                    type="datetime-local"
                    {...register('endTime')}
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-carnival-gold"
                  />
                  {errors.endTime && (
                    <p className="text-xs text-rose-400 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.endTime.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Field 6: Visibility Toggle (Draft vs. Published) */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {isVisibilityPublished ? (
                    <Eye className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <div className="font-mono text-xs text-white font-bold">
                      Visibility Toggle: {isVisibilityPublished ? 'PUBLISHED' : 'DRAFT'}
                    </div>
                    <div className="text-[11px] text-slate-400">
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
                    isVisibilityPublished ? 'bg-emerald-500 shadow-neon-cyan' : 'bg-slate-700'
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
                  className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-mono font-bold hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-carnival-gold to-carnival-amber text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>{editingTaskId ? 'Save Task Changes' : 'Publish Task'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List Section */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-white font-mono flex items-center gap-2">
          <Calendar className="w-5 h-5 text-carnival-gold" />
          Scheduled Tasks Grid ({tasks.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              whileHover={{ y: -3 }}
              className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${getTypeBadge(task.type)}`}>
                      {task.type}
                    </span>
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

              {task.description && (
                <p className="text-xs text-slate-300 font-sans line-clamp-2">{task.description}</p>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-carnival-cyan" />
                  <span>
                    {task.startTime.replace('T', ' ')} - {task.endTime.replace('T', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="p-1.5 rounded-lg bg-carnival-gold/10 hover:bg-carnival-gold/20 text-carnival-gold transition-all cursor-pointer"
                    title="Edit task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleVisibility(task.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title={task.visibility ? 'Switch to Draft' : 'Publish Task'}
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
      </div>
    </div>
  );
};
