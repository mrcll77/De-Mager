import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, CheckCircle2, Trash2, Clock, Tag, Edit2 } from 'lucide-react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarViewProps {
  tasks: Task[];
  onToggleTask?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Belajar': 'bg-red-500',
  'Olahraga': 'bg-blue-500',
  'Lainnya': 'bg-yellow-500'
};

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onToggleTask, onDeleteTask, onUpdateTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form state for editing
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });
    
    return { year, month, firstDay, daysInMonth, monthName };
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (!map[task.dueDate]) map[task.dueDate] = [];
      map[task.dueDate].push(task);
    });
    return map;
  }, [tasks]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(monthData.year, monthData.month + offset, 1));
  };

  const days = Array.from({ length: monthData.daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: monthData.firstDay }, (_, i) => i);

  const selectedDayTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasksByDate[selectedDate] || [];
  }, [selectedDate, tasksByDate]);

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditTime(task.reminderTime);
    setEditDesc(task.description || '');
  };

  const handleSaveEdit = (id: string) => {
    if (onUpdateTask) {
      onUpdateTask(id, {
        title: editTitle,
        reminderTime: editTime,
        description: editDesc
      });
    }
    setEditingTaskId(null);
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-8 bg-slate-900/40 glass rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white">{monthData.monthName}</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{monthData.year}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => changeMonth(1)}
            className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4">
        {['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'].map(day => (
          <div key={day} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4 flex-1">
        {emptyDays.map(d => <div key={`empty-${d}`} />)}
        {days.map(day => {
          const dateStr = `${monthData.year}-${(monthData.month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const dayTasks = tasksByDate[dateStr] || [];
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          const hasOverdue = dayTasks.some(t => !t.isCompleted && t.dueDate < new Date().toISOString().split('T')[0]);

          return (
            <div 
              key={day} 
              onClick={() => setSelectedDate(dateStr)}
              className={`aspect-square relative flex flex-col items-center justify-center rounded-3xl border transition-all group cursor-pointer ${
                isToday 
                  ? 'bg-emerald-600/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                  : hasOverdue
                  ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
                  : 'border-white/5 hover:bg-white/5'
              }`}
            >
              <span className={`text-lg font-black ${isToday ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`}>
                {day}
              </span>
              
              {/* Task Dots */}
              <div className="flex gap-1 mt-2">
                {dayTasks.slice(0, 3).map((task, idx) => {
                  const isOverdue = !task.isCompleted && task.dueDate < new Date().toISOString().split('T')[0];
                  return (
                    <div 
                      key={task.id} 
                      className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[task.category] || 'bg-slate-500'} shadow-sm ${
                        isOverdue ? 'ring-2 ring-red-500 ring-offset-1 ring-offset-slate-900' : ''
                      }`}
                    />
                  );
                })}
                {dayTasks.length > 3 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedDate && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDate(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass p-8 rounded-[3rem] border border-white/10 shadow-2xl bg-slate-900/95 flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Misi Tanggal {selectedDate}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detail & Edit Misi</p>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
                {selectedDayTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                    <p className="text-slate-500 font-bold italic">Tidak ada misi untuk hari ini...</p>
                  </div>
                ) : (
                  selectedDayTasks.map(task => (
                    <div key={task.id} className="glass p-6 rounded-[2rem] border border-white/5 bg-slate-800/30 space-y-4">
                      {editingTaskId === task.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Judul Misi</label>
                            <input 
                              type="text" 
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm font-bold"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Waktu</label>
                              <input 
                                type="time" 
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Kategori</label>
                              <div className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-sm font-bold text-slate-400">
                                {task.category}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Deskripsi</label>
                            <textarea 
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              rows={2}
                              className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleSaveEdit(task.id)}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-black text-white text-xs uppercase tracking-widest transition-all"
                            >
                              Simpan Perubahan
                            </button>
                            <button 
                              onClick={() => setEditingTaskId(null)}
                              className="px-6 bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-black text-white text-xs uppercase tracking-widest transition-all"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-4">
                          <button 
                            onClick={() => onToggleTask?.(task.id)}
                            className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${
                              task.isCompleted ? 'bg-indigo-500 border-indigo-500' : 'border-slate-700 hover:border-indigo-500'
                            }`}
                          >
                            {task.isCompleted && <CheckCircle2 className="w-5 h-5 text-white" />}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${CATEGORY_COLORS[task.category] || 'bg-slate-500'} text-white`}>
                                {task.category}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {task.reminderTime}
                              </span>
                            </div>
                            <h4 className={`text-lg font-black leading-tight mb-1 ${task.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-slate-400 leading-relaxed italic">"{task.description}"</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => handleStartEdit(task)}
                              className="p-2 hover:bg-indigo-500/10 rounded-xl text-slate-500 hover:text-indigo-400 transition-all"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => onDeleteTask?.(task.id)}
                              className="p-2 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
