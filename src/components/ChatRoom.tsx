/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types';
import { MessageSquare, Send, Users, Radio, Mic, Phone, Plus, UserPlus, Star, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ChatRoom() {
  const { players, currentPlayerId, messages, sendChatMessage } = useGame();
  const [inputText, setInputText] = useState<string>('');
  const [activeChannel, setActiveChannel] = useState<'global' | string>('global'); // 'global' or other player ID
  const [inVoiceRoom, setInVoiceRoom] = useState<boolean>(false);
  const [voiceUsers, setVoiceUsers] = useState<string[]>(['yonny']);
  const [friendsList, setFriendsList] = useState<string[]>(['brook', 'sol']);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  if (!currentPlayerId) return null;
  const player = players[currentPlayerId];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() === '') return;
    sendChatMessage(inputText, activeChannel);
    setInputText('');
  };

  const handleToggleVoice = () => {
    if (inVoiceRoom) {
      setVoiceUsers(['yonny']); // reset
      setInVoiceRoom(false);
    } else {
      setInVoiceRoom(true);
      // Simulate. Sol joins 2.5 seconds later
      setVoiceUsers(['yonny', currentPlayerId]);
      setTimeout(() => {
        setVoiceUsers((prev) => [...new Set([...prev, 'sol'])]);
      }, 2500);
    }
  };

  const toggleFriend = (id: string) => {
    if (friendsList.includes(id)) {
      setFriendsList(friendsList.filter((f) => f !== id));
    } else {
      setFriendsList([...friendsList, id]);
    }
  };

  // Filter messages based on active channel selector
  const channelMessages = messages.filter((msg) => {
    if (activeChannel === 'global') {
      return msg.receiverId === 'global';
    } else {
      // Private direct chats between user and target
      const isDirect =
        (msg.senderId === currentPlayerId && msg.receiverId === activeChannel) ||
        (msg.senderId === activeChannel && msg.receiverId === currentPlayerId);
      return isDirect;
    }
  });

  const activeTargetPlayer = activeChannel !== 'global' ? players[activeChannel] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 text-[#e0e0e0] font-sans bg-[#050505] space-y-6">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl sm:text-2xl font-serif italic text-gold">
          Imperial Chat Room & Social Desk
        </h1>
        <p className="text-[10px] text-zinc-550 mt-1 uppercase tracking-[0.2em] font-mono">
          CHANNELS: CRYPTO-ROUTED DIRECT CHANNELS // SYNCED VOICE MATRICES
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar roster list (3 columns) */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-5">
          {/* Active channels list */}
          <div className="bg-[#0a0a0a] border border-gold/15 rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 mb-3 font-mono flex items-center space-x-1.5 border-b border-white/5 pb-2">
              <Users className="w-4 h-4 text-gold" />
              <span>Sovereign Guild Roster</span>
            </h3>

            <div className="space-y-1.5">
              {/* Global general */}
              <button
                type="button"
                onClick={() => setActiveChannel('global')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between outline-none transition-all cursor-pointer ${
                  activeChannel === 'global'
                    ? 'border-gold bg-gold/10 text-gold shadow-[0_0_10px_rgba(212,175,55,0.05)]'
                    : 'border-white/5 bg-[#121212]/30 text-zinc-400 hover:border-gold/25'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>🌍</span>
                  <span>Global Forum</span>
                </span>
                <span className="text-[10px] bg-[#121212] border border-white/5 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold">ALL</span>
              </button>

              {/* Individual players */}
              {(Object.values(players) as Player[])
                .filter((p) => p.id !== currentPlayerId && !p.isBan)
                .map((p) => {
                  const isSelected = activeChannel === p.id;
                  const isOnline = p.status === 'online';
                  const isFriend = friendsList.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveChannel(p.id)}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-gold bg-gold/10 text-gold shadow-[0_0_10px_rgba(212,175,55,0.05)]'
                          : 'border-white/5 bg-[#121212]/30 text-zinc-400 hover:border-gold/25'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-base select-none">{p.avatar}</span>
                        <div>
                          <span className="block text-gray-200">{p.name}</span>
                          <span className="text-[9px] text-zinc-550 tracking-wide font-mono uppercase">
                            {isOnline ? '● Online' : '● Offline'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFriend(p.id);
                          }}
                          className="text-zinc-500 hover:text-gold outline-none p-1 rounded hover:bg-[#121212] cursor-pointer"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFriend ? 'text-gold fill-gold' : 'text-zinc-600'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Voice Room widget */}
          <div className="bg-[#0a0a0a] border border-gold/15 rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-gold animate-pulse" />
                <span>Secure Voice Matrix</span>
              </h3>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-1 ml-0 outline-none transition-all cursor-pointer ${
                  inVoiceRoom
                    ? 'bg-red-900 border border-red-500/20 text-red-100 hover:bg-red-850'
                    : 'bg-gold hover:bg-gold-light text-[#050505] shadow'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{inVoiceRoom ? 'Disconnect Line' : 'Connect Voice Room'}</span>
              </button>

              {inVoiceRoom && (
                <div className="p-2.5 rounded-xl bg-[#121212]/60 border border-gold/20 text-xs text-center transition-all">
                  <span className="block text-[9px] uppercase font-bold text-gold tracking-widest font-mono mb-2">
                    Active voice channels
                  </span>
                  
                  {/* Floating gold ripples */}
                  <div className="flex justify-center space-x-1.5 mb-2.5">
                    <div className="w-0.5 h-3 bg-gold animate-pulse" />
                    <div className="w-0.5 h-4 bg-gold/80 animate-pulse" />
                    <div className="w-0.5 h-2.5 bg-gold/90 animate-pulse" />
                    <div className="w-0.5 h-5 bg-gold animate-pulse" />
                  </div>

                  <div className="flex items-center justify-center space-x-1 text-[11px] text-zinc-400">
                    {voiceUsers.map((id) => (
                      <span
                        key={id}
                        className="w-6 h-6 rounded-full bg-zinc-900 border border-gold/20 flex items-center justify-center text-xs"
                        title={players[id]?.name}
                      >
                        {players[id]?.avatar}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat box area (9 columns) */}
        <div className="lg:col-span-12 xl:col-span-9 bg-[#0a0a0a] border border-gold/15 rounded-3xl p-5 h-[580px] flex flex-col justify-between overflow-hidden relative shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          {/* Header Title indicator */}
          <div className="bg-[#0a0a0a] border-b border-white/5 pb-3.5 mb-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center text-base">
                {activeTargetPlayer ? activeTargetPlayer.avatar : '🌏'}
              </div>
              <div>
                <span className="font-bold text-gray-200 text-xs sm:text-sm">
                  {activeTargetPlayer ? `${activeTargetPlayer.name} (Direct Message)` : 'Global Syndicate Channel'}
                </span>
                <span className="block text-[9px] text-zinc-550 uppercase tracking-widest font-mono">
                  {activeTargetPlayer ? 'Secured PII end-to-end channel' : 'All transactions and comments logged.'}
                </span>
              </div>
            </div>

            <span className="text-[10px] text-gold font-mono tracking-widest font-bold">
              ● SECURE COMMS
            </span>
          </div>

          {/* Messages viewport */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-4 scrollbar-thin scrollbar-thumb-zinc-850">
            {channelMessages.length === 0 ? (
              <div className="text-center py-20 text-zinc-600 text-xs italic">
                Secure link established. Send a secure transmit text to open dialogue.
              </div>
            ) : (
              channelMessages.map((msg) => {
                const isMine = msg.senderId === currentPlayerId;
                const isSystem = msg.senderId === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-3.5">
                      <div className="bg-[#1c1404] border border-gold/25 py-2 px-5 rounded-2xl text-[11px] text-gold max-w-xl text-center leading-relaxed font-serif shadow-sm">
                        <strong>KINGS MODERATOR:</strong> {msg.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex items-start ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2.5 max-w-md ${isMine ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-base select-none">
                        {msg.senderAvatar}
                      </div>

                      <div>
                        <div className={`flex items-center space-x-2 mb-1 ${isMine ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <span className="text-[11px] font-bold text-gray-300">{msg.senderName}</span>
                          <span className="text-[9px] text-zinc-550 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-gold text-[#050505] font-semibold rounded-tr-none shadow shadow-gold/15'
                            : 'bg-[#121212]/90 border border-white/5 text-gray-200 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input field */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/5 flex items-center space-x-2.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#111] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-zinc-650 focus:border-gold outline-none"
              placeholder={`Transmit to ${activeTargetPlayer ? activeTargetPlayer.name : 'Sovereigns'}...`}
              maxLength={220}
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-gold hover:bg-gold-light text-[#050505] flex items-center justify-center cursor-pointer transition-all outline-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
