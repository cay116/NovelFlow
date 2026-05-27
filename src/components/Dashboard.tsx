/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types';
import {
  TrendingUp,
  Building,
  Target,
  Trophy,
  History,
  Coins,
  ChevronUp,
  ChevronDown,
  Percent,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { players, currentPlayerId, transactions, properties, stocks } = useGame();

  if (!currentPlayerId) return null;
  const player = players[currentPlayerId];

  // 1. Calculate Owned Assets Counts & Values
  const ownedProps = properties.filter((p) => p.ownerId === currentPlayerId);
  const totalPassiveIncome = ownedProps.reduce((sum, p) => sum + p.passiveIncome, 0);
  const propsValue = ownedProps.reduce((sum, p) => sum + p.currentValue, 0);

  // 2. Portfolio Calculations
  const portfolioSymbols = Object.keys(player.portfolio);
  const stockValue = portfolioSymbols.reduce((sum, symbol) => {
    const item = player.portfolio[symbol];
    const stock = stocks.find((s) => s.symbol === symbol);
    return sum + (item.shares * (stock?.price || 0));
  }, 0);

  // 3. Leaderboard list sorting by Net Worth
  const leaderboard: Player[] = (Object.values(players) as Player[])
    .filter((p) => !p.isBan)
    .sort((a, b) => b.netWorth - a.netWorth);

  const playerRank = leaderboard.findIndex((p) => p.id === currentPlayerId) + 1;

  // Let's create an elegant mini-SVG line chart showing the simulated hourly performance index
  const chartPoints = [8900000, 9200000, 9100000, 9500000, 9800000, player.netWorth];
  const chartMax = Math.max(...chartPoints);
  const chartMin = Math.min(...chartPoints);
  const pointsString = chartPoints
    .map((val, idx) => {
      const x = (idx / (chartPoints.length - 1)) * 340;
      const y = 140 - ((val - chartMin) / (chartMax - chartMin || 1)) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  // Betting Stats
  const totalBets = player.stats.totalBets;
  const betsWon = player.stats.betsWon;
  const winRate = totalBets > 0 ? ((betsWon / totalBets) * 100).toFixed(0) : '0';

  // Recent transactions related to this user
  const userTx = transactions
    .filter((tx) => tx.senderId === currentPlayerId || tx.receiverId === currentPlayerId)
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-8 py-6 text-[#e0e0e0] font-sans bg-[#050505]">
      {/* Dynamic Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl relative overflow-hidden bg-gradient-to-br from-[#121212] to-[#080808] border border-gold/20 p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute inset-0 bg-gold/5 blur-[80px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 space-y-4 sm:space-y-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-gold tracking-[0.25em] font-mono">
              Empirical Financial Board
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif italic mt-1 text-gold flex items-center space-x-2">
              <span>Greetings, {player.name}</span>
              <span className="text-xl sm:text-2xl not-italic">{player.avatar}</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Consolidate assets, command passive dividends, and issue challenges to rival Kings. The ticker is ticking.
            </p>
          </div>
          <div className="bg-gold/10 border border-gold/25 px-5 py-3.5 rounded-2xl sm:text-right shadow-[0_4px_15px_rgba(212,175,55,0.05)]">
            <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Aggregate Net Worth
            </span>
            <span className="text-xl sm:text-3xl font-serif italic font-extrabold text-gold">
              ${player.netWorth.toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Core Finance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        {/* Balance Card */}
        <div className="bg-[#0a0a0a] border border-gold/15 rounded-2xl p-4 flex items-center space-x-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/25 shadow-[0_0_8px_rgba(212,175,55,0.1)]">
            <Coins className="w-5 h-5 text-gold" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Available Liquid Call</span>
            <span className="font-mono text-base sm:text-lg font-bold text-gray-200">
              ${player.balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Real Estate valuation Card */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex items-center space-x-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Building className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Property Portfolio</span>
            <span className="font-mono text-base sm:text-lg font-bold text-gray-200">
              ${propsValue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stock Tickers Portfolio Card */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex items-center space-x-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Wall Street Holdings</span>
            <span className="font-mono text-base sm:text-lg font-bold text-gray-200">
              ${stockValue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Passive Income card */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex items-center space-x-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
            <Percent className="w-5 h-5 text-sky-400 animate-pulse" />
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Yield Flow / cycle</span>
            <span className="font-mono text-base sm:text-lg font-bold text-sky-450">
              +${totalPassiveIncome.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Bento Layout: Leaderboard & SVG Wealth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Trophied Leaderboards (5 Column) */}
        <div className="lg:col-span-5 bg-[#0a0a0a] border border-gold/15 rounded-3xl p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-gold" />
                <span>Empire Leaderboard</span>
              </h3>
              <span className="text-[10px] bg-gold/20 text-gold font-mono px-2 py-0.5 rounded-full font-bold">
                Your Rank: #{playerRank}
              </span>
            </div>

            <div className="space-y-2.5">
              {leaderboard.map((item, index) => {
                const isCurrent = item.id === currentPlayerId;
                const medalColors = ['from-gold to-gold-light text-black', 'from-zinc-400 to-zinc-200 text-zinc-950', 'from-amber-600 to-amber-800 text-white'];
                const rankLabels = ['🥇', '🥈', '🥉', '４', '５'];

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-gold/10 to-transparent border-gold/30 shadow-[inset_0_1px_10px_rgba(212,175,55,0.05)]'
                        : 'bg-[#121212]/40 border-white/5 hover:border-gold/20 hover:bg-[#121212]/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Placement Marker */}
                      <span className="text-sm flex-shrink-0 w-6 text-center font-bold">
                        {rankLabels[index] || index + 1}
                      </span>
                      <span className="text-xl">{item.avatar}</span>
                      <div>
                        <span className="font-semibold text-xs sm:text-sm flex items-center space-x-1.5">
                          <span>{item.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-gold/20 text-gold px-1.5 py-0.2 rounded font-bold font-mono">YOU</span>
                          )}
                        </span>
                        <span className="block text-[10px] text-zinc-500 font-mono">
                          Balance: ${item.balance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-bold text-gold">
                      ${item.netWorth.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-white/5 text-[11px] text-zinc-550 font-mono text-center">
            ⏱️ Ticks compile hourly averages automatically.
          </div>
        </div>

        {/* Wealth progress chart */}
        <div className="lg:col-span-12 xl:col-span-7 bg-[#0a0a0a] border border-gold/15 rounded-3xl p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Imperial Solvency Trend</span>
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">NET METRICS PROGRESSSION</span>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="h-44 w-full flex items-center justify-center mt-2 relative">
              <svg className="w-full h-full" viewBox="0 0 340 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                <line x1="0" y1="20" x2="340" y2="20" stroke="#FFFFFF" strokeOpacity="0.02" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="340" y2="60" stroke="#FFFFFF" strokeOpacity="0.02" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="340" y2="100" stroke="#FFFFFF" strokeOpacity="0.02" strokeDasharray="3 3" />

                {/* Fill Area beneath line */}
                <path
                  d={`M0,140 L${pointsString} L340,140 Z`}
                  fill="url(#chart-gold)"
                />

                {/* Main line path */}
                <path
                  d={`M${pointsString}`}
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Ticker dots */}
                {chartPoints.map((p, idx) => {
                  const x = (idx / (chartPoints.length - 1)) * 340;
                  const y = 140 - ((p - chartMin) / (chartMax - chartMin || 1)) * 100;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#000"
                      stroke="#d4af37"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              {/* Float pricing indices */}
              <div className="absolute top-1 right-2 text-[10px] font-mono text-zinc-650 bg-black/90 border border-white/5 py-0.5 px-1.5 rounded">
                Apex Index: ${(chartMax).toLocaleString()}
              </div>
            </div>
            
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-4">
              <span>T-5 Epoch</span>
              <span>T-4 Epoch</span>
              <span>T-3 Epoch</span>
              <span>T-2 Epoch</span>
              <span>T-1 Epoch</span>
              <span className="text-gold font-bold font-sans">Now</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
            <div className="text-center">
              <span className="block text-[9px] text-zinc-500 uppercase font-bold">Wagers won</span>
              <span className="font-mono text-xs sm:text-sm font-extrabold text-gold">{betsWon} matches</span>
            </div>
            <div className="text-center">
              <span className="block text-[9px] text-zinc-500 uppercase font-bold">Strike Ratio</span>
              <span className="font-mono text-xs sm:text-sm font-extrabold text-emerald-500">{winRate}%</span>
            </div>
            <div className="text-center">
              <span className="block text-[9px] text-zinc-500 uppercase font-bold">Total bets</span>
              <span className="font-mono text-xs sm:text-sm font-extrabold text-gray-400">{totalBets} placements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets & Portfolio Sub-view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {/* Real Estate Overview */}
        <div className="bg-[#0a0a0a] border border-gold/15 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center space-x-1.5">
              <Building className="w-4 h-4 text-orange-400" />
              <span>Acquired Landed Assets</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">
              {ownedProps.length} OWNED
            </span>
          </div>

          {ownedProps.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-650 italic">
              No real estate listed in portfolio. Hit the Real Estate market.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {ownedProps.map((prop) => (
                <div key={prop.id} className="flex items-center justify-between p-3 rounded-xl bg-[#121212]/30 border border-white/5 hover:border-gold/10 transition-colors">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{prop.image}</span>
                    <div>
                      <span className="font-bold text-xs sm:text-sm block text-gray-200">{prop.name}</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider font-bold">
                        Tier {prop.upgradeLevel} Upgrade Level
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono text-xs sm:text-sm font-bold text-emerald-400">
                      +${prop.passiveIncome.toLocaleString()}/c
                    </span>
                    <span className="text-[9px] text-[#888] font-mono">Valued: ${prop.currentValue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Ledger */}
        <div className="bg-[#0a0a0a] border border-gold/15 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center space-x-1.5">
              <History className="w-4 h-4 text-gold" />
              <span>Recent Ledger Audit</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">LAST 5 CLICKS</span>
          </div>

          {userTx.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-650 italic">
              Clean ledger. No recent transactions verified.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {userTx.map((tx) => {
                const isDebit = tx.senderId === currentPlayerId;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#121212]/30 border border-white/5 text-xs hover:border-gold/10 transition-colors">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-gray-300">
                          {isDebit ? `Sent to ${tx.receiverName}` : `From ${tx.senderName}`}
                        </span>
                        <span className="text-[9px] uppercase font-mono bg-[#161616] text-[#b0b0b0] border border-white/5 px-1.5 py-0.2 rounded font-bold scale-90">
                          {tx.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 italic block mt-0.5">"{tx.note}"</span>
                    </div>
                    <span className={`font-mono font-bold text-xs sm:text-sm ${isDebit ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isDebit ? '-' : '+'}${tx.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
