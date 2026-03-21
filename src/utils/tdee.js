/**
 * TDEE (Total Daily Energy Expenditure) Calculator
 * Uses Mifflin-St Jeor equation — the most accurate for most people
 */

// Activity level multipliers
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,       // Little or no exercise
  light: 1.375,         // Light exercise 1-3 days/week
  moderate: 1.55,       // Moderate exercise 3-5 days/week
  active: 1.725,        // Hard exercise 6-7 days/week
  veryActive: 1.9,      // Very hard exercise + physical job
};

// Goal adjustments
const GOAL_ADJUSTMENTS = {
  weightLoss: -500,     // ~0.5 kg/week loss
  maintenance: 0,
  muscleGain: 300,      // Lean bulk
};

/**
 * Calculate BMR using Mifflin-St Jeor equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR in calories
 */
export function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level key
 * @returns {number} TDEE in calories
 */
export function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
}

/**
 * Get target calories based on goal
 * @param {number} tdee - TDEE in calories
 * @param {string} goal - User's goal
 * @returns {number} Target daily calories
 */
export function getTargetCalories(tdee, goal) {
  const adjustment = GOAL_ADJUSTMENTS[goal] || 0;
  return Math.round(tdee + adjustment);
}

/**
 * Calculate macronutrient targets
 * @param {number} targetCalories - Daily target calories
 * @param {string} goal - User's goal
 * @returns {object} Macro targets { protein, carbs, fat }
 */
export function calculateMacros(targetCalories, goal) {
  let proteinRatio, carbRatio, fatRatio;

  switch (goal) {
    case 'weightLoss':
      proteinRatio = 0.35;
      carbRatio = 0.35;
      fatRatio = 0.30;
      break;
    case 'muscleGain':
      proteinRatio = 0.30;
      carbRatio = 0.45;
      fatRatio = 0.25;
      break;
    default: // maintenance
      proteinRatio = 0.30;
      carbRatio = 0.40;
      fatRatio = 0.30;
  }

  return {
    protein: Math.round((targetCalories * proteinRatio) / 4), // 4 cal/g
    carbs: Math.round((targetCalories * carbRatio) / 4),      // 4 cal/g
    fat: Math.round((targetCalories * fatRatio) / 9),          // 9 cal/g
  };
}

/**
 * Full calculation pipeline
 * @param {object} profile - User profile from onboarding
 * @returns {object} Complete nutrition targets
 */
export function calculateNutritionTargets(profile) {
  const { weight, height, age, gender, activityLevel, goal } = profile;
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = getTargetCalories(tdee, goal);
  const macros = calculateMacros(targetCalories, goal);

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    macros,
    deficit: goal === 'weightLoss' ? 500 : 0,
    surplus: goal === 'muscleGain' ? 300 : 0,
  };
}
