import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  Sun,
  Coffee,
  Moon,
  Apple,
  Pill,
  ChevronDown,
  ChevronUp,
  Flame,
  Beef,
  Wheat,
  Droplets,
  RefreshCw,
  Check,
  Plus,
  Zap,
  Undo2,
  Info,
  PenLine,
  X,
  Square,
  CheckSquare,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import ProLock from '../components/ui/ProLock';
import useUserStore from '../store/useUserStore';
import { showCoach } from '../components/ui/CoachPopup';
import { dietPlans } from '../data/dietPlans';

// Build a flat searchable food index from all diet plan meals (cached once)
// Indexes both meal names AND individual food items within meals
let _foodIndex = null;
function getFoodIndex() {
  if (_foodIndex) return _foodIndex;
  const seen = new Map(); // name → { calories, protein }
  for (const tier of Object.values(dietPlans)) {
    for (const dietType of Object.values(tier)) {
      if (!dietType.meals) continue;
      for (const slot of Object.values(dietType.meals)) {
        const options = Array.isArray(slot) ? slot : [slot];
        for (const meal of options) {
          // Index the meal itself
          const key = meal.name.toLowerCase();
          if (!seen.has(key)) {
            seen.set(key, { name: meal.name, calories: meal.calories, protein: meal.protein });
          }
          // Index individual items within the meal
          if (meal.items) {
            for (const item of meal.items) {
              const itemKey = item.toLowerCase();
              if (!seen.has(itemKey)) {
                // Estimate per-item nutrition proportionally
                const perItem = meal.items.length;
                seen.set(itemKey, {
                  name: item,
                  calories: Math.round(meal.calories / perItem),
                  protein: Math.round(meal.protein / perItem),
                });
              }
            }
          }
        }
      }
    }
  }
  _foodIndex = Array.from(seen.values());
  return _foodIndex;
}

// Search food index by partial name match — returns up to 8 results
function searchFoods(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return getFoodIndex()
    .filter((f) => f.name.toLowerCase().includes(q))
    .slice(0, 8);
}

// Stable empty object to avoid infinite re-render from Zustand selector
const EMPTY_SWAPS = {};

const mealIcons = {
  breakfast: Sun,
  midMorning: Coffee,
  lunch: UtensilsCrossed,
  evening: Apple,
  dinner: Moon,
};

const mealLabels = {
  breakfast: 'Breakfast',
  midMorning: 'Mid-Morning Snack',
  lunch: 'Lunch',
  evening: 'Evening Snack',
  dinner: 'Dinner',
};

export default function Diet() {
  const { dietPlan, nutritionTargets, profile, logFood, unlogFood, getTodaysFoodLogs, getTodaysCalories, getTodaysProtein, plan, swapMeal } = useUserStore();
  const isPro = plan === 'pro';
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [showAlts, setShowAlts] = useState(null);
  const [customMealSlot, setCustomMealSlot] = useState(null);
  const [customMeal, setCustomMeal] = useState({ name: '', calories: '', protein: '' });
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [manualEntry, setManualEntry] = useState(false); // true when no match found & user must enter values

  // Per-slot item selection: { breakfast: { selected: Set([0,1,2]), customItems: [{name, calories, protein}] } }
  const [itemSelections, setItemSelections] = useState({});

  const today = new Date().toISOString().split('T')[0];
  const dayIndex = new Date().getDay();
  const swaps = useUserStore((s) => s.mealSwaps[today] ?? EMPTY_SWAPS);

  // Migration guard: regenerate if old single-meal format detected
  useEffect(() => {
    if (dietPlan?.meals?.breakfast && !Array.isArray(dietPlan.meals.breakfast)) {
      useUserStore.getState().preparePlan(profile);
    }
  }, [dietPlan, profile]);

  if (!dietPlan) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <UtensilsCrossed size={48} className="text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-text-primary">No Diet Plan</h2>
          <p className="text-text-muted text-sm">Complete onboarding to get your personalized plan.</p>
        </div>
      </PageWrapper>
    );
  }

  const mealOrder = ['breakfast', 'midMorning', 'lunch', 'evening', 'dinner'];
  const meals = dietPlan.meals;
  const todaysLogs = getTodaysFoodLogs();
  const loggedMeals = new Set(todaysLogs.map((l) => l.mealType));
  const caloriesConsumed = getTodaysCalories();
  const proteinConsumed = getTodaysProtein();
  const calorieTarget = nutritionTargets?.targetCalories || 2000;
  const proteinTarget = nutritionTargets?.macros?.protein || 100;
  const caloriePercent = Math.min(100, Math.round((caloriesConsumed / calorieTarget) * 100));
  const proteinPercent = Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100));

  // Resolve active meal for a slot (swap override > day rotation)
  const getActiveMeal = (key) => {
    const mealOptions = meals[key];
    if (!Array.isArray(mealOptions)) return mealOptions;
    const activeIndex = swaps[key] !== undefined ? swaps[key] : (dayIndex % mealOptions.length);
    return mealOptions[activeIndex] || mealOptions[0];
  };

  const getActiveIndex = (key) => {
    const mealOptions = meals[key];
    if (!Array.isArray(mealOptions)) return 0;
    return swaps[key] !== undefined ? swaps[key] : (dayIndex % mealOptions.length);
  };

  // Initialize item selection for a slot (all items selected by default)
  const getSelection = (key) => {
    const activeMeal = getActiveMeal(key);
    if (itemSelections[key]) return itemSelections[key];
    // Default: all items selected, no custom items
    return {
      selected: new Set(activeMeal.items.map((_, i) => i)),
      customItems: [],
    };
  };

  // Toggle an item's selection
  const toggleItem = (mealKey, itemIndex) => {
    const sel = getSelection(mealKey);
    const newSelected = new Set(sel.selected);
    if (newSelected.has(itemIndex)) {
      newSelected.delete(itemIndex);
    } else {
      newSelected.add(itemIndex);
    }
    setItemSelections((prev) => ({
      ...prev,
      [mealKey]: { ...sel, selected: newSelected },
    }));
  };

  // Add custom item to a meal slot
  const addCustomItem = (mealKey) => {
    if (!customMeal.name || !customMeal.calories) return;
    const sel = getSelection(mealKey);
    const newCustomItems = [...sel.customItems, {
      name: customMeal.name,
      calories: Number(customMeal.calories),
      protein: Number(customMeal.protein) || 0,
    }];
    setItemSelections((prev) => ({
      ...prev,
      [mealKey]: { ...sel, customItems: newCustomItems },
    }));
    setCustomMeal({ name: '', calories: '', protein: '' });
    setCustomMealSlot(null);
  };

  // Remove a custom item
  const removeCustomItem = (mealKey, customIndex) => {
    const sel = getSelection(mealKey);
    const newCustomItems = sel.customItems.filter((_, i) => i !== customIndex);
    setItemSelections((prev) => ({
      ...prev,
      [mealKey]: { ...sel, customItems: newCustomItems },
    }));
  };

  // Calculate adjusted calories/protein based on selected items
  const getAdjustedNutrition = (mealKey) => {
    const activeMeal = getActiveMeal(mealKey);
    const sel = getSelection(mealKey);
    const totalItems = activeMeal.items.length;
    const selectedCount = sel.selected.size;

    // Proportional calculation from meal items
    const fraction = totalItems > 0 ? selectedCount / totalItems : 0;
    let adjustedCalories = Math.round(activeMeal.calories * fraction);
    let adjustedProtein = Math.round(activeMeal.protein * fraction);

    // Add custom items
    for (const ci of sel.customItems) {
      adjustedCalories += ci.calories;
      adjustedProtein += ci.protein;
    }

    return { calories: adjustedCalories, protein: adjustedProtein };
  };

  // Get all selected item names (for logging)
  const getSelectedItemNames = (mealKey) => {
    const activeMeal = getActiveMeal(mealKey);
    const sel = getSelection(mealKey);
    const names = [];
    activeMeal.items.forEach((item, i) => {
      if (sel.selected.has(i)) names.push(item);
    });
    sel.customItems.forEach((ci) => names.push(ci.name));
    return names;
  };

  // Reset item selection when meal is swapped
  const handleSwap = (mealKey, optionIndex) => {
    swapMeal(today, mealKey, optionIndex);
    // Reset selection for this slot since the meal changed
    setItemSelections((prev) => {
      const copy = { ...prev };
      delete copy[mealKey];
      return copy;
    });
    setShowAlts(null);
  };

  // Log the selected items
  const handleLog = (mealKey) => {
    const items = getSelectedItemNames(mealKey);
    if (items.length === 0) return;
    const { calories, protein } = getAdjustedNutrition(mealKey);
    logFood(mealKey, items, calories, protein);
    // Reset selection state for this slot
    setItemSelections((prev) => {
      const copy = { ...prev };
      delete copy[mealKey];
      return copy;
    });
    showCoach('mealLogged', 'left');
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
          <span className="gradient-text-warm">Diet</span> <span className="text-text-primary">Plan</span>
        </h1>
        <p className="text-text-muted text-sm">
          {profile?.dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} · {dietPlan.calorieTier} cal tier
        </p>
      </div>

      {/* Daily Targets — Free for all */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/[0.06] rounded-xl p-5 sm:p-6 mb-5"
      >
        <h3 className="font-bold mb-4 text-xs text-text-muted uppercase tracking-wider flex items-center gap-2">
          Daily Targets {dietPlan.supplements && <span className="normal-case font-normal text-text-muted/60">(incl. supplements)</span>}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Flame, value: nutritionTargets?.targetCalories, label: 'Calories', accent: true },
            { icon: Beef, value: `${nutritionTargets?.macros?.protein}g`, label: 'Protein' },
            { icon: Wheat, value: `${nutritionTargets?.macros?.carbs}g`, label: 'Carbs' },
            { icon: Droplets, value: `${nutritionTargets?.macros?.fat}g`, label: 'Fats' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="text-center">
                <Icon size={18} className={`mx-auto mb-2 ${item.accent ? 'text-accent' : 'text-text-muted'}`} />
                <div className={`text-lg sm:text-xl font-black ${item.accent ? 'text-accent' : 'text-text-primary'}`}>{item.value}</div>
                <div className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">{item.label}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-5">
          <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden flex">
            <div className="h-full bg-white" style={{ width: `${(nutritionTargets?.macros?.protein * 4 / nutritionTargets?.targetCalories) * 100}%` }} />
            <div className="h-full bg-white/40" style={{ width: `${(nutritionTargets?.macros?.carbs * 4 / nutritionTargets?.targetCalories) * 100}%` }} />
            <div className="h-full bg-white/15" style={{ width: `${(nutritionTargets?.macros?.fat * 9 / nutritionTargets?.targetCalories) * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-[11px] text-text-muted">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white"></span> Protein</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white/40"></span> Carbs</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white/15"></span> Fats</span>
          </div>
        </div>
      </motion.div>

      {/* Today's Intake, Meals, Supplements — Pro Only */}
      {isPro ? (
        <>
          {/* Today's Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/[0.06] rounded-xl p-5 mb-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-text-secondary flex items-center gap-2">
                <Zap size={14} className="text-accent" /> Today's Intake
              </h3>
              <span className="text-[11px] text-text-muted">{todaysLogs.length} meals logged</span>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-text-muted">Calories</span>
                  <span className="font-medium text-accent">{caloriesConsumed}/{calorieTarget}</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${caloriePercent}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-text-muted">Protein</span>
                  <span className="font-medium text-text-primary">{proteinConsumed}g/{proteinTarget}g</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${proteinPercent}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 mt-4">
              {mealOrder.filter((key) => meals[key]).map((key) => {
                const logged = loggedMeals.has(key);
                return (
                  <div
                    key={key}
                    className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-medium transition-all truncate ${
                      logged ? 'bg-accent/10 text-accent' : 'bg-white/[0.03] text-text-muted'
                    }`}
                  >
                    {logged ? <Check size={12} className="mx-auto" /> : mealLabels[key]?.split(' ')[0]}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Tips */}
          <div className="space-y-2 mb-5">
            <div className="flex items-start gap-2.5 bg-accent/5 border border-accent/10 rounded-lg px-4 py-3">
              <Info size={14} className="text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted">Select what you ate, skip what you didn't. Add custom foods if yours isn't listed. Tap <strong>Swap</strong> to pick a different meal.</p>
            </div>
            <div className="flex items-start gap-2.5 bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-3">
              <Droplets size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted"><span className="text-blue-400 font-medium">Stay hydrated!</span> Drink at least 3-4 litres of water daily. Carry a bottle everywhere — hydration boosts metabolism, recovery, and focus.</p>
            </div>
          </div>

          {/* Meal Cards */}
          <div className="space-y-2">
            {mealOrder.filter((key) => meals[key]).map((key, i) => {
              const activeMeal = getActiveMeal(key);
              const activeIndex = getActiveIndex(key);
              const mealOptions = meals[key];
              const isArray = Array.isArray(mealOptions);
              const Icon = mealIcons[key] || UtensilsCrossed;
              const isExpanded = expandedMeal === key;
              const isLogged = loggedMeals.has(key);
              const sel = getSelection(key);
              const adjusted = getAdjustedNutrition(key);
              const hasSelection = sel.selected.size > 0 || sel.customItems.length > 0;
              const isModified = itemSelections[key] !== undefined;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border rounded-xl ${isLogged ? 'border-accent/20' : 'border-white/[0.06]'}`}
                >
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => setExpandedMeal(isExpanded ? null : key)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isLogged ? 'bg-accent/10' : 'bg-white/[0.04]'}`}>
                        {isLogged ? <Check size={16} className="text-accent" /> : <Icon size={16} className="text-text-muted" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-text-primary">{mealLabels[key]}</h3>
                        <p className="text-[11px] text-text-muted">{activeMeal.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold text-accent">
                          {isModified ? adjusted.calories : activeMeal.calories} cal
                        </span>
                        <span className="text-[11px] text-text-muted block">
                          {isModified ? adjusted.protein : activeMeal.protein}g protein
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 overflow-visible"
                      >
                        {/* Food Items with Checkboxes */}
                        <div className="bg-white/[0.03] rounded-lg p-3 mb-3">
                          <h4 className="text-[11px] font-medium text-text-muted mb-2 uppercase tracking-wider">
                            {isLogged ? 'What you ate' : 'Select what you ate'}
                          </h4>
                          <ul className="space-y-1">
                            {activeMeal.items.map((item, j) => {
                              const isSelected = sel.selected.has(j);
                              return (
                                <li
                                  key={j}
                                  className={`text-sm flex items-center gap-2 py-1 rounded-md transition-all ${
                                    isLogged ? 'text-text-muted' : 'cursor-pointer hover:bg-white/[0.03] px-1 -mx-1'
                                  }`}
                                  onClick={(e) => {
                                    if (!isLogged) {
                                      e.stopPropagation();
                                      toggleItem(key, j);
                                    }
                                  }}
                                >
                                  {!isLogged ? (
                                    isSelected ? (
                                      <CheckSquare size={16} className="text-accent shrink-0" />
                                    ) : (
                                      <Square size={16} className="text-text-muted/40 shrink-0" />
                                    )
                                  ) : (
                                    <span className="text-accent text-xs shrink-0">●</span>
                                  )}
                                  <span className={isSelected || isLogged ? 'text-text-secondary' : 'text-text-muted/40 line-through'}>
                                    {item}
                                  </span>
                                </li>
                              );
                            })}

                            {/* Custom Items Added */}
                            {sel.customItems.map((ci, j) => (
                              <li
                                key={`custom-${j}`}
                                className="text-sm flex items-center gap-2 py-1 text-text-secondary"
                              >
                                <CheckSquare size={16} className="text-accent shrink-0" />
                                <span className="flex-1">{ci.name}</span>
                                <span className="text-[10px] text-text-muted">{ci.calories} cal · {ci.protein}g P</span>
                                {!isLogged && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); removeCustomItem(key, j); }}
                                    className="text-text-muted hover:text-red-400 transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>

                          {/* Adjusted totals when modified */}
                          {!isLogged && isModified && (
                            <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                              <span className="text-text-muted">Adjusted total</span>
                              <span className="font-medium text-accent">{adjusted.calories} cal · {adjusted.protein}g P</span>
                            </div>
                          )}
                        </div>

                        {/* Log / Logged / Undo */}
                        {!isLogged ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleLog(key); }}
                            disabled={!hasSelection}
                            className="w-full py-2.5 rounded-lg text-sm font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/15 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} /> Log Selected ({adjusted.calories} cal) +20 XP
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-accent/5 text-accent/50 text-center flex items-center justify-center gap-2">
                              <Check size={14} /> Logged
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const todayLog = todaysLogs.filter((l) => l.mealType === key).pop();
                                if (todayLog) { unlogFood(todayLog.id); showCoach('mealUndo', 'left'); }
                              }}
                              className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted border border-white/[0.08] hover:text-red-400 hover:border-red-400/20 transition-all flex items-center gap-1"
                            >
                              <Undo2 size={14} /> Undo
                            </button>
                          </div>
                        )}

                        {/* Add Custom + Swap Meal — single row */}
                        {!isLogged && (
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); setCustomMealSlot(customMealSlot === key ? null : key); setShowAlts(null); }}
                              className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-all ${
                                customMealSlot === key
                                  ? 'bg-accent/10 text-accent border-accent/20'
                                  : 'text-text-muted border-white/[0.08] hover:text-text-secondary hover:border-white/15'
                              }`}
                            >
                              <PenLine size={12} /> Add Items
                            </button>
                            {isArray && mealOptions.length > 1 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowAlts(showAlts === key ? null : key); setCustomMealSlot(null); }}
                                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-all ${
                                  showAlts === key
                                    ? 'bg-accent/10 text-accent border-accent/20'
                                    : 'text-text-muted border-white/[0.08] hover:text-text-secondary hover:border-white/15'
                                }`}
                              >
                                <RefreshCw size={12} /> Swap Meal
                              </button>
                            )}
                          </div>
                        )}

                        {/* Custom Food Form (expanded) */}
                        {!isLogged && customMealSlot === key && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="bg-[#1a1a1a] rounded-lg p-3 space-y-2 mt-2 relative z-30"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Food name with search */}
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Type food name (e.g. Curd Rice, Idli)"
                                value={customMeal.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCustomMeal((p) => ({ ...p, name: val }));
                                  const results = searchFoods(val);
                                  setFoodSuggestions(results);
                                  if (results.length === 0 && val.length >= 2) {
                                    setManualEntry(true);
                                  } else {
                                    setManualEntry(false);
                                  }
                                }}
                                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent/30"
                              />

                              {/* Search suggestions dropdown */}
                              {foodSuggestions.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-white/[0.15] rounded-lg z-50 shadow-2xl max-h-64 overflow-y-auto">
                                  {foodSuggestions.map((food, fi) => (
                                    <button
                                      key={fi}
                                      onClick={() => {
                                        setCustomMeal({ name: food.name, calories: String(food.calories), protein: String(food.protein) });
                                        setFoodSuggestions([]);
                                        setManualEntry(false);
                                      }}
                                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-white/[0.08] transition-colors text-left border-b border-white/[0.06] last:border-b-0"
                                    >
                                      <span className="text-text-primary truncate mr-2">{food.name}</span>
                                      <span className="text-[10px] text-text-muted whitespace-nowrap">{food.calories} cal · {food.protein}g P</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Show "not found" hint when no suggestions */}
                            {manualEntry && foodSuggestions.length === 0 && customMeal.name.length >= 2 && (
                              <p className="text-[11px] text-amber-400/80">Not found in our database — enter calories & protein below.</p>
                            )}

                            {/* Calories & protein fields — show when food is selected or manual entry */}
                            {(customMeal.calories || manualEntry) && (
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  placeholder="Calories"
                                  value={customMeal.calories}
                                  onChange={(e) => setCustomMeal((p) => ({ ...p, calories: e.target.value }))}
                                  className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent/30"
                                />
                                <input
                                  type="number"
                                  placeholder="Protein (g)"
                                  value={customMeal.protein}
                                  onChange={(e) => setCustomMeal((p) => ({ ...p, protein: e.target.value }))}
                                  className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent/30"
                                />
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => addCustomItem(key)}
                                disabled={!customMeal.name || !customMeal.calories}
                                className="flex-1 py-2 rounded-lg text-sm font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                              >
                                <Plus size={12} /> Add Item
                              </button>
                              <button
                                onClick={() => {
                                  setCustomMealSlot(null);
                                  setCustomMeal({ name: '', calories: '', protein: '' });
                                  setFoodSuggestions([]);
                                  setManualEntry(false);
                                }}
                                className="px-3 py-2 rounded-lg text-sm text-text-muted border border-white/[0.08] hover:text-text-primary transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* Swap Meal Options */}
                        {isArray && mealOptions.length > 1 && showAlts === key && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="space-y-1 max-h-56 overflow-y-auto mt-2"
                          >
                            {mealOptions.map((opt, j) => (
                              <button
                                key={j}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSwap(key, j);
                                }}
                                className={`w-full flex items-center justify-between rounded-lg p-2.5 text-sm text-left transition-all ${
                                  j === activeIndex
                                    ? 'bg-accent/10 border border-accent/20'
                                    : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.06]'
                                }`}
                              >
                                <span className={`flex-1 mr-3 ${j === activeIndex ? 'text-accent font-medium' : 'text-text-secondary'}`}>
                                  {opt.name}
                                </span>
                                <span className="text-[11px] text-text-muted whitespace-nowrap">{opt.calories} cal · {opt.protein}g P</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Supplements */}
          {dietPlan.supplements && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 border border-white/[0.06] rounded-xl p-5"
            >
              <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-text-secondary">
                <Pill size={16} /> Supplement Plan
              </h3>
              <div className="space-y-3">
                {Object.entries(dietPlan.supplements).map(([key, supp]) => (
                  <div key={key} className="bg-white/[0.03] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-text-primary">{supp.name}</span>
                      <span className="text-[11px] text-text-muted">{supp.calories} cal · {supp.protein}g P</span>
                    </div>
                    <ul className="space-y-0.5">
                      {supp.items.map((item, j) => (
                        <li key={j} className="text-xs text-text-muted">· {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <ProLock message="Meal tracking, logging, swaps & supplements">
          <div className="space-y-4">
            <div className="border border-white/[0.06] rounded-xl p-5 h-[120px]" />
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-white/[0.06] rounded-xl p-4 h-[72px]" />
              ))}
            </div>
          </div>
        </ProLock>
      )}
    </PageWrapper>
  );
}
