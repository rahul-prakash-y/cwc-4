import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Save,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  Edit3,
} from 'lucide-react';
import { CATEGORY_CONFIG, TimelineDay, TimelineTask } from '../../components/landing/Timeline';

export const TimelineCMS: React.FC = () => {
  const [days, setDays] = useState<TimelineDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [savingTask, setSavingTask] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form edit states
  const [editedDays, setEditedDays] = useState<Record<number, { theme: string; daywiseName: string; eliminationInfo: string }>>({});
  const [editedTasks, setEditedTasks] = useState<Record<string, { taskDescription: string; timeLimit: string }>>({});

  const fetchTimelineData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/timeline', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.timeline && Array.isArray(data.timeline)) {
          setDays(data.timeline);
          // Initialize edit states
          const dayEdits: Record<number, any> = {};
          const taskEdits: Record<string, any> = {};

          data.timeline.forEach((d: TimelineDay) => {
            dayEdits[d.dayNumber] = {
              theme: d.theme,
              daywiseName: d.daywiseName,
              eliminationInfo: d.eliminationInfo,
            };

            d.tasks.forEach((t: TimelineTask) => {
              if (t._id) {
                taskEdits[t._id] = {
                  taskDescription: t.taskDescription,
                  timeLimit: t.timeLimit,
                };
              }
            });
          });

          setEditedDays(dayEdits);
          setEditedTasks(taskEdits);
        }
      } else {
        // Fallback public endpoint
        const pubRes = await fetch('/api/timeline');
        if (pubRes.ok) {
          const data = await pubRes.json();
          if (data.timeline) {
            setDays(data.timeline);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveDay = async (dayNumber: number) => {
    const dayData = editedDays[dayNumber];
    if (!dayData) return;

    setSavingDay(dayNumber);
    try {
      const res = await fetch(`/api/admin/timeline/day/${dayNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(dayData),
      });

      if (res.ok) {
        showToast(`🎉 Day ${dayNumber} metadata updated live in MongoDB!`);
        await fetchTimelineData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to update day metadata'}`);
      }
    } catch (err) {
      console.error('Day update error:', err);
      alert('Network error while updating day metadata');
    } finally {
      setSavingDay(null);
    }
  };

  const handleSaveTask = async (taskId: string, dayNumber: number, category: string) => {
    const taskData = editedTasks[taskId];
    if (!taskData) return;

    setSavingTask(taskId);
    try {
      const res = await fetch(`/api/admin/timeline/task/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        showToast(`✅ Day ${dayNumber} [${category}] updated successfully!`);
        await fetchTimelineData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to update task'}`);
      }
    } catch (err) {
      console.error('Task update error:', err);
      alert('Network error while updating task');
    } finally {
      setSavingTask(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-amber-400 shadow-2xl flex items-center gap-3 font-mono text-xs"
        >
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* Admin CMS Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-amber-900/30 to-slate-900 p-6 sm:p-8 border border-amber-400/40 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold mb-2">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>SUPER ADMIN TIMELINE MANAGEMENT (LIVE CMS)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              7-Day Event Timeline & Task CMS 🛠️
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-sans">
              Live edit daily themes, elimination parameters, task descriptions, and time limits directly in MongoDB during the event.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTimelineData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh CMS Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main CMS Editor List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs bg-[#18122B] rounded-3xl border border-white/10">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
          <span>Loading Timeline CMS Database...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {days.map((day) => {
            const dayEdit = editedDays[day.dayNumber] || {
              theme: day.theme,
              daywiseName: day.daywiseName,
              eliminationInfo: day.eliminationInfo,
            };

            return (
              <div
                key={day.dayNumber}
                className="p-6 sm:p-8 rounded-3xl bg-[#170E28] border border-amber-500/30 shadow-xl space-y-6"
              >
                {/* Day Header Metadata Editor Form */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-mono font-black text-slate-950 text-base shadow-md">
                      D{day.dayNumber}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-white text-lg font-mono flex items-center gap-2">
                        <span>Day {day.dayNumber} Metadata</span>
                        <span className="text-xs text-amber-400 font-normal">({day.tasks.length} Categories)</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Adjust theme name, episode title, and team elimination target.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-3xl font-mono text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Day Theme</label>
                      <input
                        type="text"
                        value={dayEdit.theme}
                        onChange={(e) =>
                          setEditedDays({
                            ...editedDays,
                            [day.dayNumber]: { ...dayEdit, theme: e.target.value },
                          })
                        }
                        className="w-full bg-[#120B1F] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Daywise Title</label>
                      <input
                        type="text"
                        value={dayEdit.daywiseName}
                        onChange={(e) =>
                          setEditedDays({
                            ...editedDays,
                            [day.dayNumber]: { ...dayEdit, daywiseName: e.target.value },
                          })
                        }
                        className="w-full bg-[#120B1F] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Elimination Pill</label>
                      <input
                        type="text"
                        value={dayEdit.eliminationInfo}
                        onChange={(e) =>
                          setEditedDays({
                            ...editedDays,
                            [day.dayNumber]: { ...dayEdit, eliminationInfo: e.target.value },
                          })
                        }
                        placeholder="e.g. 0-11"
                        className="w-full bg-[#120B1F] border border-white/15 rounded-xl px-3 py-2 text-amber-300 focus:outline-none focus:border-amber-400 font-bold"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveDay(day.dayNumber)}
                    disabled={savingDay === day.dayNumber}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-mono text-xs font-black shadow-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {savingDay === day.dayNumber ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Day {day.dayNumber}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 5 Categorized Tasks Editors Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>Category Task Descriptions & Constraints</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {day.tasks.map((task) => {
                      const taskId = task._id || '';
                      const taskEdit = editedTasks[taskId] || {
                        taskDescription: task.taskDescription,
                        timeLimit: task.timeLimit,
                      };

                      const config = CATEGORY_CONFIG[task.category] || {
                        icon: '🎯',
                        title: task.category,
                        colorClasses: 'bg-white/5 border-white/10 text-white',
                        badgeClass: 'bg-slate-700 text-white',
                      };

                      return (
                        <div
                          key={taskId}
                          className="p-4 rounded-2xl bg-[#120B1F] border border-white/15 flex flex-col justify-between space-y-3 shadow-md"
                        >
                          <div className="space-y-2">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-black uppercase tracking-wider inline-block ${config.badgeClass}`}>
                              {config.icon} {task.category}
                            </span>

                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono mb-1">Task Description</label>
                              <textarea
                                rows={3}
                                value={taskEdit.taskDescription}
                                onChange={(e) =>
                                  setEditedTasks({
                                    ...editedTasks,
                                    [taskId]: { ...taskEdit, taskDescription: e.target.value },
                                  })
                                }
                                className="w-full bg-[#18122B] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-400 font-mono mb-1">Time Limit Badge</label>
                              <input
                                type="text"
                                value={taskEdit.timeLimit}
                                onChange={(e) =>
                                  setEditedTasks({
                                    ...editedTasks,
                                    [taskId]: { ...taskEdit, timeLimit: e.target.value },
                                  })
                                }
                                placeholder="e.g. 15 MINS"
                                className="w-full bg-[#18122B] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono font-bold"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => handleSaveTask(taskId, day.dayNumber, task.category)}
                            disabled={savingTask === taskId}
                            className="w-full py-2 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white font-mono text-[11px] font-bold border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {savingTask === taskId ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Category</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimelineCMS;
