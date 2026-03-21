import { useState } from 'react';
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
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import useUserStore from '../store/useUserStore';
import { mealAlternatives } from '../data/dietPlans';

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
  const { dietPlan, nutritionTargets, profile, logFood, unlogFood, getTodaysFoodLogs, getTodaysCalories, getTodaysProtein } = useUserStore();
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [showAlts, setShowAlts] = useState(null);

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

  const handleQuickLog = (mealKey, meal) => {
    logFood(mealKey, meal.items, meal.calories, meal.protein);
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

      {/* Tip */}
      <div className="flex items-start gap-2.5 bg-accent/5 border border-accent/10 rounded-lg px-4 py-3 mb-5">
        <Info size={14} className="text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted">Log each meal as you eat for the most accurate tracking.</p>
      </div>

      {/* Macro Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="border border-white/[0.06] rounded-xl p-5 sm:p-6 mb-8"
      >
        <h3 className="font-bold mb-4 text-xs text-text-muted uppercase tracking-wider">Daily Targets</h3>
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

        {/* Macro Bar */}
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

      {/* Meal Cards */}
      <div className="space-y-2">
        {mealOrder.filter((key) => meals[key]).map((key, i) => {
          const meal = meals[key];
          const Icon = mealIcons[key] || UtensilsCrossed;
          const isExpanded = expandedMeal === key;
          const isLogged = loggedMeals.has(key);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`border rounded-xl overflow-hidden ${isLogged ? 'border-accent/20' : 'border-white/[0.06]'}`}
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
                    <p className="text-[11px] text-text-muted">{meal.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-accent">{meal.calories} cal</span>
                    <span className="text-[11px] text-text-muted block">{meal.protein}g protein</span>
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
                    className="px-4 pb-4"
                  >
                    <div className="bg-white/[0.03] rounded-lg p-3 mb-3">
                      <h4 className="text-[11px] font-medium text-text-muted mb-2 uppercase tracking-wider">What to eat</h4>
                      <ul className="space-y-1">
                        {meal.items.map((item, j) => (
                          <li key={j} className="text-sm text-text-muted flex items-start gap-2">
                            <span className="text-accent mt-0.5 text-xs">●</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!isLogged ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleQuickLog(key, meal); }}
                        className="w-full py-2.5 rounded-lg text-sm font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/15 transition-all flex items-center justify-center gap-2 mb-3"
                      >
                        <Plus size={14} /> Log This Meal (+50 XP)
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-accent/5 text-accent/50 text-center flex items-center justify-center gap-2">
                          <Check size={14} /> Logged
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const todayLog = todaysLogs.filter((l) => l.mealType === key).pop();
                            if (todayLog) unlogFood(todayLog.id);
                          }}
                          className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted border border-white/[0.08] hover:text-red-400 hover:border-red-400/20 transition-all flex items-center gap-1"
                        >
                          <Undo2 size={14} /> Undo
                        </button>
                      </div>
                    )}

                    {mealAlternatives[key] && (
                      <div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowAlts(showAlts === key ? null : key); }}
                          className="flex items-center gap-1 text-[11px] text-text-muted font-medium mb-2 hover:text-text-muted"
                        >
                          <RefreshCw size={11} /> Swap with alternative
                        </button>
                        {showAlts === key && (
                          <div className="space-y-1">
                            {mealAlternatives[key].map((alt, j) => (
                              <div key={j} className="flex items-center justify-between bg-white/[0.03] rounded-lg p-2 text-sm">
                                <span className="text-text-muted">{alt.name}</span>
                                <span className="text-[11px] text-text-muted">{alt.calories} cal · {alt.protein}g P</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Daily Total */}
      <div className="mt-6 border border-white/[0.06] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary text-sm">Daily Total</span>
          <div className="text-right">
            <span className="text-lg font-black text-accent">{dietPlan.totalCalories} cal</span>
            <span className="text-sm text-text-muted block">{dietPlan.totalProtein}g protein</span>
          </div>
        </div>
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
    </PageWrapper>
  );
}
