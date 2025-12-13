import React, { useState, useMemo } from 'react';
import { WorkoutLog } from '../types';
import { Calendar, Clock, Dumbbell, ChevronDown, ChevronUp, Trophy, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface WorkoutHistoryProps {
  history: WorkoutLog[];
  isVisible?: boolean;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ history, isVisible = true }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const chartData = useMemo(() => {
    if (history.length === 0) return [];

    const weeks: Record<number, number> = {};

    history.forEach(log => {
      const d = new Date(log.completedAt);
      // Adjust to Monday of the week
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
  }, [history]);

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

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-800 rounded-2xl border border-slate-700 animate-fade-in">
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="text-emerald-400" size={32} />
        <div>
          <h2 className="text-3xl font-bold text-white">Workout History</h2>
          <p className="text-slate-400">Track your progress and past achievements</p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-emerald-400" size={20} />
            <h3 className="text-lg font-bold text-white">Weekly Duration (Minutes)</h3>
        </div>
        <div className="h-[300px] w-full">
            {isVisible && (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                            dataKey="shortName" 
                            stroke="#64748b" 
                            tick={{fill: '#64748b', fontSize: 12}} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <YAxis 
                            stroke="#64748b" 
                            tick={{fill: '#64748b', fontSize: 12}} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <Tooltip 
                            cursor={{fill: '#334155', opacity: 0.2}}
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                            itemStyle={{ color: '#10b981' }}
                        />
                        <Bar 
                            dataKey="duration" 
                            fill="#10b981" 
                            radius={[4, 4, 0, 0]} 
                            barSize={40}
                            name="Duration"
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
      </div>

      <div className="space-y-4">
        {history.map((log) => (
          <div 
            key={log.id} 
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden transition-all hover:border-emerald-500/30"
          >
            <div 
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
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
                 <div className="text-slate-500 ml-2">
                    {expandedId === log.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </div>
               </div>
            </div>

            {expandedId === log.id && (
              <div className="px-6 pb-6 pt-2 bg-slate-900/30 border-t border-slate-700/50">
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
    </div>
  );
};

export default WorkoutHistory;