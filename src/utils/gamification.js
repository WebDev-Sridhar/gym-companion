/**
 * Transformation-Based Gamification System
 * Rewards real physical progress, not app usage.
 */

// =====================
// Helper Functions
// =====================

/**
 * Calculate body weight change from first to latest log
 * @param {array} weightLogs - [{date, weight}, ...]
 * @returns {number} Weight change in kg (positive = gained, negative = lost)
 */
export function calcWeightChange(weightLogs) {
  if (!weightLogs || weightLogs.length < 2) return 0;
  const sorted = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted[sorted.length - 1].weight - sorted[0].weight;
}

/**
 * Count exercises where the user has gotten stronger
 * Compares max weight in earliest workout vs latest workout for each exercise
 * @param {array} workoutLogs - Array of workout log entries
 * @returns {number} Count of exercises with strength gains
 */
export function calcStrengthGains(workoutLogs) {
  if (!workoutLogs || workoutLogs.length < 2) return 0;

  // Group all sets by exercise name
  const exerciseHistory = {};
  workoutLogs.forEach((log) => {
    if (!log.exercises) return;
    log.exercises.forEach((ex) => {
      if (!exerciseHistory[ex.name]) exerciseHistory[ex.name] = [];
      // Get max weight from this workout's logged sets
      let maxWeight = 0;
      if (Array.isArray(ex.logged?.sets)) {
        ex.logged.sets.forEach((s) => {
          if (s.weight > maxWeight) maxWeight = s.weight;
        });
      } else if (ex.logged?.weight) {
        maxWeight = Number(ex.logged.weight) || 0;
      }
      if (maxWeight > 0) {
        exerciseHistory[ex.name].push({ date: log.date, maxWeight });
      }
    });
  });

  // Count exercises where latest max > earliest max
  let gains = 0;
  Object.values(exerciseHistory).forEach((entries) => {
    if (entries.length < 2) return;
    const sorted = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    const earliest = sorted[0].maxWeight;
    const latest = sorted[sorted.length - 1].maxWeight;
    if (latest > earliest) gains++;
  });

  return gains;
}

/**
 * Calculate protein adherence — % of logged days where protein target was met
 * @param {array} foodLogs - [{date, totalProtein}, ...]
 * @param {number} proteinTarget - Daily protein target in grams
 * @returns {number} Percentage 0-100
 */
export function calcProteinAdherence(foodLogs, proteinTarget) {
  if (!foodLogs || !foodLogs.length || !proteinTarget) return 0;

  // Group by date and sum protein
  const dailyProtein = {};
  foodLogs.forEach((log) => {
    if (!log.date) return;
    dailyProtein[log.date] = (dailyProtein[log.date] || 0) + (log.totalProtein || 0);
  });

  const days = Object.values(dailyProtein);
  if (!days.length) return 0;

  const metTarget = days.filter((p) => p >= proteinTarget).length;
  return Math.round((metTarget / days.length) * 100);
}

/**
 * Calculate average workouts per week
 * @param {array} workoutLogs - Array of workout logs
 * @returns {number} Average workouts per week
 */
export function calcWeeklyWorkouts(workoutLogs) {
  if (!workoutLogs || workoutLogs.length < 2) return workoutLogs?.length || 0;

  const sorted = [...workoutLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstDate = new Date(sorted[0].date);
  const lastDate = new Date(sorted[sorted.length - 1].date);
  const daySpan = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));
  const weeks = Math.max(1, daySpan / 7);

  return Math.round((workoutLogs.length / weeks) * 10) / 10;
}

// =====================
// Stats Computation
// =====================

/**
 * Compute all transformation stats from raw user data
 * Pure function — no state mutation
 */
export function computeTransformationStats(workoutLogs, weightLogs, foodLogs, currentStreak, longestStreak, nutritionTargets) {
  const proteinTarget = nutritionTargets?.macros?.protein || 0;

  return {
    totalWorkouts: workoutLogs?.length || 0,
    currentStreak: currentStreak || 0,
    longestStreak: longestStreak || 0,
    weightChange: calcWeightChange(weightLogs),
    weightLogsCount: weightLogs?.length || 0,
    strengthGains: calcStrengthGains(workoutLogs),
    nutritionLogsCount: foodLogs?.length || 0,
    avgProteinAdherence: calcProteinAdherence(foodLogs, proteinTarget),
    weeklyWorkouts: calcWeeklyWorkouts(workoutLogs),
  };
}

// =====================
// 12 Transformation Levels
// =====================

export const TRANSFORMATION_LEVELS = [
  {
    id: 1,
    name: 'First Step',
    difficulty: 'Beginner',
    rewardMessage: "You showed up. That's more than most people ever do.",
    taskChecks: [
      { text: 'Complete your first workout', check: (s) => s.totalWorkouts >= 1 },
    ],
  },
  {
    id: 2,
    name: 'Building the Habit',
    difficulty: 'Beginner',
    rewardMessage: "Consistency beats intensity. You're proving it.",
    taskChecks: [
      { text: 'Complete 5 workouts', check: (s) => s.totalWorkouts >= 5 },
      { text: 'Maintain a 3-day streak', check: (s) => s.longestStreak >= 3 },
    ],
  },
  {
    id: 3,
    name: 'Tracking Matters',
    difficulty: 'Beginner',
    rewardMessage: "What gets measured gets managed. You're in control now.",
    taskChecks: [
      { text: 'Complete 10 workouts', check: (s) => s.totalWorkouts >= 10 },
      { text: 'Log your weight 3 times', check: (s) => s.weightLogsCount >= 3 },
      { text: 'Log 5 meals', check: (s) => s.nutritionLogsCount >= 5 },
    ],
  },
  {
    id: 4,
    name: 'One Week Strong',
    difficulty: 'Beginner',
    rewardMessage: 'One full week without excuses. Respect.',
    taskChecks: [
      { text: 'Complete 15 workouts', check: (s) => s.totalWorkouts >= 15 },
      { text: 'Hit a 7-day streak', check: (s) => s.longestStreak >= 7 },
    ],
  },
  {
    id: 5,
    name: 'Getting Stronger',
    difficulty: 'Medium',
    rewardMessage: "The weights are getting heavier but you're not struggling. That's strength.",
    taskChecks: [
      { text: 'Complete 25 workouts', check: (s) => s.totalWorkouts >= 25 },
      { text: 'Increase weight in 2 exercises', check: (s) => s.strengthGains >= 2 },
    ],
  },
  {
    id: 6,
    name: 'Nutrition Aware',
    difficulty: 'Medium',
    rewardMessage: "You finally understand — abs are made in the kitchen.",
    taskChecks: [
      { text: 'Complete 30 workouts', check: (s) => s.totalWorkouts >= 30 },
      { text: 'Log 20 meals', check: (s) => s.nutritionLogsCount >= 20 },
      { text: 'Hit protein target 50% of days', check: (s) => s.avgProteinAdherence >= 50 },
    ],
  },
  {
    id: 7,
    name: 'Two Weeks Unbreakable',
    difficulty: 'Medium',
    rewardMessage: 'Two weeks without breaking. Your discipline is becoming a weapon.',
    taskChecks: [
      { text: 'Complete 40 workouts', check: (s) => s.totalWorkouts >= 40 },
      { text: 'Achieve a 14-day streak', check: (s) => s.longestStreak >= 14 },
      { text: 'Log your weight 6 times', check: (s) => s.weightLogsCount >= 6 },
    ],
  },
  {
    id: 8,
    name: 'Body is Changing',
    difficulty: 'Medium',
    rewardMessage: 'Look closely — your body is not the same anymore.',
    taskChecks: [
      { text: 'Complete 50 workouts', check: (s) => s.totalWorkouts >= 50 },
      { text: 'See 1+ kg body weight change', check: (s) => Math.abs(s.weightChange) >= 1 },
      { text: 'Get stronger in 4 exercises', check: (s) => s.strengthGains >= 4 },
    ],
  },
  {
    id: 9,
    name: 'Month Warrior',
    difficulty: 'High',
    rewardMessage: "30 days. Most people quit at 3. You're not most people.",
    taskChecks: [
      { text: 'Complete 65 workouts', check: (s) => s.totalWorkouts >= 65 },
      { text: 'Achieve a 30-day streak', check: (s) => s.longestStreak >= 30 },
      { text: 'Log 40 meals', check: (s) => s.nutritionLogsCount >= 40 },
    ],
  },
  {
    id: 10,
    name: 'Strength Milestone',
    difficulty: 'High',
    rewardMessage: 'Stronger than you were, smarter about food. This is real progress.',
    taskChecks: [
      { text: 'Complete 80 workouts', check: (s) => s.totalWorkouts >= 80 },
      { text: 'Get stronger in 6 exercises', check: (s) => s.strengthGains >= 6 },
      { text: 'Hit protein target 60% of days', check: (s) => s.avgProteinAdherence >= 60 },
    ],
  },
  {
    id: 11,
    name: 'Complete Athlete',
    difficulty: 'High',
    rewardMessage: '100 workouts. You are no longer the person who started this journey.',
    taskChecks: [
      { text: 'Complete 100 workouts', check: (s) => s.totalWorkouts >= 100 },
      { text: 'Achieve a 45-day streak', check: (s) => s.longestStreak >= 45 },
      { text: 'See 2+ kg body weight change', check: (s) => Math.abs(s.weightChange) >= 2 },
      { text: 'Get stronger in 8 exercises', check: (s) => s.strengthGains >= 8 },
      { text: 'Log 60 meals', check: (s) => s.nutritionLogsCount >= 60 },
    ],
  },
  {
    id: 12,
    name: 'Transformed',
    difficulty: 'Elite',
    rewardMessage: 'Go look at the mirror. This is your reward.',
    taskChecks: [
      { text: 'Complete 120 workouts', check: (s) => s.totalWorkouts >= 120 },
      { text: 'Achieve a 60-day streak', check: (s) => s.longestStreak >= 60 },
      { text: 'See 3+ kg body weight change', check: (s) => Math.abs(s.weightChange) >= 3 },
      { text: 'Get stronger in 10 exercises', check: (s) => s.strengthGains >= 10 },
      { text: 'Hit protein target 70% of days', check: (s) => s.avgProteinAdherence >= 70 },
      { text: 'Average 4+ workouts per week', check: (s) => s.weeklyWorkouts >= 4 },
    ],
  },
];

// =====================
// Core Functions
// =====================

/**
 * Get the highest completed transformation level
 * @param {object} stats - Computed transformation stats
 * @returns {object} The highest completed level, or { id: 0, name: 'Just Starting' }
 */
export function getCurrentTransformationLevel(stats) {
  for (let i = TRANSFORMATION_LEVELS.length - 1; i >= 0; i--) {
    const level = TRANSFORMATION_LEVELS[i];
    if (level.taskChecks.every((t) => t.check(stats))) {
      return level;
    }
  }
  return { id: 0, name: 'Just Starting', difficulty: 'Beginner', rewardMessage: 'Your journey begins now.', taskChecks: [] };
}

/**
 * Check if a specific level is completed
 * @param {number} levelId - Level ID (1-12)
 * @param {object} stats - Computed transformation stats
 * @returns {boolean}
 */
export function isLevelCompleted(levelId, stats) {
  const level = TRANSFORMATION_LEVELS.find((l) => l.id === levelId);
  if (!level) return false;
  return level.taskChecks.every((t) => t.check(stats));
}

/**
 * Get the next level after the current one
 * @param {number} currentLevelId - Current level ID (0-12)
 * @returns {object|null} Next level object, or null if at max
 */
export function getNextLevel(currentLevelId) {
  if (currentLevelId >= 12) return null;
  return TRANSFORMATION_LEVELS.find((l) => l.id === currentLevelId + 1) || null;
}

/**
 * Get progress details for a specific level
 * @param {number} levelId - Level ID (1-12)
 * @param {object} stats - Computed transformation stats
 * @returns {object} { completedTasks, totalTasks, percentage, taskDetails }
 */
export function getLevelProgress(levelId, stats) {
  const level = TRANSFORMATION_LEVELS.find((l) => l.id === levelId);
  if (!level) return { completedTasks: 0, totalTasks: 0, percentage: 0, taskDetails: [] };

  const taskDetails = level.taskChecks.map((t) => ({
    text: t.text,
    completed: t.check(stats),
  }));

  const completedTasks = taskDetails.filter((t) => t.completed).length;
  const totalTasks = taskDetails.length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return { completedTasks, totalTasks, percentage, taskDetails };
}

// =====================
// Streak (unchanged)
// =====================

/**
 * Calculate streak from workout history
 * @param {array} workoutDates - Array of date strings (YYYY-MM-DD)
 * @returns {number} Current streak
 */
export function calculateStreak(workoutDates) {
  if (!workoutDates.length) return 0;

  const sorted = [...workoutDates].sort((a, b) => new Date(b) - new Date(a));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastWorkout = new Date(sorted[0]);
  lastWorkout.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i - 1]);
    const prev = new Date(sorted[i]);
    current.setHours(0, 0, 0, 0);
    prev.setHours(0, 0, 0, 0);

    const diff = Math.floor((current - prev) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }

  return streak;
}
