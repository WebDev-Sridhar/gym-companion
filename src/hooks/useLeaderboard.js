import { useState, useCallback, useEffect, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import useUserStore from '../store/useUserStore';
import {
  fetchWeeklyLeaderboard,
  fetchAlltimeLeaderboard,
  fetchStreakLeaderboard,
  fetchUserWeeklyRewards,
  triggerWeeklyRewardProcessing,
} from '../lib/supabaseService';
import { getCurrentMedal, TRANSFORMATION_LEVELS } from '../utils/gamification';

export default function useLeaderboard() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rewardHistory, setRewardHistory] = useState([]);
  const rewardsTriggered = useRef(false);

  const userId = useAuthStore((s) => s.user?.id);
  const userXp = useUserStore((s) => s.xp);
  const userStreak = useUserStore((s) => s.currentStreak);
  const userLevel = useUserStore((s) => s.transformationLevel);
  const userName = useUserStore((s) => s.profile?.name);

  const fetchData = useCallback(async (tab) => {
    setLoading(true);
    try {
      let result;
      if (tab === 'weekly') result = await fetchWeeklyLeaderboard(50);
      else if (tab === 'alltime') result = await fetchAlltimeLeaderboard(50);
      else result = await fetchStreakLeaderboard(50);

      setEntries(result.data || []);
    } catch (e) {
      console.warn('Leaderboard fetch failed:', e.message);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch leaderboard on tab change
  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  // Lazy-trigger weekly reward processing once per session
  useEffect(() => {
    if (!rewardsTriggered.current) {
      rewardsTriggered.current = true;
      triggerWeeklyRewardProcessing().catch(() => {});
    }
  }, []);

  // Fetch reward history
  useEffect(() => {
    if (userId) {
      fetchUserWeeklyRewards(userId).then((res) => {
        setRewardHistory(res.data || []);
      }).catch(() => {});
    }
  }, [userId]);

  // Find current user in entries
  const currentUserEntry = entries.find((e) => e.userId === userId) || null;

  // Compute insight message
  let insight = null;
  if (!loading && entries.length > 0 && userId) {
    const userRank = currentUserEntry?.rank;
    const scoreKey = activeTab === 'streak' ? 'currentStreak' : (activeTab === 'weekly' ? 'xpEarned' : 'totalXp');
    const userScore = currentUserEntry?.[scoreKey] || 0;
    const unit = activeTab === 'streak' ? 'days' : 'XP';

    // Find target ranks to show gap
    const targets = [1, 3, 5, 10];
    for (const targetRank of targets) {
      if (userRank && userRank <= targetRank) continue;
      const targetEntry = entries.find((e) => e.rank === targetRank);
      if (targetEntry) {
        const gap = targetEntry[scoreKey] - userScore;
        if (gap > 0) {
          insight = `You need ${gap} more ${unit} to reach Top ${targetRank}`;
          break;
        }
      }
    }
  }

  // Enrich entries with medal/level data
  const enrichedEntries = entries.map((entry) => {
    const medal = getCurrentMedal(entry.totalXp || 0);
    const levelInfo = TRANSFORMATION_LEVELS[entry.level] || TRANSFORMATION_LEVELS[0];
    return { ...entry, medal, levelName: levelInfo?.name || 'Just Starting' };
  });

  const refresh = () => fetchData(activeTab);

  return {
    activeTab,
    setActiveTab,
    entries: enrichedEntries,
    loading,
    currentUserEntry,
    insight,
    rewardHistory,
    refresh,
    userId,
    userName,
    userXp,
    userStreak,
    userLevel,
  };
}
