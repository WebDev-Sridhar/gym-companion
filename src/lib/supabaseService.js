import supabase from './supabase';

// =====================
// Helper: camelCase <-> snake_case
// =====================
const toSnake = (str) => str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const mapKeys = (obj, fn) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [fn(k), v])
  );
};

const toSnakeCase = (obj) => mapKeys(obj, toSnake);
const toCamelCase = (obj) => mapKeys(obj, toCamel);

// =====================
// Profiles
// =====================
export async function saveProfile(userId, profileData) {
  const data = toSnakeCase(profileData);
  data.user_id = userId;
  delete data.id;

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    return supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
  }
  return supabase.from('profiles').insert(data).select().single();
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data: data ? toCamelCase(data) : null, error };
}

// =====================
// Workout Plans
// =====================
export async function saveWorkoutPlan(userId, plan) {
  const data = {
    user_id: userId,
    split_name: plan.splitName,
    split_key: plan.splitKey,
    level: plan.level,
    days_per_week: plan.daysPerWeek,
    schedule: plan.schedule,
    tips: plan.tips,
  };

  // Delete old plan, insert new
  await supabase.from('workout_plans').delete().eq('user_id', userId);
  return supabase.from('workout_plans').insert(data).select().single();
}

export async function fetchWorkoutPlan(userId) {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!data) return { data: null, error };
  return {
    data: {
      splitName: data.split_name,
      splitKey: data.split_key,
      level: data.level,
      daysPerWeek: data.days_per_week,
      schedule: data.schedule,
      tips: data.tips,
    },
    error,
  };
}

// =====================
// Diet Plans
// =====================
export async function saveDietPlan(userId, plan) {
  const data = {
    user_id: userId,
    calorie_target: plan.calorieTarget,
    calorie_tier: plan.calorieTier,
    meals: plan.meals,
    supplements: plan.supplements,
    total_calories: plan.totalCalories,
    total_protein: plan.totalProtein,
    macros: plan.macros,
  };

  await supabase.from('diet_plans').delete().eq('user_id', userId);
  return supabase.from('diet_plans').insert(data).select().single();
}

export async function fetchDietPlan(userId) {
  const { data, error } = await supabase
    .from('diet_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!data) return { data: null, error };
  return {
    data: {
      calorieTarget: data.calorie_target,
      calorieTier: data.calorie_tier,
      meals: data.meals,
      supplements: data.supplements,
      totalCalories: data.total_calories,
      totalProtein: data.total_protein,
      macros: data.macros,
    },
    error,
  };
}

// =====================
// Exercise Logs
// =====================
export async function saveExerciseLog(userId, log) {
  const data = {
    user_id: userId,
    date: log.date,
    day_name: log.dayName,
    exercises: log.exercises,
    duration_minutes: log.duration_minutes || log.durationMinutes,
    notes: log.notes || null,
  };
  return supabase.from('exercise_logs').insert(data).select().single();
}

export async function fetchExerciseLogs(userId) {
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  return {
    data: (data || []).map((log) => ({
      id: log.id,
      date: log.date,
      dayName: log.day_name,
      exercises: log.exercises,
      duration_minutes: log.duration_minutes,
      notes: log.notes,
    })),
    error,
  };
}

// =====================
// Progress (Weight) Logs
// =====================
export async function saveProgressLog(userId, log) {
  const data = {
    user_id: userId,
    date: log.date,
    weight: log.weight,
    body_fat_percentage: log.bodyFatPercentage || null,
    notes: log.notes || null,
  };
  return supabase.from('progress').insert(data).select().single();
}

export async function fetchProgressLogs(userId) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  return {
    data: (data || []).map((log) => ({
      id: log.id,
      date: log.date,
      weight: parseFloat(log.weight),
    })),
    error,
  };
}

// =====================
// Gamification
// =====================
export async function saveGamification(userId, gamData) {
  const data = {
    user_id: userId,
    xp: gamData.xp,
    level: gamData.level,
    current_streak: gamData.currentStreak,
    longest_streak: gamData.longestStreak,
    total_workouts: gamData.totalWorkouts,
    earned_badges: gamData.earnedBadges,
    last_login_date: gamData.lastLoginDate,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from('gamification')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    return supabase
      .from('gamification')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single();
  }
  return supabase.from('gamification').insert(data).select().single();
}

export async function fetchGamification(userId) {
  const { data, error } = await supabase
    .from('gamification')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!data) return { data: null, error };
  return {
    data: {
      xp: data.xp,
      level: data.level,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      totalWorkouts: data.total_workouts,
      earnedBadges: data.earned_badges || [],
      lastLoginDate: data.last_login_date,
    },
    error,
  };
}

// =====================
// Food Logs
// =====================
export async function saveFoodLog(userId, log) {
  const data = {
    user_id: userId,
    date: log.date,
    meal_type: log.mealType,
    items: log.items,
    total_calories: log.totalCalories,
    total_protein: log.totalProtein,
  };
  return supabase.from('food_logs').insert(data).select().single();
}

export async function deleteFoodLog(logId) {
  return supabase.from('food_logs').delete().eq('id', logId);
}

export async function fetchFoodLogs(userId) {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  return {
    data: (data || []).map((log) => ({
      id: log.id,
      date: log.date,
      mealType: log.meal_type,
      items: log.items,
      totalCalories: log.total_calories,
      totalProtein: log.total_protein,
    })),
    error,
  };
}

// =====================
// Delete All User Data (for Reset)
// =====================
export async function deleteAllUserData(userId) {
  // Delete dependent tables first, then profiles last (FK constraints)
  await Promise.all([
    supabase.from('exercise_logs').delete().eq('user_id', userId),
    supabase.from('food_logs').delete().eq('user_id', userId),
    supabase.from('progress').delete().eq('user_id', userId),
    supabase.from('workout_plans').delete().eq('user_id', userId),
    supabase.from('diet_plans').delete().eq('user_id', userId),
    supabase.from('gamification').delete().eq('user_id', userId),
  ]);
  // Delete profile last after all dependent rows are gone
  await supabase.from('profiles').delete().eq('user_id', userId);
}
