/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types';
import { Send, ArrowDownLeft, ArrowUpRight, Check, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Transactions() {
  const { players, currentPlayerId, transactions, sendMoney, requestMoney, addNotification } = useGame();
  const [recipientId, setRecipientId] = useState<string>('brook');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [txType, setTxType] = useState<'send' | 'request'>('send');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load context parameters
  const player = currentPlayerId ? players[currentPlayerId] : null;

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setError('Please provide a valid transfer amount');
      return;
    }

    if (txType === 'send') {
      if (!player || player.balance < amtNum) {
        setError('Insufficient balance to execute wire transfer');
        return;
      }
      const isOk = sendMoney(recipientId, amtNum, note || 'Liquidity Transfer');
      if (isOk) {
        setSuccess(`Successfully wired $${amtNum.toLocaleString()} to ${players[recipientId].name}!`);
        setAmount('');
        setNote('');
      } else {
        setError('Transaction failed. Unknown bank exception.');
      }
    } else {
      // Request Money
      requestMoney(recipientId, amtNum, note || 'Cash Request Allotment');
      setSuccess(`Dispatched payment request of $${amtNum.toLocaleString()} to ${players[recipientId].name}.`);
      setAmount('');
      setNote('');
    }
  };

  if (!player) return null;

  // Filter out relevant non-active characters
  const activeBots = (Object.values(players) as Player[]).filter((p) => p.id !== currentPlayerId && !p.isBan);

  // Incoming payment claims targeting the user
  const incomingClaims = transactions.filter(
    (tx) => tx.receiverId === currentPlayerId && tx.status === 'pending' && tx.category === 'request'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 text-[#e0e0e0] font-sans bg-[#050505] space-y-6">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl sm:text-2xl font-serif italic text-gold">
          Financial Wire Desk & Ledger
        </h1>
        <p className="text-[10px] text-zinc-550 mt-1 uppercase tracking-[0.2em] font-mono">
          CHANNELS: FDIC CLEARING HOUSE SECURED // INSTANT MEMORY POOL
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Actions Pane: Send/Request form */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="bg-[#0a0a0a] border border-gold/15 rounded-2xl p-5 relative shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
            {/* Top selection Tabs */}
            <div className="flex border-b border-white/5 pb-3.5 mb-5 font-serif">
              <button
                type="button"
                onClick={() => {
                  setTxType('send');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider transition-colors outline-none cursor-pointer ${
                  txType === 'send' ? 'text-gold border-b-2 border-gold font-bold' : 'text-zinc-500 hover:text-white'
                }`}
              >
                Wire Transfer
              </button>
              <button
                type="button"
                onClick={() => {
                  setTxType('request');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider transition-colors outline-none cursor-pointer ${
                  txType === 'request' ? 'text-gold border-b-2 border-gold font-bold' : 'text-zinc-500 hover:text-white'
                }`}
              >
                Request Payment
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center space-x-1.5 text-red-400 text-xs border border-red-500/10 bg-red-950/15 p-2.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-center space-x-1.5 text-emerald-400 text-xs border border-emerald-500/10 bg-emerald-950/15 p-2.5 rounded-xl">
                <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleActionSubmit} className="space-y-4">
              {/* Recipient selection */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-550 tracking-wider mb-1.5 font-mono">
                  Select Competitive Sovereign
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {activeBots.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setRecipientId(p.id)}
                      className={`py-2 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        recipientId === p.id
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

              {/* Amount input */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-555 tracking-wider mb-1.5 font-mono">
                  Liquidity Sum (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-base text-zinc-500 font-mono">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-2.5 pl-7 text-sm font-mono text-white focus:border-gold placeholder-zinc-650 outline-none"
                    placeholder="Enter amount (e.g. 500000)"
                    min={1}
                    required
                  />
                </div>
              </div>

              {/* Transfer note */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-555 tracking-wider mb-1.5 font-mono">
                  Note / Purpose of Transfer
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={120}
                  className="w-full bg-[#111] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:border-gold placeholder-zinc-650 outline-none"
                  placeholder="e.g. Sol Investment, bet settlement, property buy"
                />
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                className="w-full bg-gold hover:bg-gold-light text-[#050505] font-bold text-xs py-3 rounded-xl mt-4 cursor-pointer flex items-center justify-center space-x-1 shadow-lg active:scale-[0.99] transition-all uppercase tracking-widest font-sans"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                <span>{txType === 'send' ? 'Confirm Wire Dispatch' : 'Request Payment Claim'}</span>
              </button>
            </form>
          </div>

          {/* Pending Wire Requests / Claims made by Others */}
          <div className="bg-[#0a0a0a] border border-gold/15 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 border-b border-white/5 pb-2 font-mono">
              Payment Demands Claimed on You
            </h3>

            {incomingClaims.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-655 italic">
                You currently have no unfulfilled sovereign demands against you.
              </div>
            ) : (
              <div className="space-y-3">
                {incomingClaims.map((tx) => (
                  <div key={tx.id} className="p-3 bg-[#121212]/60 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold block text-gray-200">{tx.senderName} is demanding:</span>
                      <span className="font-mono text-sm font-bold text-gold block my-1">
                        ${tx.amount.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-zinc-500 italic block">"{tx.note}"</span>
                    </div>

                    <div className="flex flex-col space-y-1">
                      {/* Accept button */}
                      <button
                        type="button"
                        onClick={() => {
                          // Approve: executes transfer as sendMoney internally
                          const wasOk = sendMoney(tx.senderId, tx.amount, `Claim Settlement: ${tx.note}`);
                          if (wasOk) {
                            tx.status = 'completed'; // mutating target status representation
                            setSuccess(`Approved & paid $${tx.amount.toLocaleString()} invoice to ${tx.senderName}.`);
                          } else {
                            setError('Repayment failed: insufficient wealth reserves.');
                          }
                        }}
                        className="py-1 px-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 font-bold rounded-lg border border-emerald-500/20 text-[10px] cursor-pointer transition-colors"
                      >
                        Approve
                      </button>
                      {/* Decline button */}
                      <button
                        type="button"
                        onClick={() => {
                          tx.status = 'rejected';
                          setSuccess('Payment claim rejected successfully.');
                        }}
                        className="py-1 px-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-zinc-950 font-bold rounded-lg border border-red-500/20 text-[10px] cursor-pointer transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global ledger transaction list */}
        <div className="lg:col-span-12 xl:col-span-7 bg-[#0a0a0a] border border-gold/15 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3.5 mb-4 space-y-1 sm:space-y-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold font-serif italic">
              Sovereign Ledger Audit Trail
            </h3>
            <span className="text-[9px] text-zinc-550 font-mono tracking-wider">FULLY VISUALIZED LEDGER SYSTEM</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <div className="text-center py-20 text-xs text-zinc-655 italic">
                No bank clearing data found. Ledger database is fresh.
              </div>
            ) : (
              transactions.map((tx) => {
                const isUserSender = tx.senderId === currentPlayerId;
                const isUserReceiver = tx.receiverId === currentPlayerId;

                const belongsToUser = isUserSender || isUserReceiver;

                return (
                  <div
                    key={tx.id}
                    className={`p-3.5 rounded-xl border flex justify-between items-start transition-all relative overflow-hidden ${
                      tx.status === 'pending'
                        ? 'border-gold/25 bg-gold/[0.02]'
                        : tx.status === 'rejected'
                        ? 'border-red-500/10 bg-red-955/5 text-zinc-550'
                        : belongsToUser
                        ? 'border-zinc-850 bg-[#121212]/60 hover:border-gold/20'
                        : 'border-white/5 bg-[#121212]/10 hover:border-zinc-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3 text-xs sm:text-sm">
                      <div className="mt-1">
                        {tx.status === 'pending' ? (
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold font-mono">?</div>
                        ) : isUserSender ? (
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <ArrowDownLeft className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-200">
                            {tx.senderName} ➜ {tx.receiverName}
                          </span>
                          <span className="text-[10px] uppercase font-mono bg-[#121212] text-zinc-400 px-1.5 py-0.5 rounded font-bold border border-white/5">
                            {tx.category}
                          </span>
                        </div>
                        <p className="text-zinc-400 mt-1 max-w-sm">"{tx.note}"</p>
                        <span className="text-[10px] text-zinc-650 font-mono block mt-1.5">
                          Cleared: {new Date(tx.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono text-sm sm:text-base font-extrabold block ${
                        tx.status === 'rejected'
                          ? 'line-through text-zinc-600'
                          : isUserSender
                          ? 'text-red-400'
                          : isUserReceiver
                          ? 'text-emerald-400'
                          : 'text-zinc-500'
                      }`}>
                        {isUserSender && tx.status !== 'rejected' ? '-' : '+'}${tx.amount.toLocaleString()}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${
                        tx.status === 'completed'
                          ? 'text-emerald-500'
                          : tx.status === 'pending'
                          ? 'text-yellow-500 animate-pulse'
                          : 'text-zinc-650'
                      }`}>
                        {tx.status}
                      </span>
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
