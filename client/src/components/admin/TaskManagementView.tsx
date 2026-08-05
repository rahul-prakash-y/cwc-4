import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Clock, Calendar, Award, Trash2, Edit3, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { MOCK_TIMELINE } from '../../data/mockData';

export type TaskType = 'Main Task' | 'Special Task' | 'Rapid Fire' | 'Boss Fight' | 'Bonus Quest' | 'Quiz';

export interface AdminTaskItem {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  points: number;
  startTime: string;
  endTime: string;
  visibility: boolean;
  status: 'Live' | 'Upcoming' | 'Completed';
}

export const TaskManagementView: React.FC = () => {
  const [tasks, setTasks] = useState<AdminTaskItem[]>([
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
      title: 'Rapid Fire: Memory Leak Hunt',
      description: 'Find and patch 5 hidden memory leaks in the provided Node.js repository in 30 mins.',
      type: 'Rapid Fire',
      points: 200,
      startTime: '2026-08-04T16:00',
      endTime: '2026-08-04T16:30',
      visibility: false,
      status: 'Completed',
    },
  ]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('Main Task');
  const [points, setPoints] = useState<number>(100);
  const [startTime, setStartTime] = useState('2026-08-06T10:00');
  const [endTime, setEndTime] = useState('2026-08-06T18:00');
  const [visibility, setVisibility] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();

    const newTask: AdminTaskItem = {
      id: `task-${Date.now()}`,
      title,
      description,
      type,
      points: Number(points),
      startTime,
      endTime,
      visibility,
      status: 'Upcoming',
    };

    setTasks([newTask, ...tasks]);
    setTitle('');
    setDescription('');
    setPoints(100);
    setShowForm(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const toggleVisibility = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, visibility: !t.visibility } : t)));
  };

  const getTypeBadge = (taskType: TaskType) => {
    switch (taskType) {
      case 'Main Task':
        return 'bg-carnival-gold/20 text-carnival-gold border-carnival-gold/40';
      case 'Special Task':
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-carnival-purple/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-purple/20 text-carnival-purple text-xs font-mono font-bold border border-carnival-purple/30 mb-2">
            <CheckSquare className="w-4 h-4" />
            <span>TASK SCHEDULER & ARENA CREATOR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Task Management View</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Build and schedule Main Tasks, Rapid Fire events, Special Tasks, and Boss Fights with points and time windows.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-carnival-purple to-carnival-crimson text-white font-black text-xs shadow-neon-purple hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Close Task Builder' : 'Create New Task'}</span>
        </button>
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
              Rich Task Creator Form
            </h3>
            <span className="text-xs font-mono text-carnival-gold">Fastify Backend Ready</span>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Title */}
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

              {/* Type Dropdown */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">Task Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold transition-all"
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

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-300">Task Description & Arena Instructions</label>
              <textarea
                rows={3}
                placeholder="Describe the challenge objectives, submission requirements, and rules..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-gold transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Points */}
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

              {/* Start Time Schedule */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">Start Time Schedule *</label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-carnival-gold"
                />
              </div>

              {/* End Time Schedule */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">End Time Schedule *</label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-carnival-gold"
                />
              </div>
            </div>

            {/* Visibility Toggle */}
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
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
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

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-mono font-bold hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-carnival-gold to-carnival-amber text-slate-950 font-black text-xs shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Task to Fastify Backend</span>
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
                        task.status === 'Live'
                          ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                          : task.status === 'Upcoming'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {task.status}
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
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                    title={task.visibility ? 'Hide from students' : 'Show to students'}
                  >
                    {task.visibility ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all"
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
