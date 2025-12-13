import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { WorkoutPlan } from '../types';
import { Loader2, PlayCircle, Clock, BarChart2, Zap } from 'lucide-react';

interface WorkoutGeneratorProps {
    onStartSession: (plan: WorkoutPlan) => void;
}

const WorkoutGenerator: React.FC<WorkoutGeneratorProps> = ({ onStartSession }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [formData, setFormData] = useState({
    goal: 'Build Muscle',
    level: 'Intermediate',
    duration: '45',
    equipment: 'Dumbbells only'
  });

  const generatePlan = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const result = await geminiService.generateWorkout(
        formData.goal,
        formData.level,
        formData.duration,
        formData.equipment
      );
      setPlan(result);
    } catch (error) {
      console.error(error);
      alert("Failed to generate workout. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">AI Workout Generator</h2>
        <p className="text-slate-400">Specify your parameters and let Gemini craft the perfect routine.</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Goal</label>
            <select 
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none"
            >
              <option>Build Muscle</option>
              <option>Lose Weight</option>
              <option>Increase Endurance</option>
              <option>Improve Flexibility</option>
              <option>HIIT / Cardio</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Level</label>
            <select 
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Duration (Mins)</label>
            <select 
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none"
            >
              <option>15</option>
              <option>30</option>
              <option>45</option>
              <option>60</option>
              <option>90</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Equipment</label>
            <input 
              type="text"
              value={formData.equipment}
              onChange={(e) => setFormData({...formData, equipment: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none placeholder-slate-500"
              placeholder="e.g. Gym, Bodyweight"
            />
          </div>
        </div>

        <button 
          onClick={generatePlan}
          disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-[#00FF9C] to-emerald-500 hover:to-emerald-400 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-[#00FF9C]/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Zap />}
          {loading ? 'Designing Routine...' : 'Generate Workout'}
        </button>
      </div>

      {plan && (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#00FF9C]"></div>
                <div>
                    <h3 className="text-2xl font-bold text-white">{plan.routineName}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={16} /> {plan.durationMinutes} mins</span>
                        <span className="flex items-center gap-1"><BarChart2 size={16} /> {plan.difficulty}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300">{plan.targetMuscleGroup}</span>
                    </div>
                </div>
                <button
                    onClick={() => onStartSession(plan)}
                    className="w-full md:w-auto px-8 py-3 bg-[#00FF9C] hover:bg-[#00cc7d] text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#00FF9C]/20"
                >
                    <PlayCircle size={20} />
                    Start Session
                </button>
            </div>

            <div className="grid gap-4">
                {plan.exercises.map((ex, idx) => (
                    <div key={idx} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-[#00FF9C]/50 transition-all group">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 group-hover:bg-[#00FF9C] group-hover:text-slate-900 transition-colors">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white group-hover:text-[#00FF9C] transition-colors">{ex.name}</h4>
                                    <p className="text-sm text-slate-400">{ex.instructions}</p>
                                </div>
                            </div>
                            <div className="text-right text-sm">
                                <div className="text-[#00FF9C] font-mono font-bold">{ex.sets} Sets</div>
                                <div className="text-slate-300">{ex.reps} Reps</div>
                                <div className="text-slate-500 mt-1 text-xs">Rest: {ex.rest}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutGenerator;