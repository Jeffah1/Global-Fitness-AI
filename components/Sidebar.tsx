import React, { useMemo } from 'react';
import { Activity, Dumbbell, Utensils, MessageSquare, Menu, X, CalendarDays, ShoppingBag, User, Users } from 'lucide-react';
import { AppView } from '../types';
import { useUser } from '../context/UserContext';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen }) => {
  const { user } = useUser();
  
  const navItems = [
    { view: AppView.DASHBOARD, label: 'Dashboard', icon: <Activity size={20} /> },
    { view: AppView.WORKOUTS, label: 'Workouts', icon: <Dumbbell size={20} /> },
    { view: AppView.NUTRITION, label: 'Nutrition', icon: <Utensils size={20} /> },
    { view: AppView.CHAT, label: 'AI Trainer', icon: <MessageSquare size={20} /> },
    { view: AppView.HISTORY, label: 'History', icon: <CalendarDays size={20} /> },
    { view: AppView.COMMUNITY, label: 'Community', icon: <Users size={20} /> },
    { view: AppView.MARKET, label: 'Smart Plan', icon: <ShoppingBag size={20} /> },
    { view: AppView.PROFILE, label: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-slate-800 rounded-lg text-emerald-400 shadow-lg border border-slate-700 active:scale-90 transition-transform"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition duration-200 ease-in-out z-40 flex flex-col w-64 bg-slate-900 border-r border-slate-800`}
      >
        <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-emerald-400 to-cyan-500"></div>
            <h1 className="text-xl font-bold text-white tracking-tight">Global Fitness AI</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                onChangeView(item.view);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                currentView === item.view
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-inner border border-emerald-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-xs text-slate-500 font-bold uppercase">System Online</span>
            </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
