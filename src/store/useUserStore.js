import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateWorkoutPlan, generateDietPlan } from '../utils/planGenerator';
import { calculateNutritionTargets } from '../utils/tdee';
import {
  getLevelFromXP,
  getLevelProgress,
  getLevelTitle,
  getEarnedBadges,
  calculateStreak,
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
      xp: 0,
      level: 0,
      currentStreak: 0,
      longestStreak: 0,
      earnedBadges: [],
      lastLoginDate: null,

      // Stats
      totalWorkouts: 0,
      personalRecords: 0,
      weightLogsCount: 0,
      earlyWorkouts: 0,

      // Actions
      setProfile: (profile) => {
        const nutritionTargets = calculateNutritionTargets(profile);
        const workoutPlan = generateWorkoutPlan(profile);
        const dietPlan = generateDietPlan(profile);

        set({
          profile,
          isOnboarded: true,
          nutritionTargets,
          workoutPlan,
          dietPlan,
        });

        // Sync to Supabase
        syncToSupabase(async (userId) => {
          await Promise.all([
            saveProfile(userId, profile),
            saveWorkoutPlan(userId, workoutPlan),
            saveDietPlan(userId, dietPlan),
            saveGamification(userId, {
              xp: get().xp,
              level: get().level,
              currentStreak: get().currentStreak,
              longestStreak: get().longestStreak,
              totalWorkouts: get().totalWorkouts,
              earnedBadges: get().earnedBadges,
              lastLoginDate: get().lastLoginDate,
            }),
          ]);
        });
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
        const hour = new Date().getHours();

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
        const earlyWorkouts = hour < 8 ? state.earlyWorkouts + 1 : state.earlyWorkouts;

        // Calculate XP
        let xpGain = XP_REWARDS.completeWorkout;
        if (totalWorkouts === 1) xpGain += XP_REWARDS.firstWorkout;
        if (newStreak === 7) xpGain += XP_REWARDS.sevenDayStreak;
        if (newStreak === 30) xpGain += XP_REWARDS.thirtyDayStreak;

        const newXP = state.xp + xpGain;
        const newLevel = getLevelFromXP(newXP);

        const stats = {
          totalWorkouts,
          currentStreak: newStreak,
          personalRecords: state.personalRecords,
          weightLogs: state.weightLogsCount,
          level: newLevel,
          earlyWorkouts,
        };

        const newEarnedBadges = getEarnedBadges(stats);

        set({
          workoutLogs: newLogs,
          totalWorkouts,
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          xp: newXP,
          level: newLevel,
          earnedBadges: newEarnedBadges,
          earlyWorkouts,
        });

        // Sync to Supabase
        syncToSupabase(async (userId) => {
          await Promise.all([
            saveExerciseLog(userId, newLog),
            saveGamification(userId, {
              xp: newXP,
              level: newLevel,
              currentStreak: newStreak,
              longestStreak: Math.max(state.longestStreak, newStreak),
              totalWorkouts,
              earnedBadges: newEarnedBadges,
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
        const newXP = state.xp + XP_REWARDS.weightLogged;
        const newLevel = getLevelFromXP(newXP);

        set({
          weightLogs: newWeightLogs,
          weightLogsCount: count,
          xp: newXP,
          level: newLevel,
        });

        // Sync to Supabase
        syncToSupabase(async (userId) => {
          await Promise.all([
            saveProgressLog(userId, newLog),
            saveGamification(userId, {
              xp: newXP,
              level: newLevel,
              currentStreak: state.currentStreak,
              longestStreak: state.longestStreak,
              totalWorkouts: state.totalWorkouts,
              earnedBadges: state.earnedBadges,
              lastLoginDate: state.lastLoginDate,
            }),
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
        const newXP = state.xp + (XP_REWARDS.logFood || 50);
        const newLevel = getLevelFromXP(newXP);

        set({
          foodLogs: newFoodLogs,
          xp: newXP,
          level: newLevel,
        });

        // Sync to Supabase
        syncToSupabase(async (userId) => {
          await Promise.all([
            saveFoodLog(userId, newLog),
            saveGamification(userId, {
              xp: newXP,
              level: newLevel,
              currentStreak: state.currentStreak,
              longestStreak: state.longestStreak,
              totalWorkouts: state.totalWorkouts,
              earnedBadges: state.earnedBadges,
              lastLoginDate: state.lastLoginDate,
            }),
          ]);
        });
      },

      unlogFood: (logId) => {
        const state = get();
        const logToRemove = state.foodLogs.find((l) => l.id === logId);
        if (!logToRemove) return;

        const newFoodLogs = state.foodLogs.filter((l) => l.id !== logId);
        const newXP = Math.max(0, state.xp - (XP_REWARDS.logFood || 50));
        const newLevel = getLevelFromXP(newXP);

        set({
          foodLogs: newFoodLogs,
          xp: newXP,
          level: newLevel,
        });

        syncToSupabase(async (userId) => {
          await Promise.all([
            deleteFoodLog(logId),
            saveGamification(userId, {
              xp: newXP,
              level: newLevel,
              currentStreak: state.currentStreak,
              longestStreak: state.longestStreak,
              totalWorkouts: state.totalWorkouts,
              earnedBadges: state.earnedBadges,
              lastLoginDate: state.lastLoginDate,
            }),
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
          const newXP = state.xp + XP_REWARDS.dailyLogin;
          const newLevel = getLevelFromXP(newXP);
          set({
            lastLoginDate: today,
            xp: newXP,
            level: newLevel,
          });

          syncToSupabase(async (userId) => {
            await saveGamification(userId, {
              xp: newXP,
              level: newLevel,
              currentStreak: state.currentStreak,
              longestStreak: state.longestStreak,
              totalWorkouts: state.totalWorkouts,
              earnedBadges: state.earnedBadges,
              lastLoginDate: today,
            });
          });
        }
      },

      // Get computed values
      getLevelInfo: () => {
        const { xp, level } = get();
        return {
          level,
          title: getLevelTitle(level),
          progress: getLevelProgress(xp),
          xp,
        };
      },

      // Hydrate from Supabase (called after login)
      hydrateFromSupabase: (data) => {
        const { profile, gamification, exerciseLogs, progressLogs, foodLogs } = data;

        if (!profile) return;

        const nutritionTargets = calculateNutritionTargets(profile);

        set({
          profile,
          isOnboarded: true,
          nutritionTargets,
          workoutPlan: generateWorkoutPlan(profile),
          dietPlan: generateDietPlan(profile),
          workoutLogs: exerciseLogs || [],
          weightLogs: progressLogs || [],
          foodLogs: foodLogs || [],
          xp: gamification?.xp || 0,
          level: gamification?.level || 0,
          currentStreak: gamification?.currentStreak || 0,
          longestStreak: gamification?.longestStreak || 0,
          totalWorkouts: gamification?.totalWorkouts || 0,
          earnedBadges: gamification?.earnedBadges || [],
          lastLoginDate: gamification?.lastLoginDate || null,
          weightLogsCount: (progressLogs || []).length,
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

        // Regenerate diet plan with adjusted calories
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
          xp: 0,
          level: 0,
          currentStreak: 0,
          longestStreak: 0,
          earnedBadges: [],
          lastLoginDate: null,
          totalWorkouts: 0,
          personalRecords: 0,
          weightLogsCount: 0,
          earlyWorkouts: 0,
        });
      },
    }),
    {
      name: 'gym-companion-storage',
    }
  )
);

export default useUserStore;
