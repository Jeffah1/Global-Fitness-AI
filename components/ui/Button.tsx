import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  className = '', 
  disabled,
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = `
    relative overflow-hidden font-bold py-4 px-6 rounded-2xl transition-all duration-200 
    flex items-center justify-center gap-2 
    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
    active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#00FF9C] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 outline-none
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variants = {
    primary: "bg-[#00FF9C] hover:bg-[#00cc7d] text-slate-900 shadow-lg shadow-[#00FF9C]/20 hover:shadow-[#00FF9C]/40",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white shadow-lg shadow-black/20 hover:shadow-black/30",
    outline: "bg-transparent border-2 border-slate-700 text-slate-300 hover:border-[#00FF9C] hover:text-[#00FF9C] hover:bg-[#00FF9C]/5",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-transparent hover:border-red-500/20 shadow-none hover:shadow-lg hover:shadow-red-500/20"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={20} />}
      {!isLoading && icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};