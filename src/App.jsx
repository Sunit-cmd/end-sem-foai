import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { 
  Globe, 
  MapPin, 
  Activity, 
  Users, 
  RefreshCw, 
  Sun, 
  Moon, 
  LayoutDashboard, 
  Navigation, 
  Zap,
  Radio,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import { useISS } from './hooks/useISS';
import { useNews } from './hooks/useNews';
import { useTheme } from './context/ThemeContext';
import { MetricCard, GlassPanel, Skeleton } from './components/SharedUI';
import { ISSMap } from './components/ISSMap';
import { SpeedChart } from './components/SpeedChart';
import { NewsSection } from './components/NewsSection';
import { Chatbot } from './components/Chatbot';

function App() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { position, history, speedHistory, astronauts, nearestPlace, loading: issLoading, error: issError, refresh: refreshISS } = useISS(autoRefresh);
  const { news, loading: newsLoading, refresh: refreshNews } = useNews();
  const { isDarkMode, toggleTheme } = useTheme();

  const currentSpeed = speedHistory.length > 0 ? speedHistory[speedHistory.length - 1].speed : null;

  return (
    <div className="min-h-screen bg-dashboard-beige dark:bg-slate-950 transition-colors duration-500 pb-12 selection:bg-blue-200 dark:selection:bg-blue-900">
      <Toaster position="top-right" />
      
      {/* Header - Mission Control Style */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/20">
              <Radio className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] rounded border border-blue-500/20">
                  Mission Control Dashboard
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Uplink: Active</span>
                </span>
              </div>
              <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                ISS <span className="text-blue-600">Intelligence</span> Terminal
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={toggleTheme}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-400"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        
        {/* Main Grid: Responsive 12-column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Tracker (8/12) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Navigation className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Live Space Tracking</h2>
              </div>
              
              <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2 px-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Auto-Sync</span>
                  <button 
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`w-9 h-5 rounded-full relative transition-all duration-300 ${autoRefresh ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${autoRefresh ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
                <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
                <button 
                  onClick={refreshISS}
                  className="flex items-center gap-2 px-3 py-1 text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${issLoading ? 'animate-spin' : ''}`} /> SYNC NOW
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard 
                title="Orbital Coordinates" 
                value={position ? `${position.lat.toFixed(3)}°, ${position.lng.toFixed(3)}°` : null} 
                icon={Globe}
                description="Latitude & Longitude"
                onRetry={issError ? refreshISS : null}
              />
              <MetricCard 
                title="Current Velocity" 
                value={currentSpeed ? `${currentSpeed.toLocaleString()} KM/H` : null} 
                icon={Zap}
                description="Speed over ground"
                onRetry={issError ? refreshISS : null}
              />
              <MetricCard 
                title="Proximal Landmark" 
                value={nearestPlace} 
                icon={MapPin}
                description="Nearest terrestrial area"
                onRetry={issError ? refreshISS : null}
              />
              <MetricCard 
                title="Telemetry Points" 
                value={history.length} 
                icon={Activity}
                description="Waypoints tracked"
              />
            </div>

            {/* Map Area */}
            <GlassPanel className="p-2 relative group">
              <ISSMap position={position} history={history} isDarkMode={isDarkMode} />
              {issError && (
                <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center rounded-xl">
                  <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
                  <h3 className="text-lg font-bold mb-2">Satellite Signal Lost</h3>
                  <p className="text-sm opacity-80 mb-6">Encountered an error while connecting to the ISS network.</p>
                  <button onClick={refreshISS} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all">Reconnect Uplink</button>
                </div>
              )}
            </GlassPanel>

            {/* Personnel List */}
            <GlassPanel>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">Station Personnel</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Active Duty Astronauts</p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black tracking-widest shadow-lg shadow-blue-500/30">
                  {astronauts.length} TOTAL
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {issLoading && astronauts.length === 0 ? (
                  Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-32 rounded-xl" />)
                ) : (
                  astronauts.map((astro, i) => (
                    <div key={i} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
                      {astro.name} <span className="text-[9px] text-blue-500 ml-2 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">{astro.craft}</span>
                    </div>
                  ))
                )}
                {!issLoading && astronauts.length === 0 && (
                   <p className="text-xs text-slate-400 italic">Personnel manifest currently unavailable.</p>
                )}
              </div>
            </GlassPanel>
          </div>

          {/* Right Panel: Analytics (4/12) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Orbital Analytics</h2>
            </div>
            
            <GlassPanel className="h-full flex flex-col min-h-[450px]">
              <div className="mb-8">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Velocity Trend</h3>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Live Speed (KM/H) Analysis</p>
              </div>
              
              <div className="flex-1 w-full">
                <SpeedChart data={speedHistory} isDarkMode={isDarkMode} />
              </div>
              
              <div className="mt-8 p-5 bg-blue-600/5 dark:bg-blue-500/5 rounded-3xl border border-blue-500/10">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Scientific Insight</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                  "At its current speed, the ISS completes a full orbit around Earth every 90 minutes, experiencing 16 sunrises and sunsets every day."
                </p>
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Global News Section */}
        <section className="pt-12 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Space Intelligence News</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Breaking Coverage</p>
            </div>
          </div>
          <NewsSection 
            news={news} 
            loading={newsLoading} 
            onRefresh={refreshNews} 
            isDarkMode={isDarkMode} 
          />
        </section>

      </main>

      {/* Floating Assistant */}
      <Chatbot 
        dashboardData={{
          location: nearestPlace,
          speed: currentSpeed,
          astronauts: astronauts.map(a => a.name),
          news: news.slice(0, 5)
        }} 
      />

      <footer className="max-w-7xl mx-auto px-4 mt-12 py-12 border-t border-slate-200/50 dark:border-slate-800/50 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
           <div className="h-[1px] w-8 bg-slate-400" />
           <Radio className="w-4 h-4 text-slate-400" />
           <div className="h-[1px] w-8 bg-slate-400" />
        </div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
          End-to-End Orbital Intelligence Dashboard &copy; 2026
        </p>
      </footer>
    </div>
  );
}

export default App;
