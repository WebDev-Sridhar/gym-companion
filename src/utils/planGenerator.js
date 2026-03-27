import { exercises, workoutSplits } from '../data/exercises';
import { dietPlans, supplementPlans } from '../data/dietPlans';
import { calculateNutritionTargets, calculateMacros } from './tdee';

/**
 * Generate a personalized workout plan based on user profile
 * @param {object} profile - User profile from onboarding
 * @returns {object} Complete workout plan
 */
// Cardio config per goal — added to every workout day
const CARDIO_BY_GOAL = {
  weightLoss: { type: 'treadmill', targetDuration: 30, targetDistance: 3, note: 'Walk/jog at 6–8 km/h' },
  muscleGain: { type: 'cycling', targetDuration: 15, targetDistance: null, note: 'Low intensity warmup/cooldown' },
  maintenance: { type: 'treadmill', targetDuration: 20, targetDistance: 2, note: 'Comfortable pace 7–9 km/h' },
};

export function generateWorkoutPlan(profile) {
  const { workoutDays, goal, gymExperience } = profile;
  const isNever = gymExperience === 'never';

  // First-timers always get a full-body 3-day split regardless of workoutDays
  let splitKey;
  if (isNever || workoutDays <= 3) {
    splitKey = 'fullBody3';
  } else if (workoutDays === 4) {
    splitKey = 'upperLower4';
  } else if (workoutDays === 5) {
    splitKey = 'ppl5';
  } else {
    splitKey = 'ppl6';
  }

  const split = workoutSplits[splitKey];
  const cardio = CARDIO_BY_GOAL[goal] || CARDIO_BY_GOAL.maintenance;

  // Build detailed schedule with full exercise data
  const detailedSchedule = split.schedule.map((day) => ({
    ...day,
    cardio,
    exercises: day.exercises.map((exKey) => {
      const ex = exercises[exKey];
      if (!ex) return null;

      // Adjust sets/reps based on experience and goal
      let sets = ex.sets;
      let reps = ex.reps;

      if (isNever) {
        // First-timers: 3 sets, higher reps, focus on form
        sets = Math.min(3, sets);
        reps = '12-15';
      } else if (goal === 'weightLoss') {
        // Weight loss: higher reps for more calorie burn
        sets = Math.max(3, sets);
        reps = ex.reps.includes('-') ? ex.reps.split('-').map(r => {
          const n = parseInt(r);
          return isNaN(n) ? r : n + 2;
        }).join('-') : ex.reps;
      }

      return {
        ...ex,
        exerciseKey: exKey,
        sets,
        reps,
      };
    }).filter(Boolean),
  }));

  return {
    splitName: isNever ? 'Beginner Foundation (3 days)' : split.name,
    splitKey,
    level: isNever ? 'starter' : split.level,
    daysPerWeek: isNever ? 3 : split.days,
    schedule: detailedSchedule,
    tips: getWorkoutTips(goal, isNever),
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

  // Calculate supplement totals first so we can subtract from meal target
  let suppCalories = 0;
  let suppProtein = 0;
  const supplements = useSupplements ? supplementPlans.withSupplements : null;
  if (supplements) {
    for (const supp of Object.values(supplements)) {
      suppCalories += supp.calories || 0;
      suppProtein += supp.protein || 0;
    }
  }

  // When supplements are enabled, meals should cover (target - supplement contribution)
  // so that meals + supplements ≈ targetCalories
  const mealCalorieTarget = supplements
    ? Math.max(1200, targetCalories - suppCalories)
    : targetCalories;

  // Find closest calorie tier
  const tiers = [1500, 1800, 2000, 2200, 2500, 2800, 3000];
  const closestTier = tiers.reduce((prev, curr) =>
    Math.abs(curr - mealCalorieTarget) < Math.abs(prev - mealCalorieTarget) ? curr : prev
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

  // Combine meal + supplement totals for display targets
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
 * Get workout tips based on goal and experience
 */
function getWorkoutTips(goal, isNever = false) {
  if (isNever) {
    return [
      'Start light — master form before adding any load',
      'Focus on feeling the muscle work, not just moving the weight',
      'Rest 60–90 seconds between sets and drink water throughout',
      'Show up consistently: 3 days/week for 4 weeks builds the habit',
    ];
  }
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
