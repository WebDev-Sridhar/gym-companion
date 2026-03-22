/**
 * TDEE & Nutrition Calculator
 * Mifflin-St Jeor + body-weight-based macros
 * Optimized for Indian users — realistic, sustainable targets
 */

// Base activity multipliers (Mifflin-St Jeor standard)
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

// Protein per kg of body weight by goal
const PROTEIN_PER_KG = {
  weightLoss: 2.0,
  muscleGain: 1.8,
  maintenance: 1.6,
};

const PROTEIN_MIN_PER_KG = 1.4;
const PROTEIN_MAX_PER_KG = 2.2;

/**
 * BMR — Mifflin-St Jeor Equation
 */
export function calculateBMR(weight, height, age, gender) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * BMI — Body Mass Index
 */
export function calculateBMI(weight, height) {
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
}

/**
 * TDEE — factors in activity level + workout frequency/duration
 *
 * If someone selects "sedentary" but works out 5 days/week for 60 min,
 * the base multiplier alone undersells their expenditure. We add a small
 * workout-frequency bump (capped so it doesn't overshoot).
 */
export function calculateTDEE(bmr, activityLevel, workoutDays = 0, workoutDuration = 0) {
  let multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;

  // Workout-frequency adjustment (0 to +0.15 range)
  // Only bump if workoutDays > base implied by activity level
  const impliedDays = { sedentary: 0, light: 2, moderate: 4, active: 6, veryActive: 7 };
  const baseDays = impliedDays[activityLevel] || 3;

  if (workoutDays > baseDays) {
    const extraDays = workoutDays - baseDays;
    multiplier += extraDays * 0.03; // +0.03 per extra day
  }

  // Duration adjustment: if sessions > 45 min, slight bump
  if (workoutDuration > 45) {
    multiplier += 0.02;
  }
  if (workoutDuration > 75) {
    multiplier += 0.02; // additional for long sessions
  }

  // Cap multiplier at 2.2 to avoid absurd numbers
  multiplier = Math.min(multiplier, 2.2);

  return Math.round(bmr * multiplier);
}

/**
 * Target calories based on goal
 * - weightLoss: moderate deficit (300–500 kcal) — scaled to body weight
 * - muscleGain: lean surplus (250–400 kcal)
 * - maintenance: TDEE as-is
 */
export function getTargetCalories(tdee, goal, weight) {
  let adjustment = 0;

  if (goal === 'weightLoss') {
    // Heavier people can sustain a slightly larger deficit
    // Light (<60kg): -300, Medium (60-90kg): -400, Heavy (>90kg): -500
    if (weight < 60) adjustment = -300;
    else if (weight <= 90) adjustment = -400;
    else adjustment = -500;

    // Safety floor: never go below BMR-level (~1200 women, ~1500 men)
    const floor = 1200;
    return Math.max(Math.round(tdee + adjustment), floor);
  }

  if (goal === 'muscleGain') {
    // Lean bulk: 250–400 surplus
    if (weight < 60) adjustment = 250;
    else if (weight <= 85) adjustment = 300;
    else adjustment = 400;
  }

  return Math.round(tdee + adjustment);
}

/**
 * Macronutrient calculation — body-weight-based protein
 *
 * 1. Protein: g/kg of body weight (clamped 1.4–2.2)
 * 2. Fat: 25% of total calories (range 20–30%)
 * 3. Carbs: remaining calories
 */
export function calculateMacros(targetCalories, goal, weight) {
  // 1. Protein (body-weight-based)
  let proteinPerKg = PROTEIN_PER_KG[goal] || 1.6;
  proteinPerKg = Math.max(PROTEIN_MIN_PER_KG, Math.min(PROTEIN_MAX_PER_KG, proteinPerKg));

  let protein = Math.round(proteinPerKg * weight);

  // Sanity cap: protein calories shouldn't exceed 35% of total
  const maxProteinFromCalories = Math.round((targetCalories * 0.35) / 4);
  protein = Math.min(protein, maxProteinFromCalories);

  // 2. Fat (25% of calories, adjusted slightly by goal)
  let fatPct = 0.25;
  if (goal === 'weightLoss') fatPct = 0.25; // moderate fat for satiety
  if (goal === 'muscleGain') fatPct = 0.22; // slightly less to make room for carbs

  const fat = Math.round((targetCalories * fatPct) / 9);

  // 3. Carbs (remaining)
  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbCals = Math.max(0, targetCalories - proteinCals - fatCals);
  const carbs = Math.round(carbCals / 4);

  return { protein, carbs, fat };
}

/**
 * Generate practical notes based on profile
 */
function generateNotes(profile, macros, targetCalories, tdee, bmi) {
  const { goal, dietType, useSupplements } = profile;
  const notes = [];

  // BMI-based note
  if (bmi < 18.5) {
    notes.push('Your BMI suggests you\'re underweight — focus on nutrient-dense meals and gradual weight gain.');
  } else if (bmi >= 25 && bmi < 30) {
    notes.push('Your BMI is in the overweight range — a moderate calorie deficit with high protein will help preserve muscle while losing fat.');
  } else if (bmi >= 30) {
    notes.push('Consider consulting a healthcare professional for a structured plan alongside this guide.');
  }

  // Protein achievability for Indian diet
  if (dietType === 'veg') {
    if (macros.protein > 100) {
      notes.push(`${macros.protein}g protein on a vegetarian diet needs planning — include paneer, dal, curd, soya chunks, and chickpeas at every meal.`);
    }
    if (macros.protein > 130 && !useSupplements) {
      notes.push('Consider adding whey protein to comfortably reach your protein target on a veg diet.');
    }
  } else {
    if (macros.protein > 120) {
      notes.push('Include eggs, chicken, fish, or paneer in at least 2-3 meals to hit your protein target.');
    }
  }

  // Goal-specific
  if (goal === 'weightLoss') {
    const deficit = tdee - targetCalories;
    notes.push(`You're in a ${deficit} kcal deficit — aim for ~0.3-0.5 kg loss per week. Don't drop calories further.`);
    notes.push('Prioritize protein and fibre to stay full. Drink 3-4 litres of water daily.');
  } else if (goal === 'muscleGain') {
    const surplus = targetCalories - tdee;
    notes.push(`You're in a ${surplus} kcal surplus for lean muscle gain. Track your weight weekly — aim for ~0.25-0.5 kg gain/month.`);
    notes.push('Eat a protein-rich meal within 2 hours after your workout.');
  } else {
    notes.push('Maintenance is about consistency — stick to these targets and adjust if your weight changes significantly.');
  }

  // Supplements
  if (useSupplements) {
    notes.push('Whey protein post-workout + creatine 5g daily can support your goals effectively.');
  }

  return notes;
}

/**
 * Full calculation pipeline
 */
export function calculateNutritionTargets(profile) {
  const { weight, height, age, gender, activityLevel, goal, workoutDays = 0, workoutDuration = 0 } = profile;

  const bmr = calculateBMR(weight, height, age, gender);
  const bmi = calculateBMI(weight, height);
  const tdee = calculateTDEE(bmr, activityLevel, workoutDays, workoutDuration);
  const targetCalories = getTargetCalories(tdee, goal, weight);
  const macros = calculateMacros(targetCalories, goal, weight);
  const notes = generateNotes(profile, macros, targetCalories, tdee, bmi);

  return {
    bmr: Math.round(bmr),
    bmi,
    tdee,
    targetCalories,
    macros,
    deficit: goal === 'weightLoss' ? tdee - targetCalories : 0,
    surplus: goal === 'muscleGain' ? targetCalories - tdee : 0,
    notes,
  };
}
