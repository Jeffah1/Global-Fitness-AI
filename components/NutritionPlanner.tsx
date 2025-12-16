import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { MealPlan } from '../types';
import { useGlobalContext } from '../context/GlobalContext';
import { Loader2, ChefHat, Leaf, Zap, Droplet, Copy, Check, ShoppingCart } from 'lucide-react';
import { Button } from './ui/Button';

const NutritionPlanner: React.FC = () => {
  const { addToGroceryList } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [goal, setGoal] = useState('Lose Body Fat');
  const [restrictions, setRestrictions] = useState('');
  const [copied, setCopied] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const generateMealPlan = async () => {
    setLoading(true);
    setPlan(null);
    setCopied(false);
    setAddedToCart(false);
    try {
      const result = await geminiService.generateMealPlan(goal, restrictions);
      setPlan(result);
    } catch (error) {
      console.error(error);
      alert("Failed to generate meal plan.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!plan) return;
    
    let text = `Plan: ${plan.planName}\n\n`;
    plan.meals.forEach(meal => {
        text += `${meal.name}\n`;
        text += `Calories: ${meal.macros.calories} | P: ${meal.macros.protein} | C: ${meal.macros.carbs} | F: ${meal.macros.fats}\n`;
        text += `Ingredients: ${meal.ingredients.join(', ')}\n`;
        text += `Instructions: ${meal.instructions}\n\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddGroceries = () => {
      if (!plan) return;
      const allIngredients = plan.meals.flatMap(m => m.ingredients);
      addToGroceryList(allIngredients);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000); // Reset after 3s to allow adding again if needed or just show state
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Smart Nutrition</h2>
        <p className="text-slate-400">Fuel your body with AI-curated meal plans optimized for your goals.</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nutritional Goal</label>
                <select 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                >
                    <option>Lose Body Fat</option>
                    <option>Clean Bulking (Muscle Gain)</option>
                    <option>Maintenance & Health</option>
                    <option>Keto Diet</option>
                    <option>High Protein</option>
                    <option>Vegan Performance</option>
                </select>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Dietary Restrictions / Allergies</label>
                <input 
                    type="text"
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-slate-500 transition-all"
                    placeholder="e.g. Gluten-free, No nuts"
                />
            </div>
        </div>

        <Button 
          onClick={generateMealPlan}
          isLoading={loading}
          icon={<ChefHat size={20} />}
          fullWidth
          className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-500/20 hover:shadow-blue-500/40"
        >
          {loading ? 'Creating Menu...' : 'Generate Meal Plan'}
        </Button>
      </div>

      {plan && (
        <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <h3 className="text-2xl font-bold text-emerald-400">{plan.planName}</h3>
                 <div className="flex gap-3">
                    <button 
                        onClick={handleAddGroceries}
                        disabled={addedToCart}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 active:scale-95 font-medium ${
                            addedToCart 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-emerald-500/30 hover:text-white'
                        }`}
                    >
                        {addedToCart ? <Check size={18} className="animate-bounce" /> : <ShoppingCart size={18} />}
                        {addedToCart ? 'Added to List' : 'Grocery List'}
                    </button>
                    <button 
                        onClick={copyToClipboard}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 active:scale-95 font-medium ${
                            copied
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-emerald-500/30 hover:text-white'
                        }`}
                    >
                        {copied ? <Check size={18} className="animate-bounce" /> : <Copy size={18} />}
                        {copied ? 'Copied!' : 'Copy Plan'}
                    </button>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.meals.map((meal, idx) => (
                    <div key={idx} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col hover:border-blue-500/30 transition-colors shadow-lg hover:shadow-blue-500/5">
                        <div className="p-5 border-b border-slate-700 bg-slate-700/20">
                            <h4 className="text-xl font-bold text-white">{meal.name}</h4>
                            <div className="flex gap-3 mt-3">
                                <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20">
                                    <Zap size={12} /> {meal.macros.calories} kcal
                                </span>
                                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                                    <Leaf size={12} /> P: {meal.macros.protein}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded border border-orange-400/20">
                                    <Droplet size={12} /> F: {meal.macros.fats}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col gap-4">
                            <div>
                                <h5 className="text-xs uppercase text-slate-500 font-bold mb-2">Ingredients</h5>
                                <div className="flex flex-wrap gap-2">
                                    {meal.ingredients.map((ing, i) => (
                                        <span key={i} className="text-sm text-slate-300 bg-slate-900 border border-slate-700 px-2 py-1 rounded-md">
                                            {ing}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-auto">
                                <h5 className="text-xs uppercase text-slate-500 font-bold mb-2">Preparation</h5>
                                <p className="text-sm text-slate-400 leading-relaxed">{meal.instructions}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default NutritionPlanner;