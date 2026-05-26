import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { BookCard } from './components/BookCard';
import { ChapterCard } from './components/ChapterCard';
import { NotesEditor } from './components/NotesEditor';
import { StatsCharts } from './components/StatsCharts';
import { Book, Chapter, BookStatus, ChapterStatus, ChapterPriority } from './types';
import { 
  BookOpen, 
  Feather, 
  Flame, 
  Sparkles, 
  Trophy, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  CheckCircle, 
  Lock, 
  TrendingUp, 
  CloudAlert, 
  User, 
  Mail, 
  Key, 
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function DashboardContent() {
  const { 
    currentUser, 
    userProfile, 
    books, 
    chapters, 
    writingStreak, 
    totalWords, 
    totalBooksCount, 
    totalChaptersCount, 
    completionRate, 
    recentActivity,
    isFirebaseActive
  } = useApp();

  const finishedBooksCount = books.filter(b => b.status === 'Completed').length;

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* 1. WELCOME BOARD HERO DISPLAY */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950/15 border border-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Abstract glowing sphere */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="space-y-2.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full font-black animate-pulse">StoryBlocks Studio</span>
            <span className="text-[10px] font-mono text-slate-500">•</span>
            <span className="text-[10px] font-mono text-slate-400">Time to write</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-sans text-white tracking-tight leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 font-serif font-black">{userProfile?.displayName || 'Author'}</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Your quill is active and loaded. Outlining novels, tracking weighted progress segments, and cloud documentation is active in real-time.
          </p>
        </div>

        {/* Quick overall completion widget */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-900">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Interactive Progress</span>
            <span className="text-2xl font-black text-amber-500 tracking-tight mt-1">{completionRate}%</span>
          </div>
          <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-mono font-black text-amber-500 text-sm">
            %
          </div>
        </div>
      </div>

      {/* 2. CORE DYNAMIC STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Daily Streak"
          value={`${writingStreak} Days`}
          icon={Flame}
          description="Total consecutive days of story updates"
          color="orange"
        />
        <StatCard
          title="Books Outline"
          value={totalBooksCount}
          icon={BookOpen}
          description={`With indeed ${finishedBooksCount} completed projects`}
          color="amber"
        />
        <StatCard
          title="Total Chapters"
          value={totalChaptersCount}
          icon={Feather}
          description="Chapter outlines currently active"
          color="sky"
        />
        <StatCard
          title="Total Wordcount"
          value={totalWords.toLocaleString()}
          icon={TrendingUp}
          description="Estimated page counts active in studio"
          color="emerald"
        />
      </div>

      {/* 3. VISUAL ACTIVITY AND HIGHLIGHT CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart View */}
        <div className="lg:col-span-2 space-y-4">
          <StatsCharts />
        </div>

        {/* Recent Activity Sync Log feed */}
        <div className="p-6 bg-slate-900/60 backdrop-blur-md border border-slate-900 rounded-2xl flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-black font-sans text-slate-100 uppercase tracking-wider">Workspace Sync Log</h3>
            <p className="text-xs text-slate-500 mt-1">Realtime logs of outline events and accomplishments.</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[310px] space-y-4 pr-1">
            {recentActivity.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center border border-dashed border-slate-900/60 rounded-xl max-w-xs mx-auto text-center p-4">
                <CloudAlert className="h-5 w-5 text-slate-700 animate-bounce mb-2" />
                <p className="text-[11px] text-slate-500">No events logged during the active session. Write or create outlines to log.</p>
              </div>
            ) : (
              recentActivity.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-300 font-medium leading-relaxed">{act.details}</p>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                      {new Date(act.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}

function MainAppShell() {
  const { 
    currentUser, 
    loading, 
    isFirebaseActive,
    signUp, 
    logIn, 
    logInWithGoogle, 
    resetPassword,
    books,
    chapters,
    createBook,
    editBook,
    removeBook,
    createChapter,
    editChapter,
    removeChapter,
    reorderChapters,
    writingStreak,
    totalWords,
    userProfile,
    importWorkspaceData
  } = useApp();

  // Navigation management states
  const [currentView, setView] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active book/chapter edit states
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // Authentication screens states
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authFeedback, setAuthFeedback] = useState('');

  // Search & Filter state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genreFilter, setGenreFilter] = useState('ALL');

  // Modals management states
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookTitleFld, setBookTitleFld] = useState('');
  const [bookGenreFld, setBookGenreFld] = useState('Fantasy');
  const [bookDescFld, setBookDescFld] = useState('');
  const [bookGoalFld, setBookGoalFld] = useState(50000);
  const [bookChapsFld, setBookChapsFld] = useState(12);
  const [bookStatusFld, setBookStatusFld] = useState<BookStatus>('Draft');
  const [bookCoverUrl, setBookCoverUrl] = useState('');

  // Chapter Modal variables
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapTitleFld, setChapTitleFld] = useState('');
  const [chapBlocksFld, setChapBlocksFld] = useState(2); // default Medium
  const [chapPriorityFld, setChapPriorityFld] = useState<ChapterPriority>('Medium');
  const [chapStatusFld, setChapStatusFld] = useState<ChapterStatus>('To Do');
  const [chapSummaryFld, setChapSummaryFld] = useState('');

  // Handle manual Sign-Up/Sign-In actions beautifully
  const handleSignOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthFeedback('');
    try {
      if (authMode === 'signup') {
        await signUp(authEmail, authPassword, authName);
      } else if (authMode === 'login') {
        await logIn(authEmail, authPassword);
      } else {
        await resetPassword(authEmail);
        setAuthFeedback('Password reset link successfully generated. Check email.');
      }
    } catch (err: any) {
      setAuthFeedback(err.message || 'Operation failed. Verify parameters.');
    }
  };

  // Create Book Outline Submit
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      await editBook(editingBook.id, {
        title: bookTitleFld,
        genre: bookGenreFld,
        description: bookDescFld,
        writingGoal: Number(bookGoalFld),
        plannedChapters: Number(bookChapsFld),
        status: bookStatusFld,
        coverImage: bookCoverUrl
      });
      setEditingBook(null);
    } else {
      await createBook({
        title: bookTitleFld,
        genre: bookGenreFld,
        description: bookDescFld,
        writingGoal: Number(bookGoalFld),
        plannedChapters: Number(bookChapsFld),
        status: bookStatusFld,
        coverImage: bookCoverUrl
      });
    }
    // Reset Form Fields
    setBookTitleFld('');
    setBookDescFld('');
    setBookCoverUrl('');
    setShowAddBookModal(false);
  };

  // Create Chapter Submit
  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) return;

    if (editingChapter) {
      await editChapter(editingChapter.id, {
        title: chapTitleFld,
        blocks: Number(chapBlocksFld),
        priority: chapPriorityFld,
        status: chapStatusFld,
        summary: chapSummaryFld
      });
      setEditingChapter(null);
    } else {
      await createChapter({
        bookId: selectedBookId,
        title: chapTitleFld,
        blocks: Number(chapBlocksFld),
        priority: chapPriorityFld,
        status: chapStatusFld,
        summary: chapSummaryFld
      });
    }

    setChapTitleFld('');
    setChapSummaryFld('');
    setChapBlocksFld(2);
    setShowAddChapterModal(false);
  };

  // Render initial Loading screen securely
  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-100">
        <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-mono text-xs text-slate-500 tracking-widest uppercase">Initializing StoryBlocks...</p>
      </div>
    );
  }

  // Render Authentication overlay if session does not exist
  if (!currentUser) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-amber-500/35 relative overflow-hidden">
        {/* Abstract backlights */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-900/80 shadow-2xl flex flex-col gap-6"
        >
          {/* Brand header */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 mb-1">
              <span className="font-serif font-black text-slate-950 text-2xl">S</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">StoryBlocks Workspace</h1>
            <p className="text-xs text-slate-500">The premier SaaS suite for outline writing and novelists</p>
          </div>

          <form onSubmit={handleSignOperation} className="flex flex-col gap-4">
            {authMode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Author Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-600" />
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Mary Shelley"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-600" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@storyblocks.org"
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            {authMode !== 'forgot' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Security Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-600" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            )}

            {authFeedback && (
              <p className="text-xs font-mono font-bold text-red-400 bg-red-500/5 p-2.5 border border-red-500/10 rounded-lg text-center mt-1">
                {authFeedback}
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 rounded-lg font-black text-sm tracking-wide shadow-md shadow-amber-500/5 hover:scale-[1.01] transition-all duration-300 cursor-pointer"
            >
              {authMode === 'login' ? 'Author Login' : authMode === 'signup' ? 'Create Free Workspace' : 'Reset Workspace Link'}
            </button>
          </form>

          {/* Social OAuth Google Signin */}
          {authMode !== 'forgot' && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 border-t border-slate-900" />
                <span className="relative px-3.5 bg-slate-900/10 backdrop-blur-3xl text-[10px] font-mono uppercase text-slate-600 font-bold select-none">Or Access via Cloud</span>
              </div>

              <button
                onClick={logInWithGoogle}
                className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-bold font-mono transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span>🚀 Authenticate Google Account</span>
              </button>
            </div>
          )}

          {/* View switching anchors */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mt-2 selection:bg-transparent">
            {authMode === 'login' ? (
              <>
                <button onClick={() => { setAuthFeedback(''); setAuthMode('signup'); }} className="hover:text-amber-500 transition-colors">Workspace Outliner Registration</button>
                <button onClick={() => { setAuthFeedback(''); setAuthMode('forgot'); }} className="hover:text-amber-500 transition-colors">Pass Recovery</button>
              </>
            ) : (
              <button onClick={() => { setAuthFeedback(''); setAuthMode('login'); }} className="hover:text-amber-500 transition-colors mx-auto block">Already initialized? Sign In Session</button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Active outliner detail views calculations
  const activeBook = books.find(b => b.id === selectedBookId);
  const activeChapter = chapters.find(c => c.id === activeChapterId);

  // Filter book arrays
  const filteredBooks = books.filter(b => {
    const matchQuery = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchGenre = genreFilter === 'ALL' || b.genre === genreFilter;
    return matchQuery && matchStatus && matchGenre;
  });

  // Unique genres from books
  const booksGenresList = Array.from(new Set(books.map(b => b.genre)));

  // Reordering handoff helpers
  const moveChapterAtIndex = (bookId: string, fromIdx: number, toIdx: number) => {
    const bookChaps = chapters.filter(c => c.bookId === bookId);
    if (fromIdx < 0 || fromIdx >= bookChaps.length || toIdx < 0 || toIdx >= bookChaps.length) return;
    
    // Copy array and swap
    const copy = [...bookChaps];
    const temp = copy[fromIdx];
    copy[fromIdx] = copy[toIdx];
    copy[toIdx] = temp;

    reorderChapters(bookId, copy);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex overflow-hidden font-sans select-none text-slate-100">
      
      {/* 1. Sidebar Component Block */}
      <Sidebar
        currentView={currentView}
        setView={(v) => {
          setView(v);
          setSelectedBookId(null);
          setActiveChapterId(null);
        }}
        isOpen={mobileSidebarOpen}
        toggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* 2. Main content area panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header elements */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-900 shrink-0 h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-white uppercase tracking-wider">StoryBlocks</h1>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 border border-slate-900 rounded-lg text-slate-400 hover:text-white"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Dynamic Nested Route View renderer */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 selection:bg-amber-500/25">
          <AnimatePresence mode="wait">
            
            {/* Notes Detailed Canvas overlay page takes total priority if active */}
            {activeChapter && activeBook ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30"
              >
                <NotesEditor
                  chapter={activeChapter}
                  associatedBook={activeBook}
                  onBack={() => {
                    setActiveChapterId(null);
                    setView('chapters');
                  }}
                />
              </motion.div>
            ) : null}

            {/* View book outline specific sheet */}
            {selectedBookId && activeBook && !activeChapterId && (
              <motion.div
                key="book-chapters"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Book header detail widget */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 bg-slate-900/30 rounded-3xl border border-slate-900">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                      <button onClick={() => setSelectedBookId(null)} className="hover:text-amber-500 font-bold">My Books</button>
                      <span>/</span>
                      <span className="text-slate-400">{activeBook.title}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-serif font-black text-white leading-tight">{activeBook.title} Outline Skeleton</h2>
                    <p className="text-xs text-slate-400 max-w-xl">{activeBook.description}</p>
                  </div>

                  <div className="flex items-center gap-3 select-none shrink-0 self-start md:self-center">
                    <button
                      onClick={() => {
                        setChapTitleFld('');
                        setChapSummaryFld('');
                        setEditingChapter(null);
                        setShowAddChapterModal(true);
                      }}
                      className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Chapter Outline</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedBookId(null)}
                      className="px-4 py-2 border border-slate-900 hover:border-slate-800 text-xs font-medium rounded-xl text-slate-300"
                    >
                      Return to Outline lists
                    </button>
                  </div>
                </div>

                {/* Chapters outlines list renderer */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900/50 pb-2">
                    <h3 className="text-xs font-mono font-black text-slate-500 uppercase tracking-widest">Outline Index Maps</h3>
                    <span className="text-[10px] font-mono text-slate-600">Drag/reorder chapters to sync plot orderings</span>
                  </div>

                  {chapters.filter(c => c.bookId === selectedBookId).length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-slate-900/60 rounded-3xl max-w-md mx-auto p-5">
                      <Feather className="h-10 w-10 text-slate-700 animate-bounce mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-slate-200 uppercase">Outline Map Blank</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">This book doesn't contain chapter nodes yet. Click "Add Chapter" to begin outlining.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {chapters
                        .filter(c => c.bookId === selectedBookId)
                        .map((chap, idx, arr) => (
                          <ChapterCard
                            key={chap.id}
                            chapter={chap}
                            index={idx}
                            totalChapters={arr.length}
                            onEdit={(tc) => {
                              setEditingChapter(tc);
                              setChapTitleFld(tc.title);
                              setChapBlocksFld(tc.blocks);
                              setChapPriorityFld(tc.priority);
                              setChapStatusFld(tc.status);
                              setChapSummaryFld(tc.summary || '');
                              setShowAddChapterModal(true);
                            }}
                            onDelete={(id) => removeChapter(id)}
                            onOpen={(id) => setActiveChapterId(id)}
                            onMoveUp={() => moveChapterAtIndex(selectedBookId, idx, idx - 1)}
                            onMoveDown={() => moveChapterAtIndex(selectedBookId, idx, idx + 1)}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Active Core Navigation view tabs */}
            {!selectedBookId && currentView === 'dashboard' && (
              <motion.div key="dashboard">
                <DashboardContent />
              </motion.div>
            )}

            {!selectedBookId && currentView === 'books' && (
              <motion.div key="books" className="space-y-6">
                
                {/* Title & Actions Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-900/80 pb-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black font-sans uppercase tracking-tight text-white leading-tight">My Book Outlines</h2>
                    <p className="text-xs text-slate-500">Edit details, upload custom presets, and explore outlines mapping.</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setEditingBook(null);
                      setBookTitleFld('');
                      setBookDescFld('');
                      setBookCoverUrl('');
                      setBookGoalFld(50000);
                      setBookChapsFld(12);
                      setBookStatusFld('Draft');
                      setShowAddBookModal(true);
                    }}
                    className="flex items-center gap-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md self-start md:self-center cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Outline New Book</span>
                  </button>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900/20 rounded-2xl border border-slate-900/60 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-2 text-slate-600 h-4.5 w-4.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search books, genres, tags..."
                      className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl p-1.5 focus:outline-none focus:border-amber-500"
                    >
                      <option value="ALL">Status: All</option>
                      <option value="Draft">Draft</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <select
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl p-1.5 focus:outline-none focus:border-amber-500"
                    >
                      <option value="ALL">Genre: All</option>
                      {booksGenresList.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grid Lists items */}
                {filteredBooks.length === 0 ? (
                  <div className="py-24 text-center border border-dashed border-slate-900/60 rounded-3xl max-w-sm mx-auto p-5">
                    <BookOpen className="h-10 w-10 text-slate-700 animate-bounce mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-200 uppercase">Book Outline Shelf Empty</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">No matching books found. Outline a new book to build shelf indexes.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onEdit={(tb) => {
                          setEditingBook(tb);
                          setBookTitleFld(tb.title);
                          setBookGenreFld(tb.genre);
                          setBookDescFld(tb.description || '');
                          setBookGoalFld(tb.writingGoal || 50000);
                          setBookChapsFld(tb.plannedChapters || 12);
                          setBookStatusFld(tb.status);
                          setBookCoverUrl(tb.coverImage || '');
                          setShowAddBookModal(true);
                        }}
                        onDelete={(id) => removeBook(id)}
                        onSelect={(id) => setSelectedBookId(id)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {!selectedBookId && currentView === 'chapters' && (
              <motion.div key="chapters" className="space-y-6">
                <div className="border-b border-slate-900/80 pb-5">
                  <h2 className="text-xl font-black font-sans uppercase tracking-tight text-white leading-tight">Book Outliner Workbench</h2>
                  <p className="text-xs text-slate-500 mt-1">Select a core novel from the list below to begin building chapter outlines, note templates, and dynamic segments.</p>
                </div>

                {books.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-slate-900/60 rounded-3xl max-w-md mx-auto p-5">
                    <BookOpen className="h-10 w-10 text-slate-700 mx-auto animate-bounce mb-3" />
                    <h4 className="text-sm font-bold text-slate-200">Outline shelf blank</h4>
                    <p className="text-xs text-slate-500 mt-1">You must first outline an active book profile to deploy chapter outliner trees.</p>
                    <button
                      onClick={() => setView('books')}
                      className="mt-4 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 hover:border-amber-500/35 rounded-xl text-xs font-black font-mono"
                    >
                      Outline Your First Book
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((b) => {
                      const associatedChaps = chapters.filter(c => c.bookId === b.id).length;
                      return (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBookId(b.id)}
                          className="p-6 bg-slate-900/50 hover:bg-slate-900/80 border border-slate-900/80 hover:border-amber-500/20 rounded-2xl cursor-pointer shadow-md flex flex-col justify-between hover:scale-[1.01] transition-all duration-300"
                        >
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 bg-slate-950 px-2 py-0.5 border border-slate-900 rounded-full">{b.genre}</span>
                            <h3 className="text-base font-black text-slate-200 mt-3 hover:text-amber-500 truncate">{b.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{b.description || 'No outline concepts written.'}</p>
                          </div>
                          <div className="flex justify-between items-center text-xs font-mono text-slate-500 mt-5 pt-3 border-t border-slate-950">
                            <span>{associatedChaps} outlined chapters</span>
                            <span className="text-amber-500 flex items-center gap-1 font-black">Outline maps <ChevronRight className="h-3.5 w-3.5" /></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {!selectedBookId && currentView === 'analytics' && (
              <motion.div key="analytics" className="space-y-6">
                <div className="border-b border-slate-900/80 pb-5">
                  <h2 className="text-xl font-black font-sans uppercase tracking-tight text-white leading-tight">Author Stats & Analytics Dashboard</h2>
                  <p className="text-xs text-slate-500 mt-1">Review live measurements of writing speeds, weekly outputs, goals ratios, and chapter segments completion indexes.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-900 flex flex-col gap-1 text-center select-none">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-black">Total Words Drafted</span>
                    <span className="text-3xl font-serif font-black text-amber-500 tracking-tight mt-1">{totalWords.toLocaleString()}</span>
                  </div>
                  <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-900 flex flex-col gap-1 text-center select-none">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-black">Dynamic Streak</span>
                    <span className="text-3xl font-serif font-black text-amber-500 tracking-tight mt-1">{writingStreak} Days</span>
                  </div>
                  <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-900 flex flex-col gap-1 text-center select-none">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-black">Chapter Outline Goals Ratio</span>
                    <span className="text-3xl font-serif font-black text-amber-500 tracking-tight mt-1">
                      {chapters.filter(c => c.status === 'Completed').length} completed
                    </span>
                  </div>
                </div>
                <StatsCharts />
              </motion.div>
            )}

            {!selectedBookId && currentView === 'badges' && (
              <motion.div key="badges" className="space-y-6">
                <div className="border-b border-slate-900/80 pb-5 flex justify-between items-center flex-wrap gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black font-sans uppercase tracking-tight text-white leading-tight">Author Achievements & Badges</h2>
                    <p className="text-xs text-slate-500">Unlocking custom medals dynamically in real-time as you write novels.</p>
                  </div>
                  <div className="flex gap-2 p-3 rounded-2xl bg-slate-900/40 border border-slate-900 items-center justify-center font-mono text-xs font-bold text-slate-400">
                    <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Unlocked Trophies: {userProfile?.badges.length || 0}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* System medals list items */}
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const presetMedals = [
                      { id: 'first_book', title: 'World Builder', description: 'Create your first book outline', trigger: '1 book profile', check: books.length >= 1 },
                      { id: 'first_chapter', title: 'First Chapter', description: 'Create your first book chapter', trigger: '1 chapter outline', check: chapters.length >= 1 },
                      { id: 'novelist_outline', title: 'Architect of Worlds', description: 'Outline at least 10 chapters', trigger: '10 chapters outline', check: chapters.length >= 10 },
                      { id: 'wordsmith_1k', title: 'Initiate of Words', description: 'Write 1,000 words in StoryBlocks', trigger: '1,000 words writing', check: totalWords >= 1000 },
                      { id: 'wordsmith_10k', title: 'Master Novelist', description: 'Write 10,000 words in StoryBlocks', trigger: '10,000 words writing', check: totalWords >= 10000 },
                      { id: 'streak_3', title: 'Sustained Quill', description: 'Maintain a 3-day active writing streak', trigger: '3 days streak logs', check: (userProfile?.writingStreak || 0) >= 3 },
                      { id: 'streak_7', title: 'Relentless Muse', description: 'Maintain a 7-day active writing streak', trigger: '7 days streak logs', check: (userProfile?.writingStreak || 0) >= 7 },
                    ];

                    const item = presetMedals[idx];
                    const isUnlocked = userProfile?.badges.includes(item.id) || item.check;

                    return (
                      <div
                        key={item.id}
                        className={`flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 ${
                          isUnlocked 
                            ? 'bg-gradient-to-br from-slate-900 to-amber-950/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)] text-slate-100' 
                            : 'bg-slate-950 border-slate-900 text-slate-500'
                        }`}
                      >
                        <div>
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${isUnlocked ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-slate-900 border-slate-950 text-slate-700'}`}>
                            {isUnlocked ? <Trophy className="h-5 w-5" /> : <Lock className="h-4.5 w-4.5" />}
                          </div>
                          <h3 className={`text-sm font-black mt-4 ${isUnlocked ? 'text-slate-100' : 'text-slate-500'}`}>{item.title}</h3>
                          <p className={`text-xs mt-1 leading-relaxed ${isUnlocked ? 'text-slate-400' : 'text-slate-600'}`}>{item.description}</p>
                        </div>
                        <span className={`text-[10px] font-mono mt-4 block p-1.5 rounded bg-slate-950/40 border border-slate-900/60 text-center uppercase tracking-wider font-bold ${isUnlocked ? 'text-amber-500' : 'text-slate-600'}`}>
                          {isUnlocked ? '🏅 Trophy unlocked!' : `Requires: ${item.trigger}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {!selectedBookId && currentView === 'settings' && (
              <motion.div key="settings" className="space-y-6 max-w-2xl mx-auto">
                <div className="border-b border-slate-900/80 pb-5">
                  <h2 className="text-xl font-black font-sans uppercase tracking-tight text-white leading-tight">Settings & Workspace Config</h2>
                  <p className="text-xs text-slate-500">Fine-tune your local workbench settings and check cloud database properties.</p>
                </div>

                {/* Profile Widget */}
                <div className="p-5 bg-slate-900/40 border border-slate-900 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider border-b border-slate-950 pb-2">Author profile details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-slate-500">Author Name</span>
                      <span className="font-bold text-slate-200 mt-1">{userProfile?.displayName || 'Novel Writer'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-slate-500">Email Address</span>
                      <span className="font-mono text-slate-200 mt-1 truncate">{currentUser?.email || 'writer@storyblocks.local'}</span>
                    </div>
                  </div>
                </div>

                {/* Firebase Connection details panel */}
                <div className="p-5 bg-slate-900/40 border border-slate-900 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider border-b border-slate-950 pb-2">Firebase Synchronizer Settings</h3>
                  <div className="flex items-center gap-3">
                    <div className={`h-25 w-2.5 rounded-full ${isFirebaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-xs font-mono">
                      {isFirebaseActive ? 'Status: Real-Time Synced with Cloud Firebase Firestore Services' : 'Status: Simulated Workbench Sandbox Safe Local Profile Mode'}
                    </span>
                  </div>
                  
                  {!isFirebaseActive && (
                    <div className="text-xs text-slate-400 leading-relaxed bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 space-y-2.5">
                      <p className="font-bold text-amber-500 flex items-center gap-1.5"><CloudAlert className="h-4 w-4 shrink-0" /> Local Safe-Zone Sandbox Mode</p>
                      <p>StoryBlocks detects that Firebase services are not provisioned or configured yet. This is absolutely normal! All of your books, outline maps, progress blocks, and research sheets are stored in your secure and responsive client-side Workspace Sandbox.</p>
                      <p className="underline">To connect your live Firebase credentials cloud profile:</p>
                      <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                        <li>Locate the **Secrets panel** inside the AI Studio code workspace editor.</li>
                        <li>Sync and run the Firebase setup from settings to generate the credentials.</li>
                        <li>All of your sandbox models will cleanly migrate over!</li>
                      </ol>
                    </div>
                  )}
                </div>

                {/* Local Storage Workspace clean widget */}
                <div className="p-5 bg-slate-900/40 border border-slate-900 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider border-b border-slate-950 pb-2">Data Management Utility</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Securely download or export a backup copy of all StoryBlocks outline schemas, or upload a previously exported backup file to restore your workspace records instantly.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center">
                    <button
                      onClick={() => {
                        const data = {
                          books,
                          chapters,
                          profile: userProfile
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `storyblocks_author_backup_${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white rounded-xl font-bold transition-all pointer-events-auto"
                    >
                      🚀 Backup & Export JSON
                    </button>

                    <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-600/20 to-amber-500/20 hover:from-amber-600/30 hover:to-amber-500/30 border border-amber-500/30 text-xs font-mono text-amber-500 hover:text-amber-400 rounded-xl font-black cursor-pointer transition-all">
                      <FileText className="h-4 w-4" />
                      <span>Upload Backup JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            const reader = new FileReader();
                            reader.onload = async (evt) => {
                              try {
                                const parsed = JSON.parse(evt.target?.result as string);
                                await importWorkspaceData(parsed);
                                alert("Workspace successfully imported! All novels and chapter outline nodes have been loaded.");
                              } catch (err: any) {
                                alert("Failed to parse the backup file: " + err.message);
                              }
                            };
                            reader.readAsText(file);
                          } catch (err: any) {
                            alert("Import utility failed: " + err.message);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MODAL OVERLAY: CREATE/EDIT BOOK INFO */}
      <AnimatePresence>
        {showAddBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddBookModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onSubmit={handleBookSubmit}
              className="relative w-full max-w-lg p-6 md:p-8 rounded-3xl bg-slate-900/95 border border-slate-900/80 text-left z-10 shadow-2xl flex flex-col gap-4 outline-none"
            >
              <h3 className="text-lg font-black font-sans uppercase tracking-tight text-white">
                {editingBook ? 'Edit Book Profile Outline' : 'Outline New Book'}
              </h3>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Book Novel Title</label>
                <input
                  type="text"
                  required
                  value={bookTitleFld}
                  onChange={(e) => setBookTitleFld(e.target.value)}
                  placeholder="e.g. Frankstein, The Alchemist"
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Book Genre Category</label>
                  <select
                    value={bookGenreFld}
                    onChange={(e: any) => setBookGenreFld(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500 transition-all font-medium"
                  >
                    <option value="Fantasy">✨ Fantasy</option>
                    <option value="Sci-Fi">🔮 Sci-Fi</option>
                    <option value="Mystery">🕵️ Mystery</option>
                    <option value="Drama">🎭 Drama</option>
                    <option value="Other">📚 Other General</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Planned Chapters Target</label>
                  <input
                    type="number"
                    required
                    value={bookChapsFld}
                    onChange={(e) => setBookChapsFld(Number(e.target.value))}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Target Word Goal</label>
                  <input
                    type="number"
                    value={bookGoalFld}
                    onChange={(e) => setBookGoalFld(Number(e.target.value))}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Current Outline Status</label>
                  <select
                    value={bookStatusFld}
                    onChange={(e: any) => setBookStatusFld(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Draft">Draft Outline</option>
                    <option value="In Progress">Active drafting</option>
                    <option value="Completed">Completed Novel</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Plot logline / Description outline</label>
                <textarea
                  value={bookDescFld}
                  onChange={(e) => setBookDescFld(e.target.value)}
                  placeholder="A short plot sentence explaining the novel outline target..."
                  rows={3}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Custom Cover URL (Optional)</label>
                <input
                  type="text"
                  value={bookCoverUrl}
                  onChange={(e) => setBookCoverUrl(e.target.value)}
                  placeholder="https://image-url-for-custom-cover.jpg"
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2.5 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4.5 py-2 border border-slate-900 text-xs font-bold rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save Outline Changes
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 4. MODAL OVERLAY: CREATE/EDIT CHAPTER INFO */}
      <AnimatePresence>
        {showAddChapterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddChapterModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onSubmit={handleChapterSubmit}
              className="relative w-full max-w-lg p-6 md:p-8 rounded-3xl bg-slate-900/95 border border-slate-900/80 text-left z-10 shadow-2xl flex flex-col gap-4 outline-none"
            >
              <h3 className="text-lg font-black font-sans uppercase tracking-tight text-white">
                {editingChapter ? 'Edit Chapter Outline Segment' : 'Outline Chapter Segment'}
              </h3>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Chapter Outline title</label>
                <input
                  type="text"
                  required
                  value={chapTitleFld}
                  onChange={(e) => setChapTitleFld(e.target.value)}
                  placeholder="e.g. Chapter 1: The Gathering Storm"
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Progress Weight size</label>
                  <select
                    value={chapBlocksFld}
                    onChange={(e) => setChapBlocksFld(Number(e.target.value))}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-350 focus:outline-none"
                  >
                    <option value={1}>1 Block (Small segments ~1.5k words)</option>
                    <option value={2}>2 Blocks (Medium segments ~3.5k words)</option>
                    <option value={3}>3 Blocks (Large segments ~5k+ words)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Priority Tier</label>
                  <select
                    value={chapPriorityFld}
                    onChange={(e: any) => setChapPriorityFld(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-350 focus:outline-none"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Outline Priority</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Draft Status</label>
                <select
                  value={chapStatusFld}
                  onChange={(e: any) => setChapStatusFld(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-350 focus:outline-none"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed Segment</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Outline Synopsis</label>
                <textarea
                  value={chapSummaryFld}
                  onChange={(e) => setChapSummaryFld(e.target.value)}
                  placeholder="A short synoptical outline notes of what happens in this chapter..."
                  rows={3}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddChapterModal(false)}
                  className="px-4.5 py-2 border border-slate-900 text-xs font-bold rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save Outline Changes
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
