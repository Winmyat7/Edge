
import React, { useState, useEffect } from 'react';
import { Trade, TradeSide, SetupTag, Account, TradingSession, MarketBias } from '../types';

interface TradeFormProps {
  account: Account;
  onSave: (trade: Trade) => void;
  onClose: () => void;
  initialTrade?: Trade | null;
}

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

  const calculateResultR = (entry: number, sl: number, result: number) => {
    if (!entry || !sl || !result || entry === sl) return 0;
    const riskAmount = Math.abs(entry - sl);
    // This is simplified: actual risk depends on position size, 
    // but in many journals, R is calculated as (Result / Initial Risk in Currency)
    // Here we'll just allow user to see the planned RR above.
    return 0; 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rr = calculateRR(formData.entry || 0, formData.sl || 0, formData.tp || 0);
    
    // We'll calculate resultR based on the result vs entry-sl risk if we had position size,
    // but typically user just inputs the final R-multiple directly or we derive it from $
    // For this MVP, we will derive a "Synthetic R" if they input result and risk prices.
    const riskPerUnit = Math.abs((formData.entry || 0) - (formData.sl || 0));
    const syntheticR = riskPerUnit > 0 ? (formData.result || 0) / (riskPerUnit * 100) : 0; // Very rough approximation

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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {initialTrade ? 'Edit Trade' : 'Log New Trade'}
              </h2>
              <p className="text-slate-500 text-sm">Account: {account.name}</p>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-8">
            {/* Section 1: Context */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b pb-1">1. Market Context</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">Date</label>
                  <input type="date" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">Pair / Symbol</label>
                  <input required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" placeholder="EURUSD" value={formData.symbol} onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">Session</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" value={formData.session} onChange={e => setFormData({ ...formData, session: e.target.value as TradingSession })}>
                    {Object.values(TradingSession).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">HTF Bias</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" value={formData.bias} onChange={e => setFormData({ ...formData, bias: e.target.value as MarketBias })}>
                    {Object.values(MarketBias).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Section 2: Execution */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b pb-1">2. Execution Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">Side</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" value={formData.side} onChange={e => setFormData({ ...formData, side: e.target.value as TradeSide })}>
                    <option value={TradeSide.BUY}>BUY / LONG</option>
                    <option value={TradeSide.SELL}>SELL / SHORT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">Entry Price</label>
                  <input type="number" step="any" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" value={formData.entry} onChange={e => setFormData({ ...formData, entry: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase text-red-500">Stop Loss</label>
                  <input type="number" step="any" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" value={formData.sl} onChange={e => setFormData({ ...formData, sl: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase text-emerald-500">Take Profit</label>
                  <input type="number" step="any" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" value={formData.tp} onChange={e => setFormData({ ...formData, tp: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-xs font-bold text-slate-400">Planned R:R: <span className="text-slate-900">{calculateRR(formData.entry || 0, formData.sl || 0, formData.tp || 0)}</span></span>
              </div>
            </section>

            {/* Section 3: Outcomes & Setups */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b pb-1">3. Outcome & Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">Result ({account.currency})</label>
                    <input type="number" step="any" required className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold" value={formData.result} onChange={e => setFormData({ ...formData, result: parseFloat(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">Result (R-Multiple)</label>
                    <input type="number" step="any" required className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold" value={formData.resultR} onChange={e => setFormData({ ...formData, resultR: parseFloat(e.target.value) })} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase">SMC Setups</label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.values(SetupTag).map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${formData.setups?.includes(tag) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Reflection */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b pb-1">4. Journal & Reflection</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">Common Mistakes / Behavioral Notes</label>
                  <input className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" placeholder="Overleveraged, Moved SL to break even too early, FOMO..." value={formData.mistake} onChange={e => setFormData({ ...formData, mistake: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">Trade Commentary</label>
                  <textarea className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm h-24 resize-none" placeholder="Explain the trade story..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 flex gap-3">
            <button type="submit" className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
              {initialTrade ? 'Update Trade' : 'Record Trade'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeForm;
