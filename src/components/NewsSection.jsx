import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, ExternalLink, Calendar, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Skeleton } from './SharedUI';

export const NewsSection = ({ news, loading, onRefresh, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterSource, setFilterSource] = useState(null);

  const filteredNews = useMemo(() => {
    let result = news.filter(item => 
      (item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       item.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filterSource || item.source.name === filterSource)
    );

    if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (sortBy === 'source') {
      result.sort((a, b) => a.source.name.localeCompare(b.source.name));
    }

    return result;
  }, [news, searchTerm, sortBy, filterSource]);

  const sourceData = useMemo(() => {
    const counts = {};
    news.forEach(item => {
      counts[item.source.name] = (counts[item.source.name] || 0) + 1;
    });
    return Object.keys(counts).map(name => ({ name, value: counts[name] }));
  }, [news]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search news..." 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="source">Sort by Source</option>
          </select>
          <button 
            onClick={onRefresh}
            className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News Distribution Chart */}
        <div className="lg:col-span-1 glass-card p-4 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">News Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(data) => setFilterSource(filterSource === data.name ? null : data.name)}
                >
                  {sourceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="none"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <RechartsTooltip 
                   contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {filterSource && (
             <button 
              onClick={() => setFilterSource(null)}
              className="mt-2 text-xs text-blue-500 hover:underline"
             >
               Clear filter: {filterSource}
             </button>
          )}
        </div>

        {/* News Cards */}
        <div className="lg:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="glass-card p-4 space-y-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNews.map((item, index) => (
                <motion.div 
                  key={item.url + index}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card overflow-hidden group flex flex-col md:flex-row"
                >
                  {item.urlToImage && (
                    <div className="w-full md:w-48 h-48 md:h-auto shrink-0 overflow-hidden">
                      <img 
                        src={item.urlToImage} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase">
                          {item.source.name}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2 group-hover:text-blue-500 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                         {item.author && <><User className="w-3 h-3" /> {item.author}</>}
                      </div>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-600"
                      >
                        Read More <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
