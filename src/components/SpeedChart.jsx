import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const SpeedChart = ({ data, isDarkMode }) => {
  const color = "#3b82f6"; // Professional Blue
  
  if (!data || data.length < 2) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center opacity-40">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Initializing Live Velocity Analysis...</p>
        <p className="text-[9px] mt-2 text-slate-400">Waiting for secondary telemetry sync (15s)</p>
      </div>
    );
  }
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderColor: isDarkMode ? '#334155' : '#e2e8f0',
              color: isDarkMode ? '#f8fafc' : '#1e293b',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="speed" 
            stroke={color} 
            fillOpacity={1} 
            fill="url(#colorSpeed)" 
            strokeWidth={3}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
