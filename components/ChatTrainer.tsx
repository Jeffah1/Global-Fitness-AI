import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { ChatMessage } from '../types';
import { useGlobalContext } from '../context/GlobalContext';
import { Send, User, Bot, Sparkles, Trash2, Activity, Crown, Lock, Mic, X, Volume2, Headphones } from 'lucide-react';
import { Chat, GenerateContentResponse, LiveServerMessage, Modality } from "@google/genai";

// --- AUDIO HELPERS ---
function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    return {
        data: b64,
        mimeType: 'audio/pcm;rate=16000',
    };
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

const ChatTrainer: React.FC = () => {
  const { user, workoutHistory } = useGlobalContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Text Chat Refs
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live Mode State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveVolume, setLiveVolume] = useState(0); // For visualizer
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  // --- PERSISTENCE & INIT ---
  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            parsed.forEach((m: ChatMessage) => m.timestamp = new Date(m.timestamp));
            setMessages(parsed);
        } catch(e) {
            console.error("Failed to parse chat", e);
            setDefaultMessage();
        }
    } else {
        setDefaultMessage();
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const setDefaultMessage = () => {
      setMessages([{
        id: '1',
        role: 'model',
        text: 'I am your calm, structured AI assistant. How can I help you plan your day or make a decision?',
        timestamp: new Date()
    }]);
  };

  const clearChat = () => {
      if (window.confirm("Are you sure you want to clear the conversation?")) {
        localStorage.removeItem('chatHistory');
        setDefaultMessage();
        chatSessionRef.current = geminiService.getChatModel();
      }
  };

  useEffect(() => {
    if (!chatSessionRef.current) {
        chatSessionRef.current = geminiService.getChatModel();
    }
    // Cleanup Live session on unmount
    return () => {
        stopLiveSession();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- TEXT CHAT HANDLERS ---
  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: textToSend,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        const resultStream = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
        
        const botMsgId = (Date.now() + 1).toString();
        let fullResponse = "";
        
        setMessages(prev => [...prev, {
            id: botMsgId,
            role: 'model',
            text: '',
            timestamp: new Date()
        }]);

        for await (const chunk of resultStream) {
            const c = chunk as GenerateContentResponse;
            const text = c.text || "";
            fullResponse += text;
            
            setMessages(prev => prev.map(msg => 
                msg.id === botMsgId ? { ...msg, text: fullResponse } : msg
            ));
        }

    } catch (error) {
        console.error("Chat error:", error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "I am unable to connect at the moment. Please try again shortly.",
            timestamp: new Date()
        }]);
    } finally {
        setIsTyping(false);
    }
  };

  const handleAnalyzeHistory = () => {
      if (!user?.isPremium) {
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'model',
              text: "🔒 **Premium Feature Locked**\n\nDeep analysis of your workout history, overtraining detection, and recovery insights are available to Premium members.\n\nVisit the Marketplace to upgrade and unlock your full potential!",
              timestamp: new Date()
          }]);
          return;
      }

      if (workoutHistory.length === 0) {
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'model',
              text: "I don't see any completed workouts in your history yet. Complete a few sessions and I can help you analyze them!",
              timestamp: new Date()
          }]);
          return;
      }

      const recentLogs = workoutHistory.slice(0, 10);
      const historyContext = recentLogs.map(h => 
          `- ${new Date(h.completedAt).toLocaleDateString()}: ${h.routineName} (${h.durationMinutes} min) - Difficulty: ${h.difficulty}, Target: ${h.targetMuscleGroup}`
      ).join('\n');

      const prompt = `Please analyze my recent workout history for insights, consistency patterns, and potential overtraining risks. Suggest recovery strategies if needed. Here is my data:\n${historyContext}`;
      handleSend(prompt);
  };

  // --- LIVE MODE HANDLERS ---
  const startLiveSession = async () => {
    setIsLiveActive(true);
    
    // Audio Context Setup
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
    const outputNode = audioContextRef.current.createGain();
    outputNode.connect(audioContextRef.current.destination);

    // Microphone Setup
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const inputNode = inputAudioContextRef.current.createMediaStreamSource(stream);
    const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
    
    inputNode.connect(scriptProcessor);
    scriptProcessor.connect(inputAudioContextRef.current.destination);

    // Initialize Connection
    const sessionPromise = geminiService.startLiveSession({
        onopen: () => {
            console.log("Live session connected");
            // Stream audio input
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                
                // Simple visualizer volume calc
                let sum = 0;
                for(let i = 0; i < inputData.length; i++) sum += Math.abs(inputData[i]);
                setLiveVolume(Math.min(100, (sum / inputData.length) * 500));

                const pcmBlob = createBlob(inputData);
                sessionPromise.then((session: any) => {
                   session.sendRealtimeInput({ media: pcmBlob });
                });
            };
        },
        onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
                 const ctx = audioContextRef.current;
                 nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                 
                 const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    ctx,
                    24000,
                    1
                 );
                 
                 const source = ctx.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(outputNode);
                 source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                 });
                 
                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 sourcesRef.current.add(source);
            }

            // Handle Interruptions
            if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
        },
        onclose: () => {
            console.log("Live session closed");
            setIsLiveActive(false);
        },
        onerror: (e: any) => {
            console.error("Live session error", e);
            alert("Connection error. Please try again.");
            setIsLiveActive(false);
        }
    }, {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        },
        systemInstruction: `You are a high-energy, motivating fitness coach named 'Global Coach'. 
        You are talking to ${user?.name || 'an athlete'}. 
        Keep responses concise, encouraging, and focused on fitness, form check, or quick advice. 
        Do not use markdown. Speak naturally.`
    });

    liveSessionRef.current = await sessionPromise;
  };

  const stopLiveSession = () => {
      if (liveSessionRef.current) {
          // liveSessionRef.current.close() might not exist on the type, but usually does on WebSocket wrappers.
          // Using close() from prompt guidance if available, otherwise just clearing context.
          // The prompt says "use session.close()".
          try { liveSessionRef.current.close(); } catch(e) {}
          liveSessionRef.current = null;
      }
      
      if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }
      if (inputAudioContextRef.current) {
          inputAudioContextRef.current.close();
          inputAudioContextRef.current = null;
      }
      
      setIsLiveActive(false);
      setLiveVolume(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[800px] max-w-5xl mx-auto bg-slate-900 md:bg-slate-800 rounded-2xl md:border md:border-slate-700 overflow-hidden shadow-2xl animate-fade-in relative">
      
      {/* --- LIVE MODE OVERLAY --- */}
      {isLiveActive && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-fade-in">
             <div className="relative mb-8">
                 <div className="w-32 h-32 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] relative z-10">
                    <Headphones size={48} className="text-emerald-400" />
                 </div>
                 {/* Visualizer Rings */}
                 <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-20 animate-ping" style={{ transform: `scale(${1 + liveVolume/50})` }}></div>
                 <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-10 animate-pulse" style={{ transform: `scale(${1.2 + liveVolume/30})`, animationDuration: '1s' }}></div>
             </div>
             
             <h2 className="text-3xl font-bold text-white mb-2">Voice Coach Active</h2>
             <p className="text-slate-400 mb-8 max-w-md">Speak naturally. I'm listening...</p>
             
             <button 
                onClick={stopLiveSession}
                className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 transition-all border border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
             >
                <X size={24} /> End Session
             </button>
          </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/50 shadow-emerald-500/20 shadow-md">
                <Bot size={24} />
            </div>
            <div>
                <h3 className="font-bold text-white">AI Assistant</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                </p>
            </div>
        </div>
        <div className="flex gap-2">
            <button
                onClick={startLiveSession}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 border border-emerald-400/20"
            >
                <Mic size={16} /> <span className="hidden sm:inline font-bold">Voice Mode</span>
            </button>
            <button 
                onClick={clearChat}
                className="px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-2 border border-transparent hover:border-red-500/20 active:scale-95 group"
                title="Clear Chat History"
            >
                <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scroll-smooth">
        {messages.map((msg) => (
            <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
                <div className={`max-w-[85%] lg:max-w-[70%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-md ${
                        msg.role === 'user' 
                        ? 'bg-slate-700 text-slate-300' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                        {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                        msg.role === 'user'
                        ? 'bg-slate-700 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            </div>
        ))}
        {isTyping && (
             <div className="flex justify-start animate-fade-in">
                 <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-4 ml-11 flex gap-2 items-center">
                    <span className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-emerald-500/50 rounded-full animate-bounce delay-150"></span>
                 </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            <button 
                onClick={handleAnalyzeHistory}
                className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-full text-xs text-white transition-all border border-purple-500/50 flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 hover:shadow-purple-500/40"
            >
                {user?.isPremium ? <Activity size={12} /> : <Lock size={12} />}
                Analyze My Progress
                {user?.isPremium && <Crown size={12} className="text-yellow-300" />}
            </button>

            {["Plan my day simply", "Help me decide", "What should I do tonight?"].map(s => (
                <button 
                    key={s} 
                    onClick={() => setInput(s)}
                    className="whitespace-nowrap px-4 py-2 bg-slate-700 hover:bg-slate-600 hover:text-white rounded-full text-xs text-slate-300 transition-all border border-slate-600 active:scale-95 hover:border-slate-500"
                >
                    {s}
                </button>
            ))}
        </div>

        <div className="flex gap-2">
            <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-slate-900 text-white placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FF9C] focus:border-transparent transition-all"
            />
            <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="bg-[#00FF9C] hover:bg-[#00cc7d] disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 p-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#00FF9C]/20 disabled:shadow-none hover:shadow-[#00FF9C]/40 flex items-center justify-center w-12"
            >
                <Send size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTrainer;