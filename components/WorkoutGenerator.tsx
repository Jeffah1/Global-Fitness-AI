import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { WorkoutPlan } from '../types';
import { Loader2, PlayCircle, Clock, BarChart2, Zap, Sliders, XCircle, Target, Activity, Check, Video } from 'lucide-react';

interface WorkoutGeneratorProps {
    onStartSession: (plan: WorkoutPlan) => void;
}

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs', 'Glutes', 'Full Body'];

const WorkoutGenerator: React.FC<WorkoutGeneratorProps> = ({ onStartSession }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    goal: 'Build Muscle',
    level: 'Intermediate',
    duration: '45',
    equipment: 'Dumbbells only',
    targetMuscles: '',
    excludedExercises: '',
    trainingStyle: 'Standard Sets',
    preferences: ''
  });

  // Track video loading/url states by exercise index
  const [videoStates, setVideoStates] = useState<Record<number, { loading: boolean, url: string | null }>>({});

  const toggleTargetMuscle = (muscle: string) => {
    const current = formData.targetMuscles.split(',').map(s => s.trim()).filter(Boolean);
    let updated;
    if (current.includes(muscle)) {
        updated = current.filter(m => m !== muscle);
    } else {
        updated = [...current, muscle];
    }
    setFormData({ ...formData, targetMuscles: updated.join(', ') });
  };

  const generatePlan = async () => {
    setLoading(true);
    setPlan(null);
    setVideoStates({});
    try {
      const result = await geminiService.generateWorkout(
        formData.goal,
        formData.level,
        formData.duration,
        formData.equipment,
        formData.targetMuscles,
        formData.excludedExercises,
        formData.trainingStyle,
        formData.preferences
      );
      setPlan(result);
    } catch (error) {
      console.error(error);
      alert("Failed to generate workout. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const generateExerciseVideo = async (index: number, exerciseName: string, instructions: string) => {
      setVideoStates(prev => ({ ...prev, [index]: { loading: true, url: null } }));
      try {
          const url = await geminiService.generateExerciseVideo(exerciseName, instructions);
          setVideoStates(prev => ({ ...prev, [index]: { loading: false, url } }));
      } catch (e) {
          console.error(e);
          alert("Video generation failed. Ensure you have a paid API key selected.");
          setVideoStates(prev => ({ ...prev, [index]: { loading: false, url: null } }));
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">AI Workout Generator</h2>
        <p className="text-slate-400">Specify your parameters and let Gemini craft the perfect routine.</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Goal</label>
            <select 
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none transition-all hover:border-slate-500"
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
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none transition-all hover:border-slate-500"
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
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none transition-all hover:border-slate-500"
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
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none placeholder-slate-500 transition-all hover:border-slate-500"
              placeholder="e.g. Gym, Bodyweight"
            />
          </div>
        </div>

        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-[#00FF9C] text-sm font-bold hover:text-[#00cc7d] mb-6 transition-colors group"
        >
          <Sliders size={16} className="group-hover:rotate-12 transition-transform" />
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>

        {showAdvanced && (
          <div className="space-y-6 animate-fade-in border-t border-slate-700 pt-6 mb-6">
            
            {/* Target Muscles with Chips */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                <Target size={14} /> Target Muscles
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {MUSCLE_GROUPS.map(muscle => {
                    const isSelected = formData.targetMuscles.includes(muscle);
                    return (
                        <button
                            key={muscle}
                            onClick={() => toggleTargetMuscle(muscle)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border active:scale-95 flex items-center gap-1.5 ${
                                isSelected 
                                ? 'bg-[#00FF9C] text-slate-900 border-[#00FF9C] shadow-lg shadow-[#00FF9C]/20 hover:bg-[#00cc7d]' 
                                : 'bg-slate-800 text-slate-400 border-slate-600 hover:border-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            {isSelected && <Check size={12} strokeWidth={4} />}
                            {muscle}
                        </button>
                    )
                })}
              </div>
              <input 
                type="text"
                value={formData.targetMuscles}
                onChange={(e) => setFormData({...formData, targetMuscles: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none placeholder-slate-500 transition-all hover:border-slate-500"
                placeholder="Or type custom focus areas..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                        <Activity size={14} /> Training Style
                    </label>
                    <select 
                        value={formData.trainingStyle}
                        onChange={(e) => setFormData({...formData, trainingStyle: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none transition-all hover:border-slate-500"
                    >
                        <option>Standard Sets</option>
                        <option>Supersets</option>
                        <option>Circuit Training</option>
                        <option>HIIT</option>
                        <option>Tabata</option>
                        <option>EMOM</option>
                        <option>AMRAP</option>
                    </select>
                </div>
                
                <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                    <XCircle size={14} /> Exclude Exercises
                </label>
                <input 
                    type="text"
                    value={formData.excludedExercises}
                    onChange={(e) => setFormData({...formData, excludedExercises: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none placeholder-slate-500 transition-all hover:border-slate-500"
                    placeholder="e.g. Burpees, Running"
                />
                </div>
            </div>

             <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Other Preferences</label>
              <input 
                type="text"
                value={formData.preferences}
                onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-[#00FF9C] focus:outline-none placeholder-slate-500 transition-all hover:border-slate-500"
                placeholder="e.g. Low impact, quiet exercises for apartment"
              />
            </div>
          </div>
        )}

        <button 
          onClick={generatePlan}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#00FF9C] to-emerald-500 hover:to-emerald-400 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-[#00FF9C]/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-[#00FF9C]/40"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Zap />}
          {loading ? 'Designing Routine...' : 'Generate Workout'}
        </button>
      </div>

      {plan && (
        <div className="animate-slide-up space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 relative overflow-hidden shadow-xl group hover:border-[#00FF9C]/30 transition-colors">
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
                    className="w-full md:w-auto px-8 py-3 bg-[#00FF9C] hover:bg-[#00cc7d] text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#00FF9C]/20 active:scale-95 hover:shadow-[#00FF9C]/40"
                >
                    <PlayCircle size={20} />
                    Start Session
                </button>
            </div>

            <div className="grid gap-4">
                {plan.exercises.map((ex, idx) => {
                    const videoState = videoStates[idx] || { loading: false, url: null };
                    return (
                        <div key={idx} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-[#00FF9C]/50 transition-all group hover:shadow-lg hover:shadow-[#00FF9C]/5 duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 group-hover:bg-[#00FF9C] group-hover:text-slate-900 transition-colors shadow-inner">
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
                            
                            {/* Video Generation Section */}
                            <div className="ml-14">
                                {videoState.url ? (
                                    <div className="rounded-xl overflow-hidden aspect-video border border-slate-700 shadow-md">
                                        <video src={videoState.url} controls className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => generateExerciseVideo(idx, ex.name, ex.instructions)}
                                        disabled={videoState.loading}
                                        className="text-xs font-bold text-slate-400 hover:text-[#00FF9C] flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700/50 hover:border-[#00FF9C]/30 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {videoState.loading ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
                                        {videoState.loading ? 'Creating Demo...' : 'Generate Demo Video'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutGenerator;