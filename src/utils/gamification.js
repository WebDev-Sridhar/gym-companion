/**
 * Gamification System — XP, Levels, Streaks & Badges
 */

// XP rewards for different actions
export const XP_REWARDS = {
  completeWorkout: 100,
  logFood: 50,
  dailyLogin: 25,
  firstWorkout: 200,
  sevenDayStreak: 500,
  thirtyDayStreak: 2000,
  weightLogged: 30,
};

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0, 500, 1200, 2100, 3200, 4500, 6000, 7800, 9900, 12300, 15000,
  18000, 21500, 25500, 30000, 35000, 41000, 48000, 56000, 65000, 75000,
];

// Level titles
export const LEVEL_TITLES = [
  'Newbie',           // 0
  'Gym Rookie',       // 1
  'Iron Starter',     // 2
  'Fitness Explorer', // 3
  'Pump Chaser',      // 4
  'Rep Machine',      // 5
  'Strength Seeker',  // 6
  'Iron Regular',     // 7
  'Dedicated Lifter', // 8
  'Gym Warrior',      // 9
  'Beast Mode',       // 10
  'Iron Champion',    // 11
  'Fitness Legend',   // 12
  'Unstoppable',      // 13
  'Elite Lifter',     // 14
  'Gym Master',       // 15
  'Iron God',         // 16
  'Fitness Titan',    // 17
  'Living Legend',    // 18
  'Gym Deity',        // 19
  'Ultimate Warrior', // 20
];

// Badge definitions
export const BADGES = [
  {
    id: 'first-workout',
    name: 'First Step',
    description: 'Complete your first workout',
    icon: '🏋️',
    condition: (stats) => stats.totalWorkouts >= 1,
  },
  {
    id: 'seven-day-streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day workout streak',
    icon: '🔥',
    condition: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'thirty-day-streak',
    name: 'Monthly Monster',
    description: 'Maintain a 30-day workout streak',
    icon: '⚡',
    condition: (stats) => stats.currentStreak >= 30,
  },
  {
    id: 'ten-workouts',
    name: 'Getting Serious',
    description: 'Complete 10 workouts',
    icon: '💪',
    condition: (stats) => stats.totalWorkouts >= 10,
  },
  {
    id: 'twenty-five-workouts',
    name: 'Quarter Century',
    description: 'Complete 25 workouts',
    icon: '🏆',
    condition: (stats) => stats.totalWorkouts >= 25,
  },
  {
    id: 'fifty-workouts',
    name: 'Half Century',
    description: 'Complete 50 workouts',
    icon: '👑',
    condition: (stats) => stats.totalWorkouts >= 50,
  },
  {
    id: 'hundred-workouts',
    name: 'Centurion',
    description: 'Complete 100 workouts',
    icon: '🎖️',
    condition: (stats) => stats.totalWorkouts >= 100,
  },
  {
    id: 'first-pr',
    name: 'New Record!',
    description: 'Set your first personal record',
    icon: '📈',
    condition: (stats) => stats.personalRecords >= 1,
  },
  {
    id: 'weight-logger',
    name: 'Scale Watcher',
    description: 'Log your weight 10 times',
    icon: '⚖️',
    condition: (stats) => stats.weightLogs >= 10,
  },
  {
    id: 'level-five',
    name: 'Rep Machine',
    description: 'Reach Level 5',
    icon: '⭐',
    condition: (stats) => stats.level >= 5,
  },
  {
    id: 'level-ten',
    name: 'Beast Mode',
    description: 'Reach Level 10',
    icon: '🌟',
    condition: (stats) => stats.level >= 10,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Log a workout before 8 AM',
    icon: '🌅',
    condition: (stats) => stats.earlyWorkouts >= 1,
  },
];

/**
 * Calculate level from XP
 * @param {number} xp - Total XP
 * @returns {number} Current level
 */
export function getLevelFromXP(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
}

/**
 * Get XP progress within current level
 * @param {number} xp - Total XP
 * @returns {object} { current, needed, percentage }
 */
export function getLevelProgress(xp) {
  const level = getLevelFromXP(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level + 1] || LEVEL_THRESHOLDS[level] + 5000;
  const currentXP = xp - currentThreshold;
  const neededXP = nextThreshold - currentThreshold;

  return {
    current: currentXP,
    needed: neededXP,
    percentage: Math.min(100, Math.round((currentXP / neededXP) * 100)),
  };
}

/**
 * Get level title
 * @param {number} level - Current level
 * @returns {string} Level title
 */
export function getLevelTitle(level) {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)];
}

/**
 * Check which badges user has earned
 * @param {object} stats - User stats
 * @returns {array} Array of earned badge IDs
 */
export function getEarnedBadges(stats) {
  return BADGES.filter((badge) => badge.condition(stats)).map((b) => b.id);
}

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

  // Check if last workout was today or yesterday
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
    // diff === 0 means same day, continue
  }

  return streak;
}
