
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerComponent } from './components/TimerComponent';
import { TaskList } from './components/TaskList';
import { CalendarView } from './components/CalendarView';
import { KnowledgeHub } from './components/KnowledgeHub';
import { TimerMode, Task, AppState, ProductivityHours, ChatMessage } from './types';
import { getNudgeMessage } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Timer, 
  Calendar, 
  CheckSquare, 
  Settings, 
  Bell, 
  Zap,
  Activity,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  X,
  Clock,
  Book,
  Lightbulb
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STORAGE_KEY = 'momentum_timer_state';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'task' | 'timer' | 'calendar' | 'knowledge' | null>(null);
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        chatHistory: parsed.chatHistory || []
      };
    }
    
    return {
      tasks: [],
      productivityHours: { start: '08:00', end: '18:00' },
      lastNudgeTime: 0,
      chatHistory: []
    };
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [nudge, setNudge] = useState<string | null>(null);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [showProactive, setShowProactive] = useState(true);
  const [activeAlarm, setActiveAlarm] = useState<{ id?: string; title: string; type: 'timer' | 'task' } | null>(null);
  const triggeredAlarms = useRef<Set<string>>(new Set());
  const alarmAudio = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio & Notification Permission
  useEffect(() => {
    alarmAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3');
    alarmAudio.current.loop = true;

    // Request Notification Permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Real-time Clock & Task Alarm Check
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check for Task Alarms
      const nowStr = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');
      
      state.tasks.forEach(task => {
        const taskKey = `${task.id}-${task.dueDate}-${task.reminderTime}`;
        if (!task.isCompleted && task.dueDate === nowStr && task.reminderTime === timeStr && !activeAlarm && !triggeredAlarms.current.has(taskKey)) {
          triggeredAlarms.current.add(taskKey);
          triggerAlarm(task.title, 'task', task.id);
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.tasks, activeAlarm]);

  const triggerAlarm = (title: string, type: 'timer' | 'task', id?: string) => {
    setActiveAlarm({ title, type, id });
    
    // Browser Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("MOMENTUM: Waktunya Beraksi!", {
        body: type === 'timer' ? `Sesi ${title} telah selesai!` : `Misi: ${title}`,
        icon: "/favicon.ico", // Standard fallback
        tag: id || 'momentum-alarm',
        requireInteraction: true
      });
    }

    if (alarmAudio.current) {
      alarmAudio.current.play().catch(e => console.log("Audio play failed:", e));
    }
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
  };

  const dismissAlarm = () => {
    setActiveAlarm(null);
    if (alarmAudio.current) {
      alarmAudio.current.pause();
      alarmAudio.current.currentTime = 0;
    }
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
  };

  // AI Advisor Logic
  useEffect(() => {
    const day = currentTime.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
    const isPhysicalDay = [2, 4, 6].includes(day); // Tue, Thu, Sat
    const todayStr = currentTime.toDateString();
    const lastShown = localStorage.getItem('ai_advisor_last_shown');
    
    if (isPhysicalDay && lastShown !== todayStr && !showAIAdvisor) {
      setShowAIAdvisor(true);
      localStorage.setItem('ai_advisor_last_shown', todayStr);
    }
  }, [currentTime]);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      isCompleted: false
    };
    setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
  };

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const handleBack = () => setActiveView(null);

  const handleSendChatMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      text,
      timestamp: Date.now()
    };
    setState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, newMessage] }));
  };

  const handleReceiveChatMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'ai',
      text,
      timestamp: Date.now()
    };
    setState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, newMessage] }));
  };

  const ProactiveNotification = () => (
    <AnimatePresence>
      {showProactive && (
        <motion.div 
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          className="fixed top-6 right-6 z-[110] w-[320px]"
        >
          <div className="glass p-4 rounded-2xl border border-indigo-500/40 shadow-2xl bg-slate-900/80 backdrop-blur-xl flex gap-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30 shrink-0">
              <Bell className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-white uppercase tracking-tighter mb-1">ALERT AKTIVITAS: Momentum!</h4>
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                Ini jam produktifmu. Ayo mulai sesi fokus atau lakukan olahraga ringan!
              </p>
            </div>
            <button 
              onClick={() => setShowProactive(false)}
              className="p-1 hover:bg-white/5 rounded-lg text-slate-500 self-start transition-colors hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const AIAdvisorCard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
    >
      <div className="glass p-5 rounded-3xl border border-indigo-500/30 shadow-2xl bg-slate-900/90 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tighter">AI ADVISOR</h3>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Anti-mager App</p>
          </div>
          <button onClick={() => setShowAIAdvisor(false)} className="ml-auto p-1.5 hover:bg-white/5 rounded-lg text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-200 leading-relaxed">
            "Waktunya bergerak! Lakukan Workout Ringan 10 Menit: 
            1. Jumping Jacks 30 detik (untuk kardio awal). 
            2. Stretching bahu dan leher 2 menit (mengurangi pegal duduk). 
            3. Squat 15 kali (memperkuat inti tubuh)."
          </p>
          <button 
            onClick={() => { setActiveView('timer'); setShowAIAdvisor(false); }}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all"
          >
            MULAI PHYSICAL TIME
          </button>
        </div>
      </div>
    </motion.div>
  );

  const AlarmOverlay = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-red-950/90 backdrop-blur-md"
    >
      <motion.div 
        animate={{ 
          boxShadow: ["0 0 0px rgba(239,68,68,0)", "0 0 100px rgba(239,68,68,0.5)", "0 0 0px rgba(239,68,68,0)"] 
        }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute inset-0 border-[20px] border-red-600/50 pointer-events-none"
      />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-lg glass p-12 rounded-[3rem] border border-red-500/30 bg-slate-900/90 text-center shadow-[0_0_100px_rgba(239,68,68,0.3)]"
      >
        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse shadow-[0_0_40px_rgba(220,38,38,0.5)]">
          <Bell className="w-12 h-12 text-white fill-current" />
        </div>
        
        <h2 className="text-5xl font-black uppercase tracking-tighter text-white mb-4">
          WAKTUNYA BERAKSI!
        </h2>
        
        <div className="inline-block px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest mb-8">
          {activeAlarm?.type === 'timer' ? 'TIMER SELESAI' : 'DEADLINE MISI'}
        </div>

        <p className="text-2xl font-bold text-white mb-6">
          "{activeAlarm?.title}"
        </p>

        {activeAlarm?.type === 'timer' && activeAlarm.title.includes('BREAK') && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium text-indigo-300 mb-12 italic"
          >
            "Istirahat selesai! 🍵 Baterai sudah full? Sekarang waktunya kembali ke mode serius. Selesaikan satu misi besarmu sekarang juga! 🚀🔥"
          </motion.p>
        )}

        <button 
          onClick={dismissAlarm}
          className="w-full py-6 bg-red-600 hover:bg-red-500 rounded-3xl font-black text-white uppercase tracking-[0.2em] text-lg shadow-2xl shadow-red-900/50 transition-all active:scale-95"
        >
          SAYA SUDAH SIAP!
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="h-screen bg-[#0f172a] text-slate-100 overflow-y-auto lg:overflow-hidden no-scrollbar relative">
      <AnimatePresence mode="wait">
        {!activeView ? (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-full flex flex-col lg:flex-row"
          >
            {/* TASK COLUMN */}
            <motion.div 
              onClick={() => setActiveView('task')}
              whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
              className="flex-1 min-h-[50vh] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-white/5 cursor-pointer p-8 flex flex-col gap-6 group"
              layoutId="task-view"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
                  <CheckSquare className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">TASK</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="space-y-4 opacity-60">
                  {state.tasks.slice(0, 5).map(t => (
                    <div key={t.id} className="p-4 glass rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]", t.isCompleted ? "bg-slate-600" : "bg-indigo-500")} />
                      <span className="text-sm font-bold truncate">{t.title}</span>
                    </div>
                  ))}
                  {state.tasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 italic py-12">
                      <CheckSquare className="w-12 h-12 mb-4 opacity-10" />
                      <p className="text-sm font-bold">Belum ada tugas...</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-auto">
                {state.tasks.length} Total Misi
              </div>
            </motion.div>

            {/* TIMER COLUMN */}
            <motion.div 
              onClick={() => setActiveView('timer')}
              whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
              className="flex-1 min-h-[50vh] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-white/5 cursor-pointer p-8 flex flex-col items-center justify-center gap-8 group"
              layoutId="timer-view"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600/20 rounded-2xl flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-transform">
                  <Timer className="w-6 h-6 text-orange-400" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">TIMER</h2>
              </div>
              <div className="text-center">
                <div className="text-8xl font-black tracking-tighter tabular-nums text-white drop-shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mt-4">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long' })}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-orange-500/40" />
                <div className="w-2 h-2 rounded-full bg-orange-500/20" />
              </div>
            </motion.div>

            {/* CALENDAR COLUMN */}
            <motion.div 
              onClick={() => setActiveView('calendar')}
              whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
              className="flex-1 min-h-[50vh] lg:min-h-0 cursor-pointer p-8 flex flex-col gap-6 group"
              layoutId="calendar-view"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">CALENDAR</h2>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[10rem] font-black text-white leading-none drop-shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    {currentTime.getDate()}
                  </div>
                  <div className="text-2xl font-black text-emerald-400 uppercase tracking-[0.2em] mt-2">
                    {currentTime.toLocaleString('id-ID', { month: 'long' })}
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-auto text-right">
                {currentTime.getFullYear()}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key={activeView}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full w-full bg-[#0f172a] flex flex-col"
            layoutId={`${activeView}-view`}
          >
            <div className="p-4 flex items-center gap-4 border-b border-white/5">
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {activeView === 'task' ? 'TASK MENU' : activeView === 'timer' ? 'TIMER MENU' : activeView === 'calendar' ? 'CALENDAR MENU' : 'KNOWLEDGE HUB'}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto lg:overflow-hidden no-scrollbar">
              {activeView === 'task' && (
                <TaskList 
                  tasks={state.tasks} 
                  onAddTask={addTask} 
                  onToggleTask={toggleTask} 
                  onDeleteTask={deleteTask} 
                  onUpdateTask={updateTask}
                />
              )}
              {activeView === 'timer' && (
                <TimerComponent 
                  onComplete={(mode) => triggerAlarm(`${mode} Session Complete`, 'timer')} 
                  onStatusChange={(active) => console.log('Timer active:', active)} 
                />
              )}
              {activeView === 'calendar' && (
                <CalendarView 
                  tasks={state.tasks} 
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onUpdateTask={updateTask}
                />
              )}
              {activeView === 'knowledge' && (
                <KnowledgeHub 
                  chatHistory={state.chatHistory}
                  onSendMessage={handleSendChatMessage}
                  onReceiveMessage={handleReceiveChatMessage}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Knowledge Button */}
      {!activeView && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveView('knowledge')}
          className="fixed bottom-8 left-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-900/50 transition-all z-[100] border border-indigo-400/30"
        >
          <Lightbulb className="w-6 h-6 text-white fill-current" />
        </motion.button>
      )}

      {showAIAdvisor && <AIAdvisorCard />}
      <ProactiveNotification />
      <AnimatePresence>
        {activeAlarm && <AlarmOverlay />}
      </AnimatePresence>
    </div>
  );
};

export default App;
