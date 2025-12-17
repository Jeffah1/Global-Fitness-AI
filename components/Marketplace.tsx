import React, { useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { MarketItem } from '../types';
import { ShoppingBag, Star, Crown, Trash2, Plus, Coffee, Dumbbell, Check, CheckSquare, Square, XCircle, Search, DollarSign, Calculator, ChevronRight } from 'lucide-react';

export const Marketplace: React.FC = () => {
  const { user, upgradeToPremium, groceryList, addToGroceryList, removeFromGroceryList, toggleGroceryItem, updateGroceryItem, clearCheckedItems } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<'PREMIUM' | 'GROCERY' | 'ITEMS'>('PREMIUM');
  
  // Grocery State
  const [newItem, setNewItem] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

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

  const checkedCount = groceryList.filter(i => i.checked).length;
  const totalCost = groceryList.reduce((acc, item) => acc + (item.price || 0), 0);
  const checkedCost = groceryList.filter(i => i.checked).reduce((acc, item) => acc + (item.price || 0), 0);
  const remainingCost = totalCost - checkedCost;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
        const price = parseFloat(newItemPrice);
        addToGroceryList([{ 
            name: newItem.trim(), 
            price: isNaN(price) ? 0 : price 
        }]);
        setNewItem('');
        setNewItemPrice('');
    }
  };

  const handlePriceUpdate = (id: string, newPrice: string) => {
      const price = parseFloat(newPrice);
      if (!isNaN(price)) {
          updateGroceryItem(id, { price });
      }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left Column: List and Add */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShoppingBag className="text-emerald-400" /> Shopping List
                        </h3>
                        {checkedCount > 0 && (
                            <button 
                                onClick={clearCheckedItems}
                                className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40"
                            >
                                <Trash2 size={14} /> Clear {checkedCount} Completed
                            </button>
                        )}
                    </div>

                    {/* Add Item Form */}
                    <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Add item (e.g. Eggs)..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div className="relative w-24 md:w-32">
                            <DollarSign className="absolute left-3 top-3.5 text-slate-500" size={16} />
                            <input 
                                type="number" 
                                value={newItemPrice}
                                onChange={(e) => setNewItemPrice(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-8 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={!newItem.trim()}
                            className="bg-emerald-500 text-slate-900 rounded-xl px-4 flex items-center justify-center hover:bg-emerald-400 disabled:opacity-50 disabled:bg-slate-700 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <Plus size={24} />
                        </button>
                    </form>

                    {/* Progress Bar */}
                    {groceryList.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between text-xs text-slate-400 mb-2">
                                <span>{checkedCount} / {groceryList.length} items</span>
                                <span>{Math.round((checkedCount / groceryList.length) * 100)}% done</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                                    style={{ width: `${(checkedCount / groceryList.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {groceryList.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-900/30">
                            <Coffee size={40} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Your list is empty.</p>
                            <p className="text-sm mt-1">Plan your meals to auto-fill this list.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {groceryList.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => toggleGroceryItem(item.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group select-none ${
                                        item.checked 
                                        ? 'bg-slate-900/40 border-slate-800/50 opacity-60' 
                                        : 'bg-slate-900 border-slate-700 hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`transition-all duration-300 transform ${item.checked ? 'text-emerald-500 scale-110' : 'text-slate-600 group-hover:text-emerald-400'}`}>
                                            {item.checked ? <CheckSquare size={24} /> : <Square size={24} />}
                                        </div>
                                        <span className={`text-lg font-medium transition-all duration-300 ${item.checked ? 'text-slate-500 line-through decoration-2 decoration-slate-600' : 'text-slate-200'}`}>
                                            {item.name}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                                        <div className={`flex items-center gap-1 px-3 py-1 rounded-lg border transition-colors ${item.checked ? 'bg-transparent border-transparent text-slate-600' : 'bg-slate-800 border-slate-600 text-emerald-400'}`}>
                                            <span className="text-xs">$</span>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                value={item.price || ''}
                                                onChange={(e) => handlePriceUpdate(item.id, e.target.value)}
                                                placeholder="0"
                                                className="w-12 bg-transparent text-right outline-none font-mono font-bold"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => removeFromGroceryList(item.id)}
                                            className="text-slate-600 hover:text-red-400 transition-all p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Cost Summary */}
            <div className="space-y-6">
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg sticky top-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Calculator className="text-emerald-400" size={20} /> Cost Estimate
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                            <span className="text-slate-400 text-sm">To Buy</span>
                            <span className="text-xl font-bold text-white">${remainingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <span className="text-emerald-400/70 text-sm">In Cart</span>
                            <span className="text-xl font-bold text-emerald-400">${checkedCost.toFixed(2)}</span>
                        </div>
                        
                        <div className="h-px bg-slate-700 my-4"></div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300 font-bold">Total Estimated</span>
                            <span className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</span>
                        </div>
                    </div>

                    {totalCost > 0 && (
                        <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
                            <p>Tip: These are estimated costs. Update prices as you shop for better accuracy next time.</p>
                        </div>
                    )}
                </div>
            </div>
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