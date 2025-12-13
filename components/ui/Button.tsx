import React from 'react';
import { Loader2 } from 'lucide-react';
import { theme } from '../../theme';

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
  const baseStyles = `font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''}`;
  
  const variants = {
    primary: `bg-[${theme.colors.primary}] hover:bg-[${theme.colors.primaryHover}] text-slate-900 shadow-lg shadow-[${theme.colors.primary}]/20`,
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    outline: `bg-transparent border border-slate-700 text-slate-300 hover:border-[${theme.colors.primary}] hover:text-[${theme.colors.primary}]`,
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
  };

  // Tailwind doesn't always handle dynamic template literals for JIT, so we use style objects or static classes where possible.
  // For this implementation, I'll use standard classes that match the theme colors.
  
  const variantClasses = {
    primary: "bg-[#00FF9C] hover:bg-[#00cc7d] text-slate-900 shadow-lg shadow-[#00FF9C]/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    outline: "bg-transparent border border-slate-700 text-slate-300 hover:border-[#00FF9C] hover:text-[#00FF9C]",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" size={20} /> : icon}
      {children}
    </button>
  );
};