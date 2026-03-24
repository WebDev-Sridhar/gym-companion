import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
});

const useUserStore = create(
  persist(
    (set, get) => ({
      // Profile
      profile: null,
      isOnboarded: false,

      // Plans
      workoutPlan: null,
      dietPlan: null,
      nutritionTargets: null,

      // Workout Logs
      workoutLogs: [],

      // Weight Logs
      weightLogs: [],

      // Food Logs
      foodLogs: [],

      // Gamification
      transformationLevel: 0,
      level: 0,
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,

      // Meal Swaps (per-date slot overrides)
      mealSwaps: {}, // { '2026-03-22': { breakfast: 3, dinner: 5 }, ... }

      // Exercise Swaps (daily reset — keyed by date/day/index)
      exerciseSwaps: {}, // { '2026-03-22': { 'Push Day': { 0: 'dumbbellBenchPress' } } }

      // Subscription
      plan: 'free', // 'free' | 'pro'
      subscription: null, // { id, planType, status, startsAt, expiresAt }

      // Stats
      totalWorkouts: 0,
      weightLogsCount: 0,

      // Exercise Swap Actions
      swapExercise: (dayName, exerciseIndex, newExerciseKey) => {
        const today = new Date().toISOString().split('T')[0];
        set((s) => ({
          exerciseSwaps: {
            ...s.exerciseSwaps,
            [today]: {
              ...(s.exerciseSwaps[today] || {}),
              [dayName]: {
                ...(s.exerciseSwaps[today]?.[dayName] || {}),
                [exerciseIndex]: newExerciseKey,
              },
            },
          },
        }));
      },

      resetExerciseSwap: (dayName, exerciseIndex) => {
        const today = new Date().toISOString().split('T')[0];
        set((s) => {
          const daySwaps = { ...(s.exerciseSwaps[today]?.[dayName] || {}) };
          delete daySwaps[exerciseIndex];
          return {
            exerciseSwaps: {
              ...s.exerciseSwaps,
              [today]: {
                ...(s.exerciseSwaps[today] || {}),
                [dayName]: daySwaps,
              },
            },
          };
        });
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

      // Actions
      preparePlan: (profile) => {
        const nutritionTargets = calculateNutritionTargets(profile);
        const workoutPlan = generateWorkoutPlan(profile);
        const dietPlan = generateDietPlan(profile);

        set({
          profile,
          nutritionTargets,
          workoutPlan,
          dietPlan,
        });
      },

      completeOnboarding: () => {
        set({ isOnboarded: true });

        const state = get();
        syncToSupabase(async (userId) => {
          await Promise.all([
            saveProfile(userId, state.profile),
            saveWorkoutPlan(userId, state.workoutPlan),
            saveDietPlan(userId, state.dietPlan),
            saveGamification(userId, buildGamSaveData(state)),
          ]);
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

        set({
          workoutLogs: newLogs,
          totalWorkouts,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          transformationLevel: newLevel,
          level: newLevel,
          xp: newXp,
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

        set({
          workoutLogs: newLogs,
          totalWorkouts,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          transformationLevel: newLevel,
          level: newLevel,
        });

        syncToSupabase(async (userId) => {
          await Promise.all([
            deleteExerciseLog(logId),
            saveGamification(userId, buildGamSaveData({
              ...get(),
            })),
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

        set({
          weightLogs: newWeightLogs,
          weightLogsCount: newWeightLogs.length,
          transformationLevel: newLevel,
          level: newLevel,
        });

        syncToSupabase(async () => {
          await deleteProgressLog(logId);
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

        set({
          foodLogs: newFoodLogs,
          transformationLevel: newLevel,
          level: newLevel,
        });

        syncToSupabase(async (userId) => {
          await Promise.all([
            deleteFoodLog(logId),
            saveGamification(userId, buildGamSaveData({ ...state, transformationLevel: newLevel })),
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
            await saveGamification(userId, {
              transformationLevel: newLevel,
              xp: newXp,
              currentStreak: state.currentStreak,
              longestStreak: state.longestStreak,
              totalWorkouts: state.totalWorkouts,
              lastLoginDate: today,
            });
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

      // Hydrate from Supabase (called after login)
      hydrateFromSupabase: (data) => {
        const { profile, gamification, exerciseLogs, progressLogs, foodLogs, subscription } = data;

        if (!profile) return;

        const nutritionTargets = calculateNutritionTargets(profile);

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
          nutritionTargets,
          workoutPlan: generateWorkoutPlan(profile),
          dietPlan: generateDietPlan(profile),
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
          plan,
          subscription: subData,
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

      // Reset
      resetAll: () => {
        set({
          profile: null,
          isOnboarded: false,
          workoutPlan: null,
          dietPlan: null,
          nutritionTargets: null,
          workoutLogs: [],
          weightLogs: [],
          foodLogs: [],
          transformationLevel: 0,
          level: 0,
          xp: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastLoginDate: null,
          totalWorkouts: 0,
          weightLogsCount: 0,
          mealSwaps: {},
          exerciseSwaps: {},
          plan: 'free',
          subscription: null,
        });

        localStorage.removeItem('gym-companion-storage');

        syncToSupabase(async (userId) => {
          await deleteAllUserData(userId);
        });
      },
    }),
    {
      name: 'gym-companion-storage',
    }
  )
);

export default useUserStore;
