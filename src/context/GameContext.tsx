/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Player, Transaction, Property, Stock, Bet, Challenge, Notification, Message, BankLoan } from '../types';

interface GameContextType {
  players: Record<string, Player>;
  currentPlayerId: string | null;
  transactions: Transaction[];
  properties: Property[];
  stocks: Stock[];
  bets: Bet[];
  challenges: Challenge[];
  messages: Message[];
  notifications: Notification[];
  activeMarketEvent: { title: string; desc: string; type: string } | null;
  lastBackup: string;
  login: (playerId: string, pin: string) => { success: boolean; message: string };
  logout: () => void;
  resetPin: (playerId: string, newPin: string) => void;
  sendMoney: (receiverId: string, amount: number, note: string) => boolean;
  requestMoney: (senderId: string, amount: number, note: string) => void;
  buyProperty: (propertyId: string) => boolean;
  sellProperty: (propertyId: string) => boolean;
  upgradeProperty: (propertyId: string) => boolean;
  buyStock: (symbol: string, sharesCount: number) => boolean;
  sellStock: (symbol: string, sharesCount: number) => boolean;
  createBet: (opponentId: string, sport: string, matchName: string, wager: number, prediction: string, odds: number) => void;
  acceptBet: (betId: string) => void;
  resolveBet: (betId: string, winnerId: string) => void;
  sendChallenge: (opponentId: string, gameType: 'FIFA' | 'Monopoly' | 'Basketball' | 'Custom', wager: number) => void;
  acceptChallenge: (challengeId: string) => void;
  declineChallenge: (challengeId: string) => void;
  resolveChallenge: (challengeId: string, winnerId: string) => void;
  playCasino: (gameType: 'slots' | 'dice' | 'coin' | 'roulette' | 'blackjack', wager: number, data?: any) => { won: boolean; payout: number; message: string; cardResult?: any };
  addNotification: (playerId: string, title: string, message: string, category: Notification['category']) => void;
  sendChatMessage: (text: string, receiverId?: string) => void;
  takeLoan: (amount: number) => boolean;
  payLoan: () => void;
  triggerEvent: (eventType: string) => void;
  adminModifyBalance: (playerId: string, amount: number) => void;
  adminBanUser: (playerId: string, banStat: boolean) => void;
  adminResetAll: () => void;
  clearNotifications: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Initial Profiles
const initialPlayers: Record<string, Player> = {
  cay: {
    id: 'cay',
    name: 'CAY',
    avatar: '👑',
    status: 'online',
    netWorth: 10000000,
    balance: 10000000,
    unlockedProperties: [],
    portfolio: {},
    stats: { totalBets: 12, betsWon: 8, casinoWon: 3500000, propertiesOwned: 0, tradesCount: 15 },
    pin: '1111',
    failedPinAttempts: 0,
    lockedUntil: null,
    isBan: false,
    streak: 3,
    lastLoginDate: null,
  },
  brook: {
    id: 'brook',
    name: 'Brook',
    avatar: '💎',
    status: 'online',
    netWorth: 10000000,
    balance: 10000000,
    unlockedProperties: [],
    portfolio: {},
    stats: { totalBets: 8, betsWon: 5, casinoWon: 5000000, propertiesOwned: 0, tradesCount: 22 },
    pin: '2222',
    failedPinAttempts: 0,
    lockedUntil: null,
    isBan: false,
    streak: 5,
    lastLoginDate: null,
  },
  leroy: {
    id: 'leroy',
    name: 'Dr. Leroy',
    avatar: '🩺',
    status: 'offline',
    netWorth: 10000000,
    balance: 10000000,
    unlockedProperties: [],
    portfolio: {},
    stats: { totalBets: 4, betsWon: 1, casinoWon: 800000, propertiesOwned: 0, tradesCount: 6 },
    pin: '3333',
    failedPinAttempts: 0,
    lockedUntil: null,
    isBan: false,
    streak: 1,
    lastLoginDate: null,
  },
  sol: {
    id: 'sol',
    name: 'Sol',
    avatar: '☀️',
    status: 'offline',
    netWorth: 10000000,
    balance: 10000000,
    unlockedProperties: [],
    portfolio: {},
    stats: { totalBets: 15, betsWon: 9, casinoWon: 4200000, propertiesOwned: 0, tradesCount: 19 },
    pin: '4444',
    failedPinAttempts: 0,
    lockedUntil: null,
    isBan: false,
    streak: 4,
    lastLoginDate: null,
  },
  yonny: {
    id: 'yonny',
    name: 'Yonny',
    avatar: '⚡',
    status: 'online',
    netWorth: 10000000,
    balance: 10000000,
    unlockedProperties: [],
    portfolio: {},
    stats: { totalBets: 32, betsWon: 20, casinoWon: 14000000, propertiesOwned: 0, tradesCount: 45 },
    pin: '5555',
    failedPinAttempts: 0,
    lockedUntil: null,
    isBan: false,
    streak: 8,
    lastLoginDate: null,
  },
};

// Initial Stocks Catalog
const initialStocks: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.5, history: [180, 182, 185, 183, 185.5], high: 195, low: 175, changePercent: 1.2, volatility: 0.15, marketCap: '$2.95T' },
  { symbol: 'AMZN', name: 'Amazon Web', price: 152.0, history: [155, 154, 150, 151, 152.0], high: 165, low: 140, changePercent: -0.4, volatility: 0.20, marketCap: '$1.58T' },
  { symbol: 'TSLA', name: 'Tesla Motors', price: 212.8, history: [225, 220, 215, 210, 212.8], high: 240, low: 190, changePercent: -1.8, volatility: 0.35, marketCap: '$675B' },
  { symbol: 'COIN', name: 'Coinbase Inc', price: 114.2, history: [98, 105, 110, 112, 114.2], high: 130, low: 85, changePercent: 3.5, volatility: 0.55, marketCap: '$27B' },
  { symbol: 'KNGS', name: 'Capital Kings Ltd', price: 520.0, history: [480, 495, 500, 510, 520.0], high: 550, low: 450, changePercent: 1.9, volatility: 0.10, marketCap: '$5.2B' },
  { symbol: 'BTC', name: 'Bitcoin Index', price: 68500.0, history: [65000, 66200, 67400, 68000, 68500.0], high: 72000, low: 61000, changePercent: 2.1, volatility: 0.45, marketCap: '$1.34T' },
];

// Initial Real Estate List
const initialProperties: Property[] = [
  { id: 'bh_mansion', name: 'Beverly Hills Citadel', type: 'mansion', basePrice: 2400000, currentValue: 2400000, passiveIncome: 18000, ownerId: null, upgradeLevel: 0, image: '🏡', marketTrend: 'stable', ownershipHistory: [] },
  { id: 'apex_penthouse', name: 'Apex Sky Residence', type: 'apartment', basePrice: 1200000, currentValue: 1200000, passiveIncome: 8500, ownerId: null, upgradeLevel: 0, image: '🏢', marketTrend: 'up', ownershipHistory: [] },
  { id: 'plaza_royale', name: 'The Plaza Gold Hotel', type: 'hotel', basePrice: 4800000, currentValue: 4800000, passiveIncome: 45000, ownerId: null, upgradeLevel: 0, image: '🏨', marketTrend: 'stable', ownershipHistory: [] },
  { id: 'sapphire_reef', name: 'Sapphire Reef Private Island', type: 'island', basePrice: 8500000, currentValue: 8500000, passiveIncome: 95000, ownerId: null, upgradeLevel: 0, image: '🏝️', marketTrend: 'up', ownershipHistory: [] },
  { id: 'sol_logistics', name: 'Apex Quantum Foods', type: 'business', basePrice: 3500000, currentValue: 3500000, passiveIncome: 30000, ownerId: null, upgradeLevel: 0, image: '🏭', marketTrend: 'down', ownershipHistory: [] },
  { id: 'kings_arena', name: 'Capital Kings Arena', type: 'stadium', basePrice: 12000000, currentValue: 12000000, passiveIncome: 150000, ownerId: null, upgradeLevel: 0, image: '🏟️', marketTrend: 'up', ownershipHistory: [] },
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial settings
  const [players, setPlayers] = useState<Record<string, Player>>(() => {
    const saved = localStorage.getItem('capital_kings_players');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let modified = false;
        Object.keys(parsed).forEach((id) => {
          if (parsed[id].balance !== 10000000 || parsed[id].netWorth !== 10000000 || Object.keys(parsed[id].portfolio).length > 0) {
            parsed[id].balance = 10000000;
            parsed[id].netWorth = 10000000;
            parsed[id].portfolio = {};
            parsed[id].unlockedProperties = [];
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem('capital_kings_players', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        return initialPlayers;
      }
    }
    return initialPlayers;
  });

  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(() => {
    return localStorage.getItem('capital_kings_active_player') || null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('capital_kings_transactions');
    return saved ? JSON.parse(saved) : [
      {
        id: 'initial_tx_1',
        senderId: 'BANK',
        senderName: 'Capital Kings Reserve',
        receiverId: 'cay',
        receiverName: 'CAY',
        amount: 10000000,
        timestamp: new Date().toISOString(),
        note: 'Initial Player Capital Allotment',
        status: 'completed',
        category: 'transfer'
      }
    ];
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('capital_kings_properties');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let modified = false;
        parsed.forEach((p: any) => {
          if (p.ownerId !== null) {
            p.ownerId = null;
            p.upgradeLevel = 0;
            p.currentValue = p.basePrice;
            p.ownershipHistory = [];
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem('capital_kings_properties', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        return initialProperties;
      }
    }
    return initialProperties;
  });

  const [stocks, setStocks] = useState<Stock[]>(() => {
    const saved = localStorage.getItem('capital_kings_stocks');
    return saved ? JSON.parse(saved) : initialStocks;
  });

  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('capital_kings_bets');
    return saved ? JSON.parse(saved) : [];
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('capital_kings_challenges');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('capital_kings_messages');
    return saved ? JSON.parse(saved) : [
      { id: 'msg_1', senderId: 'leroy', senderName: 'Dr. Leroy', senderAvatar: '🩺', receiverId: 'global', text: 'Welcome to Capital Kings! Secure your PIN instantly.', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'msg_2', senderId: 'yonny', senderName: 'Yonny', senderAvatar: '⚡', receiverId: 'global', text: 'Already put $5M in KNGS stocks and ready to wager! Let\'s go!', timestamp: new Date(Date.now() - 1800000).toISOString() }
    ];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('capital_kings_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Loans mapping: Key as playerId
  const [loans, setLoans] = useState<Record<string, BankLoan>>(() => {
    const saved = localStorage.getItem('capital_kings_loans');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeMarketEvent, setActiveMarketEvent] = useState<{ title: string; desc: string; type: string } | null>(null);
  const [lastBackup, setLastBackup] = useState<string>(() => new Date().toISOString());

  // Inactivity tracking
  const lastActiveRef = useRef<number>(Date.now());

  // Sync state back to persistent LocalStorage
  useEffect(() => {
    localStorage.setItem('capital_kings_players', JSON.stringify(players));
    localStorage.setItem('capital_kings_transactions', JSON.stringify(transactions));
    localStorage.setItem('capital_kings_properties', JSON.stringify(properties));
    localStorage.setItem('capital_kings_stocks', JSON.stringify(stocks));
    localStorage.setItem('capital_kings_bets', JSON.stringify(bets));
    localStorage.setItem('capital_kings_challenges', JSON.stringify(challenges));
    localStorage.setItem('capital_kings_messages', JSON.stringify(messages));
    localStorage.setItem('capital_kings_notifications', JSON.stringify(notifications));
    localStorage.setItem('capital_kings_loans', JSON.stringify(loans));
    if (currentPlayerId) {
      localStorage.setItem('capital_kings_active_player', currentPlayerId);
    } else {
      localStorage.removeItem('capital_kings_active_player');
    }
    setLastBackup(new Date().toISOString());
  }, [players, currentPlayerId, transactions, properties, stocks, bets, challenges, messages, notifications, loans]);

  // Net Worth recalculator
  const recalculateNetWorth = (playerRecord: Record<string, Player>) => {
    const updated = { ...playerRecord };
    let changed = false;

    Object.keys(updated).forEach((pId) => {
      const p = updated[pId];

      // 1. Calculate values of properties owned
      const ownedValue = properties
        .filter((prop) => prop.ownerId === pId)
        .reduce((sum, prop) => sum + prop.currentValue, 0);

      // 2. Calculate values of stock portfolio
      const portfolioValue = Object.keys(p.portfolio).reduce((sum, symbol) => {
        const item = p.portfolio[symbol];
        const currentStock = stocks.find((s) => s.symbol === symbol);
        const currentPrice = currentStock ? currentStock.price : 0;
        return sum + (item.shares * currentPrice);
      }, 0);

      // 3. Subtract outstanding loans
      const loanLiability = loans[pId] ? loans[pId].amount : 0;

      const calculatedNetWorth = Math.round(p.balance + ownedValue + portfolioValue - loanLiability);

      if (p.netWorth !== calculatedNetWorth) {
        p.netWorth = calculatedNetWorth;
        p.stats.propertiesOwned = properties.filter((prop) => prop.ownerId === pId).length;
        changed = true;
      }
    });

    if (changed) {
      setPlayers(updated);
    }
  };

  // Run Net Worth recalculations whenever relevant state shifts
  useEffect(() => {
    recalculateNetWorth(players);
  }, [properties, stocks, loans]);

  // Activity listeners for session timeouts
  useEffect(() => {
    const recordActive = () => {
      lastActiveRef.current = Date.now();
    };
    window.addEventListener('mousemove', recordActive);
    window.addEventListener('keydown', recordActive);
    window.addEventListener('click', recordActive);

    // Timeout checker interval (checks every 20s for inactivity of > 10m)
    const activeCheck = setInterval(() => {
      if (currentPlayerId && Date.now() - lastActiveRef.current > 10 * 60 * 1000) {
        logout();
        addNotification('system', 'Session Expired', 'You have been automatically logged out due to inactivity.', 'money');
      }
    }, 20000);

    return () => {
      window.removeEventListener('mousemove', recordActive);
      window.removeEventListener('keydown', recordActive);
      window.removeEventListener('click', recordActive);
      clearInterval(activeCheck);
    };
  }, [currentPlayerId]);

  // LOGIN System with PIN checking
  const login = (playerId: string, pin: string) => {
    const player = players[playerId];
    if (!player) return { success: false, message: 'Profile not found' };

    // Check ban status
    if (player.isBan) {
      return { success: false, message: 'This profile has been banned by the Administrator.' };
    }

    // Check lock expiry
    if (player.lockedUntil) {
      const lockTime = new Date(player.lockedUntil).getTime();
      if (Date.now() < lockTime) {
        const remainingSec = Math.ceil((lockTime - Date.now()) / 1000);
        return { success: false, message: `Profile is temporarily locked. Try again in ${remainingSec} seconds.` };
      }
    }

    if (player.pin === pin || player.pin === '') {
      // Correct PIN or empty/new profile setup
      setPlayers((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          failedPinAttempts: 0,
          lockedUntil: null,
          status: 'online',
          lastLoginDate: new Date().toISOString(),
        },
      }));
      setCurrentPlayerId(playerId);
      lastActiveRef.current = Date.now();

      // Trigger standard daily login rewards if streak is valid
      addNotification(
        playerId,
        'Welcome Back Lord!',
        'Successfully signed in. Passive properties and stocks are generating real-time cash flow.',
        'money'
      );

      return { success: true, message: 'Successfully signed in.' };
    } else {
      // Incorrect PIN
      const nextFailed = player.failedPinAttempts + 1;
      let lockUntil: string | null = null;
      let msg = `Incorrect PIN. ${3 - nextFailed} attempts remaining before temporary profile lock.`;

      if (nextFailed >= 3) {
        const lockExpiry = new Date(Date.now() + 60000).toISOString(); // 1-minute lock
        lockUntil = lockExpiry;
        msg = 'Profile locked for 60 seconds due to multiple incorrect credentials.';
      }

      setPlayers((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          failedPinAttempts: nextFailed >= 3 ? 0 : nextFailed,
          lockedUntil: lockUntil,
        },
      }));

      return { success: false, message: msg };
    }
  };

  const logout = () => {
    if (currentPlayerId) {
      setPlayers((prev) => ({
        ...prev,
        [currentPlayerId]: {
          ...prev[currentPlayerId],
          status: 'offline',
        },
      }));
    }
    setCurrentPlayerId(null);
  };

  const resetPin = (playerId: string, newPin: string) => {
    setPlayers((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        pin: newPin,
        failedPinAttempts: 0,
        lockedUntil: null,
      },
    }));
  };

  // Live Notification Dispatcher
  const addNotification = (
    playerId: string,
    title: string,
    message: string,
    category: Notification['category']
  ) => {
    const newNotif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      playerId,
      title,
      message,
      category,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 99)]);
  };

  // Peer-to-Peer Transactions Ledger
  const sendMoney = (receiverId: string, amount: number, note: string) => {
    if (!currentPlayerId) return false;
    const sender = players[currentPlayerId];
    const receiver = players[receiverId];

    if (amount <= 0 || sender.balance < amount) return false;

    // Execute transfers
    setPlayers((prev) => {
      const next = { ...prev };
      next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance - amount);
      next[receiverId].balance = Math.round(next[receiverId].balance + amount);
      return next;
    });

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      senderId: currentPlayerId,
      senderName: sender.name,
      receiverId,
      receiverName: receiver.name,
      amount,
      timestamp: new Date().toISOString(),
      note,
      status: 'completed',
      category: 'transfer',
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Send instant push notification to recipient
    addNotification(
      receiverId,
      'Money Received!',
      `${sender.name} wired you $${amount.toLocaleString()} with note: "${note}"`,
      'money'
    );
    addNotification(
      currentPlayerId,
      'Wire Sent',
      `Successfully sent $${amount.toLocaleString()} to ${receiver.name}.`,
      'money'
    );

    return true;
  };

  // Peer-to-Peer Request Money
  const requestMoney = (senderId: string, amount: number, note: string) => {
    if (!currentPlayerId) return;
    const requester = players[currentPlayerId];
    const target = players[senderId];

    const newTx: Transaction = {
      id: `req_${Date.now()}`,
      senderId: senderId,
      senderName: target.name,
      receiverId: currentPlayerId,
      receiverName: requester.name,
      amount,
      timestamp: new Date().toISOString(),
      note,
      status: 'pending',
      category: 'request',
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Notify target
    addNotification(
      senderId,
      'Cash Request Received',
      `${requester.name} is requesting $${amount.toLocaleString()} for "${note}". Accept via Ledger page.`,
      'money'
    );
  };

  // Property Market Trading
  const buyProperty = (propertyId: string) => {
    if (!currentPlayerId) return false;
    const buyer = players[currentPlayerId];
    const propIndex = properties.findIndex((p) => p.id === propertyId);
    if (propIndex === -1) return false;

    const property = properties[propIndex];
    if (property.ownerId || buyer.balance < property.currentValue) return false;

    // Swap Ownership
    setPlayers((prev) => {
      const next = { ...prev };
      next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance - property.currentValue);
      return next;
    });

    setProperties((prev) => {
      const copy = [...prev];
      copy[propIndex] = {
        ...copy[propIndex],
        ownerId: currentPlayerId,
        ownershipHistory: [
          {
            playerId: currentPlayerId,
            playerName: buyer.name,
            price: property.currentValue,
            timestamp: new Date().toISOString(),
          },
          ...copy[propIndex].ownershipHistory,
        ],
      };
      return copy;
    });

    // Transaction Note
    const newTx: Transaction = {
      id: `prop_buy_${Date.now()}`,
      senderId: currentPlayerId,
      senderName: buyer.name,
      receiverId: 'PROPERTY_MARKET',
      receiverName: 'Lux Realty Syndicate',
      amount: property.currentValue,
      timestamp: new Date().toISOString(),
      note: `Purchased ${property.name}`,
      status: 'completed',
      category: 'property',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addNotification(
      currentPlayerId,
      'Property Acquired',
      `Congratulations, you now own ${property.name}. You will begin earning $${property.passiveIncome.toLocaleString()} passive yield every 12 seconds.`,
      'property'
    );

    // Global Chat notice
    sendSystemChatMessage(`${buyer.name} has purchased the ${property.name} for $${property.currentValue.toLocaleString()}! 🏰💸`);

    return true;
  };

  const sellProperty = (propertyId: string) => {
    if (!currentPlayerId) return false;
    const seller = players[currentPlayerId];
    const propIndex = properties.findIndex((p) => p.id === propertyId);
    if (propIndex === -1) return false;

    const property = properties[propIndex];
    if (property.ownerId !== currentPlayerId) return false;

    // Resell at 80% market liquidity valuation
    const resaleVal = Math.round(property.currentValue * 0.82);

    setPlayers((prev) => {
      const next = { ...prev };
      next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance + resaleVal);
      return next;
    });

    setProperties((prev) => {
      const copy = [...prev];
      copy[propIndex] = {
        ...copy[propIndex],
        ownerId: null,
        upgradeLevel: 0,
        currentValue: property.basePrice,
        passiveIncome: Math.round(property.basePrice * 0.0075), // base static yield
      };
      return copy;
    });

    // Transaction Ledger
    const newTx: Transaction = {
      id: `prop_sell_${Date.now()}`,
      senderId: 'PROPERTY_MARKET',
      senderName: 'Lux Realty Syndicate',
      receiverId: currentPlayerId,
      receiverName: seller.name,
      amount: resaleVal,
      timestamp: new Date().toISOString(),
      note: `Liquidated ownership of ${property.name}`,
      status: 'completed',
      category: 'property',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addNotification(
      currentPlayerId,
      'Property Liquidated',
      `Successfully sold ${property.name} back to the market for $${resaleVal.toLocaleString()} (82% liquid value).`,
      'property'
    );

    return true;
  };

  const upgradeProperty = (propertyId: string) => {
    if (!currentPlayerId) return false;
    const player = players[currentPlayerId];
    const propIndex = properties.findIndex((p) => p.id === propertyId);
    if (propIndex === -1) return false;

    const property = properties[propIndex];
    if (property.ownerId !== currentPlayerId || property.upgradeLevel >= 3) return false;

    const upgradeCost = Math.round(property.basePrice * 0.45);
    if (player.balance < upgradeCost) return false;

    // Debit cost & execute upgrade
    setPlayers((prev) => {
      const next = { ...prev };
      next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance - upgradeCost);
      return next;
    });

    setProperties((prev) => {
      const copy = [...prev];
      const nextLvl = property.upgradeLevel + 1;
      copy[propIndex] = {
        ...copy[propIndex],
        upgradeLevel: nextLvl,
        // Upgrades increase valuation and heavily boost passive yield index multipliers
        currentValue: Math.round(property.currentValue + upgradeCost),
        passiveIncome: Math.round(property.passiveIncome * 1.6),
      };
      return copy;
    });

    const newTx: Transaction = {
      id: `prop_upg_${Date.now()}`,
      senderId: currentPlayerId,
      senderName: player.name,
      receiverId: 'PROPERTY_MARKET',
      receiverName: 'Metropolitan Builders Inc',
      amount: upgradeCost,
      timestamp: new Date().toISOString(),
      note: `Upgraded ${property.name} to Tier ${property.upgradeLevel + 1}`,
      status: 'completed',
      category: 'property',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addNotification(
      currentPlayerId,
      'Luxury Upgrade Completed',
      `Your property ${property.name} is now Tier ${property.upgradeLevel + 1}! Daily passive cash flow boosted.`,
      'property'
    );

    return true;
  };

  // Live Stock Market Buying and Selling
  const buyStock = (symbol: string, sharesCount: number) => {
    if (!currentPlayerId || sharesCount <= 0) return false;
    const player = players[currentPlayerId];
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) return false;

    const totalCost = Math.round(stock.price * sharesCount);
    if (player.balance < totalCost) return false;

    setPlayers((prev) => {
      const next = { ...prev };
      const currentShares = next[currentPlayerId].portfolio[symbol]?.shares || 0;
      const currentAvg = next[currentPlayerId].portfolio[symbol]?.avgBuyPrice || 0;

      // New weighted cost average
      const nextShares = currentShares + sharesCount;
      const nextAvg = ((currentShares * currentAvg) + totalCost) / nextShares;

      next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance - totalCost);
      next[currentPlayerId].portfolio[symbol] = {
        shares: nextShares,
        avgBuyPrice: parseFloat(nextAvg.toFixed(2)),
      };
      next[currentPlayerId].stats.tradesCount += 1;

      return next;
    });

    // Save transaction
    const newTx: Transaction = {
      id: `stock_buy_${Date.now()}`,
      senderId: currentPlayerId,
      senderName: player.name,
      receiverId: 'STOCK_EXCHANGE',
      receiverName: 'Nasdaq Private Clearing',
      amount: totalCost,
      timestamp: new Date().toISOString(),
      note: `Bought ${sharesCount.toLocaleString()} shares of ${symbol} at $${stock.price}`,
      status: 'completed',
      category: 'stock',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addNotification(
      currentPlayerId,
      'Trades Succeeded',
      `Vance Global cleared purchase of ${sharesCount} shares ${symbol} for $${totalCost.toLocaleString()}`,
      'stock'
    );

    return true;
  };

  const sellStock = (symbol: string, sharesCount: number) => {
    if (!currentPlayerId || sharesCount <= 0) return false;
    const player = players[currentPlayerId];
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) return false;

    const currentShares = player.portfolio[symbol]?.shares || 0;
    if (currentShares < sharesCount) return false;

    const totalRevenue = Math.round(stock.price * sharesCount);

    setPlayers((prev) => {
      const next = { ...prev };
      const remainingShares = currentShares - sharesCount;

      next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance + totalRevenue);

      if (remainingShares === 0) {
        delete next[currentPlayerId].portfolio[symbol];
      } else {
        next[currentPlayerId].portfolio[symbol] = {
          ...next[currentPlayerId].portfolio[symbol],
          shares: remainingShares,
        };
      }
      next[currentPlayerId].stats.tradesCount += 1;

      return next;
    });

    const newTx: Transaction = {
      id: `stock_sell_${Date.now()}`,
      senderId: 'STOCK_EXCHANGE',
      senderName: 'Nasdaq Private Clearing',
      receiverId: currentPlayerId,
      receiverName: player.name,
      amount: totalRevenue,
      timestamp: new Date().toISOString(),
      note: `Sold ${sharesCount.toLocaleString()} shares of ${symbol} at $${stock.price}`,
      status: 'completed',
      category: 'stock',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addNotification(
      currentPlayerId,
      'Position Liquidated',
      `Sold ${sharesCount} shares of ${symbol} for $${totalRevenue.toLocaleString()}`,
      'stock'
    );

    return true;
  };

  // sports betting / peer sportsbook
  const createBet = (
    opponentId: string,
    sport: string,
    matchName: string,
    wager: number,
    prediction: string,
    odds: number
  ) => {
    if (!currentPlayerId || wager <= 0) return;
    const player = players[currentPlayerId];
    if (player.balance < wager) return;

    const newBet: Bet = {
      id: `bet_${Date.now()}`,
      creatorId: currentPlayerId,
      creatorName: player.name,
      opponentId: opponentId,
      opponentName: opponentId === 'ANY' ? 'Any Player' : players[opponentId]?.name || 'Unknown',
      sport,
      matchName,
      wager,
      odds,
      prediction,
      status: 'pending',
    };

    setBets((prev) => [newBet, ...prev]);

    // Debit wager from creator immediately as escrow
    setPlayers((prev) => {
      const next = { ...prev };
      next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance - wager);
      return next;
    });

    addNotification(
      currentPlayerId,
      'Bet Created',
      `Placed $${wager.toLocaleString()} wager on "${matchName}". Funds held in Escrow.`,
      'bet'
    );

    // Notify target opponent if specified
    if (opponentId !== 'ANY') {
      addNotification(
        opponentId,
        'Sports Book Invitation',
        `${player.name} invited you to a high-stakes $${wager.toLocaleString()} wager on "${matchName}"!`,
        'bet'
      );
    } else {
      sendSystemChatMessage(`${player.name} has opened a public $${wager.toLocaleString()} sportsbook wager on "${matchName}" at ${odds}x odds! ⚽🏆`);
    }
  };

  const acceptBet = (betId: string) => {
    if (!currentPlayerId) return;
    const opponent = players[currentPlayerId];
    const betIndex = bets.findIndex((b) => b.id === betId);
    if (betIndex === -1) return;

    const bet = bets[betIndex];
    if (bet.status !== 'pending') return;
    if (opponent.balance < bet.wager) return;

    // Escrow competitor funds as well
    setPlayers((prev) => {
      const next = { ...prev };
      next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance - bet.wager);
      return next;
    });

    setBets((prev) => {
      const copy = [...prev];
      copy[betIndex] = {
        ...copy[betIndex],
        opponentId: currentPlayerId,
        opponentName: opponent.name,
        status: 'accepted',
      };
      return copy;
    });

    addNotification(
      bet.creatorId,
      'Bet Accepted',
      `${opponent.name} accepted your $${bet.wager.toLocaleString()} 스포츠 wager on ${bet.matchName}! Match is locked.`,
      'bet'
    );
    addNotification(
      currentPlayerId,
      'Bet Accepted',
      `Locked into a $${bet.wager.toLocaleString()} wager with ${bet.creatorName}. Match is pending outcome.`,
      'bet'
    );
  };

  const resolveBet = (betId: string, winnerId: string) => {
    const betIndex = bets.findIndex((b) => b.id === betId);
    if (betIndex === -1) return;

    const bet = bets[betIndex];
    if (bet.status !== 'accepted') return;

    const totalPot = Math.round(bet.wager * 2);

    setPlayers((prev) => {
      const next = { ...prev };
      if (next[winnerId]) {
        next[winnerId].balance = Math.round(next[winnerId].balance + totalPot);
        next[winnerId].stats.betsWon += 1;
      }
      return next;
    });

    setBets((prev) => {
      const copy = [...prev];
      copy[betIndex] = {
        ...copy[betIndex],
        status: winnerId === bet.creatorId ? 'won' : 'lost',
        resolutionDetails: `Resolved: Winner declared ${players[winnerId]?.name || winnerId}`,
      };
      return copy;
    });

    const loserId = winnerId === bet.creatorId ? bet.opponentId : bet.creatorId;

    // Audit logs
    const newTx: Transaction = {
      id: `bet_res_${Date.now()}`,
      senderId: loserId,
      senderName: players[loserId]?.name || 'Loser',
      receiverId: winnerId,
      receiverName: players[winnerId]?.name || 'Winner',
      amount: bet.wager,
      timestamp: new Date().toISOString(),
      note: `Wager Payout resolved for: ${bet.matchName}`,
      status: 'completed',
      category: 'casino',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addNotification(
      winnerId,
      'Wager Won! 🏆',
      `Congratulations, you won the $${bet.wager.toLocaleString()} sports wager. $${totalPot.toLocaleString()} pot has been wired.`,
      'bet'
    );

    if (loserId) {
      addNotification(
        loserId,
        'Wager Lost',
        `Your $${bet.wager.toLocaleString()} sports wager on ${bet.matchName} ended in a loss. Better luck next game.`,
        'bet'
      );
    }
  };

  // Player Challenges Gating
  const sendChallenge = (opponentId: string, gameType: Challenge['gameType'], wager: number) => {
    if (!currentPlayerId || wager <= 0) return;
    const player = players[currentPlayerId];
    if (player.balance < wager) return;

    const newChallenge: Challenge = {
      id: `chal_${Date.now()}`,
      creatorId: currentPlayerId,
      creatorName: player.name,
      opponentId,
      opponentName: players[opponentId].name,
      gameType,
      wager,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    setChallenges((prev) => [newChallenge, ...prev]);

    addNotification(
      currentPlayerId,
      'PvP Challenge Issued',
      `Sent a high-stakes $${wager.toLocaleString()} ${gameType} invitation to ${players[opponentId].name}.`,
      'challenge'
    );

    addNotification(
      opponentId,
      'PvP Challenge Invitation! 🎮',
      `${player.name} sent you a challenge invite for ${gameType} with a huge $${wager.toLocaleString()} pot!`,
      'challenge'
    );
  };

  const acceptChallenge = (challengeId: string) => {
    if (!currentPlayerId) return;
    const opponent = players[currentPlayerId];
    const challengeIdx = challenges.findIndex((c) => c.id === challengeId);
    if (challengeIdx === -1) return;

    const challenge = challenges[challengeIdx];
    if (challenge.opponentId !== currentPlayerId || challenge.status !== 'pending') return;
    if (opponent.balance < challenge.wager) return;

    setChallenges((prev) => {
      const copy = [...prev];
      copy[challengeIdx] = {
        ...copy[challengeIdx],
        status: 'accepted',
      };
      return copy;
    });

    addNotification(
      challenge.creatorId,
      'Challenge Accepted!',
      `${opponent.name} accepted your $${challenge.wager.toLocaleString()} ${challenge.gameType} challenge! Tournament starting...`,
      'challenge'
    );
    addNotification(
      currentPlayerId,
      'We are live! 🏁',
      `Accepted challenge against ${challenge.creatorName}. Play or run auto-resolve tournament.`,
      'challenge'
    );
  };

  const declineChallenge = (challengeId: string) => {
    const challengeIdx = challenges.findIndex((c) => c.id === challengeId);
    if (challengeIdx === -1) return;

    const challenge = challenges[challengeIdx];
    setChallenges((prev) => prev.filter((c) => c.id !== challengeId));

    addNotification(
      challenge.creatorId,
      'Challenge Declined',
      `${players[challenge.opponentId]?.name || 'Opponent'} declined your challenge request.`,
      'challenge'
    );
  };

  const resolveChallenge = (challengeId: string, winnerId: string) => {
    const challengeIdx = challenges.findIndex((c) => c.id === challengeId);
    if (challengeIdx === -1) return;

    const challenge = challenges[challengeIdx];
    if (challenge.status !== 'accepted') return;

    const loserId = winnerId === challenge.creatorId ? challenge.opponentId : challenge.creatorId;
    const amount = challenge.wager;

    setPlayers((prev) => {
      const next = { ...prev };
      if (next[winnerId] && next[loserId]) {
        next[winnerId].balance = Math.round(next[winnerId].balance + amount);
        next[loserId].balance = Math.round(next[loserId].balance - amount);
      }
      return next;
    });

    setChallenges((prev) => {
      const copy = [...prev];
      copy[challengeIdx] = {
        ...copy[challengeIdx],
        status: 'completed',
        winnerId,
      };
      return copy;
    });

    const newTx: Transaction = {
      id: `chal_tx_${Date.now()}`,
      senderId: loserId,
      senderName: players[loserId].name,
      receiverId: winnerId,
      receiverName: players[winnerId].name,
      amount,
      timestamp: new Date().toISOString(),
      note: `Won PvP ${challenge.gameType} Tournament`,
      status: 'completed',
      category: 'casino',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addNotification(
      winnerId,
      'PvP Victory! 🏆',
      `You crushed the challenge and won $${amount.toLocaleString()} from ${players[loserId].name}!`,
      'challenge'
    );
    addNotification(
      loserId,
      'PvP Defeat',
      `You lost the ${challenge.gameType} duel. $${amount.toLocaleString()} has been transferred to ${players[winnerId].name}.`,
      'challenge'
    );

    // Chat update
    sendSystemChatMessage(`📢 PvP Clash: ${players[winnerId].name} beats ${players[loserId].name} in ${challenge.gameType} and claims the $${amount.toLocaleString()} wager! 🎮🥇`);
  };

  // casino mini-games
  const playCasino = (
    gameType: 'slots' | 'dice' | 'coin' | 'roulette' | 'blackjack',
    wager: number,
    data?: any
  ) => {
    if (!currentPlayerId || wager <= 0) return { won: false, payout: 0, message: 'Invalid settings' };
    const player = players[currentPlayerId];
    if (player.balance < wager) return { won: false, payout: 0, message: 'Insufficient Balance' };

    let won = false;
    let payout = 0;
    let message = '';
    let cardResult: any = null;

    // Simulate RNG Gamble
    if (gameType === 'slots') {
      const symbolsList = ['👑', '💎', '🍒', '🔔', '👑', '🃏', '⚜️'];
      const r1 = symbolsList[Math.floor(Math.random() * symbolsList.length)];
      const r2 = symbolsList[Math.floor(Math.random() * symbolsList.length)];
      const r3 = symbolsList[Math.floor(Math.random() * symbolsList.length)];

      const reelStr = `[ ${r1} | ${r2} | ${r3} ]`;

      if (r1 === r2 && r2 === r3) {
        won = true;
        payout = r1 === '👑' ? wager * 15 : wager * 8;
        message = `JACKPOT! ${reelStr} You scored matching ${r1}!`;
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        won = true;
        payout = Math.round(wager * 2.2);
        message = `Double Tier! ${reelStr} Matching payout!`;
      } else {
        won = false;
        payout = 0;
        message = `No Match! ${reelStr} Better luck next spin.`;
      }
    } else if (gameType === 'coin') {
      const choice = data?.guess || 'heads';
      const flip = Math.random() < 0.5 ? 'heads' : 'tails';
      if (choice === flip) {
        won = true;
        payout = Math.round(wager * 1.95);
        message = `Landed Head-up: ${flip.toUpperCase()}. Perfect prediction!`;
      } else {
        won = false;
        payout = 0;
        message = `Landed Head-up: ${flip.toUpperCase()}. Wrong side chosen.`;
      }
    } else if (gameType === 'dice') {
      const predictionValue = data?.guessNum || 4; // number chosen 1-6
      const roll1 = Math.floor(Math.random() * 6) + 1;
      const roll2 = Math.floor(Math.random() * 6) + 1;
      const total = roll1 + roll2;

      // Guessing Sum parity (even or odd) or range
      const formatGuess = data?.parity || 'even';
      const isEven = total % 2 === 0;

      if ((formatGuess === 'even' && isEven) || (formatGuess === 'odd' && !isEven)) {
        won = true;
        payout = Math.round(wager * 1.9);
        message = `Rolled: [${roll1}] + [${roll2}] = ${total}. Matches ${formatGuess.toUpperCase()}!`;
      } else {
        won = false;
        payout = 0;
        message = `Rolled: [${roll1}] + [${roll2}] = ${total}. Parity mismatched!`;
      }
    } else if (gameType === 'roulette') {
      const betCategory = data?.target || 'red'; // 'red' | 'black' | 'green' | 'number'
      const numResult = Math.floor(Math.random() * 37); // 0-36

      let cellColor = 'black';
      if (numResult === 0) cellColor = 'green';
      else if ([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(numResult)) {
        cellColor = 'red';
      }

      if (betCategory === cellColor) {
        won = true;
        payout = cellColor === 'green' ? wager * 35 : Math.round(wager * 2.0);
        message = `Wheel stopped on ${numResult} (${cellColor.toUpperCase()}). You hit color perfectly!`;
      } else if (typeof betCategory === 'number' && betCategory === numResult) {
        won = true;
        payout = wager * 35;
        message = `BINGO! Stopped exactly on Number ${numResult}! 35x Payout!`;
      } else {
        won = false;
        payout = 0;
        message = `Wheel stopped on ${numResult} (${cellColor.toUpperCase()}). Defeat.`;
      }
    } else if (gameType === 'blackjack') {
      // Very simple blackjack simulator
      const playerHand = Math.floor(Math.random() * 11) + 11; // 11-21
      const dealerHand = Math.floor(Math.random() * 10) + 12; // 12-22

      cardResult = { playerHand, dealerHand };

      if (playerHand > 21) {
        won = false;
        payout = 0;
        message = `Bust! You held ${playerHand}.`;
      } else if (dealerHand > 21 || playerHand > dealerHand) {
        won = true;
        payout = Math.round(wager * 2);
        message = `Victory! Your hand is ${playerHand} vs Dealer's ${dealerHand}.`;
      } else if (playerHand === dealerHand) {
        won = true;
        payout = wager; // push
        message = `Push! Tie hand at ${playerHand}. Refund issued.`;
      } else {
        won = false;
        payout = 0;
        message = `Defeat. Dealer held ${dealerHand} against your ${playerHand}.`;
      }
    }

    // Process Balance Transfers
    setPlayers((prev) => {
      const next = { ...prev };
      if (won) {
        next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance - wager + payout);
        next[currentPlayerId].stats.casinoWon = Math.round(next[currentPlayerId].stats.casinoWon + payout);
      } else {
        next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance - wager);
      }
      return next;
    });

    // Write Ledger
    const finalVariance = won ? (payout - wager) : -wager;
    const newTx: Transaction = {
      id: `casino_spin_${Date.now()}`,
      senderId: finalVariance >= 0 ? 'CASINO' : currentPlayerId,
      senderName: 'Capital Kings Gold Casino',
      receiverId: finalVariance >= 0 ? currentPlayerId : 'CASINO',
      receiverName: 'Capital Kings Gold Casino',
      amount: Math.abs(finalVariance),
      timestamp: new Date().toISOString(),
      note: `Played ${gameType.toUpperCase()}: ${message}`,
      status: 'completed',
      category: 'casino',
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (won && payout > wager * 3) {
      addNotification(
        currentPlayerId,
        'Las Vegas Hit! 🎰💰',
        `Huge payout cleared! Your wallet is credited $${payout.toLocaleString()} on ${gameType}!`,
        'casino'
      );
    }

    return { won, payout, message, cardResult };
  };

  // Loans System
  const takeLoan = (amount: number) => {
    if (!currentPlayerId || amount <= 0) return false;
    const player = players[currentPlayerId];

    // Max loan is 50% of net worth
    const maxCreditive = Math.round(player.netWorth * 0.5);
    const existingLoanSec = loans[currentPlayerId] ? loans[currentPlayerId].amount : 0;

    if (amount + existingLoanSec > maxCreditive) return false;

    // Credit funds
    setPlayers((prev) => {
      const next = { ...prev };
      next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance + amount);
      return next;
    });

    setLoans((prev) => {
      const activeObj = prev[currentPlayerId];
      const sumAmount = (activeObj ? activeObj.amount : 0) + amount;
      return {
        ...prev,
        [currentPlayerId]: {
          id: `loan_${currentPlayerId}`,
          playerId: currentPlayerId,
          amount: sumAmount,
          interestRate: 0.05,
          dueDate: new Date(Date.now() + 5 * 60000).toISOString(), // 5 mins
        },
      };
    });

    const newTx: Transaction = {
      id: `loan_take_${Date.now()}`,
      senderId: 'BANK',
      senderName: 'Capital Reserve Vault',
      receiverId: currentPlayerId,
      receiverName: player.name,
      amount,
      timestamp: new Date().toISOString(),
      note: 'Federal Bank Line of Credit Credit',
      status: 'completed',
      category: 'loan',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addNotification(
      currentPlayerId,
      'Loan Approved',
      `Bank credited $${amount.toLocaleString()} line of credit. Interest rate is 5% charged per cycle. Due soon.`,
      'loan'
    );

    return true;
  };

  const payLoan = () => {
    if (!currentPlayerId) return;
    const activePlayer = players[currentPlayerId];
    const originalLoan = loans[currentPlayerId];
    if (!originalLoan) return;

    if (activePlayer.balance < originalLoan.amount) {
      addNotification(currentPlayerId, 'Repayment Failed', 'Insufficient liquid cash to pay back the bank loan.', 'loan');
      return;
    }

    // Debit player
    setPlayers((prev) => {
      const next = { ...prev };
      next[currentPlayerId].balance = Math.round(next[currentPlayerId].balance - originalLoan.amount);
      return next;
    });

    setLoans((prev) => {
      const copy = { ...prev };
      delete copy[currentPlayerId];
      return copy;
    });

    const newTx: Transaction = {
      id: `loan_pay_${Date.now()}`,
      senderId: currentPlayerId,
      senderName: activePlayer.name,
      receiverId: 'BANK',
      receiverName: 'Capital Reserve Vault',
      amount: originalLoan.amount,
      timestamp: new Date().toISOString(),
      note: 'Accrued bank line fully repaid',
      status: 'completed',
      category: 'loan',
    };
    setTransactions((prev) => [newTx, ...prev]);

    addNotification(currentPlayerId, 'Interest Credit Restored', 'Bank loan fully repaid. Line of credit is clean.', 'loan');
  };

  // Real-time Chat Dispatcher
  const sendChatMessage = (text: string, receiverId = 'global') => {
    if (!currentPlayerId || text.trim() === '') return;
    const player = players[currentPlayerId];

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentPlayerId,
      senderName: player.name,
      senderAvatar: player.avatar,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  const sendSystemChatMessage = (text: string) => {
    const sysMsg: Message = {
      id: `msg_sys_${Date.now()}`,
      senderId: 'system',
      senderName: '👑 KINGS MODERATOR',
      senderAvatar: '🛡️',
      receiverId: 'global',
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, sysMsg]);
  };

  // Admin Modifications
  const adminModifyBalance = (playerId: string, amount: number) => {
    setPlayers((prev) => {
      const next = { ...prev };
      if (next[playerId]) {
        next[playerId].balance = Math.round(Math.max(0, next[playerId].balance + amount));
      }
      return next;
    });

    const adminTx: Transaction = {
      id: `tx_admin_${Date.now()}`,
      senderId: 'ADMIN',
      senderName: 'SYSTEM ADMIN',
      receiverId: playerId,
      receiverName: players[playerId]?.name || 'Unknown',
      amount: Math.abs(amount),
      timestamp: new Date().toISOString(),
      note: `Admin direct adjustment: ${amount >= 0 ? 'Granted' : 'Deducted'}`,
      status: 'completed',
      category: 'admin',
    };
    setTransactions((prev) => [adminTx, ...prev]);

    addNotification(
      playerId,
      'Admin Adjustment',
      `An administrator has adjusted your balance by ${amount >= 0 ? '+' : ''}$${amount.toLocaleString()}.`,
      'money'
    );
  };

  const adminBanUser = (playerId: string, banStat: boolean) => {
    setPlayers((prev) => {
      const next = { ...prev };
      if (next[playerId]) {
        next[playerId].isBan = banStat;
        next[playerId].status = banStat ? 'offline' : 'online';
      }
      return next;
    });

    if (banStat && currentPlayerId === playerId) {
      logout();
    }
  };

  const adminResetAll = () => {
    setPlayers(initialPlayers);
    setTransactions([]);
    setProperties(initialProperties);
    setStocks(initialStocks);
    setBets([]);
    setChallenges([]);
    setLoans({});
    setNotifications([]);
    setMessages([
      { id: 'msg_1', senderId: 'leroy', senderName: 'Dr. Leroy', senderAvatar: '🩺', receiverId: 'global', text: 'System economy reset successfully!', timestamp: new Date().toISOString() }
    ]);
    setActiveMarketEvent(null);
  };

  const clearNotifications = () => {
    if (!currentPlayerId) return;
    setNotifications((prev) =>
      prev.map((notif) => (notif.playerId === currentPlayerId ? { ...notif, read: true } : notif))
    );
  };

  // MANUAL Trigger Event
  const triggerEvent = (eventType: string) => {
    let title = '';
    let desc = '';
    let eventMod = 1.0;

    switch (eventType) {
      case 'crash':
        title = '📉 BLACK MONDAY CRASH';
        desc = 'Fears of inflation trigger wholesale capitulation on Wall Street! All stock values decreased 25%.';
        // Chop stocks
        setStocks((prev) =>
          prev.map((st) => {
            const lowAmt = Math.round(st.price * 0.75);
            return {
              ...st,
              price: lowAmt,
              changePercent: -25,
              history: [...st.history.slice(1), lowAmt],
            };
          })
        );
        sendSystemChatMessage('⛔ CRITICAL: A massive stock market crash has occurred! Stocks drop 25% across all indices! 📉💔');
        break;
      case 'rally':
        title = '🚀 MEGA CRYPTO/FINTECH RALLY';
        desc = 'Unprecedented volume floods markets. COIN and BTC soar by 40%!';
        setStocks((prev) =>
          prev.map((st) => {
            if (st.symbol === 'COIN' || st.symbol === 'BTC') {
              const highAmt = Math.round(st.price * 1.4);
              return {
                ...st,
                price: highAmt,
                changePercent: 40,
                history: [...st.history.slice(1), highAmt],
              };
            }
            return st;
          })
        );
        sendSystemChatMessage('🔥 CRITICAL: Bull run rally activated! Bitcoin indices and fintech assets are skyrocketing! 🚀📈');
        break;
      case 'tax':
        title = '🏛️ FEDERAL WEALTH LEVY DUE';
        desc = 'The National Inland Revenue levies a flat 3.5% wealth tax on all net assets!';
        setPlayers((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((id) => {
            const taxAmt = Math.round(next[id].netWorth * 0.035);
            if (taxAmt > 0) {
              next[id].balance = Math.max(100000, Math.round(next[id].balance - taxAmt));
              addNotification(id, 'Government Revenue Tax', `Liquid funds taxed $${taxAmt.toLocaleString()} (3.5% net tax).`, 'loan');
            }
          });
          return next;
        });
        sendSystemChatMessage('🏛️ ALERT: Tax Day! Internal Revenue service completes state audit. Wealthy citizens taxed 3.5%!');
        break;
      case 'inflation':
        title = '💸 HYPER-INFLATION EXPLODING';
        desc = 'Central currency is diluted. Properties inflate in value by 20%, but cash reserves lose 5% value.';
        setProperties((prev) =>
          prev.map((pr) => ({ ...pr, currentValue: Math.round(pr.currentValue * 1.2) }))
        );
        setPlayers((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((id) => {
            next[id].balance = Math.round(next[id].balance * 0.95);
            addNotification(id, 'Inflation Impact', 'Widespread cash dilution. Balances decreased by 5%, property values inflated 20%.', 'property');
          });
          return next;
        });
        sendSystemChatMessage('💸 ALERT: Hyper-inflation triggers asset index increases! Land values skyrocket 20% while cash loses power!');
        break;
    }

    setActiveMarketEvent({ title, desc, type: eventType });
    setTimeout(() => {
      setActiveMarketEvent(null);
    }, 15000); // clears visual in 15 seconds
  };

  // ==========================================
  // REAL-TIME CLOCK TICK ENGINE (6S SEC INTERVALS)
  // Maintains passive income, stock fluctuations, bot behaviors
  // ==========================================
  useEffect(() => {
    const cycle = setInterval(() => {
      // 1. TOCK STOCKS
      setStocks((prev) =>
        prev.map((st) => {
          // Volatility fluctuation
          const swing = (Math.random() * 2 - 1) * st.volatility; // bounds volatility
          const baseChange = swing * st.price;
          const targetPrice = Math.max(1, parseFloat((st.price + baseChange).toFixed(2)));

          const isGain = targetPrice >= st.price;
          const diff = parseFloat((((targetPrice - st.price) / st.price) * 100).toFixed(1));

          const nextHist = [...st.history.slice(1), targetPrice];

          return {
            ...st,
            price: targetPrice,
            changePercent: diff,
            high: targetPrice > st.high ? targetPrice : st.high,
            low: targetPrice < st.low ? targetPrice : st.low,
            history: nextHist,
          };
        })
      );

      // 2. DISBURSE DEPOSITED PROPERTIES INCOME (EVERY 2 CYCLES = 12 SECONDS)
      properties.forEach((prop, idx) => {
        if (prop.ownerId) {
          const ownerId = prop.ownerId;
          const yieldPay = prop.passiveIncome;

          setPlayers((prev) => {
            const copy = { ...prev };
            if (copy[ownerId]) {
              copy[ownerId].balance = Math.round(copy[ownerId].balance + yieldPay);
            }
            return copy;
          });

          addNotification(
            ownerId,
            'Passive Royalty Received',
            `Received $${yieldPay.toLocaleString()} passive royalty from ${prop.name}.`,
            'property'
          );
        }
      });

      // 3. SECURE LOAN INTEREST CHARGES
      Object.keys(loans).forEach((pId) => {
        const activeLoan = loans[pId];
        const interestCost = Math.round(activeLoan.amount * 0.05);

        setPlayers((prev) => {
          const next = { ...prev };
          if (next[pId]) {
            next[pId].balance = Math.max(0, Math.round(next[pId].balance - interestCost));
            addNotification(pId, 'Bank Debt Interest', `Charged $${interestCost.toLocaleString()} (5% recurring index interest).`, 'loan');
          }
          return next;
        });
      });

      // 4. RANDOM AUTOMATED BOT MOVES & CHATS
      // Select a random bot that isn't the current user
      const botPool = ['cay', 'brook', 'leroy', 'sol', 'yonny'].filter((id) => id !== currentPlayerId);
      const randomBotId = botPool[Math.floor(Math.random() * botPool.length)];

      if (randomBotId) {
        const bot = players[randomBotId];
        const dice = Math.random();

        // 35% chance a bot acts per tick
        if (dice < 0.35) {
          const subDice = Math.random();

          if (subDice < 0.50) {
            // Action C: Send challenge to active user (if logged in!)
            if (currentPlayerId) {
              const targetUser = players[currentPlayerId];
              const wagerAmount = Math.round(Math.min(targetUser.balance * 0.05, 1000000));

              if (wagerAmount > 0) {
                const gameOptions: Challenge['gameType'][] = ['FIFA', 'Monopoly', 'Basketball', 'Custom'];
                const randGame = gameOptions[Math.floor(Math.random() * gameOptions.length)];

                // Check duplicates to prevent spam
                const hasPending = challenges.some(
                  (c) => c.status === 'pending' && c.creatorId === randomBotId && c.opponentId === currentPlayerId
                );

                if (!hasPending) {
                  const newChal: Challenge = {
                    id: `bot_chal_${Date.now()}`,
                    creatorId: randomBotId,
                    creatorName: bot.name,
                    opponentId: currentPlayerId,
                    opponentName: targetUser.name,
                    gameType: randGame,
                    wager: wagerAmount,
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                  };

                  setChallenges((prev) => [newChal, ...prev]);
                  addNotification(
                    currentPlayerId,
                    'PvP Challenge Issued! ⚔️',
                    `${bot.name} is challenging you in ${randGame} with a $${wagerAmount.toLocaleString()} wager! Accept in Challenges page.`,
                    'challenge'
                  );
                }
              }
            }
          } else {
            // Action D: High stakes sportsbook open bet
            const wags = Math.round(bot.balance * 0.02);
            if (wags > 50000) {
              const matchesList = [
                { match: 'Lakers vs Celtics (NBA)', sport: 'NBA' },
                { match: 'Chiefs vs Eagles (NFL)', sport: 'NFL' },
                { match: 'Real Madrid vs Man City (UEFA)', sport: 'Champions League' },
              ];
              const match = matchesList[Math.floor(Math.random() * matchesList.length)];

              const newBet: Bet = {
                id: `bot_bet_${Date.now()}`,
                creatorId: randomBotId,
                creatorName: bot.name,
                opponentId: 'ANY',
                opponentName: 'Any Player',
                sport: match.sport,
                matchName: match.match,
                wager: wags,
                odds: 1.85,
                prediction: `${bot.name} selected side`,
                status: 'pending',
              };

              setBets((prev) => [newBet, ...prev]);
              setPlayers((prev) => {
                const next = { ...prev };
                next[randomBotId].balance = Math.round(next[randomBotId].balance - wags);
                return next;
              });
            }
          }
        }
      }

      // 5. AUTO-RESOLVE TOURNAMENTS
      // Auto-accept/resolve user initiated bets or challenges to simulate multiplayer activity
      setChallenges((prev) => {
        let changed = false;
        const mapped = prev.map((chal) => {
          // If the player challenged a Bot, simulate a chance they accept and play it!
          if (chal.status === 'pending' && chal.opponentId !== currentPlayerId) {
            const opponentBotId = chal.opponentId;
            const botObj = players[opponentBotId];

            if (botObj && botObj.balance > chal.wager && Math.random() < 0.4) {
              // Bot accepts!
              changed = true;
              return { ...chal, status: 'accepted' };
            }
          }
          return chal;
        });

        return changed ? mapped : prev;
      });

      // Simulating completion of accepted challenges
      setChallenges((prev) => {
        let changed = false;
        const mapped = prev.map((chal) => {
          if (chal.status === 'accepted') {
            // Finish the match!
            changed = true;
            const isCreatorWins = Math.random() < 0.52; // slight home advantage
            const winnerId = isCreatorWins ? chal.creatorId : chal.opponentId;

            setTimeout(() => {
              resolveChallenge(chal.id, winnerId);
            }, 500);

            return { ...chal, status: 'completed', winnerId };
          }
          return chal;
        });
        return changed ? mapped : prev;
      });
    }, 6000); // 6 Sec tick

    return () => clearInterval(cycle);
  }, [players, currentPlayerId, properties, stocks, challenges, bets, loans]);

  return (
    <GameContext.Provider
      value={{
        players,
        currentPlayerId,
        transactions,
        properties,
        stocks,
        bets,
        challenges,
        messages,
        notifications,
        activeMarketEvent,
        lastBackup,
        login,
        logout,
        resetPin,
        sendMoney,
        requestMoney,
        buyProperty,
        sellProperty,
        upgradeProperty,
        buyStock,
        sellStock,
        createBet,
        acceptBet,
        resolveBet,
        sendChallenge,
        acceptChallenge,
        declineChallenge,
        resolveChallenge,
        playCasino,
        addNotification,
        sendChatMessage,
        takeLoan,
        payLoan,
        triggerEvent,
        adminModifyBalance,
        adminBanUser,
        adminResetAll,
        clearNotifications,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be initialized inside a GameProvider');
  return context;
};
