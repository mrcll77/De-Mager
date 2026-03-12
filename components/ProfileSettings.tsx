import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Target, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave }) => {
  const [name, setName] = useState(profile.name || '');
  const [age, setAge] = useState(profile.age || 15);
  const [goal, setGoal] = useState(profile.goal || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      age,
      goal,
      isSetup: true
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-950/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-[3rem] border border-white/10 bg-slate-900/90 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-900/40">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Profil De-Mager</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Siapkan Identitas Produktivitasmu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
              <User className="w-3 h-3" /> Nama Panggilan
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Siapa namamu?"
              required
              className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all text-sm text-white font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Usia
            </label>
            <input 
              type="number" 
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              min="10"
              max="100"
              required
              className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all text-sm text-white font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
              <Target className="w-3 h-3" /> Target Utama
            </label>
            <textarea 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Apa yang ingin kamu capai hari ini?"
              rows={3}
              required
              className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all text-sm text-white font-bold resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-white uppercase tracking-[0.2em] text-sm shadow-2xl shadow-indigo-900/50 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Mulai Beraksi <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 italic">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          "Jangan biarkan mager menguasaimu!"
        </div>
      </motion.div>
    </div>
  );
};
