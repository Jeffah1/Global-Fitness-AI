import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
  variant?: 'default' | 'glass';
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, isActive, variant = 'default' }) => {
  const baseClasses = "rounded-3xl p-6 border transition-all";
  
  const variants = {
    default: "bg-[#1A1E24] border-slate-700 hover:border-slate-600",
    glass: "bg-slate-800/50 backdrop-blur-md border-slate-700/50 hover:bg-slate-800/70"
  };

  const activeClasses = isActive 
    ? 'border-[#00FF9C] shadow-[0_0_20px_rgba(0,255,156,0.1)]' 
    : '';

  return (
    <div 
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${activeClasses}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};