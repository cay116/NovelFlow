/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Shuffle, AlertCircle, RefreshCw, Trophy, Coins } from 'lucide-react';

export default function NetflixSelector() {
  const { players, login, resetPin } = useGame();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPinChange, setShowPinChange] = useState<boolean>(false);
  const [pinChangeDetails, setPinChangeDetails] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const activePlayer = selectedPlayerId ? players[selectedPlayerId] : null;

  const handleProfileClick = (id: string) => {
    setSelectedPlayerId(id);
    setPin('');
    setErrorMsg(null);
    setShowPinChange(false);
  };

  const handlePinDigit = (num: string) => {
    setErrorMsg(null);
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        // Auto-validate
        executeLogin(selectedPlayerId!, nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const executeLogin = (playerId: string, pinStr: string) => {
    const res = login(playerId, pinStr);
    if (!res.success) {
      setErrorMsg(res.message);
      setPin('');
    }
  };

  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;

    const { oldPin, newPin, confirmPin } = pinChangeDetails;
    if (players[selectedPlayerId].pin !== oldPin) {
      setErrorMsg('Current PIN is incorrect');
      return;
    }
    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      setErrorMsg('New PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('PINs do not match');
      return;
    }

    resetPin(selectedPlayerId, newPin);
    setResetSuccess('PIN Changed Successfully!');
    setErrorMsg(null);
    setTimeout(() => {
      setResetSuccess(null);
      setShowPinChange(false);
      setPin('');
    }, 1500);
  };

  // Find the richest profile for display
  const richestPlayer = (Object.values(players) as Player[]).reduce((prev, current) => {
    return (prev.netWorth > current.netWorth) ? prev : current;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Golden Ambient Gradients */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      {/* Header Info */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center"
        >
          {/* CK Immersive Royal Monogram Badge */}
          <div className="w-12 h-12 border-2 border-gold rounded-lg flex items-center justify-center rotate-45 mb-6 shadow-[0_0_20px_rgba(212,175,55,0.35)] bg-black">
            <span className="-rotate-45 font-serif font-bold text-gold text-lg">CK</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif italic text-gold tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] mb-2">
            CAPITAL KINGS
          </h1>
          <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </motion.div>
        <p className="text-[10px] text-zinc-400 uppercase tracking-[0.25em] mt-4">
          The Real-Time High-Stakes Multiplayer Wealth Economy
        </p>

        {/* Global Richest Player Tracker */}
        <div className="mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 border border-gold/25 px-4 py-1.5 rounded-full text-xs text-gold backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <Trophy className="w-3.5 h-3.5 animate-pulse text-gold" />
          <span>Richest King: <strong>{richestPlayer.name}</strong> (${(richestPlayer.netWorth).toLocaleString()})</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedPlayerId ? (
          /* Profile Grid Screen */
          <motion.div
            key="profile-grid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl"
          >
            <h2 className="text-sm uppercase tracking-widest text-center text-zinc-400 mb-8 font-semibold">
              Who is building the empire?
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 sm:gap-8 px-4 h-auto">
              {(Object.values(players) as Player[]).map((p) => {
                const isLocked = p.lockedUntil && new Date(p.lockedUntil).getTime() > Date.now();
                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: isLocked ? 1 : 1.05 }}
                    onClick={() => !isLocked && handleProfileClick(p.id)}
                    className={`flex flex-col items-center justify-around p-4 rounded-xl border border-white/5 bg-gradient-to-br from-[#121212] to-[#080808] aspect-square sm:aspect-auto cursor-pointer relative group overflow-hidden transition-all duration-300 backdrop-blur-sm ${
                      isLocked ? 'opacity-40 cursor-not-allowed border-red-500/20' : 'hover:border-gold/40 shadow-xl hover:shadow-gold/5'
                    }`}
                  >
                    {/* Hover Gold Glow */}
                    <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-all duration-300" />

                    {/* Status indicator badge */}
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      <span className={`w-2 h-2 rounded-full ${p.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                    </div>

                    {/* Locked Indicator overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-red-400">
                        <Lock className="w-6 h-6 mb-1 text-red-500" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 animate-pulse">LOCKED</span>
                      </div>
                    )}

                    {/* Profile Avatar Frame */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-gold/15 via-[#1a1a1a] to-[#111] flex items-center justify-center text-3xl sm:text-4xl border border-white/10 group-hover:border-gold/40 shadow-inner group-hover:shadow-gold/10 transition-all duration-300 mb-4">
                      {p.avatar}
                    </div>

                    {/* Player Info */}
                    <div className="text-center">
                      <p className="font-semibold text-gray-200 group-hover:text-gold transition-colors duration-200 text-sm sm:text-base">
                        {p.name}
                      </p>
                      
                      {/* Net worth preview */}
                      <p className="text-[11px] text-gold/70 group-hover:text-gold font-mono mt-1">
                        ${(p.netWorth).toLocaleString()}
                      </p>
                    </div>

                    {/* Admin/Default PIN helpful cheat info */}
                    <div className="absolute bottom-1 bg-black/40 text-[9px] text-zinc-650 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-1 py-0.5 rounded">
                      PIN: {p.pin || 'None'}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Helper Tips */}
            <div className="mt-12 text-center text-[11px] text-zinc-500 max-w-md mx-auto px-4 bg-[#0a0a0a] p-3 rounded-lg border border-gold/10">
              💡 <span className="text-zinc-400 font-medium">Testing Tip:</span> You can switch players at any time to execute multi-party investments. Use the default 4-digit PINs (e.g. CAY is <code className="text-gold font-bold">1111</code>, Brooke is <code className="text-gold font-bold">2222</code>).
            </div>
          </motion.div>
        ) : (
          /* PIN Gate Screen */
          <motion.div
            key="pin-entry"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-[#0a0a0a] border border-gold/25 p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative"
          >
            {/* Back button */}
            <button
              onClick={() => setSelectedPlayerId(null)}
              className="absolute top-4 left-4 text-xs text-zinc-550 hover:text-white flex items-center space-x-1 outline-none transition-colors cursor-pointer"
            >
              <span>← Back</span>
            </button>

            {/* User Profile avatar bubble */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#111] border border-gold/30 flex items-center justify-center text-3xl shadow-lg mb-2 shadow-gold/5">
                {activePlayer?.avatar}
              </div>
              <h3 className="text-lg font-bold text-gray-200">{activePlayer?.name}</h3>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest mt-1">ENTER PROFILE PIN</p>
            </div>

            {/* Dots UI for PIN */}
            <div className="flex justify-center space-x-4 mb-6">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <motion.div
                    key={idx}
                    animate={{
                      scale: filled ? [1, 1.2, 1] : 1,
                      backgroundColor: filled ? '#d4af37' : '#27272a',
                    }}
                    transition={{ duration: 0.15 }}
                    className="w-3.5 h-3.5 rounded-full"
                  />
                );
              })}
            </div>

            {/* Status updates, resets & errors */}
            {errorMsg && (
              <div className="mb-4 flex items-center justify-center space-x-1.5 text-red-400 text-xs text-center border border-red-500/10 bg-red-950/10 p-2.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="mb-4 text-emerald-400 text-xs text-center border border-emerald-500/10 bg-emerald-950/10 p-2.5 rounded-lg font-medium">
                {resetSuccess}
              </div>
            )}

            {!showPinChange ? (
              /* Numerical Grid Keyboard */
              <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinDigit(digit)}
                    className="h-12 rounded-xl bg-[#121212] hover:bg-zinc-900 text-lg font-semibold border border-white/5 hover:border-gold/30 active:bg-gold/10 transition-all outline-none cursor-pointer text-white"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowPinChange(true)}
                  className="h-12 text-xs text-gold hover:text-gold-light outline-none flex items-center justify-center hover:bg-zinc-900/40 rounded-xl cursor-pointer"
                  title="Change PIN"
                >
                  Change PIN
                </button>
                <button
                  key="0"
                  onClick={() => handlePinDigit('0')}
                  className="h-12 rounded-xl bg-[#121212] hover:bg-zinc-900 text-lg font-semibold border border-white/5 hover:border-gold/30 transition-all outline-none cursor-pointer text-white"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-12 text-sm text-zinc-500 hover:text-white outline-none flex items-center justify-center hover:bg-zinc-900/40 rounded-xl cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ) : (
              /* PIN Update Form */
              <form onSubmit={handlePinChangeSubmit} className="space-y-3.5 max-w-[280px] mx-auto text-left">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 font-mono font-semibold mb-1">Old PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinChangeDetails.oldPin}
                    onChange={(e) => setPinChangeDetails({ ...pinChangeDetails, oldPin: e.target.value })}
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-center font-mono text-sm tracking-widest focus:border-gold text-white focus:outline-none"
                    placeholder="••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 font-mono font-semibold mb-1">New 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinChangeDetails.newPin}
                    onChange={(e) => setPinChangeDetails({ ...pinChangeDetails, newPin: e.target.value })}
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-center font-mono text-sm tracking-widest focus:border-gold text-white focus:outline-none"
                    placeholder="••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 font-mono font-semibold mb-1">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinChangeDetails.confirmPin}
                    onChange={(e) => setPinChangeDetails({ ...pinChangeDetails, confirmPin: e.target.value })}
                    className="w-full bg-[#111] border border-[#222] rounded-lg p-2 text-center font-mono text-sm tracking-widest focus:border-gold text-white focus:outline-none"
                    placeholder="••••"
                    required
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinChange(false);
                      setErrorMsg(null);
                    }}
                    className="flex-1 bg-zinc-900 hover:bg-[#111] text-xs py-2 rounded-lg text-gray-400 border border-white/5 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gold hover:bg-gold-light font-semibold text-black text-xs py-2 rounded-lg shadow-md hover:shadow-gold/10 cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Forgot PIN hint in Admin Area */}
            <div className="mt-6 text-center text-[10px] text-zinc-600">
              Can't remember? Resettable within secure <span className="text-zinc-400 font-medium">Admin Panel</span>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
