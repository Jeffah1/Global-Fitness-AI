import React from 'react';
import { theme } from '../../theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const InputField: React.FC<InputProps> = ({ label, icon, error, className = '', ...props }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase ml-1 block">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input 
          className={`w-full bg-[#1A1E24] border ${error ? 'border-red-500' : 'border-slate-700'} rounded-2xl py-4 ${icon ? 'pl-12' : 'px-4'} pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00FF9C] focus:border-transparent outline-none transition-all`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: string[];
}

export const SelectField: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase ml-1 block">
          {label}
        </label>
      )}
      <div className="relative">
        <select 
          className="w-full bg-[#1A1E24] border border-slate-700 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-[#00FF9C] focus:border-transparent outline-none appearance-none transition-all"
          {...props}
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          ▼
        </div>
      </div>
    </div>
  );
};