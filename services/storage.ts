
import { Account, Trade } from '../types';

const STORAGE_KEYS = {
  ACCOUNTS: 'qe_accounts',
  TRADES: 'qe_trades'
};

export const storage = {
  getAccounts: (): Account[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },
  saveAccounts: (accounts: Account[]) => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },
  getTrades: (): Trade[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRADES);
    return data ? JSON.parse(data) : [];
  },
  saveTrades: (trades: Trade[]) => {
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  }
};
