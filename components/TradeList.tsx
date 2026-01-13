
import React from 'react';
import { Trade, TradeSide, Account, TradingSession, MarketBias } from '../types';

interface TradeListProps {
  trades: Trade[];
  account: Account;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

const TradeList: React.FC<TradeListProps> = ({ trades, account, onEdit, onDelete }) => {
  const getBiasColor = (bias: MarketBias) => {
    switch (bias) {
      case MarketBias.BULLISH: return 'text-emerald-500';
      case MarketBias.BEARISH: return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  const getSessionColor = (session: TradingSession) => {
    switch (session) {
      case TradingSession.LONDON: return 'bg-blue-50 text-blue-600 border-blue-100';
      case TradingSession.NY: return 'bg-amber-50 text-amber-600 border-amber-100';
      case TradingSession.ASIA: return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Setup</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">R-Profit</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">P/L ({account.currency})</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trades.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                  No trades recorded yet. Time to hit the charts!
                </td>
              </tr>
            ) : (
              [...trades].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(trade => (
                <tr key={trade.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{trade.symbol}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-bold uppercase ${trade.side === TradeSide.BUY ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {trade.side}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-400">{trade.date}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold w-fit ${getSessionColor(trade.session)}`}>
                        {trade.session}
                      </span>
                      <span className={`text-[10px] font-medium flex items-center gap-1 ${getBiasColor(trade.bias)}`}>
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"/></svg>
                        {trade.bias} Bias
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {trade.setups.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-medium border border-slate-200">
                          {s}
                        </span>
                      ))}
                      {trade.setups.length === 0 && <span className="text-[10px] text-slate-300 italic">No Tags</span>}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${trade.resultR >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trade.resultR >= 0 ? '+' : ''}{trade.resultR.toFixed(2)}R
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${trade.result >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trade.result >= 0 ? '+' : ''}{trade.result.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Note: I added a hover class to the tr in standard CSS but tailwind works too */}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(trade)} className="text-slate-300 hover:text-indigo-600 transition-colors p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      <button onClick={() => onDelete(trade.id)} className="text-slate-300 hover:text-rose-600 transition-colors p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeList;
