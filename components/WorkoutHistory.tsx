import React, { useState, useMemo } from 'react';
import { WorkoutLog } from '../types';
import { Calendar, Clock, Dumbbell, ChevronDown, ChevronUp, Trophy, TrendingUp, Search, Filter, X } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface WorkoutHistoryProps {
  history: WorkoutLog[];
  isVisible?: boolean;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ history, isVisible = true }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');

  const filteredHistory = useMemo(() => {
    let data = history;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(h => 
        h.routineName.toLowerCase().includes(lower) || 
        h.targetMuscleGroup.toLowerCase().includes(lower)
      );
    }

    if (durationFilter !== 'all') {
      data = data.filter(h => {
        if (durationFilter === 'short') return h.durationMinutes < 30;
        if (durationFilter === 'medium') return h.durationMinutes >= 30 && h.durationMinutes <= 60;
        if (durationFilter === 'long') return h.durationMinutes > 60;
        return true;
      });
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      data = data.filter(h => {
        const d = new Date(h.completedAt);
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    return data;
  }, [history, searchTerm, durationFilter, dateFilter]);

  const chartData = useMemo(() => {
    if (filteredHistory.length === 0) return [];
    const weeks: Record<number, number> = {};
    filteredHistory.forEach(log => {
      const d = new Date(log.completedAt);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      const key = monday.getTime();
      weeks[key] = (weeks[key] || 0) + log.durationMinutes;
    });
    return Object.entries(weeks)
      .map(([timestamp, duration]) => ({
        name: `Week of ${new Date(parseInt(timestamp)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        shortName: new Date(parseInt(timestamp)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: parseInt(timestamp),
        duration
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredHistory]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const clearFilters = () => {
      setSearchTerm('');
      setDurationFilter('all');
      setDateFilter('all');
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-800 rounded-2xl border border-slate-700 animate-fade-in shadow-xl">
        <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mb-6 text-slate-400">
          <Calendar size={40} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No workouts logged</h3>
        <p className="text-slate-400 max-w-md text-center">
          Go to the Workouts tab to generate a routine and mark it as complete to start building your history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-3 rounded-xl">
                <Trophy className="text-emerald-400" size={32} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-white">Workout History</h2>
                <p className="text-slate-400">Track your progress and past achievements</p>
            </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search routine or muscle..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <select 
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                    <option value="all">Any Duration</option>
                    <option value="short">Short (&lt; 30m)</option>
                    <option value="medium">Medium (30-60m)</option>
                    <option value="long">Long (&gt; 60m)</option>
                </select>
                <select 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                    <option value="all">All Time</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                </select>
                {(searchTerm || durationFilter !== 'all' || dateFilter !== 'all') && (
                    <button 
                        onClick={clearFilters}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl px-3 py-2.5 transition-all active:scale-95 flex items-center justify-center"
                        title="Clear Filters"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Filtered Results */}
      {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed animate-fade-in">
              <Filter size={48} className="mx-auto mb-3 opacity-20" />
              <p>No workouts match your filters.</p>
              <button onClick={clearFilters} className="text-emerald-400 font-bold mt-2 hover:underline">Clear Filters</button>
          </div>
      ) : (
        <>
            {/* Trends Chart */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="text-emerald-400" size={20} />
                        <h3 className="text-lg font-bold text-white">Duration Trends</h3>
                    </div>
                    <span className="text-xs text-slate-500 uppercase font-bold">Based on current filters</span>
                </div>
                <div className="h-[250px] w-full">
                    {isVisible && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="shortName" stroke="#64748b" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: '#334155', opacity: 0.2}}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Bar dataKey="duration" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} name="Duration (mins)" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredHistory.map((log) => (
                <div 
                    key={log.id} 
                    className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
                >
                    <div 
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-700/30 transition-colors active:bg-slate-700/50"
                    onClick={() => toggleExpand(log.id)}
                    >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 text-emerald-400 mb-1">
                            <Calendar size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">{formatDate(log.completedAt)}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{log.routineName}</h3>
                        <p className="text-sm text-slate-400 mt-1">{log.targetMuscleGroup} • {log.difficulty}</p>
                    </div>
                    
                    <div className="flex items-center gap-6 text-slate-300">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold">
                                <Clock size={16} />
                                {log.durationMinutes}
                            </div>
                            <div className="text-xs text-slate-500">Minutes</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-blue-400 font-bold">
                                <Dumbbell size={16} />
                                {log.exercises.length}
                            </div>
                            <div className="text-xs text-slate-500">Exercises</div>
                        </div>
                        <div className="text-slate-500 ml-2 transform transition-transform duration-200" style={{ transform: expandedId === log.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            <ChevronDown size={20} />
                        </div>
                    </div>
                    </div>

                    {expandedId === log.id && (
                    <div className="px-6 pb-6 pt-2 bg-slate-900/30 border-t border-slate-700/50 animate-fade-in">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 mt-2">Routine Details</h4>
                        <div className="grid gap-3">
                            {log.exercises.map((ex, i) => (
                                <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-slate-800 border border-slate-700/50">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-slate-300 text-xs flex items-center justify-center font-bold">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium text-slate-200">{ex.name}</span>
                                            <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                                                {ex.sets} x {ex.reps}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{ex.instructions}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    )}
                </div>
                ))}
            </div>
        </>
      )}
    </div>
  );
};

export default WorkoutHistory;