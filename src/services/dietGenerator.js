// Smart diet plan generation service
// Dynamically generates personalized meal plans based on user profile & goals
// All nutrition values are computed from food database — never hardcoded

import { mealTemplates, getTemplatesByCategoryAndType } from '../data/mealTemplates';
import { resolveMealTemplate, scaleMealTemplate, calculateDayNutrition } from '../utils/nutritionEngine';
import { calculateNutritionTargets, calculateMacros } from '../utils/tdee';
import { supplementPlans } from '../data/foodDatabase';

// Meal slot distribution (percentage of daily calories)
const MEAL_DISTRIBUTION = {
  breakfast: 0.25,
  midMorning: 0.075,
  lunch: 0.35,
  evening: 0.075,
  dinner: 0.25,
};

// Map meal slots to template types
const SLOT_TO_TYPE = {
  breakfast: 'breakfast',
  midMorning: 'snack',
  lunch: 'lunch',
  evening: 'snack',
  dinner: 'dinner',
};

// Number of options per meal slot
const OPTIONS_PER_SLOT = 7;

/**
 * Seeded pseudo-random number generator for reproducible shuffles
 */
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Shuffle array using Fisher-Yates with optional seed
 */
function shuffleArray(arr, rng = Math.random) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Score a resolved meal against a calorie target
 * Lower score = better fit
 */
function scoreMeal(resolvedMeal, targetCalories, targetProtein) {
  const calorieDiff = Math.abs(resolvedMeal.calories - targetCalories);
  const calorieScore = calorieDiff / Math.max(targetCalories, 1);

  // Protein bonus: prefer meals with higher protein density
  const proteinDensity = resolvedMeal.protein / Math.max(resolvedMeal.calories, 1);
  const proteinBonus = targetProtein > 0 ? proteinDensity * 0.3 : 0;

  return calorieScore - proteinBonus;
}

/**
 * Calculate food overlap between two templates (0 to 1)
 * Used to ensure variety in meal options
 */
function calculateOverlap(templateA, templateB) {
  const foodsA = new Set(templateA.components.map((c) => c.foodId));
  const foodsB = new Set(templateB.components.map((c) => c.foodId));
  let shared = 0;
  for (const f of foodsA) {
    if (foodsB.has(f)) shared++;
  }
  const total = Math.max(foodsA.size, foodsB.size);
  return total === 0 ? 0 : shared / total;
}

/**
 * Select the best N templates for a meal slot with variety constraints
 */
function selectMealsForSlot(templates, targetCalories, targetProtein, count, rng) {
  if (templates.length === 0) return [];

  // Resolve and score all templates (scaled to target)
  const scored = templates.map((template) => {
    const resolved = scaleMealTemplate(template, targetCalories);
    const score = scoreMeal(resolved, targetCalories, targetProtein);
    return { template, resolved, score };
  });

  // Sort by score (best fit first)
  scored.sort((a, b) => a.score - b.score);

  // Greedy selection with variety constraint
  const selected = [];
  const used = new Set();

  for (const candidate of scored) {
    if (selected.length >= count) break;
    if (used.has(candidate.template.id)) continue;

    // Check overlap with already-selected meals
    const hasHighOverlap = selected.some(
      (s) => calculateOverlap(s.template, candidate.template) > 0.5
    );

    if (hasHighOverlap && selected.length < count - 1) {
      continue; // Skip high-overlap, but don't skip if we need to fill slots
    }

    selected.push(candidate);
    used.add(candidate.template.id);
  }

  // If we didn't get enough (due to variety constraints), fill remaining
  for (const candidate of scored) {
    if (selected.length >= count) break;
    if (used.has(candidate.template.id)) continue;
    selected.push(candidate);
    used.add(candidate.template.id);
  }

  // Shuffle selected options (so daily rotation isn't always best-fit-first)
  return shuffleArray(selected, rng).map((s) => s.resolved);
}

/**
 * Generate a complete dynamic diet plan based on user profile
 *
 * @param {object} profile - User profile from onboarding
 * @param {object} options - { calorieOverride?: number, seed?: number }
 * @returns {object} Diet plan compatible with existing Diet.jsx UI
 */
export function generateDynamicDietPlan(profile, options = {}) {
  const nutritionTargets = calculateNutritionTargets(profile);
  const targetCalories = options.calorieOverride || nutritionTargets.targetCalories;
  const { dietType, useSupplements } = profile;

  // Account for supplement calories
  let suppCalories = 0;
  let suppProtein = 0;
  const supplements = useSupplements ? supplementPlans?.withSupplements : null;
  if (supplements) {
    for (const supp of Object.values(supplements)) {
      suppCalories += supp.calories || 0;
      suppProtein += supp.protein || 0;
    }
  }

  const mealCalorieTarget = supplements
    ? Math.max(1200, targetCalories - suppCalories)
    : targetCalories;

  const proteinTarget = nutritionTargets.macros.protein;

  // Use seed for reproducible generation (changes each call unless specified)
  const seed = options.seed ?? Date.now();
  const rng = seededRandom(seed);

  // Generate meals for each slot
  const meals = {};
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  const mealSlots = ['breakfast', 'midMorning', 'lunch', 'evening', 'dinner'];

  for (const slot of mealSlots) {
    const templateType = SLOT_TO_TYPE[slot];
    const distribution = MEAL_DISTRIBUTION[slot];
    const slotCalories = Math.round(mealCalorieTarget * distribution);
    const slotProtein = Math.round(proteinTarget * distribution);

    // Get matching templates (respect diet preference)
    const available = getTemplatesByCategoryAndType(dietType, templateType);

    // Select best meals for this slot
    const options_ = selectMealsForSlot(
      available,
      slotCalories,
      slotProtein,
      OPTIONS_PER_SLOT,
      rng
    );

    meals[slot] = options_;

    // Track totals using the first option (representative day)
    if (options_.length > 0) {
      totalCalories += options_[0].calories;
      totalProtein += options_[0].protein;
      totalCarbs += options_[0].carbs || 0;
      totalFats += options_[0].fats || 0;
    }
  }

  // Protein check: if total protein falls short, try to boost lunch/dinner
  const proteinShortfall = proteinTarget - totalProtein - suppProtein;
  if (proteinShortfall > 15) {
    // Re-select lunch and dinner with higher protein weight
    for (const slot of ['lunch', 'dinner']) {
      const templateType = SLOT_TO_TYPE[slot];
      const distribution = MEAL_DISTRIBUTION[slot];
      const slotCalories = Math.round(mealCalorieTarget * distribution);

      const available = getTemplatesByCategoryAndType(dietType, templateType);

      // Sort by protein density instead
      const proteinSorted = available
        .map((t) => ({ template: t, resolved: scaleMealTemplate(t, slotCalories) }))
        .sort((a, b) => b.resolved.protein - a.resolved.protein);

      if (proteinSorted.length > 0) {
        const boosted = proteinSorted
          .slice(0, OPTIONS_PER_SLOT)
          .map((s) => s.resolved);
        meals[slot] = shuffleArray(boosted, rng);
      }
    }

    // Recalculate totals
    const recalc = calculateDayNutrition(meals);
    totalCalories = recalc.totalCalories;
    totalProtein = recalc.totalProtein;
    totalCarbs = recalc.totalCarbs;
    totalFats = recalc.totalFats;
  }

  // Final actual calories (meals + supplements)
  const actualCalories = totalCalories + suppCalories;
  const adjustedMacros = calculateMacros(actualCalories, profile.goal, profile.weight);

  return {
    ...nutritionTargets,
    targetCalories: actualCalories,
    macros: adjustedMacros,
    calorieTier: null, // No longer tier-based
    meals,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFats,
    supplements,
    generatedAt: Date.now(),
    seed,
  };
}

/**
 * Generate a 7-day weekly diet plan with day-to-day variety
 * Each day shuffles the option order differently so the "active" meal per day differs
 *
 * @param {object} profile - User profile
 * @returns {object} Standard diet plan (same shape — the 7 options per slot serve as the 7-day rotation)
 */
export function generateWeeklyPlan(profile) {
  // The standard generation already produces 7 options per slot
  // Each day rotates through them via dayIndex % 7
  // Using a different seed gives a completely new set
  return generateDynamicDietPlan(profile, { seed: getWeeklySeed() });
}

/**
 * Get a deterministic seed based on the current week
 * Same week = same plan (regeneration creates a new one)
 */
function getWeeklySeed() {
  const now = new Date();
  const yearWeek = now.getFullYear() * 100 + getWeekNumber(now);
  return yearWeek;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/**
 * Generate a replacement meal for a specific slot
 * Excludes meals already in the current plan for that slot
 *
 * @param {object} currentPlan - Current diet plan
 * @param {string} mealSlot - Slot to swap (e.g., 'breakfast')
 * @param {string} dietType - 'veg' | 'nonVeg'
 * @returns {object|null} New meal option or null if no alternatives
 */
export function generateSwapMeal(currentPlan, mealSlot, dietType) {
  const templateType = SLOT_TO_TYPE[mealSlot];
  const distribution = MEAL_DISTRIBUTION[mealSlot];
  const targetCalories = Math.round(
    (currentPlan.targetCalories - (currentPlan.supplements
      ? Object.values(currentPlan.supplements).reduce((s, v) => s + (v.calories || 0), 0)
      : 0)) * distribution
  );

  const available = getTemplatesByCategoryAndType(dietType, templateType);

  // Get IDs of current options in this slot
  const currentIds = new Set(
    (currentPlan.meals[mealSlot] || []).map((m) => m.templateId).filter(Boolean)
  );

  // Filter to templates not already in the plan
  const candidates = available.filter((t) => !currentIds.has(t.id));

  if (candidates.length === 0) return null;

  // Pick the best-fitting candidate
  const scored = candidates.map((template) => {
    const resolved = scaleMealTemplate(template, targetCalories);
    return { resolved, score: Math.abs(resolved.calories - targetCalories) };
  });

  scored.sort((a, b) => a.score - b.score);
  return scored[0].resolved;
}
