
import React, { useState, useEffect } from 'react';
import { Trade, TradeSide, SetupTag, Account, TradingSession, MarketBias } from '../types';

interface TradeFormProps {
  account: Account;
  onSave: (trade: Trade) => void;
  onClose: () => void;
  initialTrade?: Trade | null;
}

const COMMON_MISTAKES = [
  "FOMO Entry", "Moved SL Early", "Revenge Trading", "Overleveraged", 
  "Poor HTF Analysis", "Early Exit", "Counter-trend", "Late Entry"
];

const TradeForm: React.FC<TradeFormProps> = ({ account, onSave, onClose, initialTrade }) => {
  const [formData, setFormData] = useState<Partial<Trade>>({
    date: new Date().toISOString().split('T')[0],
    symbol: '',
    side: TradeSide.BUY,
    session: TradingSession.LONDON,
    bias: MarketBias.NEUTRAL,
    entry: 0,
    sl: 0,
    tp: 0,
    rr: 0,
    result: 0,
    resultR: 0,
    setups: [],
    notes: '',
    mistake: ''
  });

  useEffect(() => {
    if (initialTrade) {
      setFormData(initialTrade);
    }
  }, [initialTrade]);

  const calculateRR = (entry: number, sl: number, tp: number) => {
    if (!entry || !sl || !tp || entry === sl) return 0;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    return parseFloat((reward / risk).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rr = calculateRR(formData.entry || 0, formData.sl || 0, formData.tp || 0);
    
    const tradeData: Trade = {
      ...formData as Trade,
      id: initialTrade ? initialTrade.id : crypto.randomUUID(),
      accountId: account.id,
      rr: rr,
      resultR: formData.resultR || 0
    };
    onSave(tradeData);
  };

  const toggleTag = (tag: SetupTag) => {
    setFormData(prev => ({
      ...prev,
      setups: prev.setups?.includes(tag) 
        ? prev.setups.filter(t => t !== tag)
        : [...(prev.setups || []), tag]
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-none">
              {initialTrade ? 'Refine Trade' : 'Record Execution'}
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {account.name} • {account.broker}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-all hover:shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="space-y-10">
            {/* Row 1: The Context */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-indigo-500"></span> 01 Market Context
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Date</label>
                    <input type="date" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Pair / Symbol</label>
                    <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-black placeholder:font-normal" placeholder="EURUSD" value={formData.symbol} onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Session</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none" value={formData.session} onChange={e => setFormData({ ...formData, session: e.target.value as TradingSession })}>
                      {Object.values(TradingSession).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">HTF Bias</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none" value={formData.bias} onChange={e => setFormData({ ...formData, bias: e.target.value as MarketBias })}>
                      {Object.values(MarketBias).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Planned R:R</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {calculateRR(formData.entry || 0, formData.sl || 0, formData.tp || 0)}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${formData.side === TradeSide.BUY ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {formData.side === TradeSide.BUY ? 'Long Position' : 'Short Position'}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Parameters */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-indigo-500"></span> 02 Trade Parameters
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Side</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none bg-white" value={formData.side} onChange={e => setFormData({ ...formData, side: e.target.value as TradeSide })}>
                    <option value={TradeSide.BUY}>BUY</option>
                    <option value={TradeSide.SELL}>SELL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Entry Price</label>
                  <input type="number" step="any" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none" value={formData.entry} onChange={e => setFormData({ ...formData, entry: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-red-500 uppercase mb-1.5">Stop Loss</label>
                  <input type="number" step="any" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none border-red-100 bg-red-50/30" value={formData.sl} onChange={e => setFormData({ ...formData, sl: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-500 uppercase mb-1.5">Take Profit</label>
                  <input type="number" step="any" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none border-emerald-100 bg-emerald-50/30" value={formData.tp} onChange={e => setFormData({ ...formData, tp: parseFloat(e.target.value) })} />
                </div>
              </div>
            </div>

            {/* Row 3: SMC Strategy & Result */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-indigo-500"></span> 03 Strategy Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(SetupTag).map(tag => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)} 
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
                        formData.setups?.includes(tag) 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-indigo-500"></span> 04 Outcome
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Net P/L ({account.currency})</label>
                    <input type="number" step="any" required className={`w-full px-4 py-2.5 rounded-xl border text-sm font-black outline-none ${
                      (formData.result || 0) >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`} value={formData.result} onChange={e => setFormData({ ...formData, result: parseFloat(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">R-Multiple Earned</label>
                    <input type="number" step="any" required className={`w-full px-4 py-2.5 rounded-xl border text-sm font-black outline-none ${
                      (formData.resultR || 0) >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`} value={formData.resultR} onChange={e => setFormData({ ...formData, resultR: parseFloat(e.target.value) })} />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Reflection */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-indigo-500"></span> 05 Behavioral Reflection
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Psychological Error Quick Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_MISTAKES.map(m => (
                      <button key={m} type="button" onClick={() => setFormData({ ...formData, mistake: m })} 
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border transition-all ${
                          formData.mistake === m 
                            ? 'bg-rose-600 border-rose-600 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-rose-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                    <button type="button" onClick={() => setFormData({ ...formData, mistake: '' })} className="text-[9px] font-bold text-slate-400 hover:text-slate-600">Clear</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Specific Mistake Details</label>
                    <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium" placeholder="E.g. Entered 5 min before red news..." value={formData.mistake} onChange={e => setFormData({ ...formData, mistake: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Trade Story / Commentary</label>
                    <textarea className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium h-11 resize-none overflow-y-auto" placeholder="Explain the context behind this setup..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 flex gap-4 bg-slate-50/50">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-all flex-1">
            Discard
          </button>
          <button type="submit" onClick={handleSubmit} className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex-1">
            {initialTrade ? 'Save Changes' : 'Confirm Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeForm;
