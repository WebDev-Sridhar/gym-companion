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
  // Explicit field mapping — only include columns that exist in the profiles table.
  // Fields like gymExperience and bodyFat are app-only and must NOT be sent to Supabase.
  const data = {
    user_id: userId,
    name: profileData.name,
    age: profileData.age,
    height: profileData.height,
    weight: profileData.weight,
    gender: profileData.gender,
    activity_level: profileData.activityLevel,
    goal: profileData.goal,
    diet_type: profileData.dietType,
    workout_days: profileData.workoutDays,
    workout_duration: profileData.workoutDuration,
    use_supplements: profileData.useSupplements,
    has_onboarded_before: profileData.hasOnboardedBefore || false,
    updated_at: new Date().toISOString(),
  };

  // Use upsert to atomically insert-or-update (eliminates race conditions)
  return supabase
    .from('profiles')
    .upsert(data, { onConflict: 'user_id' })
    .select()
    .single();
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
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

  // Delete only the same type (custom vs default) to preserve the other
  const isCustom = plan.splitKey === 'custom';
  if (isCustom) {
    await supabase.from('workout_plans').delete()
      .eq('user_id', userId).eq('split_key', 'custom');
  } else {
    await supabase.from('workout_plans').delete()
      .eq('user_id', userId).neq('split_key', 'custom');
  }
  return supabase.from('workout_plans').insert(data).select().single();
}

function rowToPlan(row) {
  return {
    splitName: row.split_name,
    splitKey: row.split_key,
    level: row.level,
    daysPerWeek: row.days_per_week,
    schedule: row.schedule,
    tips: row.tips,
  };
}

export async function fetchWorkoutPlans(userId) {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  let defaultPlan = null;
  let customPlan = null;

  for (const row of (data || [])) {
    const plan = rowToPlan(row);
    if (row.split_key === 'custom') {
      if (!customPlan) customPlan = plan;
    } else {
      if (!defaultPlan) defaultPlan = plan;
    }
  }

  return { defaultPlan, customPlan, error };
}

// Backward-compatible alias (returns single plan — used by legacy callers)
export async function fetchWorkoutPlan(userId) {
  const { defaultPlan, customPlan, error } = await fetchWorkoutPlans(userId);
  return { data: customPlan || defaultPlan || null, error };
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
    .maybeSingle();

  if (!data) return { data: null, error: null };
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
    level: gamData.transformationLevel || 0,
    xp: gamData.xp || 0,
    current_streak: gamData.currentStreak,
    longest_streak: gamData.longestStreak,
    total_workouts: gamData.totalWorkouts,
    last_login_date: gamData.lastLoginDate,
    current_workout_day: gamData.currentWorkoutDay || 0,
    exercise_swaps: gamData.exerciseSwaps || {},
    updated_at: new Date().toISOString(),
  };

  // Use upsert to atomically insert-or-update (eliminates 409 conflicts from concurrent calls)
  return supabase
    .from('gamification')
    .upsert(data, { onConflict: 'user_id' })
    .select()
    .single();
}

export async function fetchGamification(userId) {
  const { data, error } = await supabase
    .from('gamification')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return { data: null, error: null };
  return {
    data: {
      transformationLevel: data.transformation_level || 0,
      xp: data.xp || 0,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      totalWorkouts: data.total_workouts,
      lastLoginDate: data.last_login_date,
      currentWorkoutDay: data.current_workout_day || 0,
      exerciseSwaps: data.exercise_swaps || {},
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

export async function deleteExerciseLog(logId) {
  return supabase.from('exercise_logs').delete().eq('id', logId);
}

export async function deleteProgressLog(logId) {
  return supabase.from('progress').delete().eq('id', logId);
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
// Subscriptions
// =====================
export async function fetchSubscription(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return { data: null, error };
  return {
    data: {
      id: data.id,
      planType: data.plan_type,
      status: data.status,
      amount: data.amount,
      startsAt: data.starts_at,
      expiresAt: data.expires_at,
      razorpayPaymentId: data.razorpay_payment_id,
    },
    error,
  };
}

export async function cancelSubscription(subscriptionId) {
  return supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single();
}

// =====================
// Delete All User Data (for Reset)
// =====================
export async function deleteAllUserData(userId) {
  // Delete dependent tables first, then profiles last (FK constraints)
  // Note: subscriptions are NOT deleted — they represent payment records and must persist across resets
  const tables = ['exercise_logs', 'food_logs', 'progress', 'workout_plans', 'diet_plans', 'gamification'];
  const results = await Promise.all(
    tables.map((table) => supabase.from(table).delete().eq('user_id', userId))
  );

  // Log any failures (usually missing DELETE RLS policies)
  results.forEach((res, i) => {
    if (res.error) console.error(`Failed to delete from ${tables[i]}:`, res.error.message);
  });

  // Null out profile fields but keep the row (preserves has_onboarded_before flag)
  const profileRes = await supabase.from('profiles').update({
    name: null, age: null, height: null, weight: null, gender: null,
    activity_level: null, goal: null, diet_type: null,
    workout_days: null, workout_duration: null, use_supplements: null,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId);
  if (profileRes.error) console.error('Failed to reset profiles:', profileRes.error.message);
}
