/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  LogOut,
  Bell,
  Wallet,
  Coins,
  Shield,
  MessageSquare,
  Activity,
  Award,
  TrendingUp,
  Building,
  Gamepad,
  History,
  Check,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { players, currentPlayerId, logout, notifications, clearNotifications } = useGame();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!currentPlayerId) return null;
  const player = players[currentPlayerId];

  const unreadNotifs = notifications.filter((n) => n.playerId === currentPlayerId && !n.read);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'ledger', label: 'Ledger', icon: History },
    { id: 'property', label: 'Real Estate', icon: Building },
    { id: 'stocks', label: 'Wall Street', icon: TrendingUp },
    { id: 'casino', label: 'Gold Casino', icon: Gamepad },
    { id: 'challenges', label: 'PvP Duels', icon: Award },
    { id: 'social', label: 'Global Chat', icon: MessageSquare },
    { id: 'admin', label: 'Admin Control', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#050505]/80 border-b border-gold/15 backdrop-blur-xl px-4 sm:px-8 py-3.5 text-[#e0e0e0] max-w-7xl mx-auto w-full flex items-center justify-between">
      {/* Brand Logo & Title */}
      <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-gold rounded-lg flex items-center justify-center rotate-45 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-transform duration-300 hover:scale-105">
          <span className="-rotate-45 font-serif font-bold text-gold text-sm sm:text-base">CK</span>
        </div>
        <div>
          <h2 className="text-sm sm:text-lg font-serif italic text-gold tracking-widest">
            CAPITAL KINGS
          </h2>
          <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest hidden sm:block">
            Virtual Boardroom Economy
          </p>
        </div>
      </div>

      {/* Desktop Responsive Tab System */}
      <nav className="hidden lg:flex items-center space-x-1.5">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center space-x-1.5 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'bg-gold/10 border border-gold/30 text-gold shadow-[0_0_10px_rgba(212,175,55,0.1)]'
                  : 'text-zinc-400 hover:text-white border border-transparent hover:bg-zinc-900/40'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-gold' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile summary & real-time Wallet readout */}
      <div className="flex items-center space-x-4">
        {/* Dynamic Balance indicator */}
        <div className="flex items-center space-x-2 bg-[#0a0a0a] border border-gold/15 py-1.5 px-3 rounded-xl shadow-[0_0_12px_rgba(212,175,55,0.05)]">
          <Wallet className="w-3.5 h-3.5 text-gold" />
          <span className="font-mono text-xs sm:text-sm font-bold text-gray-200">
            ${player.balance.toLocaleString()}
          </span>
        </div>

        {/* Live Notification Indicator Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) clearNotifications();
            }}
            className="w-9 h-9 rounded-xl bg-[#0a0a0a] hover:bg-zinc-900 border border-white/5 hover:border-gold/30 flex items-center justify-center transition-all outline-none cursor-pointer relative"
          >
            <Bell className="w-4 h-4 text-zinc-300 hover:text-white" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 leading-none w-4 h-4 bg-gold text-black rounded-full flex items-center justify-center font-bold text-[9px] animate-bounce shadow-[0_0_8px_rgba(212,175,55,0.5)]">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Quick Notification Drawer Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-3 w-80 max-h-[380px] overflow-y-auto bg-[#0a0a0a] border border-gold/25 rounded-2xl shadow-2xl p-4 overflow-hidden z-[100]"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center space-x-1">
                    <span>Notifications Center</span>
                  </h4>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-gold hover:underline outline-none cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {notifications.filter((n) => n.playerId === currentPlayerId).length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-600">
                      No recent financial or wager updates.
                    </div>
                  ) : (
                    notifications
                      .filter((n) => n.playerId === currentPlayerId)
                      .slice(0, 10)
                      .map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-lg border text-xs leading-relaxed transition-all ${
                            notif.read ? 'bg-zinc-900/10 border-white/5 text-zinc-400' : 'bg-gold/5 border-gold/20 text-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-gold/90 tracking-wide">
                              {notif.title}
                            </span>
                            <span className="text-[9px] text-zinc-600 font-mono">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] leading-normal">{notif.message}</p>
                        </div>
                      ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Frame & Logout */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-gold/20 flex items-center justify-center text-lg select-none">
            {player.avatar}
          </div>
          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-white/5 hover:bg-zinc-900 hover:border-gold/30 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-all outline-none"
            title="Sign out of Profile"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
