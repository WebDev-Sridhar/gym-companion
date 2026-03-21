/**
 * Smart Coaching Module
 * Analyzes user progress and generates actionable recommendations
 */

/**
 * Analyze user progress and return recommendations
 * @param {object} params
 * @param {object} params.profile - User profile
 * @param {Array} params.weightLogs - Weight log entries
 * @param {Array} params.workoutLogs - Workout log entries
 * @param {Array} params.foodLogs - Food log entries
 * @param {object} params.nutritionTargets - Current nutrition targets
 * @returns {Array} recommendations
 */
export function analyzeProgress({ profile, weightLogs, workoutLogs, foodLogs, nutritionTargets }) {
  const recommendations = [];

  if (!profile) return recommendations;

  // Need at least some data to analyze
  const sortedWeights = [...(weightLogs || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  const recentWorkouts = getRecentWorkouts(workoutLogs || [], 14);
  const recentFoodLogs = getRecentFoodLogs(foodLogs || [], 7);

  // 1. Weight trend analysis
  if (sortedWeights.length >= 3) {
    const weightRecs = analyzeWeightTrend(sortedWeights, profile.goal);
    recommendations.push(...weightRecs);
  }

  // 2. Workout consistency
  if (profile.workoutDays) {
    const consistencyRecs = analyzeWorkoutConsistency(recentWorkouts, profile.workoutDays);
    recommendations.push(...consistencyRecs);
  }

  // 3. Protein intake
  if (recentFoodLogs.length > 0 && nutritionTargets?.macros?.protein) {
    const proteinRecs = analyzeProteinIntake(recentFoodLogs, nutritionTargets.macros.protein);
    recommendations.push(...proteinRecs);
  }

  // 4. General encouragement if everything is on track
  if (recommendations.length === 0 && sortedWeights.length >= 2) {
    recommendations.push({
      type: 'success',
      severity: 'low',
      title: 'On Track!',
      message: 'Your progress looks consistent. Keep up the great work and stay disciplined!',
      icon: '🎯',
    });
  }

  // 5. If no data yet, prompt to start tracking
  if (sortedWeights.length < 2 && (workoutLogs || []).length < 3) {
    recommendations.push({
      type: 'info',
      severity: 'low',
      title: 'Start Tracking',
      message: 'Log a few workouts and weigh-ins so the coach can analyze your progress and give personalized advice.',
      icon: '📊',
    });
  }

  return recommendations;
}

function getRecentWorkouts(workoutLogs, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return workoutLogs.filter((l) => l.date >= cutoffStr);
}

function getRecentFoodLogs(foodLogs, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return foodLogs.filter((l) => l.date >= cutoffStr);
}

function analyzeWeightTrend(sortedWeights, goal) {
  const recs = [];
  const recent = sortedWeights.slice(-7); // Last 7 entries
  if (recent.length < 2) return recs;

  const oldest = recent[0].weight;
  const newest = recent[recent.length - 1].weight;
  const change = newest - oldest;
  const daySpan = Math.max(1, (new Date(recent[recent.length - 1].date) - new Date(recent[0].date)) / (1000 * 60 * 60 * 24));
  const weeklyChange = (change / daySpan) * 7;

  if (goal === 'weightLoss') {
    if (weeklyChange > 0.1) {
      // Weight going up while trying to lose
      recs.push({
        type: 'warning',
        severity: 'high',
        title: 'Weight Increasing',
        message: `You've gained ${Math.abs(weeklyChange).toFixed(1)}kg this week while targeting weight loss. Consider reducing daily calories by 150-200.`,
        icon: '⚠️',
        action: { type: 'adjustCalories', value: -200 },
      });
    } else if (Math.abs(weeklyChange) < 0.1 && daySpan >= 10) {
      // Weight stalled
      recs.push({
        type: 'warning',
        severity: 'medium',
        title: 'Weight Plateau',
        message: 'Your weight has stalled for over a week. A small calorie reduction of 100-150 cal/day can help break through.',
        icon: '📉',
        action: { type: 'adjustCalories', value: -150 },
      });
    } else if (weeklyChange < -1.0) {
      // Losing too fast
      recs.push({
        type: 'caution',
        severity: 'medium',
        title: 'Losing Too Fast',
        message: `You're losing ${Math.abs(weeklyChange).toFixed(1)}kg/week. Losing faster than 0.75kg/week risks muscle loss. Consider increasing calories by 150-200.`,
        icon: '🔄',
        action: { type: 'adjustCalories', value: 150 },
      });
    } else if (weeklyChange <= -0.2) {
      recs.push({
        type: 'success',
        severity: 'low',
        title: 'Great Progress!',
        message: `You're losing ${Math.abs(weeklyChange).toFixed(1)}kg/week — right on target. Keep it up!`,
        icon: '🔥',
      });
    }
  }

  if (goal === 'muscleGain') {
    if (weeklyChange < -0.1) {
      recs.push({
        type: 'warning',
        severity: 'high',
        title: 'Losing Weight',
        message: 'You\'re losing weight while trying to gain muscle. Increase daily calories by 200-300 to support muscle growth.',
        icon: '⚠️',
        action: { type: 'adjustCalories', value: 250 },
      });
    } else if (Math.abs(weeklyChange) < 0.1 && daySpan >= 10) {
      recs.push({
        type: 'warning',
        severity: 'medium',
        title: 'Weight Stalled',
        message: 'Weight hasn\'t increased in over a week. Consider adding 150-200 extra calories to fuel muscle growth.',
        icon: '📈',
        action: { type: 'adjustCalories', value: 200 },
      });
    } else if (weeklyChange > 0.5) {
      recs.push({
        type: 'caution',
        severity: 'medium',
        title: 'Gaining Too Fast',
        message: `Gaining ${weeklyChange.toFixed(1)}kg/week. Aim for 0.2-0.4kg to minimize fat gain. Consider reducing surplus by 100-150 cal.`,
        icon: '🔄',
        action: { type: 'adjustCalories', value: -100 },
      });
    } else if (weeklyChange >= 0.1) {
      recs.push({
        type: 'success',
        severity: 'low',
        title: 'Solid Gains!',
        message: `Gaining ${weeklyChange.toFixed(1)}kg/week — ideal for lean muscle building. Stay consistent!`,
        icon: '💪',
      });
    }
  }

  return recs;
}

function analyzeWorkoutConsistency(recentWorkouts, targetDays) {
  const recs = [];
  // Count unique workout days in last 14 days
  const uniqueDays = new Set(recentWorkouts.map((l) => l.date)).size;
  const expectedIn14Days = targetDays * 2; // 2 weeks worth
  const adherence = uniqueDays / expectedIn14Days;

  if (adherence < 0.5 && expectedIn14Days > 2) {
    recs.push({
      type: 'warning',
      severity: 'high',
      title: 'Low Consistency',
      message: `You've only worked out ${uniqueDays} times in the last 2 weeks (target: ${expectedIn14Days}). Consistency is key! Consider reducing to ${Math.max(3, targetDays - 1)} days/week if schedule is tight.`,
      icon: '📅',
    });
  } else if (adherence < 0.75 && expectedIn14Days > 2) {
    recs.push({
      type: 'info',
      severity: 'medium',
      title: 'Room for Improvement',
      message: `${uniqueDays} workouts in 2 weeks vs your target of ${expectedIn14Days}. Try to hit at least ${Math.ceil(expectedIn14Days * 0.8)} sessions next fortnight.`,
      icon: '💡',
    });
  }

  return recs;
}

function analyzeProteinIntake(recentFoodLogs, targetProtein) {
  const recs = [];
  // Average protein per day from logged meals
  const dayMap = {};
  for (const log of recentFoodLogs) {
    if (!dayMap[log.date]) dayMap[log.date] = 0;
    dayMap[log.date] += log.totalProtein || 0;
  }

  const days = Object.values(dayMap);
  if (days.length < 2) return recs;

  const avgProtein = days.reduce((a, b) => a + b, 0) / days.length;
  const ratio = avgProtein / targetProtein;

  if (ratio < 0.7) {
    recs.push({
      type: 'warning',
      severity: 'high',
      title: 'Low Protein Intake',
      message: `You're averaging ${Math.round(avgProtein)}g protein/day vs your ${targetProtein}g target. Protein is crucial for muscle repair. Add a protein source to each meal.`,
      icon: '🥩',
    });
  } else if (ratio < 0.9) {
    recs.push({
      type: 'info',
      severity: 'medium',
      title: 'Protein Slightly Low',
      message: `Averaging ${Math.round(avgProtein)}g/day protein (target: ${targetProtein}g). Try adding an extra egg, paneer serving, or protein shake.`,
      icon: '🥚',
    });
  }

  return recs;
}
