import { exercises, workoutSplits } from '../data/exercises';
import { dietPlans, supplementPlans } from '../data/dietPlans';
import { calculateNutritionTargets, calculateMacros } from './tdee';

/**
 * Generate a personalized workout plan based on user profile
 * @param {object} profile - User profile from onboarding
 * @returns {object} Complete workout plan
 */
export function generateWorkoutPlan(profile) {
  const { workoutDays, goal } = profile;

  // Select appropriate split based on days available
  let splitKey;
  if (workoutDays <= 3) {
    splitKey = 'fullBody3';
  } else if (workoutDays === 4) {
    splitKey = 'upperLower4';
  } else if (workoutDays === 5) {
    splitKey = 'ppl5';
  } else {
    splitKey = 'ppl6';
  }

  const split = workoutSplits[splitKey];

  // Build detailed schedule with full exercise data
  const detailedSchedule = split.schedule.map((day) => ({
    ...day,
    exercises: day.exercises.map((exKey) => {
      const ex = exercises[exKey];
      if (!ex) return null;

      // Adjust sets/reps based on goal
      let sets = ex.sets;
      let reps = ex.reps;

      if (goal === 'weightLoss') {
        // Higher reps, slightly lower weight focus
        sets = Math.max(3, sets);
        reps = ex.reps.includes('-') ? ex.reps.split('-').map(r => {
          const n = parseInt(r);
          return isNaN(n) ? r : n + 2;
        }).join('-') : ex.reps;
      }

      return {
        ...ex,
        sets,
        reps,
      };
    }).filter(Boolean),
  }));

  return {
    splitName: split.name,
    splitKey,
    level: split.level,
    daysPerWeek: split.days,
    schedule: detailedSchedule,
    tips: getWorkoutTips(goal),
  };
}

/**
 * Generate a personalized diet plan based on user profile
 * @param {object} profile - User profile from onboarding
 * @returns {object} Complete diet plan
 */
export function generateDietPlan(profile, calorieOverride) {
  const nutritionTargets = calculateNutritionTargets(profile);
  const targetCalories = calorieOverride || nutritionTargets.targetCalories;
  const { dietType, useSupplements } = profile;

  // Find closest calorie tier
  const tiers = [1500, 1800, 2000, 2200, 2500, 2800, 3000];
  const closestTier = tiers.reduce((prev, curr) =>
    Math.abs(curr - targetCalories) < Math.abs(prev - targetCalories) ? curr : prev
  );

  const mealPlan = dietPlans[closestTier];
  if (!mealPlan) {
    // Fallback to 2000 if something goes wrong
    const fallback = dietPlans[2000];
    return {
      ...nutritionTargets,
      calorieTier: 2000,
      meals: fallback[dietType === 'veg' ? 'veg' : 'nonVeg'].meals,
      totalCalories: fallback[dietType === 'veg' ? 'veg' : 'nonVeg'].totalCalories,
      totalProtein: fallback[dietType === 'veg' ? 'veg' : 'nonVeg'].totalProtein,
      supplements: useSupplements ? supplementPlans.withSupplements : null,
    };
  }

  const selectedPlan = mealPlan[dietType === 'veg' ? 'veg' : 'nonVeg'];

  // Calculate supplement totals if applicable
  let suppCalories = 0;
  let suppProtein = 0;
  const supplements = useSupplements ? supplementPlans.withSupplements : null;
  if (supplements) {
    for (const supp of Object.values(supplements)) {
      suppCalories += supp.calories || 0;
      suppProtein += supp.protein || 0;
    }
  }

  // Use actual tier calories (meals + supplements) as the real target
  // so displayed targets match what the meals actually provide
  const actualCalories = selectedPlan.totalCalories + suppCalories;
  const actualProtein = selectedPlan.totalProtein + suppProtein;

  // Recalculate macros based on actual tier calories for consistency
  const adjustedMacros = calculateMacros(actualCalories, profile.goal, profile.weight);
  // Override protein with actual meal+supplement protein since that's what the food provides
  adjustedMacros.protein = actualProtein;
  // Recalculate carbs with the real protein value
  const proteinCals = adjustedMacros.protein * 4;
  const fatCals = adjustedMacros.fat * 9;
  adjustedMacros.carbs = Math.round(Math.max(0, actualCalories - proteinCals - fatCals) / 4);

  return {
    ...nutritionTargets,
    targetCalories: actualCalories,
    macros: adjustedMacros,
    calorieTier: closestTier,
    meals: selectedPlan.meals,
    totalCalories: selectedPlan.totalCalories,
    totalProtein: selectedPlan.totalProtein,
    supplements,
  };
}

/**
 * Get the meal option for a given day (rotation through available options)
 */
export function getMealForDay(mealOptions, dayIndex) {
  if (!Array.isArray(mealOptions)) return mealOptions;
  return mealOptions[dayIndex % mealOptions.length];
}

/**
 * Get workout tips based on goal
 */
function getWorkoutTips(goal) {
  const tips = {
    weightLoss: [
      'Focus on compound movements that burn more calories',
      'Keep rest periods shorter (45-60s) to maintain elevated heart rate',
      'Add 15-20 min of walking after your workout',
      'Consistency matters more than intensity — show up every day',
    ],
    muscleGain: [
      'Focus on progressive overload — add weight or reps each week',
      'Rest 90-120 seconds between heavy compound sets',
      'Mind-muscle connection is key — feel the muscle working',
      'Eat within 1-2 hours after your workout for best recovery',
    ],
    maintenance: [
      'Focus on maintaining strength while keeping a balanced routine',
      'Mix up exercises every 4-6 weeks to prevent plateau',
      'Listen to your body — rest when you need it',
      'Stay consistent with both training and nutrition',
    ],
  };
  return tips[goal] || tips.maintenance;
}

/**
 * Get the workout for today based on the schedule
 * @param {object} workoutPlan - Generated workout plan
 * @returns {object} Today's workout
 */
export function getTodaysWorkout(workoutPlan) {
  if (!workoutPlan?.schedule?.length) return null;

  // Get the current day index (cycling through the schedule)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat

  // Skip Sunday (rest day)
  if (dayOfWeek === 0) return { isRestDay: true };

  // Map workout days to schedule
  const scheduleIndex = (dayOfWeek - 1) % workoutPlan.schedule.length;
  return {
    isRestDay: false,
    ...workoutPlan.schedule[scheduleIndex],
  };
}
