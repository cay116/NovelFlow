/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types';
import { ShieldAlert, RefreshCw, Trash2, ShieldCheck, HeartPulse, Sparkles, Coins, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminPanel() {
  const {
    players,
    transactions,
    adminModifyBalance,
    adminBanUser,
    adminResetAll,
    resetPin,
    triggerEvent,
    activeMarketEvent
  } = useGame();

  const [adjustAmount, setAdjustAmount] = useState<Record<string, string>>({});
  const [newPins, setNewPins] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleModify = (playerId: string, dir: 'up' | 'down') => {
    setSuccessMsg(null);
    const amtStr = adjustAmount[playerId] || '';
    const amt = parseFloat(amtStr);
    if (isNaN(amt) || amt <= 0) return;

    const multiplier = dir === 'up' ? 1 : -1;
    adminModifyBalance(playerId, amt * multiplier);
    setSuccessMsg(`Successfully adjusted balance of ${players[playerId].name} by ${dir === 'up' ? '+' : '-'}$${amt.toLocaleString()}`);

    setAdjustAmount({ ...adjustAmount, [playerId]: '' });
  };

  const handlePinReset = (playerId: string) => {
    setSuccessMsg(null);
    const pinStr = newPins[playerId] || '';
    if (pinStr.length !== 4 || isNaN(Number(pinStr))) {
      alert('PIN must be exactly 4 digits');
      return;
    }
    resetPin(playerId, pinStr);
    setSuccessMsg(`PIN for ${players[playerId].name} has been updated to "${pinStr}"`);
    setNewPins({ ...newPins, [playerId]: '' });
  };

  // Automated achievements listings tracker
  const achievements = [
    { title: 'The Billionaire Mogul', desc: 'Secure net worth over $15,000,000', icon: '💎' },
    { title: 'Nasdaq Board Shark', desc: 'Secure over 10 separate Wall Street stock trades', icon: '📈' },
    { title: 'Sovereign landlord', desc: 'Acquire at least 3 property titles', icon: '🏰' },
    { title: 'Vegas Whale', desc: 'Score over $5,000,000 in Casino wins', icon: '🃏' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 text-white font-sans bg-black space-y-6">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-200">
          Executive Admin Control & Market Modulator
        </h1>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-mono">
          CHANNELS: FDIC HIGH COMMAND GATES // STATE MODULATOR SECURED
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Market Event Injectors (4 columns) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 border-b border-white/5 pb-2.5 mb-4 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>Sovereign Market Modulators</span>
            </h3>

            {activeMarketEvent && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-center animate-pulse text-red-400 font-medium">
                Active Event: {activeMarketEvent.title}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => triggerEvent('crash')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600/30 to-red-800/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl text-xs outline-none transition-all cursor-pointer"
              >
                📉 Trigger Market Crash (-25% Stocks)
              </button>
              <button
                onClick={() => triggerEvent('rally')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600/30 to-emerald-800/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-semibold rounded-xl text-xs outline-none transition-all cursor-pointer"
              >
                🚀 Trigger Crypto Bull Market (+40% Assets)
              </button>
              <button
                onClick={() => triggerEvent('tax')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-yellow-600/30 to-yellow-800/10 border border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-500 font-semibold rounded-xl text-xs outline-none transition-all cursor-pointer"
              >
                🏛️ Trigger Wealth Tax Audits (3.5% Levy)
              </button>
              <button
                onClick={() => triggerEvent('inflation')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600/30 to-purple-800/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 font-semibold rounded-xl text-xs outline-none transition-all cursor-pointer"
              >
                💸 Trigger Hyper-Inflation Cycles
              </button>
            </div>
          </div>

          {/* Quick Stats Achievements panel */}
          <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 border-b border-white/5 pb-2.5 mb-3 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Advanced Achievements Tracker</span>
            </h3>

            <div className="space-y-2.5">
              {achievements.map((item, id) => (
                <div key={id} className="p-2.5 bg-zinc-900/40 rounded-xl border border-white/5 flex items-start space-x-2.5 text-xs">
                  <span className="text-base select-none">{item.icon}</span>
                  <div>
                    <span className="font-bold block text-gray-200">{item.title}</span>
                    <span className="text-[10px] text-zinc-500 block leading-normal mt-0.5">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger adjustment table (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-950 border border-white/5 rounded-3xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 border-b border-white/5 pb-3 mb-4 flex justify-between items-center">
              <span>Sovereign Ledger Adjustment Desk</span>
              <button
                onClick={() => {
                  if (confirm('Revoke all assets and reset all profiles?')) {
                    adminResetAll();
                  }
                }}
                className="text-[10px] text-red-500 border border-red-500/20 hover:bg-red-500/10 hover:text-white font-bold uppercase px-3 py-1 bg-red-950/10 rounded-xl transition-all"
              >
                Total System Reset
              </button>
            </h3>

            {successMsg && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-xs text-center text-emerald-400">
                {successMsg}
              </div>
            )}

            <div className="space-y-4">
              {(Object.values(players) as Player[]).map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between text-xs space-y-4 md:space-y-0"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{p.avatar}</span>
                    <div>
                      <span className="font-bold block text-sm">{p.name} {p.isBan && <span className="text-[10px] text-red-500 uppercase font-mono tracking-widest font-bold">Banned</span>}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Net: ${p.netWorth.toLocaleString()} // Bal: ${p.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3.5">
                    {/* Modify Wallet form */}
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        placeholder="Amt"
                        value={adjustAmount[p.id] || ''}
                        onChange={(e) => setAdjustAmount({ ...adjustAmount, [p.id]: e.target.value })}
                        className="w-20 bg-zinc-950 border border-white/5 rounded-lg p-1.5 font-mono text-center outline-none"
                      />
                      <button
                        onClick={() => handleModify(p.id, 'up')}
                        className="p-1 px-2.5 bg-emerald-500 bg-opacity-20 border border-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 rounded-lg text-xs"
                      >
                        Grant
                      </button>
                      <button
                        onClick={() => handleModify(p.id, 'down')}
                        className="p-1 px-2.5 bg-red-500 bg-opacity-20 border border-red-500/10 hover:bg-red-500 text-red-400 hover:text-zinc-950 rounded-lg text-xs"
                      >
                        Debit
                      </button>
                    </div>

                    {/* Reset PIN input */}
                    <div className="flex items-center space-x-1 text-[11px]">
                      <input
                        type="text"
                        placeholder="PIN"
                        maxLength={4}
                        value={newPins[p.id] || ''}
                        onChange={(e) => setNewPins({ ...newPins, [p.id]: e.target.value })}
                        className="w-14 bg-zinc-950 border border-white/5 rounded-lg p-1.5 font-mono text-center outline-none"
                      />
                      <button
                        onClick={() => handlePinReset(p.id)}
                        className="p-1.5 bg-zinc-90 w-full hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 rounded-lg font-mono tracking-widest leading-none outline-none"
                      >
                        Set
                      </button>
                    </div>

                    {/* Ban toggle */}
                    <button
                      onClick={() => adminBanUser(p.id, !p.isBan)}
                      className={`p-1.5 px-3 rounded-lg leading-none ${
                        p.isBan ? 'bg-orange-500 text-zinc-950' : 'bg-red-950/20 text-red-500 hover:bg-red-650 hover:text-white border border-red-500/10'
                      }`}
                    >
                      {p.isBan ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
