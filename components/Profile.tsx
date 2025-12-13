import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { User, Settings, Award, Ruler, Scale, LogOut, Crown } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useGlobalContext();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(user?.stats || { age: 0, weight: 0, height: 0, gender: 'Male' });

  if (!user) return null;

  const handleSave = () => {
    updateProfile({ stats: form as any });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 border-4 border-slate-600">
                    <User size={40} />
                </div>
                <div className="text-center md:text-left flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                        {user.isPremium && <Award className="text-yellow-400" fill="currentColor" size={24} />}
                    </div>
                    <p className="text-slate-400">{user.email}</p>
                    <div className="flex gap-2 mt-4 justify-center md:justify-start">
                        <span className="px-3 py-1 rounded-full bg-slate-700 text-xs font-bold text-slate-300 uppercase tracking-wide">
                            {user.fitnessLevel}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-700 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                            {user.goal}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-white flex items-center gap-2">
                         <Settings size={20} className="text-emerald-400" />
                         Body Stats
                     </h3>
                     <button 
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="text-xs text-emerald-400 hover:underline"
                     >
                         {isEditing ? 'Save' : 'Edit'}
                     </button>
                 </div>
                 
                 <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Scale size={18} />
                            <span>Weight</span>
                        </div>
                        {isEditing ? (
                            <input 
                                type="number" 
                                value={form.weight}
                                onChange={(e) => setForm({...form, weight: Number(e.target.value)})}
                                className="w-20 bg-slate-800 text-white text-right p-1 rounded border border-slate-600"
                            />
                        ) : (
                            <span className="font-bold text-white">{user.stats.weight} kg</span>
                        )}
                     </div>
                     <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Ruler size={18} />
                            <span>Height</span>
                        </div>
                         {isEditing ? (
                            <input 
                                type="number" 
                                value={form.height}
                                onChange={(e) => setForm({...form, height: Number(e.target.value)})}
                                className="w-20 bg-slate-800 text-white text-right p-1 rounded border border-slate-600"
                            />
                        ) : (
                            <span className="font-bold text-white">{user.stats.height} cm</span>
                        )}
                     </div>
                     <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl">
                        <div className="flex items-center gap-3 text-slate-400">
                            <User size={18} />
                            <span>Age</span>
                        </div>
                         {isEditing ? (
                            <input 
                                type="number" 
                                value={form.age}
                                onChange={(e) => setForm({...form, age: Number(e.target.value)})}
                                className="w-20 bg-slate-800 text-white text-right p-1 rounded border border-slate-600"
                            />
                        ) : (
                            <span className="font-bold text-white">{user.stats.age} yrs</span>
                        )}
                     </div>
                 </div>
            </div>

            <div className="md:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <Award size={20} className="text-emerald-400" />
                    Achievements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700/50">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Award size={24} />
                        </div>
                        <div className="text-sm font-bold text-white">Starter</div>
                        <div className="text-xs text-slate-500">Joined App</div>
                    </div>
                    {user.streak > 3 && (
                        <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700/50">
                            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Award size={24} />
                            </div>
                            <div className="text-sm font-bold text-white">On Fire</div>
                            <div className="text-xs text-slate-500">3 Day Streak</div>
                        </div>
                    )}
                    {user.isPremium && (
                         <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700/50">
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
    </div>
  );
};