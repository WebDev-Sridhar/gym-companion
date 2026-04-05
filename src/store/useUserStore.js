import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import supabase from '../lib/supabase';
import { generateWorkoutPlan, generateDietPlan } from '../utils/planGenerator';
import { calculateNutritionTargets } from '../utils/tdee';
import {
  calculateStreak,
  computeTransformationStats,
  getCurrentTransformationLevel,
  getNextLevel,
  getLevelProgress,
  XP_REWARDS,
} from '../utils/gamification';
import {
  saveProfile,
  saveWorkoutPlan,
  saveDietPlan,
  saveGamification,
  saveExerciseLog,
  saveProgressLog,
  saveFoodLog,
  deleteFoodLog,
  deleteExerciseLog,
  deleteProgressLog,
  deleteAllUserData,
  deleteCustomPlan,
  saveXpLog,
} from '../lib/supabaseService';

// Lazy reference to auth store to avoid circular dependency at import time
let _authStoreModule = null;
const getUserId = () => {
  try {
    if (!_authStoreModule) {
      _authStoreModule = import.meta.glob('./useAuthStore.js', { eager: true })['./useAuthStore.js'];
    }
    return _authStoreModule?.default?.getState()?.user?.id ?? null;
  } catch {
    return null;
  }
};

// Fire-and-forget Supabase push (non-blocking)
const syncToSupabase = async (fn) => {
  try {
    const userId = getUserId();
    if (userId) await fn(userId);
  } catch (err) {
    console.warn('Supabase sync failed:', err.message);
  }
};

// Fire-and-forget XP log for leaderboard tracking
const logXpEvent = (userId, xpAmount, source) => {
  saveXpLog(userId, xpAmount, source).catch((err) =>
    console.warn('XP log failed:', err.message)
  );
};

// Helper: recompute transformation level from current state
const recomputeLevel = (state) => {
  const stats = computeTransformationStats(
    state.workoutLogs,
    state.weightLogs,
    state.foodLogs,
    state.currentStreak,
    state.longestStreak,
    state.nutritionTargets
  );
  const currentLevel = getCurrentTransformationLevel(stats);
  return currentLevel.id;
};

// Helper: build gamification save object
const buildGamSaveData = (state) => ({
  transformationLevel: state.transformationLevel,
  xp: state.xp,
  currentStreak: state.currentStreak,
  longestStreak: state.longestStreak,
  totalWorkouts: state.totalWorkouts,
  lastLoginDate: state.lastLoginDate,
  currentWorkoutDay: state.currentWorkoutDay,
  exerciseSwaps: state.exerciseSwaps,
});

const useUserStore = create(
  persist(
    (set, get) => ({
      // Profile
      profile: null,
      isOnboarded: false,
      hasOnboardedBefore: false,

      // Plans (dual-plan system: default + custom coexist)
      defaultPlan: null,         // Auto-generated plan (never touched by builder)
      customPlan: null,          // User-built plan (null until created)
      activePlanType: 'default', // 'default' | 'custom'
      workoutPlan: null,         // Active plan pointer (always equals default or custom)
      dietPlan: null,
      nutritionTargets: null,

      // Workout Logs
      workoutLogs: [],

      // Weight Logs
      weightLogs: [],

      // Food Logs
      foodLogs: [],

      // Gamification
      transformationLevel: 1,
      level: 1,
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,

      // Meal Swaps (per-date slot overrides)
      mealSwaps: {}, // { '2026-03-22': { breakfast: 3, dinner: 5 }, ... }

      // Exercise Swaps (persistent until manually reset — keyed by dayName/index)
      exerciseSwaps: {}, // { 'Push Day': { 0: 'dumbbellBenchPress' } }

      // Current workout day progression (index into workoutPlan.schedule)
      currentWorkoutDay: 0,

      // Pending food logs (survives navigation, cleared on complete)
      pendingFoodLogs: {},

      // Active workout log (survives navigation, cleared on save/cancel)
      activeWorkoutLog: null, // { dayName, activeDay, logData, cardioLog }

      // Subscription
      plan: 'free', // 'free' | 'pro'
      subscription: null, // { id, planType, status, startsAt, expiresAt }

      // Referral
      referralCode: null,
      rewardPoints: 0,
      successfulReferrals: 0,

      // Stats
      totalWorkouts: 0,
      weightLogsCount: 0,

      // Exercise Swap Actions (persistent — no date key)
      swapExercise: (dayName, exerciseIndex, newExerciseKey) => {
        set((s) => ({
          exerciseSwaps: {
            ...s.exerciseSwaps,
            [dayName]: {
              ...(s.exerciseSwaps[dayName] || {}),
              [exerciseIndex]: newExerciseKey,
            },
          },
        }));
      },

      resetExerciseSwap: (dayName, exerciseIndex) => {
        set((s) => {
          const daySwaps = { ...(s.exerciseSwaps[dayName] || {}) };
          delete daySwaps[exerciseIndex];
          return {
            exerciseSwaps: {
              ...s.exerciseSwaps,
              [dayName]: daySwaps,
            },
          };
        });
      },

      // Workout Day Progression
      advanceWorkoutDay: (scheduleLength) => {
        set((s) => ({
          currentWorkoutDay: scheduleLength > 0 ? (s.currentWorkoutDay + 1) % scheduleLength : 0,
        }));
      },

      // Meal Swap Actions
      swapMeal: (date, mealKey, optionIndex) => {
        set((s) => ({
          mealSwaps: {
            ...s.mealSwaps,
            [date]: { ...(s.mealSwaps[date] || {}), [mealKey]: optionIndex },
          },
        }));
      },

      // Pending Food Log Actions
      addPendingFoodLog: (mealKey, data) => {
        set((s) => ({ pendingFoodLogs: { ...s.pendingFoodLogs, [mealKey]: data } }));
      },
      removePendingFoodLog: (mealKey) => {
        set((s) => {
          const copy = { ...s.pendingFoodLogs };
          delete copy[mealKey];
          return { pendingFoodLogs: copy };
        });
      },
      clearPendingFoodLogs: () => set({ pendingFoodLogs: {} }),

      // Active Workout Log Actions (persist in-progress logging across navigation)
      setActiveWorkoutLog: (data) => set({ activeWorkoutLog: data }),
      clearActiveWorkoutLog: () => set({ activeWorkoutLog: null }),

      // Subscription Actions
      activatePro: (subscriptionData) => {
        set({
          plan: 'pro',
          subscription: subscriptionData,
        });
      },

      deactivatePro: () => {
        set({
          plan: 'free',
          subscription: null,
        });
      },

      checkSubscriptionExpiry: () => {
        const { subscription } = get();
        if (subscription?.expiresAt) {
          const expired = new Date(subscription.expiresAt) < new Date();
          if (expired) {
            set({ plan: 'free', subscription: { ...subscription, status: 'expired' } });
          }
        }
      },

      // Referral Actions
      updateReferralData: ({ rewardPoints, successfulReferrals, referralCode }) => {
        set({
          ...(referralCode !== undefined && { referralCode }),
          ...(rewardPoints !== undefined && { rewardPoints }),
          ...(successfulReferrals !== undefined && { successfulReferrals }),
        });
      },

      // Actions
      preparePlan: (profile) => {
        const nutritionTargets = calculateNutritionTargets(profile);
        const generatedPlan = generateWorkoutPlan(profile);
        const dietPlan = generateDietPlan(profile);

        const currentPlan = get().workoutPlan;
        const planChanged = currentPlan?.daysPerWeek !== generatedPlan.daysPerWeek;

        set({
          profile,
          nutritionTargets,
          defaultPlan: generatedPlan,
          workoutPlan: generatedPlan,
          activePlanType: 'default',
          dietPlan,
          ...(planChanged ? { currentWorkoutDay: 0 } : {}),
        });
      },

      regenerateDiet: () => {
        const profile = get().profile;
        if (!profile) return;
        const dietPlan = generateDietPlan(profile);
        const nutritionTargets = calculateNutritionTargets(profile);
        set({ dietPlan, nutritionTargets });
        syncToSupabase((userId) => saveDietPlan(userId, dietPlan));
      },

      completeOnboarding: () => {
        set({ isOnboarded: true, hasOnboardedBefore: true });

        const state = get();
        syncToSupabase(async (userId) => {
          await Promise.all([
            saveProfile(userId, { ...state.profile, hasOnboardedBefore: true }),
            saveWorkoutPlan(userId, state.workoutPlan),
            saveDietPlan(userId, state.dietPlan),
            saveGamification(userId, buildGamSaveData(state)),
          ]);

          // Process pending referral (if user signed up via referral link)
          const refCode = localStorage.getItem('owngainz-ref');
          if (refCode) {
            supabase.functions.invoke('process-referral-signup', {
              body: { referralCode: refCode },
            }).then(() => {
              localStorage.removeItem('owngainz-ref');
            }).catch((e) => {
              console.warn('Referral processing failed:', e.message);
            });
          }
        });
      },

      setProfile: (profile) => {
        get().preparePlan(profile);
        get().completeOnboarding();
      },

      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (!currentProfile) return;

        const newProfile = { ...currentProfile, ...updates };
        get().setProfile(newProfile);
      },

      // Custom Workout Plan (PRO Builder)
      setCustomWorkoutPlan: (plan) => {
        set({
          customPlan: plan,
          workoutPlan: plan,
          activePlanType: 'custom',
          currentWorkoutDay: 0,
          exerciseSwaps: {},
        });
        syncToSupabase((userId) => saveWorkoutPlan(userId, plan));
      },

      // Delete custom plan and revert to default
      deleteCustomWorkoutPlan: () => {
        const { defaultPlan } = get();
        set({
          customPlan: null,
          activePlanType: 'default',
          workoutPlan: defaultPlan,
          currentWorkoutDay: 0,
          exerciseSwaps: {},
        });
        syncToSupabase((userId) => deleteCustomPlan(userId));
      },

      // Switch between default and custom plans
      switchPlan: (type) => {
        const { defaultPlan, customPlan } = get();
        if (type === 'custom' && !customPlan) return false;
        const target = type === 'custom' ? customPlan : defaultPlan;
        if (!target) return false;
        set({
          activePlanType: type,
          workoutPlan: target,
          currentWorkoutDay: 0,
          exerciseSwaps: {},
        });
        syncToSupabase((userId) => saveWorkoutPlan(userId, target));
        return true;
      },

      // Workout Logging
      logWorkout: (workout) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];

        const newLog = {
          id: Date.now().toString(),
          date: today,
          timestamp: new Date().toISOString(),
          ...workout,
        };

        const newLogs = [...state.workoutLogs, newLog];
        const workoutDates = [...new Set(newLogs.map((l) => l.date))];
        const newStreak = calculateStreak(workoutDates);
        const totalWorkouts = state.totalWorkouts + 1;
        const newLongestStreak = Math.max(state.longestStreak, newStreak);

        // Compute transformation level from updated data
        const stats = computeTransformationStats(
          newLogs, state.weightLogs, state.foodLogs,
          newStreak, newLongestStreak, state.nutritionTargets
        );
        const newLevel = getCurrentTransformationLevel(stats).id;

        // XP: workout reward + streak milestone bonuses
        let xpGain = XP_REWARDS.workout;
        if (newStreak === 7) xpGain += XP_REWARDS.streak7;
        else if (newStreak === 14) xpGain += XP_REWARDS.streak14;
        else if (newStreak === 30) xpGain += XP_REWARDS.streak30;
        const newXp = state.xp + xpGain;

        const workoutPlan = get().workoutPlan;
        const scheduleLength = workoutPlan?.schedule?.length || 0;
        // Advance from the logged day (not always from currentWorkoutDay)
        const loggedDayIndex = workoutPlan?.schedule?.findIndex(d => d.day === workout.dayName) ?? -1;
        const baseDay = loggedDayIndex >= 0 ? loggedDayIndex : get().currentWorkoutDay;
        const newWorkoutDay = scheduleLength > 0 ? (baseDay + 1) % scheduleLength : 0;

        set({
          workoutLogs: newLogs,
          totalWorkouts,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          transformationLevel: newLevel,
          level: newLevel,
          xp: newXp,
          currentWorkoutDay: newWorkoutDay,
        });

        syncToSupabase(async (userId) => {
          await Promise.all([
            saveExerciseLog(userId, newLog),
            saveGamification(userId, {
              transformationLevel: newLevel,
              xp: newXp,
              currentStreak: newStreak,
              longestStreak: newLongestStreak,
              totalWorkouts,
              lastLoginDate: get().lastLoginDate,
            }),
          ]);
          logXpEvent(userId, XP_REWARDS.workout, 'workout');
          const streakBonus = xpGain - XP_REWARDS.workout;
          if (streakBonus > 0) logXpEvent(userId, streakBonus, 'streak_bonus');
        });
      },

      // Weight Logging
      logWeight: (weight) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];

        const newLog = {
          id: Date.now().toString(),
          date: today,
          weight: parseFloat(weight),
        };

        const newWeightLogs = [...state.weightLogs, newLog];
        const count = state.weightLogsCount + 1;

        // Recompute transformation level (weight change may unlock levels)
        const stats = computeTransformationStats(
          state.workoutLogs, newWeightLogs, state.foodLogs,
          state.currentStreak, state.longestStreak, state.nutritionTargets
        );
        const newLevel = getCurrentTransformationLevel(stats).id;

        const newXp = state.xp + XP_REWARDS.weight;

        set({
          weightLogs: newWeightLogs,
          weightLogsCount: count,
          transformationLevel: newLevel,
          level: newLevel,
          xp: newXp,
        });

        syncToSupabase(async (userId) => {
          await Promise.all([
            saveProgressLog(userId, newLog),
            saveGamification(userId, buildGamSaveData({ ...state, weightLogsCount: count, transformationLevel: newLevel, xp: newXp })),
          ]);
          logXpEvent(userId, XP_REWARDS.weight, 'weight');
        });
      },

      // Delete Workout Log
      deleteWorkoutLog: (logId) => {
        const state = get();
        const logToRemove = state.workoutLogs.find((l) => l.id === logId);
        if (!logToRemove) return;

        const newLogs = state.workoutLogs.filter((l) => l.id !== logId);
        const workoutDates = [...new Set(newLogs.map((l) => l.date))];
        const newStreak = calculateStreak(workoutDates);
        const totalWorkouts = Math.max(0, state.totalWorkouts - 1);
        const newLongestStreak = Math.max(newStreak, state.longestStreak);

        const stats = computeTransformationStats(
          newLogs, state.weightLogs, state.foodLogs,
          newStreak, newLongestStreak, state.nutritionTargets
        );
        const newLevel = getCurrentTransformationLevel(stats).id;
        const newXp = Math.max(0, state.xp - XP_REWARDS.workout);

        // Revert active day to the deleted log's day so user can re-do it
        const workoutPlan = get().workoutPlan;
        const deletedDayIndex = workoutPlan?.schedule?.findIndex(d => d.day === logToRemove.dayName) ?? -1;

        set({
          workoutLogs: newLogs,
          totalWorkouts,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          transformationLevel: newLevel,
          level: newLevel,
          xp: newXp,
          currentWorkoutDay: deletedDayIndex >= 0 ? deletedDayIndex : state.currentWorkoutDay,
        });

        syncToSupabase(async (userId) => {
          await Promise.all([
            deleteExerciseLog(logId),
            saveGamification(userId, buildGamSaveData({ ...get() })),
          ]);
        });
      },

      // Delete Weight Log
      deleteWeightLog: (logId) => {
        const state = get();
        const newWeightLogs = state.weightLogs.filter((l) => l.id !== logId);

        const stats = computeTransformationStats(
          state.workoutLogs, newWeightLogs, state.foodLogs,
          state.currentStreak, state.longestStreak, state.nutritionTargets
        );
        const newLevel = getCurrentTransformationLevel(stats).id;
        const newXp = Math.max(0, state.xp - XP_REWARDS.weight);

        set({
          weightLogs: newWeightLogs,
          weightLogsCount: newWeightLogs.length,
          transformationLevel: newLevel,
          level: newLevel,
          xp: newXp,
        });

        syncToSupabase(async (userId) => {
          await Promise.all([
            deleteProgressLog(logId),
            saveGamification(userId, buildGamSaveData({ ...get() })),
          ]);
        });
      },

      // Food Logging
      logFood: (mealType, items, totalCalories, totalProtein) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];

        const newLog = {
          id: Date.now().toString(),
          date: today,
          mealType,
          items,
          totalCalories,
          totalProtein,
        };

        const newFoodLogs = [...state.foodLogs, newLog];

        // Recompute transformation level (nutrition logs may unlock levels)
        const stats = computeTransformationStats(
          state.workoutLogs, state.weightLogs, newFoodLogs,
          state.currentStreak, state.longestStreak, state.nutritionTargets
        );
        const newLevel = getCurrentTransformationLevel(stats).id;

        const newXp = state.xp + XP_REWARDS.meal;

        set({
          foodLogs: newFoodLogs,
          transformationLevel: newLevel,
          level: newLevel,
          xp: newXp,
        });

        syncToSupabase(async (userId) => {
          const [saveResult] = await Promise.all([
            saveFoodLog(userId, newLog),
            saveGamification(userId, buildGamSaveData({ ...state, transformationLevel: newLevel, xp: newXp })),
          ]);
          if (saveResult?.data?.id) {
            set((s) => ({
              foodLogs: s.foodLogs.map((l) =>
                l.id === newLog.id ? { ...l, id: saveResult.data.id } : l
              ),
            }));
          }
          logXpEvent(userId, XP_REWARDS.meal, 'diet');
        });
      },

      unlogFood: (logId) => {
        const state = get();
        const logToRemove = state.foodLogs.find((l) => l.id === logId);
        if (!logToRemove) return;

        const newFoodLogs = state.foodLogs.filter((l) => l.id !== logId);

        // Recompute transformation level
        const stats = computeTransformationStats(
          state.workoutLogs, state.weightLogs, newFoodLogs,
          state.currentStreak, state.longestStreak, state.nutritionTargets
        );
        const newLevel = getCurrentTransformationLevel(stats).id;
        const newXp = Math.max(0, state.xp - XP_REWARDS.meal);

        set({
          foodLogs: newFoodLogs,
          transformationLevel: newLevel,
          level: newLevel,
          xp: newXp,
        });

        syncToSupabase(async (userId) => {
          await Promise.all([
            deleteFoodLog(logId),
            saveGamification(userId, buildGamSaveData({ ...get() })),
          ]);
        });
      },

      getTodaysFoodLogs: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().foodLogs.filter((l) => l.date === today);
      },

      getTodaysCalories: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().foodLogs
          .filter((l) => l.date === today)
          .reduce((sum, l) => sum + (l.totalCalories || 0), 0);
      },

      getTodaysProtein: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().foodLogs
          .filter((l) => l.date === today)
          .reduce((sum, l) => sum + (l.totalProtein || 0), 0);
      },

      // Daily Login
      checkDailyLogin: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];

        if (state.lastLoginDate !== today) {
          const newLevel = recomputeLevel({ ...state, lastLoginDate: today });
          const newXp = state.xp + XP_REWARDS.dailyLogin;

          set({
            lastLoginDate: today,
            transformationLevel: newLevel,
            level: newLevel,
            xp: newXp,
          });

          syncToSupabase(async (userId) => {
            await saveGamification(userId, buildGamSaveData({
              ...state,
              transformationLevel: newLevel,
              xp: newXp,
              lastLoginDate: today,
            }));
            logXpEvent(userId, XP_REWARDS.dailyLogin, 'login');
          });
        }
      },

      // Get computed level info
      getLevelInfo: () => {
        const state = get();
        const stats = computeTransformationStats(
          state.workoutLogs, state.weightLogs, state.foodLogs,
          state.currentStreak, state.longestStreak, state.nutritionTargets
        );
        const current = getCurrentTransformationLevel(stats);
        const next = getNextLevel(current.id);
        const progress = next ? getLevelProgress(next.id, stats) : { completedTasks: 0, totalTasks: 0, percentage: 100, taskDetails: [] };

        return {
          level: current.id,
          name: current.name,
          rewardMessage: current.rewardMessage,
          nextLevel: next,
          progress,
        };
      },

      // Hydrate subscription only (when profile doesn't exist, e.g. after reset)
      hydrateSubscription: (subscription) => {
        if (subscription && subscription.status === 'active') {
          const expired = new Date(subscription.expiresAt) < new Date();
          if (!expired) {
            set({ plan: 'pro', subscription });
          } else {
            set({ plan: 'free', subscription: { ...subscription, status: 'expired' } });
          }
        }
      },

      // Hydrate from Supabase (called after login)
      hydrateFromSupabase: (data) => {
        const { profile, defaultPlan: savedDefault, customPlan: savedCustom, dietPlan: savedDietPlan, gamification, exerciseLogs, progressLogs, foodLogs, subscription } = data;

        if (!profile) return;

        // Determine plan status from subscription
        let plan = 'free';
        let subData = null;
        if (subscription && subscription.status === 'active') {
          const expired = new Date(subscription.expiresAt) < new Date();
          if (!expired) {
            plan = 'pro';
            subData = subscription;
          } else {
            subData = { ...subscription, status: 'expired' };
          }
        }

        // Profile row exists but fields are nulled (post-reset) — hydrate flag + subscription only
        if (!profile.name) {
          set({
            hasOnboardedBefore: profile.hasOnboardedBefore || false,
            plan,
            subscription: subData,
          });
          return;
        }

        const nutritionTargets = calculateNutritionTargets(profile);

        // Restore dual-plan system from Supabase
        const defaultPlan = savedDefault?.schedule
          ? savedDefault
          : generateWorkoutPlan(profile);
        const customPlan = savedCustom?.schedule ? savedCustom : null;

        // Determine which plan was active (custom takes priority if it exists)
        const activePlanType = customPlan ? 'custom' : 'default';
        const workoutPlan = activePlanType === 'custom' ? customPlan : defaultPlan;

        const dietPlan = savedDietPlan?.meals
          ? savedDietPlan
          : generateDietPlan(profile);

        // Recompute stats from actual logs (not gamification table, which may be stale)
        const wLogs = exerciseLogs || [];
        const weLogs = progressLogs || [];
        const fLogs = foodLogs || [];

        // Compute streak and total from actual workout logs
        const workoutDates = [...new Set(wLogs.map((l) => l.date))];
        const computedStreak = calculateStreak(workoutDates);
        const computedTotalWorkouts = wLogs.length;
        // Use whichever is higher: computed from logs or stored in gamification
        const currentStreak = Math.max(computedStreak, gamification?.currentStreak || 0);
        const longestStreak = Math.max(computedStreak, gamification?.longestStreak || 0);
        const totalWorkouts = Math.max(computedTotalWorkouts, gamification?.totalWorkouts || 0);

        const stats = computeTransformationStats(wLogs, weLogs, fLogs, currentStreak, longestStreak, nutritionTargets);
        const transformationLevel = getCurrentTransformationLevel(stats).id;

        set({
          profile,
          isOnboarded: true,
          hasOnboardedBefore: profile.hasOnboardedBefore || false,
          nutritionTargets,
          defaultPlan,
          customPlan,
          activePlanType,
          workoutPlan,
          dietPlan,
          workoutLogs: wLogs,
          weightLogs: weLogs,
          foodLogs: fLogs,
          transformationLevel,
          level: transformationLevel,
          currentStreak,
          longestStreak,
          xp: gamification?.xp || 0,
          totalWorkouts,
          lastLoginDate: gamification?.lastLoginDate || null,
          weightLogsCount: weLogs.length,
          currentWorkoutDay: gamification?.currentWorkoutDay || 0,
          exerciseSwaps: gamification?.exerciseSwaps || {},
          plan,
          subscription: subData,
          referralCode: profile.referralCode || null,
          rewardPoints: profile.rewardPoints || 0,
          successfulReferrals: profile.successfulReferrals || 0,
        });
      },

      // Adjust nutrition (for smart coaching)
      adjustNutrition: (calorieAdjustment) => {
        const state = get();
        if (!state.nutritionTargets || !state.profile) return;

        const newTargetCalories = state.nutritionTargets.targetCalories + calorieAdjustment;
        const newNutritionTargets = {
          ...state.nutritionTargets,
          targetCalories: newTargetCalories,
        };

        const adjustedProfile = { ...state.profile };
        const newDietPlan = generateDietPlan(adjustedProfile, newTargetCalories);

        set({
          nutritionTargets: newNutritionTargets,
          dietPlan: newDietPlan,
        });

        syncToSupabase(async (userId) => {
          await saveDietPlan(userId, newDietPlan);
        });
      },

      // Clear local state only (used on sign-out — does NOT delete Supabase data)
      clearLocalState: () => {
        set({
          profile: null,
          isOnboarded: false,
          defaultPlan: null,
          customPlan: null,
          activePlanType: 'default',
          workoutPlan: null,
          dietPlan: null,
          nutritionTargets: null,
          workoutLogs: [],
          weightLogs: [],
          foodLogs: [],
          transformationLevel: 1,
          level: 1,
          xp: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastLoginDate: null,
          totalWorkouts: 0,
          weightLogsCount: 0,
          mealSwaps: {},
          exerciseSwaps: {},
          currentWorkoutDay: 0,
          pendingFoodLogs: {},
          activeWorkoutLog: null,
          plan: 'free',
          subscription: null,
          referralCode: null,
          rewardPoints: 0,
          successfulReferrals: 0,
        });
        localStorage.removeItem('gym-companion-storage');
      },

      // Reset (preserves subscription/plan) — deletes Supabase data too
      resetAll: () => {
        const { plan, subscription, hasOnboardedBefore } = get();
        set({
          profile: null,
          isOnboarded: false,
          hasOnboardedBefore, // preserve — stored in DB, survives reset
          defaultPlan: null,
          customPlan: null,
          activePlanType: 'default',
          workoutPlan: null,
          dietPlan: null,
          nutritionTargets: null,
          workoutLogs: [],
          weightLogs: [],
          foodLogs: [],
          transformationLevel: 1,
          level: 1,
          xp: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastLoginDate: null,
          totalWorkouts: 0,
          weightLogsCount: 0,
          mealSwaps: {},
          exerciseSwaps: {},
          currentWorkoutDay: 0,
          pendingFoodLogs: {},
          activeWorkoutLog: null,
          plan,
          subscription,
          referralCode: null,
          rewardPoints: 0,
          successfulReferrals: 0,
        });

        syncToSupabase(async (userId) => {
          await deleteAllUserData(userId);
        });
      },
    }),
    {
      name: 'gym-companion-storage',
      version: 2,
      migrate: (persisted, version) => {
        // v1 → v2: migrate single workoutPlan to dual-plan system
        if (version < 2 && persisted.workoutPlan && !persisted.defaultPlan) {
          if (persisted.workoutPlan.splitKey === 'custom') {
            persisted.customPlan = persisted.workoutPlan;
            persisted.activePlanType = 'custom';
            // defaultPlan will be regenerated on next hydration from profile
            persisted.defaultPlan = null;
          } else {
            persisted.defaultPlan = persisted.workoutPlan;
            persisted.customPlan = null;
            persisted.activePlanType = 'default';
          }
        }
        return persisted;
      },
    }
  )
);

export default useUserStore;
