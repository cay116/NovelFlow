import React from 'react';
import { Book, BookStatus } from '../types';
import { BookOpen, Edit, Trash2, Milestone, Target, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

// Map status titles to colorful pills
const statusStyles = {
  'Draft': 'bg-slate-800/80 text-slate-400 border-slate-700/80',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]',
  'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.05)]'
};

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onEdit,
  onDelete,
  onSelect
}) => {
  // Built-in placeholder fallback covers if user doesn't specify an image
  const defaultPresets: Record<string, string> = {
    'Fantasy': 'bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-950 border-purple-500/20',
    'Sci-Fi': 'bg-gradient-to-br from-cyan-950 via-slate-900 to-indigo-950 border-cyan-500/20',
    'Mystery': 'bg-gradient-to-br from-rose-950 via-stone-900 to-amber-950 border-rose-500/20',
    'Drama': 'bg-gradient-to-br from-emerald-950 via-teal-900 to-zinc-950 border-teal-500/20',
    'Default': 'bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 border-amber-500/20'
  };

  const presetStyle = defaultPresets[book.genre] || defaultPresets['Default'];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-900/80 overflow-hidden hover:border-amber-500/25 shadow-xl transition-all duration-300"
    >
      {/* Dynamic Book Spine Grid representation */}
      <div 
        onClick={() => onSelect(book.id)}
        className="relative h-44 w-full cursor-pointer overflow-hidden border-b border-slate-900"
      >
        {book.coverImage ? (
          <img 
            src={book.coverImage} 
            alt={book.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full ${presetStyle} flex flex-col justify-between p-5 relative select-none`}>
            {/* Elegant decorative spine line */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/35 border-r border-white/5" />
            
            <div className="flex justify-between items-start pl-3 z-10">
              <span className="text-[10px] font-mono font-black border border-white/10 px-2 py-0.5 rounded backdrop-blur-md text-white/60 tracking-wider">
                {book.genre.toUpperCase()}
              </span>
              <BookOpen className="h-4.5 w-4.5 text-white/35" />
            </div>

            <div className="pl-3 z-10 mb-2">
              <h2 className="font-serif font-black text-lg text-white leading-tight tracking-tight drop-shadow-md">
                {book.title}
              </h2>
              <p className="text-[10px] font-mono text-white/50 tracking-wide mt-1">
                A Novel Concept
              </p>
            </div>
          </div>
        )}

        {/* Action icons hovering menu */}
        <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(book); }}
            className="p-2 bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-500 rounded-lg backdrop-blur-md transition-all duration-200"
            title="Edit Draft Details"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(book.id); }}
            className="p-2 bg-slate-950/80 border border-slate-800 hover:border-red-500/40 text-slate-300 hover:text-red-400 rounded-lg backdrop-blur-md transition-all duration-200"
            title="Delete Book"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Book Metadata details */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[10px] uppercase tracking-widest font-mono font-bold px-2 py-0.5 border rounded-full ${statusStyles[book.status]}`}>
            {book.status}
          </span>
          <span className="text-[10px] font-mono text-slate-600">
            {new Date(book.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
        </div>

        <h3 
          onClick={() => onSelect(book.id)}
          className="text-base font-bold text-white tracking-tight cursor-pointer hover:text-amber-500 transition-colors duration-200 line-clamp-1"
        >
          {book.title}
        </h3>
        
        <p className="text-xs text-slate-500 mt-1 mb-4 line-clamp-2 leading-relaxed">
          {book.description || 'No outline description added yet. Edit details to set. '}
        </p>

        {/* Dynamic target parameters */}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-950 pt-4 mt-auto">
          <div className="flex items-center gap-2 overflow-hidden">
            <Milestone className="h-4 w-4 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] font-mono text-slate-600 block uppercase tracking-wider">Chapters</span>
              <span className="text-xs font-bold text-slate-300 truncate tracking-tight block">
                Planned: {book.plannedChapters || 12}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-hidden">
            <Target className="h-4 w-4 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] font-mono text-slate-600 block uppercase tracking-wider">Target Goal</span>
              <span className="text-xs font-bold text-slate-300 truncate tracking-tight block">
                {book.writingGoal ? `${book.writingGoal.toLocaleString()} w` : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Micro slider completion metrics */}
        <div className="mt-4 pt-1 border-t border-slate-950">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-1">
            <span>Overall Block Progress</span>
            <span className="text-amber-500 font-bold">{book.progress || 0}%</span>
          </div>
          <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${book.progress || 0}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
