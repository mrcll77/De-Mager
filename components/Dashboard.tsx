import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  CheckSquare, 
  Timer, 
  Bell, 
  TrendingUp, 
  Award, 
  Zap,
  Activity,
  BookOpen,
  Coffee
} from 'lucide-react';
import { AppState, TimerMode } from '../types';

interface DashboardProps {
  state: AppState;
}

export const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const { tasks, timerSessions, nudgeCount, userProfile } = state;

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const totalTasks = tasks.length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalFocusTime = timerSessions
      .filter(s => s.mode === TimerMode.FOCUS)
      .reduce((acc, s) => acc + s.duration, 0);
    
    const totalPhysicalTime = timerSessions
      .filter(s => s.mode === TimerMode.PHYSICAL)
      .reduce((acc, s) => acc + s.duration, 0);

    const focusHours = Math.floor(totalFocusTime / 3600);
    const focusMinutes = Math.floor((totalFocusTime % 3600) / 60);

    return {
      completedTasks,
      totalTasks,
      taskCompletionRate,
      focusHours,
      focusMinutes,
      totalPhysicalTime: Math.floor(totalPhysicalTime / 60),
      nudgeCount
    };
  }, [tasks, timerSessions, nudgeCount]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const daySessions = timerSessions.filter(s => 
        new Date(s.timestamp).toISOString().split('T')[0] === date
      );
      
      const focus = daySessions
        .filter(s => s.mode === TimerMode.FOCUS)
        .reduce((acc, s) => acc + s.duration, 0) / 60; // in minutes

      const physical = daySessions
        .filter(s => s.mode === TimerMode.PHYSICAL)
        .reduce((acc, s) => acc + s.duration, 0) / 60; // in minutes

      return {
        name: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }),
        focus,
        physical
      };
    });
  }, [timerSessions]);

  const pieData = [
    { name: 'Focus', value: timerSessions.filter(s => s.mode === TimerMode.FOCUS).length, color: '#6366f1' },
    { name: 'Physical', value: timerSessions.filter(s => s.mode === TimerMode.PHYSICAL).length, color: '#f59e0b' },
    { name: 'Break', value: timerSessions.filter(s => s.mode === TimerMode.BREAK).length, color: '#10b981' },
  ].filter(d => d.value > 0);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8 no-scrollbar pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Dashboard Produktivitas</h2>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">Halo, {userProfile.name}! Ini Performa Kamu.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl">
          <Award className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-black text-white uppercase tracking-widest">Level: Anti-Mager</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<CheckSquare className="w-5 h-5 text-emerald-400" />}
          label="Misi Selesai"
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          subValue={`${stats.taskCompletionRate}% Selesai`}
          color="emerald"
        />
        <StatCard 
          icon={<Timer className="w-5 h-5 text-indigo-400" />}
          label="Waktu Fokus"
          value={`${stats.focusHours}j ${stats.focusMinutes}m`}
          subValue="Total Sesi Belajar"
          color="indigo"
        />
        <StatCard 
          icon={<Activity className="w-5 h-5 text-orange-400" />}
          label="Aktivitas Fisik"
          value={`${stats.totalPhysicalTime}m`}
          subValue="Total Gerak Badan"
          color="orange"
        />
        <StatCard 
          icon={<Bell className="w-5 h-5 text-red-400" />}
          label="Nudge AI"
          value={`${stats.nudgeCount}`}
          subValue="Alert Anti-Mager"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 glass p-6 rounded-[2.5rem] border border-white/5 bg-slate-900/40">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Aktivitas 7 Hari Terakhir</h3>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Focus</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /> Physical</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight="bold" 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight="bold" 
                  axisLine={false} 
                  tickLine={false}
                  label={{ value: 'Menit', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 10, fontWeight: 'bold' } }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Bar dataKey="focus" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="physical" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session Distribution */}
        <div className="glass p-6 rounded-[2.5rem] border border-white/5 bg-slate-900/40 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Distribusi Sesi</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            {pieData.length > 0 ? (
              <>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full mt-4">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-white">{d.value} Sesi</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 opacity-20">
                <Activity className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Belum ada data sesi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Section */}
      <div className="glass p-8 rounded-[3rem] border border-indigo-500/20 bg-indigo-600/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Award className="w-32 h-32 text-indigo-400" />
        </div>
        <div className="relative z-10">
          <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Target Utama Kamu</h4>
          <p className="text-xl font-bold text-white leading-relaxed max-w-2xl">
            "{userProfile.goal}"
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">1</div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">2</div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">3</div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Terus Berjuang, {userProfile.name}!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue: string;
  color: 'emerald' | 'indigo' | 'orange' | 'red';
}> = ({ icon, label, value, subValue, color }) => {
  const colorClasses = {
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    indigo: 'border-indigo-500/20 bg-indigo-500/5',
    orange: 'border-orange-500/20 bg-orange-500/5',
    red: 'border-red-500/20 bg-red-500/5'
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-6 rounded-[2rem] border glass transition-all ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black text-white tracking-tighter mb-1">{value}</div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{subValue}</div>
    </motion.div>
  );
};
