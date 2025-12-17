import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutLog } from '../types';
import { Play, Pause, Square, CheckCircle, Clock, ChevronRight, Save, Video, Loader2, AlertCircle, Key } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import { geminiService } from '../services/gemini';
import { VideoPlayer } from './ui/VideoPlayer';

interface WorkoutSessionProps {
    plan: WorkoutPlan;
    onComplete: () => void;
    onCancel: () => void;
}

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({ plan, onComplete, onCancel }) => {
    const { logWorkout } = useGlobalContext();
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [restTimer, setRestTimer] = useState(0);
    const [isResting, setIsResting] = useState(false);
    
    // Video generation state
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [loadingText, setLoadingText] = useState("Initializing AI...");
    
    const [logs, setLogs] = useState<any[]>(
        plan.exercises.map(ex => ({ 
            name: ex.name, 
            completedSets: 0, 
            targetSets: parseInt(ex.sets) || 3 
        }))
    );

    const currentExercise = plan.exercises[currentExerciseIndex];

    // Reset video state when exercise changes
    useEffect(() => {
        setVideoUrl(null);
        setIsVideoLoading(false);
        setVideoError(null);
    }, [currentExerciseIndex]);

    // Cycling loading text to improve perceived speed
    useEffect(() => {
        let textInterval: any;
        if (isVideoLoading) {
            const messages = [
                "Analyzing movement mechanics...",
                "Scripting 3D scene...",
                "Rendering lighting...",
                "Generating smooth motion...",
                "Polishing final frames..."
            ];
            let i = 0;
            setLoadingText(messages[0]);
            textInterval = setInterval(() => {
                i = (i + 1) % messages.length;
                setLoadingText(messages[i]);
            }, 2500);
        }
        return () => clearInterval(textInterval);
    }, [isVideoLoading]);

    useEffect(() => {
        let interval: any;
        if (isTimerRunning && !isResting) {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, isResting]);

    useEffect(() => {
        let interval: any;
        if (isResting && restTimer > 0) {
            interval = setInterval(() => setRestTimer(t => t - 1), 1000);
        } else if (isResting && restTimer === 0) {
            setIsResting(false);
            // Play sound or alert here
        }
        return () => clearInterval(interval);
    }, [isResting, restTimer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (currentExerciseIndex / plan.exercises.length) * 100;

    const handleNext = () => {
        if (currentExerciseIndex < plan.exercises.length - 1) {
            setCurrentExerciseIndex(i => i + 1);
            setIsResting(true);
            setRestTimer(60); // Default 60s rest between exercises
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        setIsTimerRunning(false);
        const log: WorkoutLog = {
            ...plan,
            id: Date.now().toString(),
            completedAt: new Date().toISOString(),
            durationMinutes: Math.ceil(timer / 60),
            // Could add detailed logs here
        };
        logWorkout(log);
        onComplete();
    };

    const logSet = () => {
        const newLogs = [...logs];
        newLogs[currentExerciseIndex].completedSets += 1;
        setLogs(newLogs);
        
        // Optional: Trigger rest timer after set
        if (newLogs[currentExerciseIndex].completedSets < newLogs[currentExerciseIndex].targetSets) {
             setIsResting(true);
             setRestTimer(45); // 45s rest between sets
        }
    };

    const handleSelectKey = async () => {
        if ((window as any).aistudio) {
            try {
                await (window as any).aistudio.openSelectKey();
                // After selecting, try generating again immediately or reset error
                setVideoError(null);
            } catch (e) {
                console.error("Failed to open key selector", e);
            }
        } else {
            alert("Key selector not available in this environment.");
        }
    };

    const handleGenerateVideo = async () => {
        setIsVideoLoading(true);
        setVideoError(null);
        try {
            const url = await geminiService.generateExerciseVideo(currentExercise.name, currentExercise.instructions);
            setVideoUrl(url);
        } catch (e: any) {
            console.error(e);
            let msg = "Video generation failed.";
            
            // Check for specific error types regarding API Keys / Billing
            if (e.message.includes("403") || e.message.includes("permission") || e.message.includes("key")) {
                msg = "BILLING_REQUIRED"; 
            } else if (e.message.includes("not found")) {
                msg = "Model Not Found: The 'veo-3.1-fast-generate-preview' model is not available.";
            } else {
                msg = e.message || "Unknown error occurred.";
            }
            setVideoError(msg);
        } finally {
            setIsVideoLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-100px)] flex flex-col bg-slate-900 relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">{plan.routineName}</h2>
                    <p className="text-slate-400 text-sm">{currentExerciseIndex + 1} of {plan.exercises.length} Exercises</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-2 font-mono text-[#00FF9C]">
                        <Clock size={16} />
                        {formatTime(timer)}
                    </div>
                    <button onClick={onCancel} className="p-2 text-slate-500 hover:text-white active:scale-90 transition-transform">
                        <Square size={20} fill="currentColor" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
                <div className="bg-[#00FF9C] h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Main Exercise Card */}
            <div className="flex-1 overflow-y-auto pb-24">
                <div className="bg-slate-800 rounded-3xl p-6 md:p-10 border border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-[#00FF9C]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="text-[#00FF9C] font-bold text-sm tracking-widest uppercase mb-2">Current Exercise</div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">{currentExercise.name}</h1>
                        
                        {/* Video Section */}
                        {videoUrl ? (
                            <div className="mb-6">
                                <VideoPlayer src={videoUrl} autoPlay={true} />
                            </div>
                        ) : (
                            <div className="mb-6">
                                {videoError ? (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 flex gap-4 text-left items-start">
                                        <AlertCircle className="text-red-500 shrink-0 mt-1" size={24} />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-red-400">Video Generation Issue</h4>
                                            
                                            {videoError === "BILLING_REQUIRED" ? (
                                                <>
                                                    <p className="text-xs text-slate-300 mt-1 mb-3">
                                                        The Veo video model is a premium feature. You must select a Paid API Key from a Google Cloud Project with billing enabled.
                                                    </p>
                                                    <button 
                                                        onClick={handleSelectKey}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                                                    >
                                                        <Key size={14} /> Select Paid API Key
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-xs text-slate-300 mt-1">{videoError}</p>
                                                    <button 
                                                        onClick={() => setVideoError(null)}
                                                        className="text-xs text-red-400 mt-2 underline"
                                                    >
                                                        Try Again
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleGenerateVideo}
                                        disabled={isVideoLoading}
                                        className="w-full py-8 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-white rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group active:scale-[0.98]"
                                    >
                                        {isVideoLoading ? (
                                            <>
                                                <Loader2 className="animate-spin text-emerald-400" size={32} />
                                                <div className="text-center">
                                                    <div className="text-emerald-400 font-bold mb-1">Creating Demo...</div>
                                                    <div className="text-slate-500 text-sm animate-pulse">{loadingText}</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                                    <Video size={24} className="text-emerald-400" />
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold">Generate AI Demo Video</div>
                                                    <div className="text-slate-500 text-sm">Powered by Veo</div>
                                                </div>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                <div className="text-slate-400 text-xs uppercase font-bold">Sets</div>
                                <div className="text-2xl font-bold text-white">{currentExercise.sets}</div>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                <div className="text-slate-400 text-xs uppercase font-bold">Reps</div>
                                <div className="text-2xl font-bold text-white">{currentExercise.reps}</div>
                            </div>
                        </div>

                        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700 mb-8">
                            <h4 className="text-slate-300 font-bold mb-2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9C]"></div> 
                                Instructions
                            </h4>
                            <p className="text-slate-400 leading-relaxed">{currentExercise.instructions}</p>
                        </div>

                        <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700">
                             <div className="text-white font-bold">
                                 Sets Completed: <span className="text-[#00FF9C] text-xl">{logs[currentExerciseIndex].completedSets}</span> / {logs[currentExerciseIndex].targetSets}
                             </div>
                             <button 
                                onClick={logSet} 
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-600 transition-all active:scale-95 hover:border-[#00FF9C]"
                             >
                                 Log Set
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rest Timer Overlay */}
            {isResting && (
                <div className="absolute inset-x-0 bottom-24 mx-4 bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-xl flex items-center justify-between z-20 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-[#00FF9C] flex items-center justify-center text-white font-bold text-sm">
                            {restTimer}s
                        </div>
                        <div>
                            <div className="font-bold text-white">Resting...</div>
                            <div className="text-xs text-slate-400">Take a breather</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => { setIsResting(false); setRestTimer(0); }}
                        className="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-all active:scale-95"
                    >
                        Skip
                    </button>
                </div>
            )}

            {/* Bottom Controls */}
            <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-slate-900 border-t border-slate-800 p-4 flex gap-4 z-30">
                <button 
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                    {isTimerRunning ? 'Pause' : 'Resume'}
                </button>
                
                {currentExerciseIndex === plan.exercises.length - 1 ? (
                    <button 
                        onClick={handleFinish}
                        className="flex-[2] bg-[#00FF9C] hover:bg-[#00cc7d] text-slate-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00FF9C]/20 active:scale-[0.98]"
                    >
                        <Save size={20} /> Finish Workout
                    </button>
                ) : (
                    <button 
                        onClick={handleNext}
                        className="flex-[2] bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        Next Exercise <ChevronRight size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};