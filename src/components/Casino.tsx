/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types';
import { Gamepad, Award, Percent, Coins, DollarSign, RefreshCw, Star, Info, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Casino() {
  const { players, currentPlayerId, playCasino, createBet, acceptBet, resolveBet, bets } = useGame();
  const [activeCasinoTab, setActiveCasinoTab] = useState<'games' | 'sports'>('games');
  const [activeMiniGame, setActiveMiniGame] = useState<'slots' | 'coin' | 'dice' | 'roulette' | 'blackjack'>('slots');

  // Input States
  const [wagerInput, setWagerInput] = useState<string>('500000');
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);
  const [gameOutcome, setGameOutcome] = useState<{ won: boolean; payout: number } | null>(null);

  // Coin Guess, Dice Guess, Roulette Guess
  const [coinGuess, setCoinGuess] = useState<'heads' | 'tails'>('heads');
  const [diceParity, setDiceParity] = useState<'even' | 'odd'>('even');
  const [rouletteTarget, setRouletteTarget] = useState<string>('red');

  // Sports Book Inputs
  const [sportsOpponent, setSportsOpponent] = useState<string>('ANY');
  const [sportCategory, setSportCategory] = useState<string>('UEFA Champions League');
  const [sportsMatch, setSportsMatch] = useState<string>('Real Madrid vs AC Milan');
  const [sportsPrediction, setSportsPrediction] = useState<string>('Real Madrid to win');
  const [sportsWager, setSportsWager] = useState<string>('1000000');
  const [sportsError, setSportsError] = useState<string | null>(null);
  const [sportsSuccess, setSportsSuccess] = useState<string | null>(null);

  if (!currentPlayerId) return null;
  const player = players[currentPlayerId];

  const handlePlayMiniGame = () => {
    setGameFeedback(null);
    setGameOutcome(null);

    const wagerVal = parseFloat(wagerInput);
    if (isNaN(wagerVal) || wagerVal <= 0) {
      setGameFeedback('Please input a valid casino wager.');
      return;
    }

    if (player.balance < wagerVal) {
      setGameFeedback('Insufficient balance to authorize casino wager.');
      return;
    }

    let result;
    if (activeMiniGame === 'slots') {
      result = playCasino('slots', wagerVal);
    } else if (activeMiniGame === 'coin') {
      result = playCasino('coin', wagerVal, { guess: coinGuess });
    } else if (activeMiniGame === 'dice') {
      result = playCasino('dice', wagerVal, { parity: diceParity });
    } else if (activeMiniGame === 'roulette') {
      const targetIsColor = ['red', 'black', 'green'].includes(rouletteTarget);
      const dataPayload = targetIsColor ? { target: rouletteTarget } : { target: parseInt(rouletteTarget) };
      result = playCasino('roulette', wagerVal, dataPayload);
    } else {
      // Blackjack
      result = playCasino('blackjack', wagerVal);
    }

    if (result) {
      setGameFeedback(result.message);
      setGameOutcome({ won: result.won, payout: result.payout });
    }
  };

  const handleSportsWagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSportsError(null);
    setSportsSuccess(null);

    const wagerVal = parseFloat(sportsWager);
    if (isNaN(wagerVal) || wagerVal <= 0) {
      setSportsError('Please supply a valid Sports wager.');
      return;
    }

    if (player.balance < wagerVal) {
      setSportsError('Sovereign reserves insufficient for this sporstbook escrow.');
      return;
    }

    createBet(sportsOpponent, sportCategory, sportsMatch, wagerVal, sportsPrediction, 1.95);
    setSportsSuccess(`Successfully compiled Sports Wager on "${sportsMatch}" and held funds in Escrow!`);
    setSportsWager('');
    setSportsMatch('');
    setSportsPrediction('');
  };

  const activeBots = (Object.values(players) as Player[]).filter((p) => p.id !== currentPlayerId && !p.isBan);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 text-[#e0e0e0] font-sans bg-[#050505] space-y-6">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif italic text-gold">
            Royal Casino & Sportsbook
          </h1>
          <p className="text-[10px] text-zinc-550 mt-1 uppercase tracking-[0.2em] font-mono">
            high Stakes gambling // peer-to-peer sporting wagers escrows
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-[#0a0a0a] p-1.5 rounded-xl border border-gold/15 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveCasinoTab('games')}
            className={`px-3.5 py-1.5 rounded-lg outline-none cursor-pointer transition-all ${
              activeCasinoTab === 'games' ? 'bg-gold text-[#050505] font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Las Vegas MiniGames
          </button>
          <button
            type="button"
            onClick={() => setActiveCasinoTab('sports')}
            className={`px-3.5 py-1.5 rounded-lg outline-none cursor-pointer transition-all ${
              activeCasinoTab === 'sports' ? 'bg-gold text-[#050505] font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sovereign Sportsbook
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeCasinoTab === 'games' ? (
          /* Las Vegas MiniGames Side */
          <motion.div
            key="las-vegas-games"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Interactive selections (3 columns) */}
            <div className="lg:col-span-12 xl:col-span-3 bg-[#0a0a0a] border border-gold/15 rounded-2xl p-4 space-y-2 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
              <span className="block text-[10px] text-zinc-550 uppercase font-mono font-bold tracking-wider mb-2">
                Select Mini-game
              </span>
              {[
                { id: 'slots', label: 'Gold Slots', emoji: '👑' },
                { id: 'coin', label: 'Royale CoinFlip', emoji: '🪙' },
                { id: 'dice', label: 'Double Dice roll', emoji: '🎲' },
                { id: 'roulette', label: 'Mogul Roulette', emoji: '🔴' },
                { id: 'blackjack', label: 'High Stakes Blackjack', emoji: '🃏' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setActiveMiniGame(g.id as any);
                    setGameFeedback(null);
                    setGameOutcome(null);
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border text-xs font-bold leading-none flex items-center space-x-2.5 outline-none transition-all cursor-pointer ${
                    activeMiniGame === g.id
                      ? 'border-gold bg-gold/10 text-gold shadow-[0_0_10px_rgba(212,175,55,0.05)]'
                      : 'border-white/5 bg-[#121212]/30 text-zinc-400 hover:border-gold/20'
                  }`}
                >
                  <span className="text-base">{g.emoji}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>

            {/* Active Machine (6 columns) */}
            <div className="lg:col-span-12 xl:col-span-6 bg-[#0a0a0a] border border-gold/15 rounded-3xl p-6 relative flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <div>
                <span className="block text-[10px] text-zinc-550 uppercase font-mono font-bold tracking-wider mb-2">
                  Interactive play Table
                </span>

                {/* Slots specific view */}
                {activeMiniGame === 'slots' && (
                  <div className="text-center py-6 space-y-4 font-serif">
                    <div className="inline-flex space-x-3 bg-[#121212] border border-gold/25 px-8 py-5 rounded-2xl text-4xl shadow-inner font-mono max-w-[280px]">
                      <span>🍒</span>
                      <span>👑</span>
                      <span>💎</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-normal max-w-sm mx-auto">
                      Matching 3 symbols returns up to <strong className="text-gold">15x wagers</strong>! Double matching icons pay <strong className="text-gold-light">2.2x</strong>.
                    </p>
                  </div>
                )}

                {/* Coin Specific view */}
                {activeMiniGame === 'coin' && (
                  <div className="text-center py-6 space-y-4">
                    <div className="flex justify-center space-x-4">
                      {['heads', 'tails'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setCoinGuess(g as any)}
                          className={`py-3 px-6 rounded-xl border text-xs font-bold font-mono tracking-widest uppercase cursor-pointer transition-colors ${
                            coinGuess === g
                              ? 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(212,175,55,0.05)]'
                              : 'border-white/5 bg-[#121212]/30 text-zinc-550 hover:border-gold/20'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400 leading-normal">
                      Predict heads or tails perfectly for a clean <strong className="text-gold-light">1.95x cash payout</strong>.
                    </p>
                  </div>
                )}

                {/* Dice specific view */}
                {activeMiniGame === 'dice' && (
                  <div className="text-center py-6 space-y-4">
                    <div className="flex justify-center space-x-4">
                      {['even', 'odd'].map((g) => (
                        <button
                          key={g}
                          onClick={() => setDiceParity(g as any)}
                          className={`py-3 px-6 rounded-xl border text-xs font-bold font-mono tracking-widest uppercase cursor-pointer ${
                            diceParity === g
                              ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                              : 'border-white/5 bg-zinc-900/40 text-zinc-500'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400 leading-normal">
                      Guess whether the rolled sum of two dice is even or odd for <strong className="text-amber-400">1.9x yields</strong>!
                    </p>
                  </div>
                )}

                {/* Roulette specific view */}
                {activeMiniGame === 'roulette' && (
                  <div className="text-center py-6 space-y-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {['red', 'black', 'green', '17', '21', '0'].map((val) => (
                        <button
                          key={val}
                          onClick={() => setRouletteTarget(val)}
                          className={`py-2 px-4 rounded-lg border text-xs font-semibold uppercase ${
                            rouletteTarget === val
                              ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                              : 'border-white/5 bg-zinc-900/40 text-zinc-400'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400 leading-normal">
                      Red/Black wins multiply wagers by <strong className="text-amber-400">2x</strong>. Targeting green or precise numbers awards a massive <strong className="text-yellow-500">35x jackpot payout</strong>!
                    </p>
                  </div>
                )}

                {/* Blackjack specific view */}
                {activeMiniGame === 'blackjack' && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-9 h-9 mx-auto rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/10 flex items-center justify-center font-bold text-lg animate-pulse mb-2">
                      🃏
                    </div>
                    <p className="text-xs text-zinc-400 leading-normal">
                      Simple Blackjack tables. Draws a randomized user hand between 11-21 and compares to CPU dealer. Win/tie payout returns <strong className="text-amber-400">2x wagers</strong>.
                    </p>
                  </div>
                )}

                {/* General Ledger inputs */}
                <div className="mt-8 pt-6 border-t border-white/5 space-y-4 max-w-sm mx-auto text-left">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 font-mono">
                      Wager placement (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-[13px] text-zinc-500 font-mono">$</span>
                      <input
                        type="number"
                        value={wagerInput}
                        onChange={(e) => setWagerInput(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-xl p-2.5 pl-6 text-xs text-white placeholder-zinc-655 focus:border-gold font-mono outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlayMiniGame}
                    className="w-full bg-gradient-to-r from-gold via-gold-light to-gold hover:opacity-90 text-[#050505] font-extrabold text-xs py-3 rounded-xl transition-all tracking-widest uppercase cursor-pointer flex items-center justify-center space-x-1 shadow-lg shadow-gold/10"
                  >
                    <Coins className="w-3.5 h-3.5 mr-1" />
                    <span>Authorize & Spin Wheel</span>
                  </button>
                </div>
              </div>

              {/* Game interaction responses */}
              <AnimatePresence>
                {gameFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className={`mt-6 p-4 rounded-xl border text-xs text-center leading-relaxed font-sans ${
                      gameOutcome?.won
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    <p className="font-bold mb-1">{gameOutcome?.won ? '★ VICTORY PAYOUT ★' : '● SYSTEM DEFEAT'}</p>
                    <p className="text-[11px] leading-relaxed">{gameFeedback}</p>
                    {gameOutcome?.won && (
                      <span className="block font-mono font-bold text-gold text-xs mt-1">
                        Credited wallet +${gameOutcome.payout.toLocaleString()}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick stats panel (3 columns) */}
            <div className="lg:col-span-12 xl:col-span-3 bg-[#0a0a0a] border border-gold/15 rounded-2xl p-4 flex flex-col justify-between shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 font-mono">
                  Gambler Audits
                </h3>

                <div className="space-y-4">
                  <div>
                    <span className="block text-[9px] text-zinc-550 uppercase font-bold font-mono">My Total Casino Earnings</span>
                    <span className="font-mono text-base font-extrabold text-[#d4af37] animate-pulse">
                      ${player.stats.casinoWon.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Total Bets:</span>
                      <span className="text-zinc-300">{player.stats.totalBets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Bets Won:</span>
                      <span className="text-zinc-300">{player.stats.betsWon}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-zinc-600 font-mono leading-none pt-4 border-t border-white/5 uppercase">
                ⚙️ casino RNG checked continuously. plays logged automatically.
              </div>
            </div>
          </motion.div>
        ) : (
          /* Peer Sportsbook Side */
          <motion.div
            key="sovereign-sportsbook"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Create sports wagers (5 columns) */}
            <div className="lg:col-span-5 bg-zinc-950 border border-white/5 rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 border-b border-white/5 pb-2.5 mb-4">
                Originate Sports Wager
              </h3>

              {sportsError && <div className="mb-3 text-red-400 text-xs text-center bg-red-950/20 p-2 rounded-lg">{sportsError}</div>}
              {sportsSuccess && <div className="mb-3 text-emerald-400 text-xs text-center bg-emerald-950/20 p-2 rounded-lg">{sportsSuccess}</div>}

              <form onSubmit={handleSportsWagerSubmit} className="space-y-3.5">
                {/* Target Opponent */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1 font-mono">Opponent Selector</label>
                  <select
                    value={sportsOpponent}
                    onChange={(e) => setSportsOpponent(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  >
                    <option value="ANY">Public Book (Open to Any Player)</option>
                    {activeBots.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Competition selection */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1 font-mono">Sport / Event League</label>
                  <select
                    value={sportCategory}
                    onChange={(e) => setSportCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  >
                    <option value="UEFA Champions League">UEFA Champions League ⚽</option>
                    <option value="NBA Basketball">NBA Basketball 🏀</option>
                    <option value="NFL Football">NFL American Football 🏈</option>
                    <option value="FIFA Esports League">FIFA Esports League 🎮</option>
                  </select>
                </div>

                {/* Match names */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1 font-mono">Fixture/Fixture Title</label>
                  <input
                    type="text"
                    value={sportsMatch}
                    onChange={(e) => setSportsMatch(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 placeholder-zinc-600 outline-none"
                    placeholder="e.g. Lakers vs Celtics"
                    required
                  />
                </div>

                {/* Prediction */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1 font-mono">Your Prediction</label>
                  <input
                    type="text"
                    value={sportsPrediction}
                    onChange={(e) => setSportsPrediction(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 placeholder-zinc-600 outline-none"
                    placeholder="e.g. Celtics to win outright"
                    required
                  />
                </div>

                {/* Wagers */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1 font-mono">Escrow Escrow (USD)</label>
                  <input
                    type="number"
                    value={sportsWager}
                    onChange={(e) => setSportsWager(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs py-2.5 rounded-xl cursor-pointer uppercase tracking-widest"
                >
                  Create Sports Bet Slip
                </button>
              </form>
            </div>

            {/* Sports book wagers logs (7 columns) */}
            <div className="lg:col-span-12 xl:col-span-7 bg-[#0a0a0a] border border-gold/15 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold border-b border-white/5 pb-2.5 mb-4 font-serif italic">
                Sovereign Sports Book Exchanges
              </h3>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {bets.length === 0 ? (
                  <div className="text-center py-20 text-xs text-zinc-650 italic">
                    No active sports wagers open in sportsbook logs.
                  </div>
                ) : (
                  bets.map((b) => {
                    const isCreator = b.creatorId === currentPlayerId;
                    const canOpponentAccept = b.opponentId === currentPlayerId || b.opponentId === 'ANY';
                    const isPending = b.status === 'pending';

                    return (
                      <div
                        key={b.id}
                        className={`p-3.5 rounded-xl border flex justify-between items-center text-xs leading-relaxed transition-all ${
                          b.status === 'won'
                            ? 'border-emerald-500/10 bg-emerald-950/5'
                            : b.status === 'lost'
                            ? 'border-red-500/10 bg-red-950/5'
                            : 'border-white/5 bg-[#121212]/30 hover:border-gold/15'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-gray-200">{b.creatorName} vs {b.opponentName}</p>
                          <p className="text-[10px] uppercase font-bold text-gold font-mono mt-0.5 tracking-wider">
                            {b.sport} // {b.matchName}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-1 italic">Prediction: "{b.prediction}"</p>
                          <span className="text-[10px] font-mono text-zinc-550 block mt-2">
                            Index odds: {b.odds}x // Escrow: ${b.wager.toLocaleString()}
                          </span>
                        </div>

                        <div className="text-right flex flex-col items-end space-y-1.5">
                          <span className="block font-mono font-bold text-gold">
                            ${(b.wager * 2).toLocaleString()} pot
                          </span>

                          {isPending && !isCreator && canOpponentAccept ? (
                            /* Acceptance */
                            <button
                              type="button"
                              onClick={() => {
                                if (player.balance < b.wager) {
                                  alert('Insufficient balance to accept wager.');
                                  return;
                                }
                                acceptBet(b.id);
                              }}
                              className="py-1 px-3 bg-gold hover:bg-gold-light text-[#050505] font-bold tracking-widest rounded-lg cursor-pointer text-[10px] uppercase transition-colors"
                            >
                              Accept Wager
                            </button>
                          ) : isPending && isCreator ? (
                            <span className="text-[9px] uppercase font-bold bg-[#121212] text-zinc-500 py-0.5 px-2 rounded tracking-widest animate-pulse border border-white/5">
                              Escrow Pending
                            </span>
                          ) : b.status === 'accepted' ? (
                            /* Simulated resolves specifically for testing out-comes */
                            <div className="flex space-x-1.5">
                              <button
                                type="button"
                                onClick={() => resolveBet(b.id, b.creatorId)}
                                className="py-1 px-2.5 bg-emerald-550 hover:bg-emerald-600 text-[#050505] font-bold rounded-lg text-[10px] cursor-pointer"
                              >
                                {b.creatorName} Wins
                              </button>
                              <button
                                type="button"
                                onClick={() => resolveBet(b.id, b.opponentId)}
                                className="py-1 px-2.5 bg-emerald-555 hover:bg-emerald-605 text-[#050505] font-bold rounded-lg text-[10px] cursor-pointer"
                              >
                                {b.opponentName} Wins
                              </button>
                            </div>
                          ) : (
                            <span className={`text-[10px] uppercase font-bold font-mono tracking-wider ${
                              b.status === 'won' ? 'text-emerald-450 animate-pulse' : 'text-zinc-550'
                            }`}>
                              {b.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
