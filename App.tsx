
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
    if (confirm("Delete this trade record?")) {
      const updated = trades.filter(t => t.id !== id);
      setTrades(updated);
      storage.saveTrades(updated);
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsAddingTrade(true);
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
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="bg-indigo-600 text-white p-1 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                </svg>
              </span>
              QuantEdge Journal
            </h1>
          </div>
          <AccountSelector 
            accounts={accounts}
            selectedId={selectedAccountId}
            onSelect={setSelectedAccountId}
            onAdd={() => setIsAddingAccount(true)}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {!selectedAccount ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-20 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to QuantEdge</h2>
            <p className="text-slate-500 mb-6">Start by creating your first trading account to track your performance.</p>
            <button 
              onClick={() => setIsAddingAccount(true)}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
            >
              Setup First Account
            </button>
          </div>
        ) : (
          <>
            {/* Dashboard & Stats */}
            <Dashboard trades={accountTrades} account={selectedAccount} />

            {/* AI Insights Section */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-lg font-bold text-indigo-900">Gemini Performance Coach</h3>
                </div>
                <button 
                  onClick={runAiAnalysis}
                  disabled={isAnalyzing || accountTrades.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Refresh AI Analysis'}
                </button>
              </div>
              
              {aiCoachResponse ? (
                <div className="prose prose-indigo max-w-none text-indigo-800 bg-white/50 p-4 rounded-xl border border-indigo-100">
                  <div dangerouslySetInnerHTML={{ __html: aiCoachResponse.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <p className="text-indigo-600 text-sm italic">
                  {accountTrades.length > 0 
                    ? "Click the button to get feedback on your trading psychology and setups."
                    : "Log a few trades to unlock AI performance analysis."}
                </p>
              )}
            </div>

            {/* Trades List Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Recent Trades</h2>
                <button 
                  onClick={() => { setEditingTrade(null); setIsAddingTrade(true); }}
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Trade
                </button>
              </div>
              <TradeList 
                trades={accountTrades} 
                account={selectedAccount} 
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade} 
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <form onSubmit={handleCreateAccount} className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Add Trading Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                  <input name="name" required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" placeholder="e.g. Personal Prop 100k" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Broker</label>
                  <input name="broker" required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" placeholder="e.g. IC Markets, FTMO" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Balance</label>
                    <input name="balance" type="number" step="any" required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none" placeholder="10000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                    <select name="currency" className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Create Account</button>
                <button type="button" onClick={() => setIsAddingAccount(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
