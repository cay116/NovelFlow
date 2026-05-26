import React, { useState, useEffect, useRef } from 'react';
import { Chapter, Book } from '../types';
import { WeightedBlocks } from './WeightedBlocks';
import { ReferenceList } from './ReferenceList';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  Sparkles, 
  HelpCircle, 
  Cloud, 
  BookOpen, 
  Sliders, 
  Eye, 
  EyeOff,
  Feather,
  CheckCircle,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotesEditorProps {
  chapter: Chapter;
  associatedBook: Book;
  onBack: () => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  chapter,
  associatedBook,
  onBack
}) => {
  const { editChapter, autoSaveNotes, addReference, removeReference, syncStatus } = useApp();

  // Local editor drafts states
  const [title, setTitle] = useState(chapter.title);
  const [summary, setSummary] = useState(chapter.summary || '');
  const [notes, setNotes] = useState(chapter.notes || '');
  const [priority, setPriority] = useState(chapter.priority);
  const [status, setStatus] = useState(chapter.status);
  const [progress, setProgress] = useState(chapter.progress || 0);
  const [blocks, setBlocks] = useState(chapter.blocks || 1);

  // Drag and Drop & file loading states
  const [isDragging, setIsDragging] = useState(false);

  // Distraction-free toggle state! Custom SaaS premium UX touch!
  const [focusMode, setFocusMode] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState<'saved' | 'saving' | 'typing'>('saved');

  // Keep references to skip initial render triggers
  const initialLoadRef = useRef(true);
  const typingTimerRef = useRef<any>(null);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setNotes(text);
          setSaveIndicator('saving');
          autoSaveNotes(chapter.id, text).then(() => {
            setSaveIndicator('saved');
          });
        }
      };
      reader.readAsText(file);
    } else {
      alert("Unsupported file type! Please drop a .txt or .md manuscript file.");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setNotes(text);
          setSaveIndicator('saving');
          autoSaveNotes(chapter.id, text).then(() => {
            setSaveIndicator('saved');
          });
        }
      };
      reader.readAsText(file);
    } else {
      alert("Unsupported file type! Please upload a .txt or .md manuscript file.");
    }
  };

  // Update draft states when parent chapter changes (routing)
  useEffect(() => {
    setTitle(chapter.title);
    setSummary(chapter.summary || '');
    setNotes(chapter.notes || '');
    setPriority(chapter.priority);
    setStatus(chapter.status);
    setProgress(chapter.progress || 0);
    setBlocks(chapter.blocks || 1);
    initialLoadRef.current = true;
  }, [chapter.id]);

  // Synchronous debounced real-time Autosave engine
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textVal = e.target.value;
    setNotes(textVal);
    setSaveIndicator('typing');

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      setSaveIndicator('saving');
      autoSaveNotes(chapter.id, textVal).then(() => {
        setSaveIndicator('saved');
      });
    }, 1200); // 1.2 second debounce trigger
  };

  // Synchronous update for other general field details
  const triggerOutlineDetailsUpdate = (updatedFields: Partial<Chapter>) => {
    editChapter(chapter.id, updatedFields);
  };

  // Calculate live statistics
  const cleanNotes = notes.trim();
  const liveWords = cleanNotes ? cleanNotes.split(/\s+/).length : 0;
  const livePages = Math.max(1, Math.ceil(liveWords / 250));

  // Export options - down to TXT, MD, JSON
  const triggerFileDownload = (format: 'txt' | 'md') => {
    let content = '';
    let filename = `${associatedBook.title} - Chapter ${chapter.title}`;
    
    if (format === 'md') {
      content = `# ${chapter.title}\n\n*Book Profile: ${associatedBook.title} | Genre: ${associatedBook.genre}*\n\n*Summary Outline:*\n> ${summary || 'None'}\n\n*Progress weight:* ${blocks} blocks (${progress}% complete)\n\n---\n\n${notes || '_Start writing chapter notes..._'}`;
      filename += '.md';
    } else {
      content = `${chapter.title.toUpperCase()}\n\nBook Profile: ${associatedBook.title} | Genre: ${associatedBook.genre}\n\nSummary Outline:\n${summary || 'None'}\n\nProgress weight: ${blocks} blocks (${progress}% complete)\n\n=======================================================\n\n${notes || ''}`;
      filename += '.txt';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render Editor Viewport Layout
  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans select-none text-slate-100">
      
      {/* Upper Navigation Header bar */}
      <div className="flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md py-4 px-6 shrink-0 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/40 rounded-lg transition-all"
            title="Return to Book Outline"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-black">Book Profile</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80"></span>
              <span className="text-[10px] font-mono text-amber-500/80 font-bold truncate max-w-[120px]">{associatedBook.title}</span>
            </div>
            <h1 className="text-sm font-black text-slate-100 uppercase tracking-tight line-clamp-1 max-w-[200px] md:max-w-xs">{title}</h1>
          </div>
        </div>

        {/* Display live autosave telemetry indicator */}
        <div className="flex items-center gap-3.5">
          {/* Status pill saver */}
          <div className="text-[11px] font-mono flex items-center gap-1.5 text-slate-500 bg-slate-900/60 border border-slate-900 px-3 py-1 rounded-full">
            {saveIndicator === 'typing' && (
              <>
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping"></span>
                <span>Drafting notes...</span>
              </>
            )}
            {saveIndicator === 'saving' && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-spin"></span>
                <span>Saving outline...</span>
              </>
            )}
            {saveIndicator === 'saved' && (
              <>
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                <span>Autosaved Cloud</span>
              </>
            )}
          </div>

          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`p-2 border rounded-lg transition-all duration-200 ${focusMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white'}`}
            title={focusMode ? "Leave Focus Mode" : "Enter Distraction-Free Focus Mode"}
          >
            {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>

          {/* Export button dropdown */}
          <div className="flex items-center border border-slate-900 rounded-lg bg-slate-900/20 text-slate-400 overflow-hidden text-xs">
            <button
              onClick={() => triggerFileDownload('txt')}
              className="px-3.5 py-2 hover:bg-slate-900 hover:text-white flex items-center gap-1 font-medium transition-colors border-r border-slate-950"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>TXT</span>
            </button>
            <button
              onClick={() => triggerFileDownload('md')}
              className="px-3.5 py-2 hover:bg-slate-900 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <span>Markdown</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Workspace layout */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* LEFT WORKSPACE: Notes Entry and Outline details */}
        <div className={`flex-1 flex flex-col overflow-y-auto p-6 md:p-8 transition-all duration-300 ${focusMode ? 'max-w-4xl mx-auto' : ''}`}>
          
          <div className="flex flex-col gap-6 max-w-4xl w-full mx-auto">
            {/* Outline settings section (Hidden in focus mode if desired, but we render neatly) */}
            {!focusMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-slate-900/30 rounded-2xl border border-slate-900"
              >
                {/* Chapter Title & summary setting details */}
                <div className="flex flex-col gap-3 md:col-span-2">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Chapter Outline title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          triggerOutlineDetailsUpdate({ title: e.target.value });
                        }}
                        placeholder="Chapter name..."
                        className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Outline Summary Line</label>
                      <input
                        type="text"
                        value={summary}
                        onChange={(e) => {
                          setSummary(e.target.value);
                          triggerOutlineDetailsUpdate({ summary: e.target.value });
                        }}
                        placeholder="Plot synopsis outline notes..."
                        className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Weighted interactive selector system */}
                  <div className="grid grid-cols-2 gap-3.5 mt-2 pt-2 border-t border-slate-950">
                    <div className="flex flex-col gap-1 select-none">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-black flex items-center gap-1">
                        <span>Chapter Progress Block Weight</span>
                      </label>
                      <div className="flex gap-1 bg-slate-950 p-1.5 border border-slate-900 rounded-lg">
                        {[1, 2, 3].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              setBlocks(val);
                              triggerOutlineDetailsUpdate({ blocks: val });
                            }}
                            className={`flex-1 text-[10px] font-mono font-black py-1 rounded transition-all ${blocks === val ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-200'}`}
                          >
                            {val === 1 ? '1 Block (S)' : val === 2 ? '2 Blocks (M)' : '3 Blocks (L)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-black block">Interactive Block Progress</label>
                      <div className="bg-slate-950 p-1 rounded-lg border border-slate-900">
                        <WeightedBlocks
                          blocksCount={blocks}
                          progress={progress}
                          interactive={true}
                          size="sm"
                          onBlockClick={(pct) => {
                            setProgress(pct);
                            triggerOutlineDetailsUpdate({ progress: pct });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter metadata sliders details */}
                <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3 flex flex-col justify-center">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-[10px] uppercase text-slate-500 font-bold">Priority outline status</span>
                    <select
                      value={priority}
                      onChange={(e: any) => {
                        setPriority(e.target.value);
                        triggerOutlineDetailsUpdate({ priority: e.target.value });
                      }}
                      className="bg-slate-900 border border-slate-800 text-xs rounded text-amber-500 font-bold p-1 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-900/60">
                    <span className="font-mono text-[10px] uppercase text-slate-500 font-bold">Draft Status State</span>
                    <select
                      value={status}
                      onChange={(e: any) => {
                        setStatus(e.target.value);
                        triggerOutlineDetailsUpdate({ status: e.target.value });
                      }}
                      className="bg-slate-900 border border-slate-800 text-xs rounded text-sky-400 font-bold p-1 focus:outline-none focus:border-amber-500"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Manual Progress Slider meter */}
                  <div className="pt-2 border-t border-slate-900/60">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span>Manual percentage sync</span>
                      <span>{progress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => {
                        const pct = parseInt(e.target.value);
                        setProgress(pct);
                        triggerOutlineDetailsUpdate({ progress: pct });
                      }}
                      className="w-full h-1.5 accent-amber-500 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Focused text note draft editor */}
            <div 
              className="flex flex-col flex-1 h-full min-h-[480px] relative"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <textarea
                id="notes-text-area"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Start drafting your novel notes, characters, dialog outlines, and book summaries here... Feel free to drag & drop a .txt or .md draft manuscript from your device here to import contents instantly."
                className={`w-full flex-1 min-h-[450px] p-6 text-sm md:text-base leading-relaxed text-slate-200 bg-slate-900/20 backdrop-blur-md hover:bg-slate-900/30 transition-all duration-200 border rounded-2xl focus:outline-none placeholder-slate-600 resize-none font-sans ${
                  isDragging 
                    ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                    : 'border-slate-900/80 focus:border-amber-500/30'
                }`}
              />
              
              {/* Quick file upload button on the top right corner of the canvas */}
              <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/90 hover:bg-slate-800 border border-slate-800/80 text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors">
                  <FileDown className="h-3 w-3 rotate-180 text-amber-500" />
                  <span>Upload Draft</span>
                  <input 
                    type="file" 
                    accept=".txt,.md" 
                    onChange={handleFileInputChange} 
                    className="hidden" 
                  />
                </label>
              </div>

              {isDragging && (
                <div className="absolute inset-0 bg-slate-950/95 border border-dashed border-amber-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none z-20 animate-fade-in">
                  <FileDown className="h-10 w-10 text-amber-500 shrink-0 mb-3 rotate-180 animate-bounce" />
                  <h4 className="text-sm font-black uppercase text-amber-500 tracking-wider">Drop Draft Content</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">Release to automatically parse and load this document draft into your editor canvas</p>
                </div>
              )}
            </div>
            
            {/* Editor Bottom Stats footer panel */}
            <div className="flex items-center justify-between border-t border-slate-900 pt-4 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-4">
                <span>Total Words: <strong className="text-slate-300 font-bold">{liveWords.toLocaleString()}</strong></span>
                <span>Pages: <strong className="text-slate-300 font-bold">{livePages}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>StoryBlocks Author Canvas</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT WORKSPACE: Wiki References and outline bookmarks, hidden in focusMode for distraction-free styling */}
        {!focusMode && (
          <div className="hidden lg:block w-80 shrink-0 border-l border-slate-900 bg-slate-950/40 p-5 overflow-y-auto">
            <ReferenceList
              references={chapter.references || []}
              onAdd={(ref) => addReference(chapter.id, ref)}
              onRemove={(refId) => removeReference(chapter.id, refId)}
            />
          </div>
        )}

      </div>
    </div>
  );
};
