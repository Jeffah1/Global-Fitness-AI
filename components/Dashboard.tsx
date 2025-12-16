import React, { useMemo } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Flame, Timer, Trophy, Dumbbell, Droplet, Plus, Minus } from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView?: (view: AppView) => void;
  isVisible?: boolean;
}

const StatCard: React.FC<{ title: string; value: string; sub: string; icon: React.ReactNode; color: string }> = ({ title, value, sub, icon, color }) => (
  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors shadow-lg hover:shadow-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: color.replace('bg-', 'text-') })}
      </div>
    </div>
    <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
    <p className="text-sm text-slate-400 mb-1">{title}</p>
    <p className="text-xs text-slate-500">{sub}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onChangeView, isVisible = true }) => {
  const { user, workoutHistory, updateWater } = useGlobalContext();

  const stats = useMemo(() => {
    if (!workoutHistory) return { activeMinutes: 0, caloriesBurned: 0, workoutsCount: 0, streak: 0 };
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const thisMonthLogs = workoutHistory.filter(h => {
      const d = new Date(h.completedAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const thisWeekLogs = workoutHistory.filter(h => new Date(h.completedAt) >= startOfWeek);

    const activeMinutes = thisWeekLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const caloriesBurned = activeMinutes * 8;
    const workoutsCount = thisMonthLogs.length;

    return {
      activeMinutes,
      caloriesBurned,
      workoutsCount,
      streak: user?.streak || 0
    };
  }, [workoutHistory, user]);

  const chartData = useMemo(() => {
    const data = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      
      const dayLogs = workoutHistory.filter(h => h.completedAt.startsWith(dateStr));
      const mins = dayLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      
      data.push({
        name: dayName,
        calories: mins * 8
      });
    }
    return data;
  }, [workoutHistory]);

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">Hi, {user.name}</h2>
            <p className="text-slate-400">Let's crush your {user.goal} goals today.</p>
        </div>
        <button 
            onClick={() => onChangeView && onChangeView(AppView.WORKOUTS)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
            Start New Workout
        </button>
      </div>

      {/* Water Tracker */}
      <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-500/5">
         <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-3 rounded-full text-white shadow-lg shadow-blue-500/20">
                <Droplet size={24} fill="currentColor" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">Hydration</h3>
                <p className="text-slate-400 text-sm">Target: 8 glasses/day</p>
            </div>
         </div>
         <div className="flex items-center gap-6">
             <div className="text-2xl font-bold text-blue-400">{user.waterIntake} <span className="text-sm text-slate-500">/ 8</span></div>
             <div className="flex gap-2">
                 <button onClick={() => updateWater(-1)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white active:scale-90 transition-all"><Minus size={16} /></button>
                 <button onClick={() => updateWater(1)} className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white active:scale-90 transition-all shadow-lg shadow-blue-500/20"><Plus size={16} /></button>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="Calories Burned" 
            value={stats.caloriesBurned.toLocaleString()} 
            sub="This Week" 
            icon={<Flame size={24} />} 
            color="bg-orange-500"
        />
        <StatCard 
            title="Active Minutes" 
            value={stats.activeMinutes.toString()} 
            sub="This Week" 
            icon={<Timer size={24} />} 
            color="bg-blue-500"
        />
        <StatCard 
            title="Workouts Completed" 
            value={stats.workoutsCount.toString()} 
            sub="This Month" 
            icon={<Dumbbell size={24} />} 
            color="bg-purple-500"
        />
        <StatCard 
            title="Current Streak" 
            value={`${stats.streak} Day${stats.streak !== 1 ? 's' : ''}`} 
            sub="Keep it up!" 
            icon={<Trophy size={24} />} 
            color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-400" />
                Activity Overview
            </h3>
            <div className="h-[300px] w-full">
                {isVisible && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} 
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Area type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Recent Achievements</h3>
            <div className="space-y-4">
                {stats.workoutsCount > 0 ? (
                    <>
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-700/30 border border-slate-700/50">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-slate-900 font-bold">
                                <Trophy size={16} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-200 text-sm">Action Taker</h4>
                                <p className="text-xs text-slate-400">Completed a workout</p>
                            </div>
                        </div>
                        {user.waterIntake >= 8 && (
                             <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-700/30 border border-slate-700/50">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-slate-900 font-bold">
                                    <Droplet size={16} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200 text-sm">Hydrated</h4>
                                    <p className="text-xs text-slate-400">Hit water goal</p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <p className="text-sm">Complete your first workout to unlock achievements!</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;