import { create } from 'zustand';
import supabase from '../lib/supabase';
import useUserStore from './useUserStore';
import {
  fetchProfile,
  fetchWorkoutPlan,
  fetchDietPlan,
  fetchGamification,
  fetchExerciseLogs,
  fetchProgressLogs,
  fetchFoodLogs,
} from '../lib/supabaseService';

const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        set({ session, user: session.user });
        await get().hydrateProfile(session.user.id);
      }

      set({ loading: false });

      supabase.auth.onAuthStateChange(async (event, session) => {
        set({ session, user: session?.user ?? null });

        if (event === 'SIGNED_IN' && session) {
          // Only hydrate if not already onboarded (avoid re-loading on tab focus)
          if (!useUserStore.getState().isOnboarded) {
            set({ loading: true });
            await get().hydrateProfile(session.user.id);
            set({ loading: false });
          }
        }
      });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  hydrateProfile: async (userId) => {
    try {
      const { data: profile } = await fetchProfile(userId);
      if (profile) {
        const [
          { data: workoutPlan },
          { data: dietPlan },
          { data: gamification },
          { data: exerciseLogs },
          { data: progressLogs },
          { data: foodLogs },
        ] = await Promise.all([
          fetchWorkoutPlan(userId),
          fetchDietPlan(userId),
          fetchGamification(userId),
          fetchExerciseLogs(userId),
          fetchProgressLogs(userId),
          fetchFoodLogs(userId),
        ]);

        useUserStore.getState().hydrateFromSupabase({
          profile,
          workoutPlan,
          dietPlan,
          gamification,
          exerciseLogs: exerciseLogs || [],
          progressLogs: progressLogs || [],
          foodLogs: foodLogs || [],
        });
      }
    } catch (err) {
      console.warn('Profile hydration failed:', err.message);
    }
  },

  signInWithGoogle: async () => {
    set({ error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) set({ error: error.message });
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      useUserStore.getState().resetAll();
      set({
        session: null,
        user: null,
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
