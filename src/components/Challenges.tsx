/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types';
import { Award, Star, Activity, Plus, ShieldCheck, RefreshCw, Trophy, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Challenges() {
  const { players, currentPlayerId, challenges, sendChallenge, acceptChallenge, declineChallenge, resolveChallenge } = useGame();
  const [targetOpponentId, setTargetOpponentId] = useState<string>('brook');
  const [wager, setWager] = useState<string>('1500000');
  const [gameChoice, setGameChoice] = useState<'FIFA' | 'Monopoly' | 'Basketball' | 'Custom'>('FIFA');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!currentPlayerId) return null;
  const player = players[currentPlayerId];

  const handleChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const wagerNum = parseFloat(wager);
    if (isNaN(wagerNum) || wagerNum <= 0) {
      setError('Please provide a valid wager sum');
      return;
    }

    if (player.balance < wagerNum) {
      setError('Sovereign funds insufficient to escrow this challenge');
      return;
    }

    sendChallenge(targetOpponentId, gameChoice, wagerNum);
    setSuccess(`Challenge dispatched to ${players[targetOpponentId].name}! Pending response.`);
    setWager('1500000');
  };

  const activeBots = (Object.values(players) as Player[]).filter((p) => p.id !== currentPlayerId && !p.isBan);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 text-[#e0e0e0] font-sans bg-[#050505] space-y-6 flex flex-col justify-start">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl sm:text-2xl font-serif italic text-gold">
          PvP Sovereign Duels
        </h1>
        <p className="text-[10px] text-zinc-550 mt-1 uppercase tracking-[0.2em] font-mono">
          CHALLENGE incubator: MATCHMAKING ESCROWS // RESOLVE CHAMPIONSHIPS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Issue Challenges form (5 columns) */}
        <div className="lg:col-span-12 xl:col-span-5 bg-[#0a0a0a] border border-gold/15 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-white/5 pb-2.5 mb-4 font-mono">
            Issue Competitive Challenge
          </h3>

          {error && <div className="mb-3 text-red-400 text-xs text-center bg-red-950/20 p-2 rounded-lg">{error}</div>}
          {success && <div className="mb-3 text-emerald-400 text-xs text-center bg-emerald-950/20 p-2 rounded-lg">{success}</div>}

          <form onSubmit={handleChallengeSubmit} className="space-y-4">
            {/* Target selection */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-550 tracking-wider mb-1.5 font-mono">
                Select Competitor Opponent
              </label>
              <div className="grid grid-cols-4 gap-2">
                {activeBots.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTargetOpponentId(p.id)}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                      targetOpponentId === p.id
                        ? 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(212,175,55,0.05)]'
                        : 'border-white/5 bg-[#121212]/30 text-zinc-400 hover:border-gold/25'
                    }`}
                  >
                    <span className="text-lg">{p.avatar}</span>
                    <span className="text-[10px] font-semibold mt-1 font-sans">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Category */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-555 tracking-wider mb-1.5 font-mono">
                Sovereign Game Type
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['FIFA', 'Monopoly', 'Basketball', 'Custom'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGameChoice(g)}
                    className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between font-bold cursor-pointer transition-colors ${
                      gameChoice === g ? 'border-gold bg-gold/10 text-gold' : 'border-white/5 bg-[#121212]/35 text-zinc-400 hover:border-gold/25'
                    }`}
                  >
                    <span>{g}</span>
                    {gameChoice === g && <span className="text-gold text-[10px]">✔</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Wager Sum */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-555 tracking-wider mb-1.5 font-mono">
                Tournament Wager Escrow (USD)
              </label>
              <input
                type="number"
                value={wager}
                onChange={(e) => setWager(e.target.value)}
                className="w-full bg-[#111] border border-white/10 p-2.5 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-gold outline-none font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gold hover:bg-gold-light text-[#050505] font-bold text-xs py-3 rounded-xl mt-4 cursor-pointer flex items-center justify-center space-x-1 uppercase tracking-widest transition-colors"
            >
              <Award className="w-3.5 h-3.5 mr-1" />
              <span>Issue Duel Invite</span>
            </button>
          </form>
        </div>

        {/* List of pending/active challenges (7 columns) */}
        <div className="lg:col-span-12 xl:col-span-7 bg-[#0a0a0a] border border-gold/15 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold border-b border-white/5 pb-2.5 mb-4 font-serif italic">
            Duels Match Pool & Arena
          </h3>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {challenges.length === 0 ? (
              <div className="text-center py-20 text-xs text-zinc-655 italic">
                No active competitive challenges found. Arena is quiet.
              </div>
            ) : (
              challenges.map((c) => {
                const isUserCreator = c.creatorId === currentPlayerId;
                const isUserOpponent = c.opponentId === currentPlayerId;

                const belongsToUser = isUserCreator || isUserOpponent;

                return (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-xl border flex justify-between items-center text-xs transition-all ${
                      c.status === 'completed'
                        ? 'border-zinc-900 bg-[#121212]/30'
                        : c.status === 'accepted'
                        ? 'border-gold/30 bg-gold/5'
                        : belongsToUser
                        ? 'border-white/10 bg-[#121212]/50 hover:border-gold/25'
                        : 'border-white/5 bg-[#121212]/10 opacity-70'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-gray-200">
                        {c.creatorName} ⚔️ {c.opponentName}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-gold font-mono mt-0.5 tracking-wider">
                        {c.gameType} Duel Tournament
                      </p>
                      <span className="text-[10px] text-zinc-650 block mt-1.5 font-mono">
                        Pooled pot: ${(c.wager * 2).toLocaleString()} // Status: <strong className="text-zinc-500 font-sans uppercase text-[10px] tracking-wider">{c.status}</strong>
                      </span>
                    </div>

                    <div className="text-right flex flex-col items-end space-y-1.5">
                      <span className="font-mono text-xs sm:text-sm font-bold block text-gold animate-pulse">
                        ${c.wager.toLocaleString()} wager
                      </span>

                      {/* Pending controls */}
                      {c.status === 'pending' && isUserOpponent && (
                        <div className="flex space-x-1.5">
                          <button
                            type="button"
                            onClick={() => acceptChallenge(c.id)}
                            className="py-1 px-3 bg-gold hover:bg-gold-light text-[#050505] font-bold tracking-widest uppercase text-[9px] rounded-lg cursor-pointer transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => declineChallenge(c.id)}
                            className="py-1 px-2 border border-white/10 hover:bg-red-500/10 text-zinc-400 hover:text-white rounded-lg text-[9px] cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {/* Accepted Resolution for testing / manual tournament resolves */}
                      {c.status === 'accepted' && (
                        <div className="flex space-x-1.5">
                          <button
                            type="button"
                            onClick={() => resolveChallenge(c.id, c.creatorId)}
                            className="py-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#050505] font-extrabold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer"
                          >
                            {c.creatorName} wins
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveChallenge(c.id, c.opponentId)}
                            className="py-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#050505] font-extrabold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer"
                          >
                            {c.opponentName} wins
                          </button>
                        </div>
                      )}

                      {c.status === 'completed' && (
                        <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center space-x-1">
                          <Trophy className="w-3.5 h-3.5 text-gold" />
                          <span>Winner: {players[c.winnerId!]?.name || c.winnerId}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
