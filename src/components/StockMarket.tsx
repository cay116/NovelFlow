/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Coins, Award, Percent, BookOpen, Star, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StockMarket() {
  const { players, currentPlayerId, stocks, buyStock, sellStock } = useGame();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('KNGS');
  const [tradeShares, setTradeShares] = useState<string>('');
  const [watchlist, setWatchlist] = useState<string[]>(['KNGS', 'BTC']);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!currentPlayerId) return null;
  const player = players[currentPlayerId];

  // Selected Stock Details
  const activeStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const shares = parseInt(tradeShares);
    if (isNaN(shares) || shares <= 0) {
      setError('Provide of a valid shares count');
      return;
    }

    const cost = Math.round(activeStock.price * shares);
    if (player.balance < cost) {
      setError('Sovereign funds insufficient for this position');
      return;
    }

    const ok = buyStock(activeStock.symbol, shares);
    if (ok) {
      setSuccess(`Position Filled! Acquired ${shares.toLocaleString()} shares of ${activeStock.symbol}.`);
      setTradeShares('');
    }
  };

  const handleSell = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const shares = parseInt(tradeShares);
    if (isNaN(shares) || shares <= 0) {
      setError('Provide of a valid shares count');
      return;
    }

    const owned = player.portfolio[activeStock.symbol]?.shares || 0;
    if (owned < shares) {
      setError('Insufficient share assets in portfolios to liquidate');
      return;
    }

    const revenue = Math.round(activeStock.price * shares);
    const ok = sellStock(activeStock.symbol, shares);
    if (ok) {
      setSuccess(`Position Cleared! Sold ${shares.toLocaleString()} shares of ${activeStock.symbol} for $${revenue.toLocaleString()}.`);
      setTradeShares('');
    }
  };

  const toggleWatchlist = (sym: string) => {
    if (watchlist.includes(sym)) {
      setWatchlist(watchlist.filter((s) => s !== sym));
    } else {
      setWatchlist([...watchlist, sym]);
    }
  };

  // Portfolio Analytics Calculations
  const portfolioSummaryList = Object.keys(player.portfolio).map((sym) => {
    const item = player.portfolio[sym];
    const liveSt = stocks.find((s) => s.symbol === sym);
    const costBasis = Math.round(item.shares * item.avgBuyPrice);
    const liveValue = Math.round(item.shares * (liveSt?.price || 0));
    const profitLoss = liveValue - costBasis;
    const profitRate = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

    return {
      symbol: sym,
      name: liveSt?.name || sym,
      shares: item.shares,
      avgPrice: item.avgBuyPrice,
      livePrice: liveSt?.price || 0,
      costBasis,
      liveValue,
      profitLoss,
      profitRate,
    };
  });

  const totalStockNetValue = portfolioSummaryList.reduce((sum, item) => sum + item.liveValue, 0);

  // SVG Chart points strings
  const hist = activeStock.history;
  const maxPrice = Math.max(...hist);
  const minPrice = Math.min(...hist);
  const chartPointsStr = hist
    .map((price, index) => {
      const x = (index / (hist.length - 1)) * 340;
      const y = 140 - ((price - minPrice) / (maxPrice - minPrice || 1)) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 text-[#e0e0e0] font-sans bg-[#050505] space-y-6">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl sm:text-2xl font-serif italic text-gold">
          Wall Street Equity Index Terminal
        </h1>
        <p className="text-[10px] text-zinc-550 mt-1 uppercase tracking-[0.2em] font-mono">
          TRADING CHANNELS: NASDAQ CLEARING HOUSE SECURED // REAL-TIME EXCHANGE FLUCTUATIONS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        {/* Stocks List and prices (4 Columns) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#0a0a0a] border border-gold/15 rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-3 font-mono">
              Live Sovereign Indices
            </h3>

            <div className="space-y-2">
              {stocks.map((st) => {
                const isSelected = selectedSymbol === st.symbol;
                const isGain = st.changePercent >= 0;
                const isWatched = watchlist.includes(st.symbol);

                return (
                  <div
                    key={st.symbol}
                    onClick={() => {
                      setSelectedSymbol(st.symbol);
                      setError(null);
                      setSuccess(null);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-gold/35 bg-gold/5 shadow-[inset_0_1px_8px_rgba(212,175,55,0.05)]'
                        : 'border-white/5 bg-[#121212]/30 hover:border-gold/20 hover:bg-[#121212]/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(st.symbol);
                        }}
                        className="text-zinc-500 hover:text-gold outline-none cursor-pointer"
                      >
                        <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-gold text-gold' : ''}`} />
                      </button>
                      <div>
                        <span className="font-mono font-bold text-xs sm:text-sm block text-gray-200">{st.symbol}</span>
                        <span className="text-[10px] text-zinc-500 block truncate max-w-[120px]">{st.name}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs sm:text-sm font-bold block text-gray-200 animate-pulse">
                        ${st.price.toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold font-mono inline-flex items-center space-x-0.5 ${
                          isGain ? 'text-emerald-500' : 'text-red-400'
                        }`}
                      >
                        {isGain ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownLeft className="w-2.5 h-2.5" />}
                        <span>{isGain ? '+' : ''}{st.changePercent}%</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Watchlist Shortcuts */}
          <div className="bg-[#0a0a0a] border border-gold/15 rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 font-mono">
              Watchlist Highlights
            </h3>
            {watchlist.length === 0 ? (
              <p className="text-xs text-zinc-600 py-2">Watchlist bookmarks are empty.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {watchlist.map((sym) => {
                  const s = stocks.find((item) => item.symbol === sym);
                  if (!s) return null;
                  return (
                    <button
                      key={sym}
                      onClick={() => {
                        setSelectedSymbol(sym);
                        setError(null);
                        setSuccess(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-gold/30 bg-[#121212]/30 text-[10px] font-mono hover:text-white cursor-pointer transition-colors"
                    >
                      {sym}: <span className={s.changePercent >= 0 ? 'text-emerald-500' : 'text-red-400'}>${s.price}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Stock Charts & Trading Desk (5 Columns) */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="bg-[#0a0a0a] border border-gold/15 rounded-2xl p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl pointer-events-none" />

            {/* Title Block */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
              <div>
                <h4 className="font-serif italic text-gold text-sm sm:text-base flex items-center space-x-2">
                  <span>{activeStock.name}</span>
                  <span className="text-[10px] bg-gold/10 text-gold px-1.5 py-0.2 rounded font-mono font-bold not-italic">
                    {activeStock.symbol}
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                  Market Cap: {activeStock.marketCap}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-base sm:text-lg font-bold text-gold">
                  ${activeStock.price.toLocaleString()}
                </span>
                <span className={`block text-[10px] font-mono font-bold ${activeStock.changePercent >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                  {activeStock.changePercent >= 0 ? '+' : ''}{activeStock.changePercent}%
                </span>
              </div>
            </div>

            {/* Custom SVG Line Ticker Graph */}
            <div className="h-40 w-full flex items-center justify-center relative my-4">
              <svg className="w-full h-full" viewBox="0 0 340 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="glow-gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="20" x2="340" y2="20" stroke="#FFFFFF" strokeOpacity="0.02" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="340" y2="70" stroke="#FFFFFF" strokeOpacity="0.02" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="340" y2="120" stroke="#FFFFFF" strokeOpacity="0.02" strokeDasharray="3 3" />

                {/* Area under curve */}
                <path d={`M0,140 L${chartPointsStr} L340,140 Z`} fill="url(#glow-gold)" />

                {/* Line Path */}
                <path d={`M${chartPointsStr}`} fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" />

                {/* Nodes */}
                {hist.map((val, i) => {
                  const x = (i / (hist.length - 1)) * 340;
                  const y = 140 - ((val - minPrice) / (maxPrice - minPrice || 1)) * 100;
                  return <circle key={i} cx={x} cy={y} r="3" fill="#000" stroke="#d4af37" strokeWidth="2" />;
                })}
              </svg>

              <div className="absolute top-1 right-2 text-[9px] font-mono text-[#888] flex flex-col space-y-0.5 bg-black/40 px-1 py-0.5 rounded">
                <span>HI: ${maxPrice.toLocaleString()}</span>
                <span>LO: ${minPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Trading Forms (Buy & Sell Side-by-Side) */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              {error && <div className="text-red-400 text-xs text-center border border-red-500/10 bg-red-950/10 p-2 rounded-lg">{error}</div>}
              {success && <div className="text-emerald-450 text-xs text-center border border-emerald-500/10 bg-emerald-950/10 p-2 rounded-lg">{success}</div>}

              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={tradeShares}
                    onChange={(e) => setTradeShares(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-gold placeholder-zinc-650 outline-none font-mono"
                    placeholder="Shares Count"
                    min={1}
                  />
                  {tradeShares && (
                    <span className="absolute right-3 top-3 text-[10px] text-zinc-500 font-mono">
                      Est: ${(parseFloat(tradeShares) * activeStock.price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                {/* Buy Button */}
                <button
                  type="button"
                  onClick={handleBuy}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer uppercase tracking-widest"
                >
                  Buy Shares
                </button>
                {/* Sell Button */}
                <button
                  type="button"
                  onClick={handleSell}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer uppercase tracking-widest"
                >
                  Sell Live Position
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Analytics breakdown (3 Columns) */}
        <div className="lg:col-span-12 xl:col-span-3 bg-[#0a0a0a] border border-gold/15 rounded-2xl p-4 flex flex-col justify-between shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 border-b border-white/5 pb-2.5 mb-3 flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Broker Analytics</span>
            </h3>

            {/* Total asset valuation summary */}
            <div className="mb-4">
              <span className="block text-[9px] text-zinc-500 uppercase font-bold">Aggregate equity vault</span>
              <span className="font-mono text-base sm:text-lg font-bold text-emerald-450 animate-pulse">
                ${totalStockNetValue.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {portfolioSummaryList.length === 0 ? (
                <div className="text-center py-12 text-xs text-zinc-600 italic">
                  No shares cataloged in portfolio holdings.
                </div>
              ) : (
                portfolioSummaryList.map((item) => (
                  <div key={item.symbol} className="p-2.5 bg-[#121212]/30 border border-white/5 rounded-xl text-xs flex flex-col justify-between hover:border-gold/10 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans font-bold text-gray-200">{item.symbol}</span>
                      <span className={`font-mono font-bold ${item.profitLoss >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {item.profitLoss >= 0 ? '+' : ''}{item.profitRate.toFixed(1)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-550 font-mono">
                      <span>Shares: <strong className="text-zinc-300">{item.shares}</strong></span>
                      <span>Avg: <strong className="text-zinc-350">${item.avgPrice}</strong></span>
                      <span>Value: <strong className="text-zinc-300">${item.liveValue.toLocaleString()}</strong></span>
                      <span>Gain: <strong className={item.profitLoss >= 0 ? 'text-emerald-555' : 'text-red-400'}>
                        {item.profitLoss >= 0 ? '+$' : '-$'}{Math.abs(item.profitLoss).toLocaleString()}
                      </strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-white/5 text-[9px] text-zinc-600 font-mono text-center">
            🚀 Ticks update prices globally to preserve real-time trade margins.
          </div>
        </div>
      </div>
    </div>
  );
}
