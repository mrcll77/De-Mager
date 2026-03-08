import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon, BookOpen, Coffee, Activity, AlertCircle } from 'lucide-react';
import { TimerMode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerComponentProps {
  onComplete: (mode: TimerMode) => void;
  onStatusChange: (isActive: boolean) => void;
}

const MODE_CONFIG = {
  [TimerMode.FOCUS]: { label: 'Study Time', duration: 25 * 60, icon: BookOpen, color: 'text-indigo-400' },
  [TimerMode.BREAK]: { label: 'Break Time', duration: 5 * 60, icon: Coffee, color: 'text-emerald-400' },
  [TimerMode.PHYSICAL]: { label: 'Physical Time', duration: 10 * 60, icon: Activity, color: 'text-orange-400' }
};

export const TimerComponent: React.FC<TimerComponentProps> = ({ onComplete, onStatusChange }) => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG[TimerMode.FOCUS].duration);
  const [isActive, setIsActive] = useState(false);
  const [pendingMode, setPendingMode] = useState<TimerMode | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    setIsActive(false);
    onStatusChange(false);
    setTimeLeft(MODE_CONFIG[mode].duration);
  }, [mode, clearTimer, onStatusChange]);

  const toggleTimer = () => {
    if (isActive) {
      clearTimer();
      setIsActive(false);
      onStatusChange(false);
    } else {
      setIsActive(true);
      onStatusChange(true);
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsActive(false);
            onStatusChange(false);
            onComplete(mode);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    if (newMode === mode) return;
    
    // If timer is active or has progressed, ask for confirmation
    const isProgressed = timeLeft < MODE_CONFIG[mode].duration;
    if (isActive || isProgressed) {
      setPendingMode(newMode);
    } else {
      confirmModeChange(newMode);
    }
  };

  const confirmModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    clearTimer();
    setIsActive(false);
    onStatusChange(false);
    setTimeLeft(MODE_CONFIG[newMode].duration);
    setPendingMode(null);
  };

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const ModeIcon = MODE_CONFIG[mode].icon;

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-800/50 rounded-2xl border border-white/5 mb-12">
        {Object.entries(MODE_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          const isSelected = mode === key;
          return (
            <button
              key={key}
              onClick={() => handleModeChange(key as TimerMode)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isSelected 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden lg:inline">{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Timer Display */}
      <div className="relative flex flex-col items-center">
        <div className="text-[7rem] sm:text-[10rem] lg:text-[12rem] font-black tracking-tighter leading-none text-white tabular-nums drop-shadow-[0_0_50px_rgba(79,70,229,0.2)]">
          {formatTime(timeLeft)}
        </div>
        <div className={`flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-slate-800/50 border border-white/5 ${MODE_CONFIG[mode].color}`}>
          <ModeIcon className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">{MODE_CONFIG[mode].label}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-6 mt-16">
        <button
          onClick={resetTimer}
          className="w-16 h-16 bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl flex items-center justify-center transition-all active:scale-95 text-slate-400 hover:text-white border border-white/5 shadow-lg"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button
          onClick={toggleTimer}
          className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all active:scale-90 shadow-2xl ${
            isActive 
              ? 'bg-slate-700 text-white hover:bg-slate-600' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/50'
          }`}
        >
          {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
        </button>
        <div className="w-16 h-16" /> {/* Spacer for balance */}
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {pendingMode && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingMode(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl bg-slate-900/90 text-center"
            >
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Ganti Mode?</h3>
              <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">
                Timer sedang berjalan atau sudah dimulai. <br/>
                Apakah Anda yakin ingin mengganti ke mode <span className="text-white">"{MODE_CONFIG[pendingMode].label}"</span>? Progres saat ini akan hilang.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setPendingMode(null)}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-slate-300 uppercase tracking-widest text-xs transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={() => confirmModeChange(pendingMode)}
                  className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl font-black text-white uppercase tracking-widest text-xs shadow-lg shadow-orange-900/40 transition-all"
                >
                  Ya, Ganti
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
