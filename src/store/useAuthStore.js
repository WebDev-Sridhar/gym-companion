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
  fetchSubscription,
} from '../lib/supabaseService';

const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  loading: true,
  error: null,

  _lastRefresh: 0, // timestamp of last Supabase refresh

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        set({ session, user: session.user });
        // Always hydrate from Supabase on boot to ensure cross-device sync.
        // Use sessionStorage flag to avoid redundant hydration within the same tab session.
        const alreadyHydratedThisSession = sessionStorage.getItem('gymthozhan-hydrated');
        if (!alreadyHydratedThisSession) {
          try {
            await get().hydrateProfile(session.user.id);
            sessionStorage.setItem('gymthozhan-hydrated', 'true');
          } catch (e) {
            console.warn('Initial hydration failed:', e.message);
          }
        }
      }

      set({ loading: false });

      supabase.auth.onAuthStateChange(async (event, session) => {
        set({ session, user: session?.user ?? null });

        if (event === 'SIGNED_IN' && session) {
          try {
            await get().hydrateProfile(session.user.id);
            sessionStorage.setItem('gymthozhan-hydrated', 'true');
          } catch (e) {
            console.warn('Auth change hydration failed:', e.message);
          }
        }
      });

      // Refetch from Supabase when tab regains focus (cross-device sync)
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            get().refreshFromSupabase();
          }
        });
      }
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  // Refresh data from Supabase (throttled to once per 30s)
  refreshFromSupabase: async () => {
    const state = get();
    const now = Date.now();
    if (now - state._lastRefresh < 30000) return; // throttle: 30s
    if (!state.user?.id) return;
    set({ _lastRefresh: now });
    try {
      await get().hydrateProfile(state.user.id);
    } catch (e) {
      console.warn('Background refresh failed:', e.message);
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
          { data: subscription },
        ] = await Promise.all([
          fetchWorkoutPlan(userId),
          fetchDietPlan(userId),
          fetchGamification(userId),
          fetchExerciseLogs(userId),
          fetchProgressLogs(userId),
          fetchFoodLogs(userId),
          fetchSubscription(userId),
        ]);

        useUserStore.getState().hydrateFromSupabase({
          profile,
          workoutPlan,
          dietPlan,
          gamification,
          exerciseLogs: exerciseLogs || [],
          progressLogs: progressLogs || [],
          foodLogs: foodLogs || [],
          subscription,
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
      // Only clear local state — do NOT delete Supabase data on sign-out.
      // resetAll() is reserved for the explicit "Reset All Data" action in Profile.
      const userStore = useUserStore.getState();
      userStore.clearLocalState();
      sessionStorage.removeItem('gymthozhan-hydrated');
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
