import { exercises, workoutSplits } from '../data/exerciseDatabase';
import { generateDynamicDietPlan } from '../services/dietGenerator';

/**
 * Generate a personalized workout plan based on user profile
 * @param {object} profile - User profile from onboarding
 * @returns {object} Complete workout plan
 */
// Shift each number in a rep range string (e.g. "8-12") by delta
function adjustReps(reps, delta) {
  if (!reps || typeof reps !== 'string') return reps;
  return reps.split('-').map((r) => {
    const n = parseInt(r);
    return isNaN(n) ? r : String(Math.max(1, n + delta));
  }).join('-');
}

export function generateWorkoutPlan(profile) {
  const {
    workoutDays,
    goal,
    gymExperience,
    age,
    bodyFat,
    activityLevel,
    workoutDuration,
  } = profile;

  const isNewbie = gymExperience === 'never';
  const isBeginner = gymExperience === 'beginner';

  // -------------------------------
  // 1. SAFE SPLIT SELECTION
  // -------------------------------
  let splitKey;

  if (isNewbie) {
    splitKey = 'fullBody3';
  } else if (workoutDays <= 3) {
    splitKey = 'fullBody3';
  } else if (workoutDays === 4) {
    splitKey = 'upperLower4';
  } else if (workoutDays === 5) {
    splitKey = 'ppl5';
  } else {
    splitKey = 'ppl6';
  }

  const split = workoutSplits[splitKey];

  // -------------------------------
  // 2. INTENSITY SYSTEM
  // -------------------------------
  const ageFactor = age > 40 ? 0.85 : age > 30 ? 0.9 : 1;

  const activityMap = {
    sedentary: 0.85,
    light: 0.95,
    moderate: 1,
    active: 1.1,
    veryActive: 1.15,
  };
  const activityFactor = activityMap[activityLevel] || 1;

  const bodyFatMap = {
    lean: 0.95,
    fit: 1,
    average: 1.05,
    aboveAvg: 1.1,
    high: 1.15,
  };
  const bodyFatFactor = bodyFatMap[bodyFat] || 1;

  const totalIntensity = ageFactor * activityFactor * bodyFatFactor;

  // -------------------------------
  // 3. DURATION CONTROL
  // -------------------------------
  const durationFactor =
    workoutDuration < 45 ? 0.7 :
    workoutDuration > 75 ? 1.2 : 1;

  // -------------------------------
  // 4. SMART CARDIO
  // -------------------------------
  let cardio;

  if (goal === 'weightLoss' || bodyFat === 'high') {
    cardio = {
      type: 'treadmill',
      duration: 25 + Math.round((bodyFatFactor - 1) * 20),
      note: 'Fat loss focus',
    };
  } else if (goal === 'muscleGain') {
    cardio = {
      type: 'cycling',
      duration: 10,
      note: 'Light recovery cardio',
    };
  } else {
    cardio = {
      type: 'treadmill',
      duration: 15,
      note: 'General fitness',
    };
  }

  // -------------------------------
  // 5. BUILD WORKOUT
  // -------------------------------
  const detailedSchedule = split.schedule.map((day) => {
    let exerciseList = day.exercises
      .map((key) => ({ key, data: exercises[key] }))
      .filter((e) => e.data);

    // Adjust number of exercises based on duration
    const maxExercises = Math.max(
      3,
      Math.round(exerciseList.length * durationFactor)
    );
    exerciseList = exerciseList.slice(0, maxExercises);

    const updatedExercises = exerciseList.map(({ key, data: ex }) => {
      let sets = ex.sets;
      let reps = ex.reps;

      // EXPERIENCE LOGIC
      if (isNewbie) {
        sets = 2;
        reps = '12-15';
      } else if (isBeginner) {
        sets = Math.max(3, sets);
      } else {
        sets = Math.max(4, sets);
      }

      // GOAL-BASED REP ADJUSTMENT
      if (goal === 'weightLoss') {
        reps = adjustReps(reps, +2);
      } else if (goal === 'muscleGain') {
        reps = adjustReps(reps, -2);
      }

      // INTENSITY SCALING
      sets = Math.round(sets * totalIntensity);
      sets = Math.max(2, Math.min(5, sets));

      return {
        ...ex,
        exerciseKey: key,
        sets,
        reps,
      };
    });

    return {
      ...day,
      cardio,
      exercises: updatedExercises,
    };
  });

  // -------------------------------
  // 6. FINAL OUTPUT
  // -------------------------------
  return {
    splitName: isNewbie
      ? 'Beginner Foundation Plan'
      : split.name,
    splitKey,
    level: isNewbie ? 'starter' : split.level,
    daysPerWeek: isNewbie ? 3 : split.days,
    schedule: detailedSchedule,
    tips: getWorkoutTips(goal, isNewbie),
  };
}


/**
 * Generate a personalized diet plan based on user profile
 * Now uses dynamic generation from food database + meal templates
 * @param {object} profile - User profile from onboarding
 * @returns {object} Complete diet plan
 */
export function generateDietPlan(profile, calorieOverride) {
  return generateDynamicDietPlan(profile, { calorieOverride });
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
