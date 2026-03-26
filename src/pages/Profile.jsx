import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Edit3, Trophy, Flame, TrendingUp, Dumbbell, RotateCcw, Save, X, LogOut, Mail, Sparkles, Crown, Check, Lock, Medal, Zap, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { showCoach } from '../components/ui/CoachPopup';
import { showUpgradeModal } from '../components/ui/PaymentModal';
import useUserStore from '../store/useUserStore';
import useAuthStore from '../store/useAuthStore';
import { cancelSubscription } from '../lib/supabaseService';
import { TRANSFORMATION_LEVELS, computeTransformationStats, getCurrentTransformationLevel, getLevelProgress, MEDALS, getCurrentMedal, getNextMedal } from '../utils/gamification';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, transformationLevel, xp, currentStreak, longestStreak, totalWorkouts, weightLogs, workoutLogs, foodLogs, nutritionTargets, resetAll, updateProfile, plan, subscription, deactivatePro } = useUserStore();
  const isPro = plan === 'pro';
  const { user, signOut } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showWeightHistory, setShowWeightHistory] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  if (!profile) {
    return <PageWrapper><div className="text-center py-20"><User size={48} className="text-text-muted mx-auto mb-4" /><p className="text-text-muted">No profile found.</p></div></PageWrapper>;
  }

  const stats = computeTransformationStats(workoutLogs, weightLogs, foodLogs, currentStreak, longestStreak, nutritionTargets);
  const currentLevel = getCurrentTransformationLevel(stats);

  const startEdit = () => { setEditData({ name: profile.name, age: profile.age, height: profile.height, weight: profile.weight }); setEditing(true); };
  const saveEdit = () => { updateProfile(editData); setEditing(false); };
  const handleReset = () => setShowResetModal(true);
  const confirmReset = () => { setShowResetModal(false); resetAll(); showCoach('resetData'); navigate('/dashboard'); };
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const goalLabel = { weightLoss: 'Weight Loss', muscleGain: 'Muscle Gain', maintenance: 'Maintenance' };
  const actLabel = { sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', active: 'Active', veryActive: 'Very Active' };

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">Track your fitness journey</p>
      </div>

      {/* Avatar + Level */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-white/[0.06] rounded-xl p-6 sm:p-8 mb-6 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white mx-auto mb-4 flex items-center justify-center text-2xl sm:text-3xl font-black text-black">
          {profile.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-lg sm:text-xl font-bold text-text-primary">{profile.name}</h2>
          {isPro && (
            <span className="text-[10px] bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Crown size={9} /> PRO
            </span>
          )}
        </div>
        <p className="text-accent text-sm font-medium">Level {currentLevel.id} — {currentLevel.name}</p>
        {currentLevel.id > 0 && (
          <p className="text-xs text-text-muted italic mt-1">{currentLevel.rewardMessage}</p>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Dumbbell, value: totalWorkouts, label: 'Workouts' },
          { icon: Flame, value: currentStreak, label: 'Streak', accent: true },
          { icon: TrendingUp, value: currentLevel.id, label: 'Level' },
          { icon: Zap, value: xp, label: 'XP' },
        ].map((s) => (
          <div key={s.label} className="border border-white/[0.06] rounded-xl p-3 sm:p-4 text-center">
            <s.icon size={16} className={`mx-auto mb-2 ${s.accent ? 'text-accent' : 'text-text-muted'}`} />
            <div className={`text-lg sm:text-xl font-black ${s.accent ? 'text-accent' : 'text-text-primary'}`}>{s.value}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Transformation Journey */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border border-white/[0.06] rounded-xl p-5 mb-6">
        <h3 className="font-bold mb-5 flex items-center gap-2 text-sm text-text-secondary">
          <Trophy size={16} /> Transformation Journey
        </h3>
        <div className="space-y-3">
          {TRANSFORMATION_LEVELS.map((tl) => {
            const isCompleted = tl.id <= currentLevel.id;
            const isCurrent = tl.id === currentLevel.id + 1;
            const progress = isCurrent ? getLevelProgress(tl.id, stats) : null;

            return (
              <div
                key={tl.id}
                className={`rounded-lg p-4 transition-all ${
                  isCompleted
                    ? 'bg-accent/5 border border-accent/20'
                    : isCurrent
                    ? 'border border-white/[0.12] bg-white/[0.03]'
                    : 'border border-white/[0.04] opacity-40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCompleted ? 'bg-accent text-white' : isCurrent ? 'bg-white/[0.08] text-text-secondary' : 'bg-white/[0.04] text-text-muted'
                    }`}>
                      {isCompleted ? <Check size={12} /> : tl.id}
                    </div>
                    <span className={`text-sm font-semibold ${isCompleted ? 'text-accent' : isCurrent ? 'text-text-primary' : 'text-text-muted'}`}>
                      {tl.name}
                    </span>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${
                    tl.difficulty === 'Elite' ? 'text-accent' : tl.difficulty === 'High' ? 'text-orange-400' : tl.difficulty === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {tl.difficulty}
                  </span>
                </div>

                {isCompleted && (
                  <p className="text-xs text-accent/70 italic ml-8">{tl.rewardMessage}</p>
                )}

                {isCurrent && progress && (
                  <div className="ml-8 mt-2">
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${progress.percentage}%` }} />
                    </div>
                    <div className="space-y-1">
                      {progress.taskDetails.map((task, ti) => (
                        <div key={ti} className="flex items-center gap-2 text-xs">
                          <span className={task.completed ? 'text-accent' : 'text-text-muted/40'}>{task.completed ? '✓' : '○'}</span>
                          <span className={task.completed ? 'text-text-secondary line-through opacity-60' : 'text-text-muted'}>{task.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isCompleted && !isCurrent && (
                  <div className="ml-8 mt-1 flex items-center gap-1 text-text-muted/50">
                    <Lock size={10} />
                    <span className="text-[10px]">{tl.taskChecks.length} tasks</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* XP Medals */}
      {(() => {
        const currentMedal = getCurrentMedal(xp);
        const nextMedal = getNextMedal(xp);
        const progressPercent = nextMedal
          ? Math.round(((xp - currentMedal.xpRequired) / (nextMedal.xpRequired - currentMedal.xpRequired)) * 100)
          : 100;

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="border border-white/[0.06] rounded-xl p-5 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-text-secondary">
              <Medal size={16} /> XP Medals
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold ${currentMedal.color}`}>{currentMedal.name} Medal</span>
                <span className="text-xs text-text-muted font-medium">{xp} XP</span>
              </div>
              {nextMedal ? (
                <>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="text-[11px] text-text-muted">{nextMedal.xpRequired - xp} XP to {nextMedal.name}</p>
                </>
              ) : (
                <p className="text-[11px] text-accent font-medium">All medals unlocked!</p>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {MEDALS.map((medal) => {
                const unlocked = xp >= medal.xpRequired;
                return (
                  <div key={medal.id} className={`rounded-lg p-3 text-center transition-all ${unlocked ? medal.bg : 'bg-white/[0.02] opacity-40'}`}>
                    <Medal size={20} className={`mx-auto mb-1 ${unlocked ? medal.color : 'text-text-muted'}`} />
                    <div className={`text-[10px] font-bold ${unlocked ? medal.color : 'text-text-muted'}`}>{medal.name}</div>
                    <div className="text-[9px] text-text-muted">{medal.xpRequired} XP</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })()}

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border border-white/[0.06] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-text-secondary">Personal Info</h3>
          {!editing ? (
            <button onClick={startEdit} className="text-accent text-xs font-medium flex items-center gap-1 hover:underline"><Edit3 size={12} /> Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveEdit} className="text-accent text-xs font-medium flex items-center gap-1"><Save size={12} /> Save</button>
              <button onClick={() => setEditing(false)} className="text-text-muted text-xs flex items-center gap-1"><X size={12} /> Cancel</button>
            </div>
          )}
        </div>
        {editing ? (
          <div className="space-y-3">
            {[
              { key: 'name', label: 'Name', type: 'text' },
              { key: 'age', label: 'Age', type: 'number' },
              { key: 'height', label: 'Height (cm)', type: 'number' },
              { key: 'weight', label: 'Weight (kg)', type: 'number' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[11px] text-text-muted uppercase tracking-wider">{f.label}</label>
                <input type={f.type} value={editData[f.key] || ''} onChange={(e) => setEditData({ ...editData, [f.key]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })} className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-text-primary focus:outline-none focus:border-white/20 mt-1 text-sm" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Age', value: `${profile.age} years` },
              { label: 'Gender', value: profile.gender },
              { label: 'Height', value: `${profile.height} cm` },
              { label: 'Weight', value: `${profile.weight} kg` },
              { label: 'Activity', value: actLabel[profile.activityLevel] },
              { label: 'Goal', value: goalLabel[profile.goal] },
              { label: 'Diet', value: profile.dietType === 'veg' ? 'Vegetarian' : 'Non-Veg' },
              { label: 'Workout Days', value: `${profile.workoutDays}/week` },
            ].map((item) => (
              <div key={item.label} className="bg-white/[0.03] rounded-lg p-3">
                <div className="text-[10px] text-text-muted uppercase tracking-wider">{item.label}</div>
                <div className="text-sm font-medium text-text-primary capitalize mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Subscription */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={`border rounded-xl p-5 mb-6 ${isPro ? 'border-accent/20 bg-gradient-to-br from-accent/[0.06] to-transparent' : 'border-accent/15 bg-gradient-to-br from-accent/[0.04] to-transparent'}`}>
        <h3 className="font-bold mb-3 flex items-center gap-2 text-sm text-text-secondary">
          {isPro ? <Crown size={16} className="text-accent" /> : <Sparkles size={16} className="text-accent" />} Subscription
        </h3>
        <div className="bg-white/[0.03] rounded-lg p-3 mb-3">
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Current Plan</div>
          <div className="text-sm font-bold text-text-primary mt-0.5">
            {isPro ? `Pro ${subscription?.planType === 'yearly' ? 'Yearly' : 'Monthly'}` : 'Free Plan'}
          </div>
        </div>
        {isPro && subscription ? (
          <>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <div className="text-[10px] text-text-muted uppercase tracking-wider">Started</div>
                <div className="text-xs font-medium text-text-primary mt-0.5">{new Date(subscription.startsAt).toLocaleDateString()}</div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <div className="text-[10px] text-text-muted uppercase tracking-wider">Expires</div>
                <div className="text-xs font-medium text-text-primary mt-0.5">{new Date(subscription.expiresAt).toLocaleDateString()}</div>
              </div>
            </div>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to cancel your Pro subscription? You will lose access to Pro features.')) {
                  await cancelSubscription(subscription.id);
                  deactivatePro();
                }
              }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-text-muted border border-white/[0.06] hover:border-white/[0.12] hover:text-text-secondary transition-all inline-flex items-center gap-2"
            >
              Cancel Subscription
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              You've completed your basic plan. Unlock advanced workouts, diet plans & progress tracking.
            </p>
            <button
              onClick={() => showUpgradeModal()}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/15 transition-all inline-flex items-center gap-2"
            >
              <Sparkles size={14} /> Upgrade to Pro
            </button>
          </>
        )}
      </motion.div>

      {/* Weight History */}
      {weightLogs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="border border-white/[0.06] rounded-xl mb-6 overflow-hidden">
          <button
            onClick={() => setShowWeightHistory((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-text-muted hover:text-text-secondary transition-all"
          >
            <span className="flex items-center gap-2"><TrendingUp size={14} /> Weight History</span>
            {showWeightHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showWeightHistory && (
            <div className="px-5 pb-4 space-y-2">
              {[...weightLogs].reverse().slice(0, 15).map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">{new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="font-medium text-text-primary">{log.weight} kg</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-text-secondary">
          <Mail size={16} /> Account
        </h3>
        {user?.email && (
          <div className="bg-white/[0.03] rounded-lg p-3 mb-4">
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Email</div>
            <div className="text-sm font-medium text-text-primary mt-0.5">{user.email}</div>
          </div>
        )}
        <div className="space-y-2 gap-2">
          <button onClick={handleSignOut} className="px-5 py-3 rounded-lg text-sm font-medium text-text-muted border border-white/[0.06] hover:border-white/[0.12] hover:text-text-secondary transition-all inline-flex items-center gap-2">
            <LogOut size={14} /> Sign Out
          </button>
          <button onClick={handleReset} className="px-5 py-3 rounded-lg text-sm font-medium text-accent/50 border border-accent/10 hover:bg-accent/5 hover:text-accent transition-all inline-flex items-center gap-2">
            <RotateCcw size={14} /> Reset All Data
          </button>
        </div>
      </motion.div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Reset All Data?</h3>
            </div>

            <div className="mb-5 space-y-3">
              <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                <p className="text-xs font-medium text-red-400 mb-2">Will be permanently deleted:</p>
                <ul className="space-y-1 text-xs text-text-muted">
                  {['Workout logs & history', 'Diet & meal logs', 'Progress & streaks', 'Exercise swaps', 'XP & transformation level'].map((item) => (
                    <li key={item} className="flex items-center gap-2"><X size={10} className="text-red-400/60 shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                <p className="text-xs font-medium text-text-secondary mb-2">Will be preserved:</p>
                <ul className="space-y-1 text-xs text-text-muted">
                  {['Subscription & Pro access', 'Account & email'].map((item) => (
                    <li key={item} className="flex items-center gap-2"><Check size={10} className="text-accent/60 shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-red-400/80 font-medium text-center">This action cannot be undone.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-white/[0.08] text-text-muted hover:text-text-primary transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                Delete Everything
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
}
