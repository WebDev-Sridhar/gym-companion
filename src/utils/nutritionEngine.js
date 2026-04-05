// Dynamic nutrition calculation engine
// All values computed from food database — zero hardcoded calories/protein

import { foodDatabase } from '../data/foodDatabase';

/**
 * Calculate nutrition for a single food item at a given quantity
 * @param {object} foodItem - Food item from foodDatabase
 * @param {number} grams - Quantity in grams
 * @returns {{ calories: number, protein: number, carbs: number, fats: number }}
 */
export function calculateNutrition(foodItem, grams) {
  const factor = grams / 100;
  return {
    calories: Math.round(foodItem.calories_per_100g * factor),
    protein: Math.round(foodItem.protein_per_100g * factor * 10) / 10,
    carbs: Math.round(foodItem.carbs_per_100g * factor * 10) / 10,
    fats: Math.round(foodItem.fats_per_100g * factor * 10) / 10,
  };
}

/**
 * Calculate total nutrition for a meal (array of food components)
 * @param {Array<{ foodItem: object, grams: number }>} components
 * @returns {{ calories: number, protein: number, carbs: number, fats: number }}
 */
export function calculateMealNutrition(components) {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fats = 0;

  for (const { foodItem, grams } of components) {
    const n = calculateNutrition(foodItem, grams);
    calories += n.calories;
    protein += n.protein;
    carbs += n.carbs;
    fats += n.fats;
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats),
  };
}

/**
 * Calculate total nutrition for a full day of meals
 * @param {object} meals - { breakfast: mealData, lunch: mealData, ... }
 *   where mealData = { calories, protein, carbs, fats }
 * @returns {{ totalCalories: number, totalProtein: number, totalCarbs: number, totalFats: number }}
 */
export function calculateDayNutrition(meals) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  for (const meal of Object.values(meals)) {
    const m = Array.isArray(meal) ? meal[0] : meal;
    if (!m) continue;
    totalCalories += m.calories || 0;
    totalProtein += m.protein || 0;
    totalCarbs += m.carbs || 0;
    totalFats += m.fats || 0;
  }

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein),
    totalCarbs: Math.round(totalCarbs),
    totalFats: Math.round(totalFats),
  };
}

/**
 * Resolve a meal template into a fully computed meal object
 * Looks up each component in the food database and calculates nutrition
 *
 * @param {object} template - Meal template from mealTemplates
 * @returns {{ name: string, items: string[], calories: number, protein: number, carbs: number, fats: number, templateId: string }}
 */
export function resolveMealTemplate(template) {
  const items = [];
  const components = [];

  for (const comp of template.components) {
    const foodItem = foodDatabase[comp.foodId];
    if (!foodItem) continue;

    items.push(comp.label);
    components.push({ foodItem, grams: comp.grams });
  }

  const nutrition = calculateMealNutrition(components);

  return {
    name: template.name,
    items,
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fats: nutrition.fats,
    templateId: template.id,
  };
}

/**
 * Scale a meal template to hit a target calorie count
 * Proportionally adjusts all component grams
 *
 * @param {object} template - Meal template
 * @param {number} targetCalories - Desired calorie count
 * @returns {object} Resolved meal with scaled portions
 */
export function scaleMealTemplate(template, targetCalories) {
  // First resolve at original portions to get base calories
  const base = resolveMealTemplate(template);
  if (base.calories === 0) return base;

  const scaleFactor = targetCalories / base.calories;

  // Clamp scale factor to avoid absurd portions (0.5x to 2x)
  const clampedScale = Math.max(0.5, Math.min(2.0, scaleFactor));

  // Build scaled components
  const items = [];
  const components = [];

  for (const comp of template.components) {
    const foodItem = foodDatabase[comp.foodId];
    if (!foodItem) continue;

    const scaledGrams = Math.round(comp.grams * clampedScale);
    items.push(comp.label);
    components.push({ foodItem, grams: scaledGrams });
  }

  const nutrition = calculateMealNutrition(components);

  return {
    name: template.name,
    items,
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fats: nutrition.fats,
    templateId: template.id,
  };
}
