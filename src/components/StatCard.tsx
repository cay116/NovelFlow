import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: string; // e.g. 'amber', 'orange', 'emerald'
  progressValue?: number; // optionally display a neat mini linear progress percentage indicator
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  color = 'amber',
  progressValue
}) => {
  const brandColors = {
    amber: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'hover:border-indigo-500/30',
      glow: 'shadow-[0_0_15px_rgba(99,102,241,0.08)]',
      progress: 'bg-indigo-500'
    },
    orange: {
      text: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'hover:border-indigo-500/30',
      glow: 'shadow-[0_0_15px_rgba(99,102,241,0.08)]',
      progress: 'bg-indigo-500'
    },
    emerald: {
      text: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'hover:border-emerald-500/30',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.05)]',
      progress: 'bg-emerald-500'
    },
    sky: {
      text: 'text-sky-500',
      bg: 'bg-sky-500/10',
      border: 'hover:border-sky-500/30',
      glow: 'shadow-[0_0_15px_rgba(14,165,233,0.05)]',
      progress: 'bg-sky-500'
    }
  }[color] || {
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'hover:border-indigo-500/30',
    glow: 'shadow-[0_0_15px_rgba(99,102,241,0.08)]',
    progress: 'bg-indigo-500'
  };

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`
        relative p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-900/80
        transition-all duration-300 ${brandColors.border} ${brandColors.glow}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-mono font-medium tracking-wide uppercase text-slate-500">
            {title}
          </span>
          <span id={`stat-val-${title.toLowerCase().replace(/\s/g, '-')}`} className="text-2xl lg:text-3xl font-black font-sans text-white tracking-tight mt-1.5">
            {value}
          </span>
        </div>
        <div className={`h-11 w-11 rounded-xl ${brandColors.bg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${brandColors.text}`} />
        </div>
      </div>

      {description && (
        <span className="text-[11px] font-sans text-slate-400 mt-2.5 block leading-relaxed">
          {description}
        </span>
      )}

      {/* Progress micro bar if provided */}
      {progressValue !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 mb-1">
            <span>Overall Completion</span>
            <span className={brandColors.text}>{progressValue}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressValue}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${brandColors.progress}`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};
