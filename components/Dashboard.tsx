
import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Trade, Account, PerformanceStats } from '../types';

interface DashboardProps {
  trades: Trade[];
  account: Account;
}

const Dashboard: React.FC<DashboardProps> = ({ trades, account }) => {
  const stats: PerformanceStats = useMemo(() => {
    const wins = trades.filter(t => t.result > 0);
    const losses = trades.filter(t => t.result <= 0);
    
    const totalWins = wins.reduce((sum, t) => sum + t.result, 0);
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.result, 0));
    const totalR = trades.reduce((sum, t) => sum + (t.resultR || 0), 0);
    
    let currentBalance = account.initialBalance;
    const equityCurve = [{ date: 'Start', balance: currentBalance }];
    
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedTrades.forEach(t => {
      currentBalance += t.result;
      equityCurve.push({ 
        date: new Date(t.date).toLocaleDateString(), 
        balance: currentBalance 
      });
    });

    return {
      winRate: (wins.length / (trades.length || 1)) * 100,
      expectancy: (totalWins - totalLosses) / (trades.length || 1),
      profitFactor: totalLosses === 0 ? totalWins : totalWins / totalLosses,
      avgWin: totalWins / (wins.length || 1),
      avgLoss: totalLosses / (losses.length || 1),
      totalTrades: trades.length,
      totalR,
      equityCurve
    };
  }, [trades, account]);

  return (
    <div className="space-y-6">
      {/* Account Header Info */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-xl">
            {account.currency.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{account.name}</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">{account.broker}</p>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-slate-400 text-[10px] font-bold uppercase">Balance</p>
            <p className="text-2xl font-bold tracking-tight">
              {account.currency} {(account.initialBalance + (trades.reduce((a, b) => a + b.result, 0))).toLocaleString()}
            </p>
          </div>
          <div className="text-right border-l border-slate-800 pl-8">
            <p className="text-slate-400 text-[10px] font-bold uppercase">Total R</p>
            <p className={`text-2xl font-bold tracking-tight ${stats.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.totalR >= 0 ? '+' : ''}{stats.totalR.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, color: 'text-indigo-600' },
          { label: 'Profit Factor', value: stats.profitFactor.toFixed(2), color: 'text-blue-600' },
          { label: 'Avg Win', value: `${account.currency} ${stats.avgWin.toFixed(0)}`, color: 'text-emerald-600' },
          { label: 'Expectancy', value: `${stats.expectancy.toFixed(2)}`, color: 'text-slate-800' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Equity Curve Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Equity Performance</h3>
          <div className="flex gap-2">
             <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
               <span className="w-2 h-0.5 bg-indigo-500"></span> Balance Curve
             </span>
          </div>
        </div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.equityCurve}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" hide />
              <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                formatter={(value: number) => [`${account.currency} ${value.toFixed(2)}`, 'Balance']}
              />
              <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} dot={false} animationDuration={1000} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
