
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
  },
  exportToCSV: (trades: Trade[]) => {
    if (trades.length === 0) return;
    const headers = ["Date", "Symbol", "Side", "Session", "Bias", "Entry", "SL", "TP", "Result", "ResultR", "Setups", "Mistake", "Notes"];
    const rows = trades.map(t => [
      t.date,
      t.symbol,
      t.side,
      t.session,
      t.bias,
      t.entry,
      t.sl,
      t.tp,
      t.result,
      t.resultR,
      t.setups.join('|'),
      t.mistake || '',
      `"${t.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `QuantEdge_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
