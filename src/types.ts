/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Player {
  id: string; // 'cay' | 'brooke' | 'leroy' | 'sol' | 'yonny'
  name: string;
  avatar: string; // URL or emoji-based visual
  status: 'online' | 'busy' | 'offline';
  netWorth: number;
  balance: number;
  unlockedProperties: string[]; // item IDs
  portfolio: {
    [symbol: string]: {
      shares: number;
      avgBuyPrice: number;
    }
  };
  stats: {
    totalBets: number;
    betsWon: number;
    casinoWon: number;
    propertiesOwned: number;
    tradesCount: number;
  };
  pin: string; // 4-digit PIN string
  failedPinAttempts: number;
  lockedUntil: string | null; // ISO string if locked
  isBan: boolean;
  streak: number;
  lastLoginDate: string | null;
}

export interface BankLoan {
  id: string;
  playerId: string;
  amount: number;
  interestRate: number; // e.g. 0.05 for 5%
  dueDate: string;
}

export interface Transaction {
  id: string;
  senderId: string | 'BANK' | 'STOCK_EXCHANGE' | 'CASINO' | 'PROPERTY_MARKET' | 'ADMIN';
  senderName: string;
  receiverId: string | 'BANK' | 'STOCK_EXCHANGE' | 'CASINO' | 'PROPERTY_MARKET' | 'ADMIN';
  receiverName: string;
  amount: number;
  timestamp: string;
  note: string;
  status: 'completed' | 'pending' | 'rejected';
  category: 'transfer' | 'request' | 'stock' | 'property' | 'casino' | 'loan' | 'tax' | 'dividend' | 'admin';
}

export interface Property {
  id: string;
  name: string;
  type: 'mansion' | 'apartment' | 'hotel' | 'island' | 'business' | 'stadium';
  basePrice: number;
  currentValue: number;
  passiveIncome: number; // generated per tick (e.g. per 10s)
  ownerId: string | null; // null if unowned
  upgradeLevel: number; // 0 to 3
  image: string;
  marketTrend: 'up' | 'down' | 'stable';
  ownershipHistory: {
    playerId: string;
    playerName: string;
    price: number;
    timestamp: string;
  }[];
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  history: number[]; // array of last N prices for live chart
  high: number;
  low: number;
  changePercent: number;
  volatility: number; // 0 to 1 value
  marketCap: string;
}

export interface Bet {
  id: string;
  creatorId: string;
  creatorName: string;
  opponentId: string; // specific player or 'ANY'
  opponentName: string;
  sport: string; // 'NBA' | 'NFL' | 'Champions League' | 'FIFA wagers'
  matchName: string; // Lakers vs Celtics, etc.
  wager: number;
  odds: number; // e.g., 2.0 (Even)
  prediction: string; // e.g., "Lakers to win"
  status: 'pending' | 'accepted' | 'won' | 'lost' | 'declined';
  resolutionDetails?: string;
}

export interface Challenge {
  id: string;
  creatorId: string;
  creatorName: string;
  opponentId: string;
  opponentName: string;
  gameType: 'FIFA' | 'Monopoly' | 'Basketball' | 'Custom';
  wager: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  winnerId?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  playerId: string;
  title: string;
  message: string;
  category: 'money' | 'bet' | 'property' | 'stock' | 'challenge' | 'casino' | 'rank' | 'market_event' | 'loan';
  timestamp: string;
  read: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: 'global' | string; // 'global' or specific player ID
  text: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  avatar: string;
  netWorth: number;
  balance: number;
  propertiesCount: number;
  rank: number;
}
