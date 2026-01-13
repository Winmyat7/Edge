
import React, { useState, useEffect, useMemo } from 'react';
import { Account, Trade } from './types';
import { storage } from './services/storage';
import { analyzeTrades } from './services/gemini';
import AccountSelector from './components/AccountSelector';
import Dashboard from './components/Dashboard';
import TradeList from './components/TradeList';
import TradeForm from './components/TradeForm';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isAddingTrade, setIsAddingTrade] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [aiCoachResponse, setAiCoachResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize
  useEffect(() => {
    const savedAccounts = storage.getAccounts();
    const savedTrades = storage.getTrades();
    setAccounts(savedAccounts);
    setTrades(savedTrades);
    if (savedAccounts.length > 0) {
      setSelectedAccountId(savedAccounts[0].id);
    }
  }, []);

  const selectedAccount = useMemo(() => 
    accounts.find(a => a.id === selectedAccountId) || null
  , [accounts, selectedAccountId]);

  const accountTrades = useMemo(() => 
    trades.filter(t => t.accountId === selectedAccountId)
  , [trades, selectedAccountId]);

  const handleSaveTrade = (trade: Trade) => {
    let updated: Trade[];
    if (editingTrade) {
      updated = trades.map(t => t.id === trade.id ? trade : t);
    } else {
      updated = [...trades, trade];
    }
    setTrades(updated);
    storage.saveTrades(updated);
    setIsAddingTrade(false);
    setEditingTrade(null);
  };

  const handleDeleteTrade = (id: string) => {
    if (confirm("Permanently delete this trade from your journal?")) {
      const updated = trades.filter(t => t.id !== id);
      setTrades(updated);
      storage.saveTrades(updated);
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsAddingTrade(true);
  };

  const handleExport = () => {
    storage.exportToCSV(accountTrades);
  };

  const handleCreateAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAccount: Account = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      broker: formData.get('broker') as string,
      initialBalance: parseFloat(formData.get('balance') as string),
      currency: formData.get('currency') as string
    };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    storage.saveAccounts(updated);
    setSelectedAccountId(newAccount.id);
    setIsAddingAccount(false);
  };

  const runAiAnalysis = async () => {
    if (!selectedAccount || accountTrades.length === 0) return;
    setIsAnalyzing(true);
    setAiCoachResponse(null);
    try {
      const response = await analyzeTrades(accountTrades, selectedAccount);
      setAiCoachResponse(response);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-24 text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 transform rotate-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">QuantEdge</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Journal v1.2</span>
                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">MVP Build</span>
              </div>
            </div>
          </div>
          <AccountSelector 
            accounts={accounts}
            selectedId={selectedAccountId}
            onSelect={setSelectedAccountId}
            onAdd={() => setIsAddingAccount(true)}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 mt-12 space-y-12">
        {!selectedAccount ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[48px] py-32 px-10 text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Initialize your Edge.</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg font-medium">Create your primary trading account to begin logging institutional setup data and receiving AI coaching.</p>
            <button 
              onClick={() => setIsAddingAccount(true)}
              className="px-12 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Configure First Account
            </button>
          </div>
        ) : (
          <>
            {/* Dashboard & Stats */}
            <Dashboard trades={accountTrades} account={selectedAccount} />

            {/* AI Insights Section */}
            <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-sm relative group">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 transition-all group-hover:w-3"></div>
              <div className="p-8 lg:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[20px] flex items-center justify-center text-3xl shadow-inner transform -rotate-2">
                      🧠
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Strategy Consultant</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">SMC Logic & Psychology Analysis</p>
                    </div>
                  </div>
                  <button 
                    onClick={runAiAnalysis}
                    disabled={isAnalyzing || accountTrades.length === 0}
                    className="px-8 py-4 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-3 group-hover:shadow-2xl active:scale-95"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Synthesizing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Generate Debrief
                      </>
                    )}
                  </button>
                </div>
                
                {aiCoachResponse ? (
                  <div className="bg-slate-50/50 p-8 lg:p-10 rounded-[32px] border border-slate-100 shadow-inner">
                    <div className="prose prose-indigo max-w-none text-slate-700">
                      <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: aiCoachResponse.replace(/\n/g, '<br/>') }} />
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-200/60 flex justify-end">
                      <button onClick={() => setAiCoachResponse(null)} className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors">Clear Analysis</button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/20">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      {accountTrades.length > 0 
                        ? "Infrastructure ready for performance analysis"
                        : "Accumulate trade data to unlock AI coaching insights"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Trades List Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Execution Ledger</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Immutable Trading History</p>
                </div>
                <button 
                  onClick={() => { setEditingTrade(null); setIsAddingTrade(true); }}
                  className="px-8 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center gap-3 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                  Log Execution
                </button>
              </div>
              <TradeList 
                trades={accountTrades} 
                account={selectedAccount} 
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade}
                onExport={handleExport}
              />
            </section>
          </>
        )}
      </main>

      {/* Modals */}
      {isAddingTrade && selectedAccount && (
        <TradeForm 
          account={selectedAccount} 
          onSave={handleSaveTrade} 
          onClose={() => { setIsAddingTrade(false); setEditingTrade(null); }} 
          initialTrade={editingTrade}
        />
      )}

      {isAddingAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <form onSubmit={handleCreateAccount} className="p-10 lg:p-12">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">New Account</h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Define your capital structure</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Identification Label</label>
                  <input name="name" required className="w-full px-6 py-4 rounded-[20px] border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all text-lg placeholder:text-slate-300" placeholder="e.g. Apex 100K Performance" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Brokerage / Gateway</label>
                  <input name="broker" required className="w-full px-6 py-4 rounded-[20px] border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all text-lg placeholder:text-slate-300" placeholder="e.g. MyFundedFutures, MetaTrader 5" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Opening Liquidity</label>
                    <input name="balance" type="number" step="any" required className="w-full px-6 py-4 rounded-[20px] border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-black transition-all text-lg" placeholder="100000" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Settlement Currency</label>
                    <select name="currency" className="w-full px-6 py-4 rounded-[20px] border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-black transition-all text-lg bg-white appearance-none cursor-pointer">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="BTC">BTC (₿)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-14 flex flex-col gap-4">
                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-base hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95">
                  Confirm Infrastructure
                </button>
                <button type="button" onClick={() => setIsAddingAccount(false)} className="w-full bg-slate-50 text-slate-500 py-5 rounded-[24px] font-black text-base hover:bg-slate-100 transition-all">
                  Cancel Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
