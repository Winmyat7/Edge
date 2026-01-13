
import React from 'react';
import { Account } from '../types';

interface AccountSelectorProps {
  accounts: Account[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ accounts, selectedId, onSelect, onAdd }) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {accounts.map(acc => (
        <button
          key={acc.id}
          onClick={() => onSelect(acc.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
            selectedId === acc.id
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {acc.name}
          </div>
        </button>
      ))}
      <button 
        onClick={onAdd}
        className="flex-shrink-0 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all border border-dashed border-slate-300"
      >
        + New Account
      </button>
    </div>
  );
};

export default AccountSelector;
