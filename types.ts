
export enum TradeSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum TradingSession {
  ASIA = 'Asia',
  LONDON = 'London',
  NY = 'New York',
  NY_CLOSE = 'NY Close'
}

export enum MarketBias {
  BULLISH = 'Bullish',
  BEARISH = 'Bearish',
  NEUTRAL = 'Neutral'
}

export enum SetupTag {
  OB = 'Order Block',
  FVG = 'Fair Value Gap',
  BMS = 'Break of Market Structure',
  LIQ = 'Liquidity Sweep',
  CHOCH = 'Change of Character',
  VEC = 'Volume Imbalance'
}

export interface Trade {
  id: string;
  accountId: string;
  date: string;
  symbol: string;
  side: TradeSide;
  session: TradingSession;
  bias: MarketBias;
  entry: number;
  sl: number;
  tp: number;
  rr: number;
  result: number; // Profit/Loss in currency
  resultR: number; // Profit/Loss in R-multiple
  setups: SetupTag[];
  notes: string;
  mistake?: string;
}

export interface Account {
  id: string;
  name: string;
  broker: string;
  initialBalance: number;
  currency: string;
}

export interface PerformanceStats {
  winRate: number;
  expectancy: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  totalTrades: number;
  totalR: number;
  equityCurve: { date: string; balance: number }[];
}
