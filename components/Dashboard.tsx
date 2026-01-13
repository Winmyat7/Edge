
import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Trade, Account, PerformanceStats, SetupTag } from '../types';

interface DashboardProps {
  trades: Trade[];
  account: Account;
}

const Dashboard: React.FC<DashboardProps> = ({ trades, account }) => {
  const stats = useMemo(() => {
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

    // Group R-Profit by Setup
    const setupPerformance: { name: string; r: number }[] = Object.values(SetupTag).map(tag => {
      const rSum = trades
        .filter(t => t.setups.includes(tag))
        .reduce((sum, t) => sum + (t.resultR || 0), 0);
      return { name: tag, r: parseFloat(rSum.toFixed(2)) };
    }).filter(s => s.r !== 0);

    return {
      winRate: (wins.length / (trades.length || 1)) * 100,
      expectancy: (totalWins - totalLosses) / (trades.length || 1),
      profitFactor: totalLosses === 0 ? totalWins : totalWins / totalLosses,
      avgWin: totalWins / (wins.length || 1),
      avgLoss: totalLosses / (losses.length || 1),
      totalTrades: trades.length,
      totalR,
      equityCurve,
      setupPerformance
    };
  }, [trades, account]);

  return (
    <div className="space-y-6">
      {/* Account Header Info */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center font-bold text-2xl shadow-inner">
            {account.currency.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{account.name}</h2>
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{account.broker}</p>
          </div>
        </div>
        <div className="flex gap-12 relative z-10">
          <div className="text-right">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Balance</p>
            <p className="text-3xl font-black tracking-tighter">
              <span className="text-indigo-400 mr-1 text-xl">{account.currency}</span>
              {(account.initialBalance + (trades.reduce((a, b) => a + b.result, 0))).toLocaleString()}
            </p>
          </div>
          <div className="text-right border-l border-white/10 pl-12">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total R</p>
            <p className={`text-3xl font-black tracking-tighter ${stats.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.totalR >= 0 ? '+' : ''}{stats.totalR.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Profit Factor', value: stats.profitFactor.toFixed(2), color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Win', value: `${account.currency} ${stats.avgWin.toFixed(0)}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Expectancy', value: stats.expectancy.toFixed(2), color: 'text-slate-800', bg: 'bg-slate-50' }
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Equity Curve</h3>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase">Daily Progression</span>
          </div>
          <div className="w-full h-[280px] min-h-[280px] relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={stats.equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(value: number) => [`${account.currency} ${value.toFixed(2)}`, 'Balance']}
                />
                <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={4} dot={false} animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Setup Performance Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Setup Performance</h3>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase">Total R per Setup</span>
          </div>
          <div className="w-full h-[280px] min-h-[280px] relative">
            {stats.setupPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={stats.setupPerformance} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 9, fontWeight: 'bold', fill: '#64748b'}} width={80} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                    formatter={(value: number) => [`${value}R`, 'Performance']}
                  />
                  <Bar dataKey="r" radius={[0, 4, 4, 0]} barSize={20}>
                    {stats.setupPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.r >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300 text-sm italic">
                Add setup tags to see performance data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
