import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  LayoutDashboard, 
  Feather, 
  BarChart3, 
  Settings, 
  Award, 
  LogOut, 
  CloudCheck, 
  CloudAlert, 
  Menu, 
  X,
  History,
  TrendingUp,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setView,
  isOpen,
  toggleSidebar
}) => {
  const { currentUser, userProfile, syncStatus, logOut, writingStreak, totalWords } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'My Books', icon: BookOpen },
    { id: 'chapters', label: 'Book Outliner', icon: Feather },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'badges', label: 'Trophies', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const syncInfo = {
    synced: { label: 'Cloud Synced', color: 'text-emerald-400 bg-emerald-500/10', icon: CloudCheck },
    saving: { label: 'Autosaving...', color: 'text-amber-400 bg-amber-500/10', icon: CloudCheck },
    offline: { label: 'Local Safe Sandbox', color: 'text-sky-400 bg-sky-500/10', icon: CloudAlert },
    error: { label: 'Connect Error', color: 'text-red-400 bg-red-500/10', icon: CloudAlert }
  }[syncStatus];

  const navContent = (
    <div className="flex flex-col h-full bg-[#0A0C10] text-slate-100 border-r border-white/5">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <span className="font-serif font-black text-slate-950 text-xl text-center">S</span>
        </div>
        <div className="flex flex-col">
          <span className="font-sans font-black tracking-tight text-lg text-white">StoryBlocks</span>
          <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Novel Studio</span>
        </div>
      </div>

      {/* Synchronizer Status pill */}
      <div className="px-4 py-3 border-b border-white/5 bg-[#0A0C10]/50">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 text-xs font-medium ${syncInfo.color}`}>
          <syncInfo.icon className="h-4 w-4 shrink-0 animate-pulse" />
          <span className="truncate">{syncInfo.label}</span>
        </div>
      </div>

      {/* Main Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                if (window.innerWidth < 1024) toggleSidebar(); // auto close on mobile
              }}
              className={`
                w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-950 border-l-2 border-amber-500 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }
              `}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Writing active Streak tracker mini-widget */}
      {currentUser && (
        <div className="px-4 py-4 border-t border-white/5 bg-[#0A0C10]/35">
          <div className="p-3 bg-[#16181F] rounded-xl border border-white/5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-indigo-500 animate-pulse" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Streak</p>
              <p className="text-xs font-bold text-slate-200 truncate">{writingStreak} {writingStreak === 1 ? 'day' : 'days'} writing</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Footer */}
      <div className="px-4 py-4 border-t border-white/5 mt-auto bg-[#0A0C10]">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center border border-white/10">
            <span className="font-bold text-amber-500 text-sm">
              {(userProfile?.displayName || 'A').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="text-xs font-semibold text-white truncate">
              {userProfile?.displayName || 'Story Author'}
            </h4>
            <p className="text-[10px] text-slate-500 truncate">
              {currentUser?.email || 'offline-workbench'}
            </p>
          </div>
        </div>
        <button
          onClick={logOut}
          className="w-full flex items-center gap-2 justify-center px-3 py-2 border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 text-slate-400 hover:text-red-400 rounded-lg text-xs font-medium transition-all duration-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-full shrink-0 z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide in body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative flex flex-col w-64 max-w-xs h-full bg-[#0A0C10] shadow-2xl z-50"
            >
              <button
                onClick={toggleSidebar}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              {navContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
