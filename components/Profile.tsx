import React, { useState, useMemo } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { User, Settings, Award, Ruler, Scale, LogOut, Crown, TrendingUp, Lock, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const Profile: React.FC = () => {
  const { user, updateProfile, logout, workoutHistory, upgradeToPremium } = useGlobalContext();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(user?.stats || { age: 0, weight: 0, height: 0, gender: 'Male' });

  // Analytics Data Calculation
  const muscleData = useMemo(() => {
    if (!workoutHistory) return [];
    const counts: Record<string, number> = {};
    workoutHistory.forEach(log => {
        const muscles = log.targetMuscleGroup.split(',').map(m => m.trim());
        muscles.forEach(m => {
            counts[m] = (counts[m] || 0) + 1;
        });
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5
  }, [workoutHistory]);

  const consistencyData = useMemo(() => {
    if (!workoutHistory) return [];
    const data = [];
    const today = new Date();
    
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const monthIdx = d.getMonth();
        const year = d.getFullYear();
        
        const count = workoutHistory.filter(log => {
            const logDate = new Date(log.completedAt);
            return logDate.getMonth() === monthIdx && logDate.getFullYear() === year;
        }).length;

        data.push({ name: monthName, workouts: count });
    }
    return data;
  }, [workoutHistory]);

  if (!user) return null;

  const handleSave = () => {
    updateProfile({ stats: form as any });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 border-4 border-slate-600 shadow-xl">
                    <User size={40} />
                </div>
                <div className="text-center md:text-left flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                        {user.isPremium && <Award className="text-yellow-400 drop-shadow-lg" fill="currentColor" size={24} />}
                    </div>
                    <p className="text-slate-400">{user.email}</p>
                    <div className="flex gap-2 mt-4 justify-center md:justify-start">
                        <span className="px-3 py-1 rounded-full bg-slate-700 text-xs font-bold text-slate-300 uppercase tracking-wide border border-slate-600">
                            {user.fitnessLevel}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-700 text-xs font-bold text-emerald-400 uppercase tracking-wide border border-slate-600">
                            {user.goal}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95 border border-transparent hover:border-red-400/30"
                    title="Sign Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-white flex items-center gap-2">
                         <Settings size={20} className="text-emerald-400" />
                         Body Stats
                     </h3>
                     <button 
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-colors font-bold"
                     >
                         {isEditing ? 'Save Changes' : 'Edit Stats'}
                     </button>
                 </div>
                 
                 <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Scale size={18} />
                            <span>Weight</span>
                        </div>
                        {isEditing ? (
                            <input 
                                type="number" 
                                value={form.weight}
                                onChange={(e) => setForm({...form, weight: Number(e.target.value)})}
                                className="w-20 bg-slate-800 text-white text-right p-1 rounded border border-slate-600 focus:border-emerald-500 outline-none"
                            />
                        ) : (
                            <span className="font-bold text-white">{user.stats.weight} kg</span>
                        )}
                     </div>
                     <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Ruler size={18} />
                            <span>Height</span>
                        </div>
                         {isEditing ? (
                            <input 
                                type="number" 
                                value={form.height}
                                onChange={(e) => setForm({...form, height: Number(e.target.value)})}
                                className="w-20 bg-slate-800 text-white text-right p-1 rounded border border-slate-600 focus:border-emerald-500 outline-none"
                            />
                        ) : (
                            <span className="font-bold text-white">{user.stats.height} cm</span>
                        )}
                     </div>
                     <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-3 text-slate-400">
                            <User size={18} />
                            <span>Age</span>
                        </div>
                         {isEditing ? (
                            <input 
                                type="number" 
                                value={form.age}
                                onChange={(e) => setForm({...form, age: Number(e.target.value)})}
                                className="w-20 bg-slate-800 text-white text-right p-1 rounded border border-slate-600 focus:border-emerald-500 outline-none"
                            />
                        ) : (
                            <span className="font-bold text-white">{user.stats.age} yrs</span>
                        )}
                     </div>
                 </div>
            </div>

            <div className="md:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <Award size={20} className="text-emerald-400" />
                    Achievements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Award size={24} />
                        </div>
                        <div className="text-sm font-bold text-white">Starter</div>
                        <div className="text-xs text-slate-500">Joined App</div>
                    </div>
                    {user.streak > 3 && (
                        <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700/50 hover:border-orange-500/30 transition-colors">
                            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Award size={24} />
                            </div>
                            <div className="text-sm font-bold text-white">On Fire</div>
                            <div className="text-xs text-slate-500">3 Day Streak</div>
                        </div>
                    )}
                    {user.isPremium && (
                         <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700/50 hover:border-yellow-500/30 transition-colors">
                            <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Crown size={24} />
                            </div>
                            <div className="text-sm font-bold text-white">Elite</div>
                            <div className="text-xs text-slate-500">Premium Member</div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Advanced Analytics Section */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-400" />
                    Advanced Analytics
                </h3>
                {!user.isPremium && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-bold border border-yellow-500/20">
                        <Lock size={12} /> Premium Feature
                    </div>
                )}
            </div>

            {user.isPremium ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    {/* Consistency Chart */}
                    <div className="h-64">
                        <h4 className="text-sm font-bold text-slate-400 mb-4">Monthly Consistency</h4>
                        {consistencyData.length > 0 && consistencyData.some(d => d.workouts > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={consistencyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip 
                                        cursor={{fill: '#334155', opacity: 0.2}}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                    />
                                    <Bar dataKey="workouts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm italic bg-slate-900/50 rounded-xl">
                                No workout data available yet
                            </div>
                        )}
                    </div>

                    {/* Muscle Distribution Chart */}
                    <div className="h-64">
                        <h4 className="text-sm font-bold text-slate-400 mb-4">Top Muscle Groups</h4>
                        {muscleData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={muscleData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        stroke="#64748b" 
                                        tick={{fill: '#94a3b8', fontSize: 11}} 
                                        width={80} 
                                        axisLine={false} 
                                        tickLine={false}
                                    />
                                    <Tooltip 
                                        cursor={{fill: '#334155', opacity: 0.2}}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                    />
                                    <Bar dataKey="value" fill="#00FF9C" radius={[0, 4, 4, 0]}>
                                        {muscleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#00FF9C', '#10B981', '#059669', '#047857', '#065F46'][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="h-full flex items-center justify-center text-slate-500 text-sm italic bg-slate-900/50 rounded-xl">
                                Complete workouts to see stats
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative h-64 bg-slate-900/50 rounded-xl flex flex-col items-center justify-center border border-slate-800 text-center p-6 overflow-hidden group">
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-10 blur-sm pointer-events-none">
                         <div className="grid grid-cols-6 gap-2 h-full">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="bg-slate-700 h-32 rounded-t-lg mt-auto mx-1"></div>
                            ))}
                         </div>
                    </div>

                    <div className="relative z-10 max-w-sm">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-xl group-hover:scale-110 transition-transform duration-300">
                            <Lock size={32} className="text-slate-400" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Unlock Your Full Potential</h4>
                        <p className="text-slate-400 mb-6 text-sm">
                            Gain access to advanced consistency charts, muscle group breakdown, and detailed volume tracking with Premium.
                        </p>
                        <button 
                            onClick={upgradeToPremium}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 mx-auto active:scale-95"
                        >
                            Upgrade Now <ArrowUpRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};