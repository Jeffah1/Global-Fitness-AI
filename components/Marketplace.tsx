import React, { useState, useMemo } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { geminiService } from '../services/gemini';
import { GroceryCategory } from '../types';
import { ShoppingBag, Crown, Trash2, Plus, Coffee, Check, CheckSquare, Square, XCircle, Search, DollarSign, Calculator, Leaf, Sparkles, AlertCircle, Info, ChevronRight, PieChart } from 'lucide-react';

export const Marketplace: React.FC = () => {
  const { user, upgradeToPremium, groceryList, addToGroceryList, removeFromGroceryList, toggleGroceryItem, updateGroceryItem, clearCheckedItems } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<'PLANNER' | 'UPGRADE'>('PLANNER');
  
  // Input State
  const [newItem, setNewItem] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Upgrade Plans (kept minimal)
  const plans = [
    { name: 'Monthly', price: '$4.99', period: '/mo', save: '' },
    { name: 'Yearly', price: '$39.99', period: '/yr', save: 'Save 33%', recommended: true },
    { name: 'Lifetime', price: '$99.99', period: 'once', save: 'Best Value' },
  ];

  // Logic: Categorization & Costs
  const categorizedItems = useMemo(() => {
    const groups: Record<string, typeof groceryList> = {
        'Essentials': [],
        'Groceries': [],
        'Household': [],
        'Personal Care': [],
        'Optional': [],
        'Uncategorized': []
    };

    groceryList.forEach(item => {
        const cat = item.category || 'Uncategorized';
        if (groups[cat]) {
            groups[cat].push(item);
        } else {
            groups['Uncategorized'].push(item);
        }
    });

    return groups;
  }, [groceryList]);

  const checkedCount = groceryList.filter(i => i.checked).length;
  const totalPlannedCost = groceryList.reduce((acc, item) => acc + (item.price || 0), 0);
  const purchasedCost = groceryList.filter(i => i.checked).reduce((acc, item) => acc + (item.price || 0), 0);
  const remainingCost = totalPlannedCost - purchasedCost;

  // Add Item with Smart Awareness
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const itemName = newItem.trim();
    setNewItem(''); // Clear input immediately for responsiveness

    // 1. Add item immediately with default state
    const tempId = Math.random().toString(36).substr(2, 9);
    // Note: The context's addToGroceryList might generate its own ID, but for immediate UI feedback in a real app we might handle optimistic updates.
    // Here we just call the context function.
    addToGroceryList([{ name: itemName, price: 0 }]);
    
    // 2. Trigger AI Analysis in background
    setIsAnalyzing(true);
    try {
        const analysis = await geminiService.analyzeGroceryItem(itemName);
        
        // We need to find the item we just added to update it. 
        // Since addToGroceryList creates a new ID, in a real app we'd need that ID back.
        // For now, we will assume we can match by name (simplified for this demo) or just update the latest item with that name.
        
        // Wait a tiny bit for state propagation (simulated) or use a callback in a real architecture
        // Here we just find the item by name in the list after a delay or just trigger a global update if we had an update function by name.
        // Since we don't have updateByName, we will fetch the list and find it? 
        // Actually, let's just assume the user sees the "Analyzing..." indicator and then it pops in.
        
        // We need to implement a mechanism to update the specific item.
        // For this demo, we will scan the groceryList in the NEXT render cycle. 
        // This is tricky without the ID. 
        // IMPROVEMENT: We will pass the analysis data TO the `addToGroceryList` if we could, but we can't change the interface easily.
        // ALTERNATIVE: We can't easily update the *exact* item without its ID returned from context.
        // Hack for demo: We will look for an item with this name that has no category/price yet.
        
        // To make this robust without changing Context signature too much:
        // We will just do the update logic here if we can find the item.
        
        // Actually, let's just assume we can find it.
        const itemToUpdate = groceryList.find(i => i.name === itemName && !i.category);
        if (itemToUpdate && analysis) {
             // Parse estimated price range to a concrete number for the "planned" price (avg)
             // e.g. "$2 - $4" -> 3.
             const rangeParts = analysis.estimatedRange.replace(/[^0-9\-\.]/g, '').split('-');
             let avgPrice = 0;
             if (rangeParts.length === 2) {
                 avgPrice = (parseFloat(rangeParts[0]) + parseFloat(rangeParts[1])) / 2;
             } else if (rangeParts.length === 1) {
                 avgPrice = parseFloat(rangeParts[0]);
             }

             updateGroceryItem(itemToUpdate.id, {
                 category: analysis.category,
                 estimatedRange: analysis.estimatedRange,
                 aiTip: analysis.aiTip,
                 price: avgPrice || 0
             });
        } else {
             // Fallback: Just try to update *any* instance of this item added recently
             // This part relies on the context updating `groceryList` state which might happen on next render.
             // We'll skip complex sync logic for this specific demo and rely on the user manually entering price if AI fails or simply accept the delay.
             
             // Better approach for the demo: 
             // We will implement a `useEffect` that watches for new items without categories and triggers AI? 
             // No, that causes loops.
             
             // Let's just run a delayed search.
             setTimeout(() => {
                 // Access the *latest* groceryList via a ref or just closure if possible, but here we can't.
                 // We will skip auto-updating the context *after* add in this specific block without ID.
                 // Ideally `addToGroceryList` returns the ID.
             }, 500);
        }

    } catch (e) {
        console.error("AI Analysis failed", e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  // Effect to apply AI to items that are "Uncategorized" automatically?
  // To avoid loops, we only do this once or on user action. 
  // Let's stick to the manual "Add" flow triggering the logic, but since we can't get the ID easily,
  // we will add a small button "Auto-Organize" or similar if we wanted, 
  // OR we upgrade the `WorkoutContext` to return IDs. 
  // Since I can't change Context return type easily without breaking other things, 
  // I will assume the user manually categorizes OR we do a "Scan List" button.
  
  // Actually, I can update `groceryList` in the context to accept the full object!
  // `addToGroceryList` accepts `(string | { name: string; price?: number })[]`.
  // I can PRE-CALCULATE the AI data and THEN add it. 
  // Yes, that's better UX: "Thinking..." then add.
  
  const handleSmartAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItem.trim()) return;
      const name = newItem.trim();
      setNewItem('');
      setIsAnalyzing(true);

      try {
          const analysis = await geminiService.analyzeGroceryItem(name);
          
          let avgPrice = 0;
          if (analysis?.estimatedRange) {
             const rangeParts = analysis.estimatedRange.replace(/[^0-9\-\.]/g, '').split('-');
             if (rangeParts.length === 2) {
                 avgPrice = (parseFloat(rangeParts[0]) + parseFloat(rangeParts[1])) / 2;
             } else {
                 avgPrice = parseFloat(rangeParts[0]) || 0;
             }
          }

          // We need to bypass the strict type check of addToGroceryList if we want to pass extra fields
          // or we update the context to allow them.
          // Since I updated `GroceryItem` type, I should update `addToGroceryList` implementation to spread extra fields.
          // I'll assume I can pass a richer object if I cast it or if the context allows.
          
          // Actually, I'll add it then update it immediately. The ID generation is inside context. 
          // I will use a custom ID approach: 
          // I will modify `WorkoutContext` to allow passing a full object? No, too invasive.
          
          // Let's use the "Add then Scan" approach but simpler:
          // 1. Add item.
          // 2. Fetch list.
          // 3. Find item.
          // 4. Update item.
          // Since I can't await step 1's ID, I'll rely on the `groceryList` prop updating.
          
          // Let's actually just pre-calculate and add with the `price`, then user can see category update later?
          // No, let's try to just be fast.
          
          // REVISED PLAN: 
          // 1. Add item with price 0.
          // 2. In `useEffect`, detect items with 'Uncategorized' and run AI on them.
          
          addToGroceryList([{ name, price: avgPrice }]); 
          // The effect below will pick it up.

      } catch (e) {
          addToGroceryList([{ name, price: 0 }]);
      } finally {
          setIsAnalyzing(false);
      }
  };

  // Smart background organizer
  // This watches for new items and categorizes them if they are fresh.
  React.useEffect(() => {
      const uncategorized = groceryList.filter(i => !i.category || i.category === 'Uncategorized');
      if (uncategorized.length === 0) return;

      const processQueue = async () => {
          for (const item of uncategorized) {
              // Avoid re-processing if it was just added and we want to be gentle
              // We'll mark them as processed by giving them a category
              try {
                  const analysis = await geminiService.analyzeGroceryItem(item.name);
                  if (analysis) {
                      updateGroceryItem(item.id, {
                          category: analysis.category as any,
                          estimatedRange: analysis.estimatedRange,
                          aiTip: analysis.aiTip,
                          // Only update price if user hasn't set one (assuming 0 is unset)
                          price: item.price === 0 ? parseFloat(analysis.estimatedRange.match(/\d+(\.\d+)?/)?.[0] || '0') : item.price
                      });
                  } else {
                       updateGroceryItem(item.id, { category: 'Optional' }); // Default fallback
                  }
              } catch (e) {
                  // ignore
              }
          }
      };
      // Debounce slightly to allow batch adds
      const t = setTimeout(processQueue, 1000);
      return () => clearTimeout(t);
  }, [groceryList.length]); // Only run when length changes (new items added)

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">Smart Purchase Plan</h2>
            <p className="text-slate-400">Plan your spending, categorize needs, and shop with intention.</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl">
            <button
                onClick={() => setActiveTab('PLANNER')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${
                    activeTab === 'PLANNER' 
                    ? 'bg-emerald-500 text-slate-900 shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
                <ShoppingBag size={16} /> My Plan
            </button>
            <button
                onClick={() => setActiveTab('UPGRADE')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${
                    activeTab === 'UPGRADE' 
                    ? 'bg-emerald-500 text-slate-900 shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
                <Crown size={16} /> Upgrade
            </button>
        </div>
      </div>

      {activeTab === 'UPGRADE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 animate-fade-in">
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
                                <Check size={14} className="text-emerald-500" /> {feat}
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

      {activeTab === 'PLANNER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left Column: List and Add */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
                    {/* Add Item Form */}
                    <form onSubmit={handleSmartAdd} className="flex gap-2 mb-8 relative z-20">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Add item (e.g. Avocado, Batteries)..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-4 pr-12 text-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-inner"
                            />
                            {isAnalyzing && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Sparkles className="animate-spin text-emerald-400" size={18} />
                                </div>
                            )}
                        </div>
                        <button 
                            type="submit"
                            disabled={!newItem.trim() || isAnalyzing}
                            className="bg-emerald-500 text-slate-900 rounded-xl px-6 font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:bg-slate-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            <Plus size={24} />
                        </button>
                    </form>

                    {/* Progress Bar */}
                    {groceryList.length > 0 && (
                        <div className="mb-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">List Progress</div>
                                    <div className="text-white font-bold text-lg">{checkedCount} <span className="text-slate-500 text-sm font-normal">/ {groceryList.length} items</span></div>
                                </div>
                                <div className="text-emerald-400 font-mono font-bold">{Math.round((checkedCount / groceryList.length) * 100)}%</div>
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
                        <div className="text-center py-16 text-slate-500 border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-900/20">
                            <Leaf size={40} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium text-lg text-slate-400">Your plan is empty.</p>
                            <p className="text-sm mt-2 max-w-xs mx-auto">Start adding items. We'll categorize them and estimate costs for you.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Render Categories */}
                            {Object.entries(categorizedItems).map(([category, items]) => {
                                if (items.length === 0) return null;
                                return (
                                    <div key={category} className="animate-fade-in">
                                        <h4 className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                            {category === 'Essentials' && <AlertCircle size={14} />}
                                            {category === 'Optional' && <Coffee size={14} />}
                                            {category} 
                                            <span className="text-slate-600 text-xs ml-auto font-mono bg-slate-900 px-2 py-0.5 rounded-full">
                                                {items.length}
                                            </span>
                                        </h4>
                                        <div className="space-y-2">
                                            {items.map((item) => (
                                                <div 
                                                    key={item.id} 
                                                    onClick={() => toggleGroceryItem(item.id)}
                                                    className={`relative group flex flex-col p-4 rounded-xl border transition-all cursor-pointer select-none ${
                                                        item.checked 
                                                        ? 'bg-slate-900/40 border-slate-800/50 opacity-60' 
                                                        : 'bg-slate-900 border-slate-700 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`transition-all duration-300 transform ${item.checked ? 'text-emerald-500 scale-110' : 'text-slate-600 group-hover:text-emerald-400'}`}>
                                                                {item.checked ? <CheckSquare size={22} /> : <Square size={22} />}
                                                            </div>
                                                            <div>
                                                                <span className={`text-lg font-medium transition-all duration-300 ${item.checked ? 'text-slate-500 line-through decoration-2 decoration-slate-600' : 'text-slate-200'}`}>
                                                                    {item.name}
                                                                </span>
                                                                {item.estimatedRange && (
                                                                    <div className="text-xs text-slate-500 mt-0.5 font-mono">
                                                                        Est: {item.estimatedRange}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                                            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${item.checked ? 'bg-transparent border-transparent text-slate-600' : 'bg-slate-800 border-slate-600 text-emerald-400'}`}>
                                                                <span className="text-xs">$</span>
                                                                <input 
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={item.price || ''}
                                                                    onChange={(e) => updateGroceryItem(item.id, { price: parseFloat(e.target.value) })}
                                                                    placeholder="0.00"
                                                                    className="w-16 bg-transparent text-right outline-none font-mono font-bold text-sm"
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => removeFromGroceryList(item.id)}
                                                                className="text-slate-600 hover:text-red-400 transition-all p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* AI Tip / Smart Insight */}
                                                    {item.aiTip && !item.checked && (
                                                        <div className="mt-3 text-xs text-indigo-300 flex items-start gap-1.5 bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                                                            <Sparkles size={12} className="mt-0.5 shrink-0" />
                                                            {item.aiTip}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {checkedCount > 0 && (
                        <div className="mt-8 text-center">
                            <button 
                                onClick={clearCheckedItems}
                                className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors flex items-center justify-center gap-2 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 hover:border-red-500/40 mx-auto"
                            >
                                <Trash2 size={14} /> Clear {checkedCount} Purchased Items
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Spending Awareness */}
            <div className="space-y-6">
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg sticky top-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieChart className="text-emerald-400" size={20} /> Spending Overview
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                            <div>
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Planned</div>
                                <div className="text-xs text-slate-500 mt-1">Not yet bought</div>
                            </div>
                            <span className="text-xl font-bold text-white">${remainingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <div>
                                <div className="text-emerald-400/70 text-xs font-bold uppercase tracking-wider">Purchased</div>
                                <div className="text-xs text-emerald-500/40 mt-1">In cart/checked</div>
                            </div>
                            <span className="text-xl font-bold text-emerald-400">${purchasedCost.toFixed(2)}</span>
                        </div>
                        
                        <div className="h-px bg-slate-700 my-4"></div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300 font-bold">Total Estimate</span>
                            <span className="text-2xl font-bold text-white">${totalPlannedCost.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed flex gap-3">
                        <Info size={16} className="shrink-0 text-indigo-400" />
                        <div>
                            <p className="font-bold text-indigo-400 mb-1">Smart Awareness</p>
                            <p>Prices are market estimates. Updating actual prices as you shop helps refine your monthly spending tracking.</p>
                        </div>
                    </div>

                    {totalPlannedCost > 100 && (
                        <div className="mt-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20 text-xs text-orange-200 leading-relaxed flex gap-3">
                            <div className="shrink-0 font-bold text-orange-400">$</div>
                            <p>Your plan is over $100. Check the "Optional" category to see if anything can be saved for later.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
