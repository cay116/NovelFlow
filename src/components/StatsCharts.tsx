import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { BarChart, Flame, ChevronRight, Award, Trophy, ArrowUpRight } from 'lucide-react';

export const StatsCharts: React.FC = () => {
  const { chapters, books, userProfile, totalWords, completionRate } = useApp();

  // Safeguard profile logging
  const logs = userProfile?.dailyLogs || {};
  const datesArray = Object.keys(logs).sort();

  // Get last 7 days for the writing activity bar graph
  const getLast7Days = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      list.push(str);
    }
    return list;
  };

  const last7Days = getLast7Days();
  const maxWordsInDays = Math.max(...last7Days.map(day => logs[day]?.wordsWritten || 0), 100);

  // Chapters completed vs To Do
  const completedChapters = chapters.filter(c => c.status === 'Completed').length;
  const inProgressChapters = chapters.filter(c => c.status === 'In Progress').length;
  const todoChapters = chapters.filter(c => c.status === 'To Do').length;
  const inReviewChapters = chapters.filter(c => c.status === 'In Review').length;

  const totalChapters = chapters.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. SEVEN DAY WRITING ACTIVITY BAR CHART */}
      <div className="lg:col-span-2 p-6 bg-slate-900/60 backdrop-blur-md border border-slate-900 rounded-2xl flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-black font-sans text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <BarChart className="h-4.5 w-4.5 text-amber-500" />
            <span>Weekly Activity Outline</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Live tracking of active words written per day over the last week.</p>
        </div>

        {/* Handcrafted animated responsive SVG bar chart */}
        <div className="h-64 w-full flex items-end gap-3.5 pt-6 select-none">
          {last7Days.map((day) => {
            const words = logs[day]?.wordsWritten || 0;
            const barHeightPct = Math.min(100, (words / maxWordsInDays) * 100);
            const dateObj = new Date(day);
            const labelDay = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
            const isToday = new Date().toISOString().split('T')[0] === day;

            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                {/* Word Count Hover card */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/90 text-slate-200 border border-slate-800 text-[10px] font-mono px-2 py-1 rounded-md mb-1 select-none pointer-events-none text-center">
                  <span className="font-bold text-amber-400">{words.toLocaleString()} w</span>
                </div>

                {/* Vertical Bar Graphic */}
                <div className="w-full bg-slate-950 border border-slate-900/40 rounded-t-lg flex-grow relative overflow-hidden flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeightPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`w-full rounded-t-[5px] cursor-pointer transition-all duration-300 ${
                      isToday 
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 hover:shadow-[0_0_12px_rgba(99,102,241,0.35)]' 
                        : 'bg-gradient-to-t from-slate-800 to-slate-700 group-hover:from-amber-600/60 group-hover:to-amber-500/60'
                    }`}
                  />
                </div>

                {/* Day label */}
                <span className={`text-[10px] font-mono font-medium ${isToday ? 'text-amber-500 font-bold' : 'text-slate-500'}`}>
                  {labelDay}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. COMPLETION RING STATS AND BADGES PROGRESS */}
      <div className="p-6 bg-slate-900/60 backdrop-blur-md border border-slate-900 rounded-2xl flex flex-col gap-5 justify-between">
        <div>
          <h3 className="text-sm font-black font-sans text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-amber-500" />
            <span>Workspace Efficiency</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Status proportions of all outlined chapters.</p>
        </div>

        {/* Dynamic circular composition ring chart */}
        <div className="flex items-center justify-center py-4 select-none relative">
          <svg className="w-36 h-36 transform -rotate-90">
            {/* Background ring gap */}
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="#0f172a"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Completed progression ring */}
            <motion.circle
              cx="72"
              cy="72"
              r="60"
              stroke="url(#progressGlowGradient)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={376.8}
              initial={{ strokeDashoffset: 376.8 }}
              animate={{ strokeDashoffset: 376.8 - (376.8 * (completionRate || 0)) / 100 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {/* Gradients def */}
            <defs>
              <linearGradient id="progressGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E50914" />
                <stop offset="100%" stopColor="#ff5a64" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute text-center flex flex-col">
            <span className="text-2xl font-black font-sans tracking-tighter text-white">{completionRate || 0}%</span>
            <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">Finished</span>
          </div>
        </div>

        {/* Mini progress bars for chapter statuses */}
        <div className="space-y-2 pt-2 border-t border-slate-950/80">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-emerald-400">Completed ({completedChapters})</span>
            <span className="text-slate-400">
              {totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-sky-400">Active drafting ({inProgressChapters + inReviewChapters})</span>
            <span className="text-slate-400">
              {totalChapters > 0 ? Math.round(((inProgressChapters + inReviewChapters) / totalChapters) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
