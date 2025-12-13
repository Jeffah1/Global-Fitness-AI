import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { ChatMessage } from '../types';
import { Send, User, Bot, Sparkles, Trash2 } from 'lucide-react';
import { Chat, GenerateContentResponse } from "@google/genai";

const ChatTrainer: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: input,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[800px] max-w-5xl mx-auto bg-slate-900 md:bg-slate-800 rounded-2xl md:border md:border-slate-700 overflow-hidden shadow-2xl animate-fade-in">
      <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/50">
                <Bot size={24} />
            </div>
            <div>
                <h3 className="font-bold text-white">AI Assistant</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                </p>
            </div>
        </div>
        <button 
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Clear Chat"
        >
            <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
        {messages.map((msg) => (
            <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div className={`max-w-[85%] lg:max-w-[70%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                        msg.role === 'user' 
                        ? 'bg-slate-700 text-slate-300' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                        {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
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
             <div className="flex justify-start">
                 <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-4 ml-11">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                    </div>
                 </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        {/* Suggestion Chips */}
        {messages.length <= 1 && (
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {["Plan my day simply", "Help me decide", "What should I do tonight?", "Explain in simple terms"].map(s => (
                    <button 
                        key={s} 
                        onClick={() => setInput(s)}
                        className="whitespace-nowrap px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 transition-colors border border-slate-600"
                    >
                        {s}
                    </button>
                ))}
            </div>
        )}
        <div className="flex gap-2">
            <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-slate-900 text-white placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white p-3 rounded-xl transition-colors"
            >
                <Send size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTrainer;