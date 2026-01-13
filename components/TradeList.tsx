
import React, { useState, useMemo } from 'react';
import { Trade, TradeSide, Account, TradingSession, MarketBias } from '../types';

interface TradeListProps {
  trades: Trade[];
  account: Account;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
}

const TradeList: React.FC<TradeListProps> = ({ trades, account, onEdit, onDelete, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState<string>('All');

  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      const matchesSearch = t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.setups.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSession = sessionFilter === 'All' || t.session === sessionFilter;
      return matchesSearch && matchesSession;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades, searchTerm, sessionFilter]);

  const getBiasStyles = (bias: MarketBias) => {
    switch (bias) {
      case MarketBias.BULLISH: return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case MarketBias.BEARISH: return 'text-rose-500 bg-rose-50 border-rose-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  const getSessionStyles = (session: TradingSession) => {
    switch (session) {
      case TradingSession.LONDON: return 'bg-blue-50 text-blue-600 border-blue-100';
      case TradingSession.NY: return 'bg-amber-50 text-amber-600 border-amber-100';
      case TradingSession.ASIA: return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
        <div className="flex flex-1 gap-4 w-full">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search symbol or setup..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
          >
            <option value="All">All Sessions</option>
            {Object.values(TradingSession).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button 
          onClick={onExport}
          className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-50 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Context</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SMC Setup</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">R-Profit</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net P/L</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      <p className="text-sm font-bold uppercase tracking-widest">No matching trades found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrades.map(trade => (
                  <tr key={trade.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 tracking-tight">{trade.symbol}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${trade.side === TradeSide.BUY ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {trade.side}
                          </span>
                          <span className="text-[10px] font-bold text-slate-300">{trade.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black w-fit uppercase tracking-wider ${getSessionStyles(trade.session)}`}>
                          {trade.session}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black w-fit uppercase tracking-wider ${getBiasStyles(trade.bias)}`}>
                          {trade.bias} Bias
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-2 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {trade.setups.map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[8px] font-black uppercase border border-slate-200">
                              {s}
                            </span>
                          ))}
                          {trade.setups.length === 0 && <span className="text-[10px] text-slate-300 italic">No tags</span>}
                        </div>
                        {trade.mistake && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider line-clamp-1">{trade.mistake}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`px-8 py-5 text-sm font-black text-right tracking-tight ${trade.resultR >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {trade.resultR >= 0 ? '+' : ''}{trade.resultR.toFixed(2)}R
                    </td>
                    <td className={`px-8 py-5 text-sm font-black text-right tracking-tight ${trade.result >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {trade.result >= 0 ? '+' : ''}{trade.result.toFixed(2)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => onEdit(trade)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all hover:shadow-sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => onDelete(trade.id)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all hover:shadow-sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradeList;
