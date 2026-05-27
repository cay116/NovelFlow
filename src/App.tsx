/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import NetflixSelector from './components/NetflixSelector';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import PropertyMarket from './components/PropertyMarket';
import StockMarket from './components/StockMarket';
import Casino from './components/Casino';
import Challenges from './components/Challenges';
import ChatRoom from './components/ChatRoom';
import AdminPanel from './components/AdminPanel';
import { ShieldAlert, TrendingUp, AlertTriangle, Play, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function GameAppInner() {
  const { players, currentPlayerId, activeMarketEvent } = useGame();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Lockout system: verify pin exists
  if (!currentPlayerId) {
    return <NetflixSelector />;
  }

  const player = players[currentPlayerId];

  // Secure checking - if user is banned
  if (player.isBan) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border border-red-500/20 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-xl border border-red-500/20 animate-pulse">
            ⚠️
          </div>
          <h2 className="text-xl font-black text-red-500 tracking-wider">SOVEREIGN ACCESS TERMINATED</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your boardroom credential slot has been suspended by High Command executive overrides. Unresolved banking anomalies detected on portfolio.
          </p>
          <div className="pt-2 text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
            STATUS CODE // EXPULSION_403
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col justify-between overflow-hidden relative selection:bg-gold selection:text-black">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none blur-[120px]" />

      {/* Real-time ticker banner (Stock tape feed) */}
      <div className="bg-[#0a0a0a] border-b border-white/5 py-2 px-4 sm:px-8 text-[11px] font-mono text-zinc-400 overflow-hidden relative z-10 flex items-center space-x-6">
        <div className="flex-shrink-0 flex items-center space-x-1 font-sans text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          <TrendingUp className="w-3 h-3" />
          <span>Board Tape COMMS</span>
        </div>

        {/* Moving Ticker Loop */}
        <div className="relative flex-1 overflow-hidden h-4">
          <div className="absolute flex space-x-8 animate-marquee whitespace-nowrap">
            <span>● CAY: ${players.cay?.netWorth.toLocaleString()}</span>
            <span>● BROOKE: ${players.brooke?.netWorth.toLocaleString()}</span>
            <span>● DR. LEROY: ${players.dr_leroy?.netWorth.toLocaleString()}</span>
            <span>● SOL: ${players.sol?.netWorth.toLocaleString()}</span>
            <span>● YONNY: ${players.yonny?.netWorth.toLocaleString()}</span>
            <span>● INDICES: AAPL $230 // TSLA $280 // KNGS $940 // BTC $92,000</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-zinc-500 text-[10px]">
          <span>NETWORK LATENCY: 12ms</span>
          <span>●</span>
          <span>FDIC SECURED</span>
        </div>
      </div>

      {/* Main navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Dynamic System / Market Warnings Banner */}
      <AnimatePresence>
        {activeMarketEvent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-yellow-500 text-zinc-950 px-4 py-2 text-xs font-bold font-mono tracking-wide flex items-center justify-between shadow"
          >
            <span className="flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ALERT: {activeMarketEvent.title} IS ACTIVE. {activeMarketEvent.desc}</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest bg-zinc-950 text-yellow-500 py-0.5 px-2 rounded-full font-sans font-extrabold shadow-sm">
              ALERT SYSTEM ACTIVE
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Principal Contents viewport renders based on activeTab */}
      <main className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'ledger' && <Transactions />}
            {activeTab === 'property' && <PropertyMarket />}
            {activeTab === 'stocks' && <StockMarket />}
            {activeTab === 'casino' && <Casino />}
            {activeTab === 'challenges' && <Challenges />}
            {activeTab === 'social' && <ChatRoom />}
            {activeTab === 'admin' && <AdminPanel />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Moving Activity Wire footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/5 py-4 px-4 sm:px-8 text-[11px] text-zinc-500 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono uppercase tracking-wider text-[10px] text-zinc-400">
            Boardroom secure. No recent conflicts.
          </span>
        </div>

        <div className="font-mono text-[10px] uppercase text-zinc-600 flex items-center space-x-1">
          <span>CAPITAL KINGS GLOBAL SYSTEM VER 2.2 // DEEPMIND ANTIGRAVITY Engine</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameAppInner />
    </GameProvider>
  );
}
