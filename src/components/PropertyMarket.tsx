/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Building, Award, Heart, ShieldAlert, Sparkles, Coins, DollarSign, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function PropertyMarket() {
  const { players, currentPlayerId, properties, buyProperty, sellProperty, upgradeProperty } = useGame();
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);

  if (!currentPlayerId) return null;
  const player = players[currentPlayerId];

  const handleBuy = (id: string) => {
    buyProperty(id);
  };

  const handleSell = (id: string) => {
    sellProperty(id);
  };

  const handleUpgrade = (id: string) => {
    upgradeProperty(id);
  };

  const selectedProp = properties.find((p) => p.id === selectedPropId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 text-[#e0e0e0] font-sans bg-[#050505] space-y-6">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif italic text-gold">
            Luxury Real Estate Exchange
          </h1>
          <p className="text-[10px] text-zinc-550 mt-1 uppercase tracking-[0.2em] font-mono">
            acquire sovereign plots // generate continuous passive cash dividends
          </p>
        </div>
        <div className="text-xs text-zinc-400 font-mono bg-[#0a0a0a] px-4 py-2 rounded-xl border border-gold/25">
          🏦 Passive Cycle: <span className="text-emerald-400 font-bold">Every 12 seconds</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        {/* Core Property Listings Grid (7 Columns) */}
        <div className="lg:col-span-12 xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {properties.map((prop) => {
            const isOwned = prop.ownerId !== null;
            const isMine = prop.ownerId === currentPlayerId;
            const ownerObj = isOwned ? players[prop.ownerId!] : null;

            const upgradeCost = Math.round(prop.basePrice * 0.45);
            const canAffordUpg = player.balance >= upgradeCost;

            return (
              <motion.div
                key={prop.id}
                whileHover={{ y: -4 }}
                className={`relative bg-[#0a0a0a] border rounded-2xl p-5 hover:shadow-2xl transition-all flex flex-col justify-between shadow-[0_4px_15px_rgba(0,0,0,0.3)] ${
                  isMine
                    ? 'border-gold/30 shadow-[0_0_12px_rgba(212,175,55,0.05)]'
                    : isOwned
                    ? 'border-white/5 opacity-80'
                    : 'border-white/5 hover:border-gold/25'
                }`}
              >
                {/* Floating Category Tag */}
                <div className="absolute top-4 right-4 flex items-center space-x-1">
                  <span className="text-[9px] font-mono font-bold bg-[#121212] border border-white/10 px-2 py-0.5 rounded text-zinc-400 uppercase tracking-widest">
                    {prop.type}
                  </span>
                </div>

                {/* Main Visuals & Content */}
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-4xl">{prop.image}</span>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-gray-200">{prop.name}</h3>
                      {isOwned ? (
                        <p className="text-[10px] text-zinc-500 flex items-center space-x-1.5 mt-0.5 font-bold uppercase tracking-wider">
                          <span>Owner: {ownerObj?.name}</span>
                          <span className="text-lg">{ownerObj?.avatar}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-gold font-mono font-bold mt-0.5 uppercase tracking-wider">
                          ★ FOR SALE
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Passive yield indicators */}
                  <div className="grid grid-cols-2 gap-3 bg-[#121212]/40 border border-white/5 p-3 rounded-xl mb-4 text-xs">
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5 font-mono">Yield Multiplier</span>
                      <span className="font-bold font-mono text-emerald-400">
                        +${prop.passiveIncome.toLocaleString()}/cycle
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5 font-mono">Asset Valuation</span>
                      <span className="font-bold font-mono text-gray-300">
                        ${prop.currentValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Star Upgrade Status indicators */}
                  {isOwned && (
                    <div className="flex items-center space-x-1 mb-4">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mr-1">Tiers:</span>
                      {[1, 2, 3].map((starIdx) => (
                        <span
                          key={starIdx}
                          className={`text-xs ${prop.upgradeLevel >= starIdx ? 'text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.8)] font-bold' : 'text-zinc-800'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Control Action Buttons */}
                <div className="pt-2 border-t border-white/5 flex items-center space-x-2">
                  {!isOwned ? (
                    /* Purchase Actions */
                    <button
                      type="button"
                      onClick={() => handleBuy(prop.id)}
                      disabled={player.balance < prop.currentValue}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer ${
                        player.balance >= prop.currentValue
                          ? 'bg-gold hover:bg-gold-light text-[#050505] shadow-md transition-colors'
                          : 'bg-[#111] text-zinc-650 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      Buy For ${prop.currentValue.toLocaleString()}
                    </button>
                  ) : isMine ? (
                    /* Owner controls (Upgrade or liquidate) */
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpgrade(prop.id)}
                        disabled={prop.upgradeLevel >= 3 || !canAffordUpg}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer ${
                          prop.upgradeLevel < 3 && canAffordUpg
                            ? 'bg-gradient-to-r from-gold/15 to-gold/5 border border-gold/30 text-gold hover:bg-gold/20 shadow'
                            : 'bg-[#111] text-zinc-650 border border-white/5 cursor-not-allowed'
                        }`}
                        title={prop.upgradeLevel >= 3 ? 'Max Upgrade Level' : `Upgrade cost $${upgradeCost.toLocaleString()}`}
                      >
                        {prop.upgradeLevel >= 3 ? 'Max Level' : `Upgrade: $${upgradeCost.toLocaleString()}`}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSell(prop.id)}
                        className="py-2 px-3.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-[#050505] border border-red-500/20 active:scale-95 transition-all outline-none cursor-pointer"
                        title="Liquidate back to realty agency at 82% valuations"
                      >
                        Liquidate
                      </button>
                    </>
                  ) : (
                    /* Owned by bot indicator */
                    <span className="text-[11px] text-zinc-500 italic py-2 text-center w-full">
                      Owned by rival Sovereign {ownerObj?.name}.
                    </span>
                  )}

                  {/* Details Trigger */}
                  <button
                    type="button"
                    onClick={() => setSelectedPropId(prop.id)}
                    className="p-2 rounded-xl hover:bg-[#121212] text-zinc-500 hover:text-white border border-transparent hover:border-white/5 transition-colors cursor-pointer"
                    title="Audit Ownership History logs"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Ownership Logs & Registry (4 Columns) */}
        <div className="lg:col-span-12 xl:col-span-4 bg-[#0a0a0a] border border-gold/15 rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold border-b border-white/5 pb-3 mb-4 flex items-center space-x-2">
              <Award className="w-4 h-4 text-gold" />
              <span>Property Registry</span>
            </h3>

            {selectedProp ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-[#121212]/60 rounded-xl border border-white/5">
                  <span className="text-4xl">{selectedProp.image}</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-200">{selectedProp.name}</h4>
                    <span className="text-[10px] uppercase font-mono text-zinc-500 font-medium">
                      Category Type: {selectedProp.type}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-500">Base Land Value:</span>
                    <span className="text-gray-300">${selectedProp.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-zinc-500">Index Status:</span>
                    <span className="text-gold font-sans tracking-wide">
                      {selectedProp.marketTrend === 'up' ? '📈 Appreciating' : selectedProp.marketTrend === 'down' ? '📉 Diluting' : '● Stable'}
                    </span>
                  </div>
                </div>

                {/* History list */}
                <div>
                  <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 font-mono">
                    Audited Ownership History
                  </span>
                  {selectedProp.ownershipHistory.length === 0 ? (
                    <div className="text-zinc-650 text-xs py-3 italic">
                      No transactions recorded. Held by virtual vault syndicate.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {selectedProp.ownershipHistory.map((h, i) => (
                        <div key={i} className="p-2 bg-[#121212]/50 rounded-lg text-xs border border-white/5 font-mono">
                          <div className="flex justify-between items-center font-sans mb-1 leading-none">
                            <span className="font-bold text-gray-300">{h.playerName}</span>
                            <span className="text-[10px] text-gold font-bold">${h.price.toLocaleString()}</span>
                          </div>
                          <span className="text-[9px] text-zinc-650">
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-zinc-600 italic">
                Click the <HelpCircle className="w-3.5 h-3.5 inline text-zinc-550" /> details icon on any listed real estate asset to inspect historical ledger acquisitions.
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-white/5 text-[9px] text-zinc-600 text-center uppercase font-mono leading-relaxed font-bold">
            ⚜️ ALL TITLES PROTECTED BY KINGS CLEARING HOUSE AND FIRESTORE LEDGER VAULTS.
          </div>
        </div>
      </div>
    </div>
  );
}
