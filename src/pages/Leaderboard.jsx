import { motion } from 'framer-motion';
import { Trophy, Crown, Flame, Zap, Medal, TrendingUp, RefreshCw, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import useLeaderboard from '../hooks/useLeaderboard';
import { getCurrentMedal, TRANSFORMATION_LEVELS } from '../utils/gamification';

const TABS = [
  { key: 'weekly', label: 'Weekly', icon: Flame },
  { key: 'alltime', label: 'All Time', icon: Trophy },
  { key: 'streak', label: 'Streak', icon: Zap },
];

const PODIUM_STYLES = {
  1: { border: 'border-yellow-400/30', bg: 'bg-yellow-400/[0.04]', badge: 'bg-yellow-400/20 text-yellow-400', icon: 'text-yellow-400', label: '1st' },
  2: { border: 'border-gray-300/30', bg: 'bg-gray-300/[0.04]', badge: 'bg-gray-300/20 text-gray-300', icon: 'text-gray-300', label: '2nd' },
  3: { border: 'border-amber-600/30', bg: 'bg-amber-600/[0.04]', badge: 'bg-amber-600/20 text-amber-600', icon: 'text-amber-600', label: '3rd' },
};

function getScoreDisplay(entry, tab) {
  if (tab === 'streak') return `${entry.currentStreak} days`;
  if (tab === 'weekly') return `${entry.xpEarned} XP`;
  return `${entry.totalXp} XP`;
}

function PodiumCard({ entry, tab, isCurrentUser }) {
  const style = PODIUM_STYLES[entry.rank];
  if (!style) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: entry.rank * 0.1 }}
      className={`border ${style.border} ${style.bg} rounded-xl p-4 relative ${isCurrentUser ? 'ring-1 ring-accent/40' : ''}`}
    >
      {/* Rank badge */}
      <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 ${style.badge} text-xs font-bold px-3 py-0.5 rounded-full`}>
        {style.label}
      </div>

      {/* Crown for #1 */}
      {entry.rank === 1 && (
        <Crown size={16} className="text-yellow-400 mx-auto mb-1" />
      )}

      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-black ${entry.rank === 1 ? 'bg-yellow-400/20 text-yellow-400' : entry.rank === 2 ? 'bg-gray-300/20 text-gray-300' : 'bg-amber-600/20 text-amber-600'}`}>
        {entry.displayName?.[0]?.toUpperCase() || '?'}
      </div>

      <p className="text-sm font-bold text-text-primary text-center truncate">
        {isCurrentUser ? 'You' : entry.displayName}
      </p>

      {/* Level + Medal */}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <span className="text-[10px] text-text-muted">Lv.{entry.level}</span>
        {entry.medal && (
          <span className={`text-[10px] font-medium ${entry.medal.color}`}>{entry.medal.name}</span>
        )}
      </div>

      {/* Score */}
      <p className={`text-center text-sm font-bold mt-2 ${style.icon}`}>
        {getScoreDisplay(entry, tab)}
      </p>
    </motion.div>
  );
}

function LeaderboardRow({ entry, tab, isCurrentUser, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isCurrentUser
          ? 'bg-accent/5 border border-accent/20'
          : 'bg-white/[0.02] hover:bg-white/[0.04]'
      }`}
    >
      {/* Rank */}
      <div className="w-8 text-center">
        <span className={`text-sm font-bold ${isCurrentUser ? 'text-accent' : 'text-text-muted'}`}>
          #{entry.rank}
        </span>
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
        {entry.displayName?.[0]?.toUpperCase() || '?'}
      </div>

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-accent' : 'text-text-primary'}`}>
            {isCurrentUser ? `${entry.displayName} (You)` : entry.displayName}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-text-muted">Lv.{entry.level} {entry.levelName}</span>
          {entry.medal && (
            <span className={`text-[10px] font-medium ${entry.medal.color}`}>{entry.medal.name}</span>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <span className={`text-sm font-bold ${isCurrentUser ? 'text-accent' : 'text-text-primary'}`}>
          {getScoreDisplay(entry, tab)}
        </span>
      </div>
    </motion.div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Podium skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-white/[0.06] rounded-xl p-4 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-white/[0.06] mx-auto mb-2" />
            <div className="h-3 bg-white/[0.06] rounded w-16 mx-auto mb-1" />
            <div className="h-3 bg-white/[0.06] rounded w-12 mx-auto" />
          </div>
        ))}
      </div>
      {/* Row skeletons */}
      <div className="space-y-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg animate-pulse">
            <div className="w-8 h-4 bg-white/[0.06] rounded" />
            <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
            <div className="flex-1">
              <div className="h-3 bg-white/[0.06] rounded w-24 mb-1" />
              <div className="h-2 bg-white/[0.06] rounded w-16" />
            </div>
            <div className="h-3 bg-white/[0.06] rounded w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const {
    activeTab, setActiveTab,
    entries, loading,
    currentUserEntry, insight,
    rewardHistory, refresh,
    userId,
  } = useLeaderboard();

  const [showRewards, setShowRewards] = useState(false);

  const topThree = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);
  const isUserInList = entries.some((e) => e.userId === userId);

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              <span className="gradient-text">Leaderboard</span>
            </h1>
            <p className="text-text-muted text-sm mt-1">Compete with the community</p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-white/[0.04] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#111] rounded-xl p-1 flex gap-1 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/10 text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Weekly Rewards Banner */}
      {activeTab === 'weekly' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-accent/15 bg-accent/[0.03] rounded-xl mb-6 overflow-hidden"
        >
          <button
            onClick={() => setShowRewards(!showRewards)}
            className="w-full flex items-center justify-between px-5 py-3.5"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Gift size={14} className="text-accent" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-text-primary">Weekly Rewards</p>
                <p className="text-[10px] text-text-muted">Top 5 earn reward points every Sunday</p>
              </div>
            </div>
            {showRewards ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
          </button>

          {showRewards && (
            <div className="px-5 pb-4 space-y-3">
              {/* Reward tiers */}
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { rank: 1, pts: 50, color: 'text-yellow-400' },
                  { rank: 2, pts: 40, color: 'text-gray-300' },
                  { rank: 3, pts: 30, color: 'text-amber-600' },
                  { rank: 4, pts: 20, color: 'text-text-secondary' },
                  { rank: 5, pts: 10, color: 'text-text-muted' },
                ].map((tier) => (
                  <div key={tier.rank} className="bg-white/[0.03] rounded-lg p-2 text-center">
                    <p className={`text-xs font-bold ${tier.color}`}>#{tier.rank}</p>
                    <p className="text-[10px] text-text-muted">{tier.pts} pts</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-text-muted text-center">Minimum 300 XP required to qualify</p>

              {/* User's reward history */}
              {rewardHistory.length > 0 && (
                <div className="border-t border-white/[0.06] pt-3">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Your Rewards</p>
                  <div className="space-y-1.5">
                    {rewardHistory.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">
                          {new Date(r.weekStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(r.weekEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-text-secondary">Rank #{r.rank}</span>
                          <span className="text-accent font-medium">+{r.pointsAwarded} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <LeaderboardSkeleton />
      ) : entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-white/[0.06] rounded-xl p-8 text-center"
        >
          <Trophy size={32} className="text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-text-primary mb-1">
            {activeTab === 'weekly' ? 'No activity this week' : 'No entries yet'}
          </h3>
          <p className="text-sm text-text-muted">
            {activeTab === 'weekly'
              ? 'Log workouts and meals to earn XP and climb the rankings!'
              : activeTab === 'streak'
              ? 'Start a workout streak to appear on the leaderboard!'
              : 'Earn XP by logging workouts, meals, and weight to get ranked!'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className={`grid gap-3 ${topThree.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : topThree.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {topThree.map((entry) => (
                <PodiumCard
                  key={entry.userId}
                  entry={entry}
                  tab={activeTab}
                  isCurrentUser={entry.userId === userId}
                />
              ))}
            </div>
          )}

          {/* Remaining list */}
          {rest.length > 0 && (
            <div className="border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="divide-y divide-white/[0.04]">
                {rest.map((entry, i) => (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    tab={activeTab}
                    isCurrentUser={entry.userId === userId}
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Current user not in list */}
          {!isUserInList && userId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-accent/20 bg-accent/[0.03] rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 text-center">
                  <span className="text-sm font-bold text-accent">50+</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                  You
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-accent">Your Ranking</p>
                  <p className="text-[10px] text-text-muted">Keep going to climb the leaderboard!</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Insight */}
          {insight && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <TrendingUp size={16} className="text-accent shrink-0" />
              <p className="text-sm text-text-secondary">{insight}</p>
            </motion.div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
