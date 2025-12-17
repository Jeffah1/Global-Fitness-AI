import React, { useMemo } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { useUser } from '../context/UserContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Flame, Timer, Trophy, Dumbbell, Droplet, Plus, Minus, ArrowRight } from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView?: (view: AppView) => void;
  isVisible?: boolean;
}

const StatCard: React.FC<{ title: string; value: string; sub: string; icon: React.ReactNode; color: string }> = ({ title, value, sub, icon, color }) => (
  <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all shadow-lg hover:shadow-xl group hover:-translate-y-1 duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20 group-hover:bg-opacity-30 transition-colors`}>
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
    <div className="space-y-8 animate-fade-in relative pb-12">
       {/* Background Decor */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Hi, {user.name}
            </h2>
            <p className="text-slate-400 mt-1">Let's crush your <span className="text-[#00FF9C] font-bold">{user.goal}</span> goals today.</p>
        </div>
        <button 
            onClick={() => onChangeView && onChangeView(AppView.WORKOUTS)}
            className="bg-[#00FF9C] hover:bg-[#00cc7d] text-slate-900 font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-[#00FF9C]/20 active:scale-95 flex items-center gap-2 group"
        >
            Start New Workout <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Water Tracker */}
      <div className="relative z-10 bg-gradient-to-r from-blue-900/40 to-slate-800/40 backdrop-blur-md border border-blue-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between shadow-lg shadow-blue-500/5">
         <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-blue-500 p-4 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                <Droplet size={28} fill="currentColor" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">Hydration Status</h3>
                <p className="text-slate-400 text-sm">Daily Target: 8 glasses</p>
            </div>
         </div>
         <div className="flex items-center gap-8">
             <div className="text-3xl font-bold text-blue-400">{user.waterIntake} <span className="text-lg text-slate-500 font-medium">/ 8</span></div>
             <div className="flex gap-3">
                 <button onClick={() => updateWater(-1)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white active:scale-90 transition-all border border-slate-700"><Minus size={18} /></button>
                 <button onClick={() => updateWater(1)} className="p-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white active:scale-90 transition-all shadow-lg shadow-blue-500/20"><Plus size={18} /></button>
             </div>
         </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            title="Workouts" 
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

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-[#00FF9C]" />
                Activity Overview
            </h3>
            <div className="h-[300px] w-full">
                {isVisible && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00FF9C" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00FF9C" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                cursor={{ stroke: '#334155', strokeWidth: 1 }}
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }} 
                                itemStyle={{ color: '#00FF9C' }}
                            />
                            <Area type="monotone" dataKey="calories" stroke="#00FF9C" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Recent Achievements</h3>
            <div className="space-y-4">
                {stats.workoutsCount > 0 ? (
                    <>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-700/30 border border-slate-700/50 hover:border-[#00FF9C]/30 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-orange-500/20">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-200 text-sm">Action Taker</h4>
                                <p className="text-xs text-slate-400 mt-1">Completed a workout</p>
                            </div>
                        </div>
                        {user.waterIntake >= 8 && (
                             <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-700/30 border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-blue-500/20">
                                    <Droplet size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200 text-sm">Hydrated</h4>
                                    <p className="text-xs text-slate-400 mt-1">Hit water goal</p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-2xl">
                        <Trophy size={32} className="mx-auto mb-3 opacity-20" />
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