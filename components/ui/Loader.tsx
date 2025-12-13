import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 className="animate-spin text-[#00FF9C]" size={size} />
  </div>
);

export const ScreenLoader: React.FC = () => (
  <div className="min-h-screen bg-[#0D0F12] flex items-center justify-center text-[#00FF9C]">
    <Loader2 className="animate-spin" size={48} />
  </div>
);

export const Skeleton: React.FC<{ height?: string; width?: string; className?: string }> = ({ 
  height = 'h-4', 
  width = 'w-full', 
  className = '' 
}) => (
  <div className={`bg-slate-800 rounded animate-pulse ${height} ${width} ${className}`}></div>
);