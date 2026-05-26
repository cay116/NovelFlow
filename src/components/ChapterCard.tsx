import React from 'react';
import { Chapter } from '../types';
import { WeightedBlocks } from './WeightedBlocks';
import { useApp } from '../context/AppContext';
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Edit, 
  ArrowRight, 
  Clock, 
  Layers, 
  Paperclip,
  Bookmark
} from 'lucide-react';
import { motion } from 'motion/react';

interface ChapterCardProps {
  chapter: Chapter;
  index: number;
  totalChapters: number;
  onEdit: (chapter: Chapter) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const statusColorpills = {
  'To Do': 'bg-slate-800 text-slate-400 border-slate-700/50',
  'In Progress': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'In Review': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.05)]'
};

const priorityBadges = {
  'Low': 'bg-slate-900 text-slate-500 border-slate-800',
  'Medium': 'bg-amber-500/10 text-amber-500 border-amber-500/25',
  'High': 'bg-rose-500/10 text-rose-500 border-rose-500/25'
};

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  index,
  totalChapters,
  onEdit,
  onDelete,
  onOpen,
  onMoveUp,
  onMoveDown
}) => {
  const { editChapter } = useApp();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 rounded-2xl transition-all duration-300"
    >
      {/* Index & Reorder Handle Panel */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
            disabled={index === 0}
            className={`p-1 rounded hover:bg-slate-800 transition-colors ${index === 0 ? 'text-slate-800 cursor-not-allowed' : 'text-slate-500 hover:text-white'}`}
            title="Move Chapter Up"
          >
            <ChevronUp className="h-4.5 w-4.5" />
          </button>
          
          <div className="h-7 w-7 rounded-lg bg-slate-950 flex items-center justify-center font-mono text-xs font-black text-slate-400 border border-slate-800">
            {index + 1}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
            disabled={index === totalChapters - 1}
            className={`p-1 rounded hover:bg-slate-800 transition-colors ${index === totalChapters - 1 ? 'text-slate-800 cursor-not-allowed' : 'text-slate-500 hover:text-white'}`}
            title="Move Chapter Down"
          >
            <ChevronDown className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Chapter info */}
        <div className="flex-1 min-w-0 pl-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Live Interactive Status Select Pill */}
            <select
              value={chapter.status}
              onChange={(e) => editChapter(chapter.id, { status: e.target.value as any })}
              className={`text-[9px] uppercase tracking-widest font-mono font-bold px-1.5 py-0.5 border rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/30 ${statusColorpills[chapter.status]}`}
              title="Click to live-update status"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Live Interactive Priority Select Pill */}
            <select
              value={chapter.priority || 'Medium'}
              onChange={(e) => editChapter(chapter.id, { priority: e.target.value as any })}
              className={`text-[9px] font-mono px-1.5 py-0.5 border rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/30 ${priorityBadges[chapter.priority || 'Medium']}`}
              title="Click to live-update priority"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>

            {chapter.references && chapter.references.length > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
                <Paperclip className="h-3 w-3 text-slate-600" />
                {chapter.references.length} {chapter.references.length === 1 ? 'doc' : 'docs'}
              </span>
            )}
          </div>
          <h4 
            onClick={() => onOpen(chapter.id)} 
            className="text-base font-bold text-white tracking-tight cursor-pointer hover:text-amber-500 transition-colors line-clamp-1"
          >
            {chapter.title}
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1 truncate max-w-md">
            {chapter.summary || 'Click to edit summary/start writing outline notes.'}
          </p>
        </div>
      </div>

      {/* Weighted progress blocks visualization panel inside child */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 md:gap-7 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-950">
        <div className="w-full sm:w-44 shrink-0">
          <WeightedBlocks
            blocksCount={chapter.blocks}
            progress={chapter.progress || 0}
            interactive={true}
            onBlockClick={(pct) => editChapter(chapter.id, { progress: pct })}
            size="sm"
          />
        </div>

        {/* Word Counts stats */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 select-none">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-600 uppercase">Words</span>
            <span className="text-slate-300 font-bold">{(chapter.wordCount || 0).toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-600 uppercase">Pages</span>
            <span className="text-slate-300 font-bold">{chapter.pageCount || 0}</span>
          </div>

          {/* Stepper progress micro-modifier */}
          <div className="flex flex-col border-l border-white/5 pl-3.5" onClick={(e) => e.stopPropagation()}>
            <span className="text-[9px] text-slate-600 uppercase">Progress</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <button 
                onClick={() => editChapter(chapter.id, { progress: Math.max(0, (chapter.progress || 0) - 10) })}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-black"
                title="Decrease 10%"
              >
                -
              </button>
              <span className="text-slate-300 font-bold min-w-[28px] text-center text-[10px]">{chapter.progress || 0}%</span>
              <button 
                onClick={() => editChapter(chapter.id, { progress: Math.min(100, (chapter.progress || 0) + 10) })}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-black"
                title="Increase 10%"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Actions panel */}
        <div className="flex items-center gap-1.5 select-none self-end sm:self-center">
          <button
            onClick={() => onEdit(chapter)}
            className="p-2 border border-slate-900 hover:border-amber-500/25 text-slate-400 hover:text-amber-500 hover:bg-amber-500/5 rounded-lg transition-all duration-200"
            title="Edit Chapter Settings"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(chapter.id)}
            className="p-2 border border-slate-900 hover:border-red-500/25 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all duration-200"
            title="Remove Chapter"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onOpen(chapter.id)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600/95 to-amber-500/95 hover:from-amber-600 hover:to-amber-500 text-slate-950 rounded-lg text-xs font-bold transition-all duration-300 shadow-[0_4px_12px_rgba(99,102,241,0.15)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
            title="Open Chapter Editor"
          >
            <span>Write</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
