import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MarketItem } from '../types';
import { ShoppingBag, Star, Crown, Trash2, Plus, Coffee, Dumbbell } from 'lucide-react';

export const Marketplace: React.FC = () => {
  const { user, upgradeToPremium, groceryList, removeFromGroceryList } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<'PREMIUM' | 'GROCERY' | 'ITEMS'>('PREMIUM');

  const plans = [
    { name: 'Monthly', price: '$4.99', period: '/mo', save: '' },
    { name: 'Yearly', price: '$39.99', period: '/yr', save: 'Save 33%', recommended: true },
    { name: 'Lifetime', price: '$99.99', period: 'once', save: 'Best Value' },
  ];

  const items: MarketItem[] = [
    { id: '1', name: 'Whey Protein', category: 'Supplement', price: 29.99, description: 'High quality isolate.' },
    { id: '2', name: 'Resistance Bands', category: 'Equipment', price: 15.99, description: 'Set of 5 levels.' },
    { id: '3', name: 'Creatine Monohydrate', category: 'Supplement', price: 24.99, description: 'Pure micronized creatine.' },
    { id: '4', name: 'Yoga Mat', category: 'Equipment', price: 19.99, description: 'Non-slip extra thick.' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">Marketplace</h2>
            <p className="text-slate-400">Upgrade your experience or gear up.</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl">
            {['PREMIUM', 'GROCERY', 'ITEMS'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                        activeTab === tab 
                        ? 'bg-emerald-500 text-slate-900 shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                    {tab === 'PREMIUM' && <Crown size={14} className="inline mr-1" />}
                    {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'PREMIUM' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {plans.map((plan) => (
                <div key={plan.name} className={`relative bg-slate-800 rounded-3xl p-8 border ${plan.recommended ? 'border-emerald-500 shadow-emerald-500/20 shadow-xl scale-105 z-10' : 'border-slate-700'} flex flex-col transition-all duration-300 hover:-translate-y-1`}>
                    {plan.recommended && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                            Most Popular
                        </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-4">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-slate-400 ml-1">{plan.period}</span>
                    </div>
                    {plan.save && <p className="text-emerald-400 text-sm font-bold mb-6">{plan.save}</p>}
                    
                    <ul className="space-y-3 mb-8 flex-1">
                        {['Unlimited AI Chat', 'Personalized Plans', 'Smart Analytics', 'Ad-free Experience'].map(feat => (
                            <li key={feat} className="flex items-center gap-2 text-slate-300 text-sm">
                                <Star size={14} className="text-emerald-500" fill="currentColor" /> {feat}
                            </li>
                        ))}
                    </ul>

                    <button 
                        onClick={upgradeToPremium}
                        disabled={user?.isPremium}
                        className={`w-full py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${
                            user?.isPremium 
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-lg shadow-emerald-500/20'
                        }`}
                    >
                        {user?.isPremium ? 'Current Plan' : 'Get Started'}
                    </button>
                </div>
            ))}
        </div>
      )}

      {activeTab === 'GROCERY' && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 min-h-[400px] shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="text-emerald-400" /> My Grocery List
            </h3>
            {groceryList.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <Coffee size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Your list is empty. Generate a meal plan to add items!</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {groceryList.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700 group hover:border-slate-600 transition-colors">
                            <span className="text-slate-200">{item}</span>
                            <button 
                                onClick={() => removeFromGroceryList(idx)}
                                className="text-slate-500 hover:text-red-400 transition-all p-2 active:scale-90"
                            >
                                <Trash2 size={18} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      )}

      {activeTab === 'ITEMS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
                <div key={item.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden group hover:border-emerald-500/50 transition-all hover:shadow-lg">
                    <div className="h-40 bg-slate-700 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-colors">
                        <Dumbbell size={40} />
                    </div>
                    <div className="p-4">
                        <div className="text-xs font-bold text-emerald-400 uppercase mb-1">{item.category}</div>
                        <h4 className="font-bold text-white mb-1">{item.name}</h4>
                        <p className="text-xs text-slate-400 mb-4">{item.description}</p>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-lg">${item.price}</span>
                            <button className="p-2 bg-emerald-500 text-slate-900 rounded-lg hover:bg-emerald-600 transition-all active:scale-90 shadow-lg shadow-emerald-500/20">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};