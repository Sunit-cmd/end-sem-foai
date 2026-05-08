import React from 'react';
import { motion } from 'framer-motion';

export const MetricCard = ({ title, value, icon: Icon, description, onRetry }) => {
  const isLoading = value === null || value === undefined || value === 'Loading...';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="metric-card group relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</span>
        {Icon && <Icon className="w-4 h-4 text-blue-500 group-hover:rotate-12 transition-transform" />}
      </div>
      <div className="text-xl font-bold text-slate-800 dark:text-white truncate font-mono">
        {isLoading ? (
          <div className="h-7 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded border-l-2 border-blue-500" />
        ) : (
          value
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[9px] text-slate-400 uppercase font-medium">{description || 'Telemetry Active'}</span>
        {onRetry && (
           <button onClick={onRetry} className="text-[9px] font-bold text-blue-500 hover:underline">RETRY</button>
        )}
      </div>
    </motion.div>
  );
};

export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`} />
);

export const GlassPanel = ({ children, className = "" }) => (
  <div className={`glass-card p-6 ${className}`}>
    {children}
  </div>
);
