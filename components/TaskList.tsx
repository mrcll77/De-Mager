import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  CheckCircle2, 
  Trash2, 
  Calendar, 
  Clock,
  Tag
} from 'lucide-react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

const CATEGORIES = [
  { name: 'Belajar', color: 'bg-red-500', text: 'text-red-500' },
  { name: 'Olahraga', color: 'bg-blue-500', text: 'text-blue-500' },
  { name: 'Lainnya', color: 'bg-yellow-500', text: 'text-yellow-500' }
];

export const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, onUpdateTask }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'Belajar' | 'Olahraga' | 'Lainnya'>('all');
  
  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('Belajar');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || t.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchQuery, filter]);

  const upcomingTasks = useMemo(() => filteredTasks.filter(t => !t.isCompleted), [filteredTasks]);
  const historyTasks = useMemo(() => filteredTasks.filter(t => t.isCompleted), [filteredTasks]);

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!title) newErrors.title = 'Judul wajib diisi';
    if (!date) newErrors.date = 'Tanggal wajib diisi';
    if (!time) newErrors.time = 'Waktu wajib diisi';
    if (!category) newErrors.category = 'Kategori wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddTask({
      title,
      dueDate: date,
      reminderTime: time,
      category,
      description
    });

    // Reset Form
    setTitle('');
    setDate('');
    setTime('');
    setCategory('Belajar');
    setDescription('');
    setErrors({});
    setShowModal(false);
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 relative">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Cari tugas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-slate-800/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            <option value="Belajar">Belajar</option>
            <option value="Olahraga">Olahraga</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-24">
        {/* Upcoming */}
        <section>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Upcoming Tasks</h3>
          <div className="space-y-3">
            {upcomingTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} onUpdate={onUpdateTask} />
            ))}
            {upcomingTasks.length === 0 && (
              <p className="text-xs font-bold text-slate-600 italic">Tidak ada tugas mendatang...</p>
            )}
          </div>
        </section>

        {/* History */}
        <section>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">History</h3>
          <div className="space-y-3 opacity-60">
            {historyTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} onUpdate={onUpdateTask} />
            ))}
            {historyTasks.length === 0 && (
              <p className="text-xs font-bold text-slate-600 italic">Belum ada riwayat tugas...</p>
            )}
          </div>
        </section>
      </div>

      {/* FAB */}
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-900/50 transition-all hover:scale-110 active:scale-95 z-50"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl bg-slate-900/90"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase tracking-tighter">Tambah Misi Baru</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Judul Tugas</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Apa yang ingin dikerjakan?"
                    className={`w-full bg-slate-800/50 border ${errors.title ? 'border-red-500' : 'border-white/5'} rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm`}
                  />
                  {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tanggal</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full bg-slate-800/50 border ${errors.date ? 'border-red-500' : 'border-white/5'} rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm`}
                    />
                    {errors.date && <p className="text-[10px] text-red-500 mt-1">{errors.date}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Waktu</label>
                    <input 
                      type="time" 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={`w-full bg-slate-800/50 border ${errors.time ? 'border-red-500' : 'border-white/5'} rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm`}
                    />
                    {errors.time && <p className="text-[10px] text-red-500 mt-1">{errors.time}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Kategori</label>
                  <div className="flex gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.name}
                        onClick={() => setCategory(cat.name)}
                        className={`flex-1 py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                          category === cat.name 
                            ? `${cat.color} border-transparent text-white` 
                            : 'bg-slate-800/50 border-white/5 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${category === cat.name ? 'bg-white' : cat.color}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Deskripsi (Opsional)</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tambahkan catatan..."
                    rows={3}
                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm resize-none"
                  />
                </div>

                <button 
                  onClick={handleSave}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-white shadow-xl shadow-indigo-900/50 transition-all uppercase tracking-widest text-sm mt-4"
                >
                  Simpan Misi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TaskItem: React.FC<{ 
  task: Task; 
  onToggle: (id: string) => void; 
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}> = ({ task, onToggle, onDelete, onUpdate }) => {
  const cat = CATEGORIES.find(c => c.name === task.category) || CATEGORIES[0];
  
  return (
    <div className="group glass p-4 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-800/40 transition-all flex items-center gap-4">
      <button 
        onClick={() => onToggle(task.id)}
        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          task.isCompleted ? 'bg-indigo-500 border-indigo-500' : 'border-slate-700 hover:border-indigo-500'
        }`}
      >
        {task.isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${cat.color} text-white`}>
            {task.category}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
            <Calendar className="w-3 h-3" />
            <input 
              type="date" 
              value={task.dueDate}
              onChange={(e) => onUpdate(task.id, { dueDate: e.target.value })}
              className="bg-transparent border-none outline-none focus:text-indigo-400 cursor-pointer w-24"
            />
          </div>
          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {task.reminderTime}
          </span>
        </div>
        <h4 className={`text-sm font-bold truncate ${task.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{task.description}</p>
        )}
      </div>

      <button 
        onClick={() => onDelete(task.id)}
        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
