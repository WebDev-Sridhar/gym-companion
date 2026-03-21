import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Edit3, Trophy, Flame, Zap, Dumbbell, Scale, RotateCcw, Save, X, Award, LogOut, Mail } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import useUserStore from '../store/useUserStore';
import useAuthStore from '../store/useAuthStore';
import { getLevelTitle, getLevelProgress, BADGES } from '../utils/gamification';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, xp, level, currentStreak, longestStreak, totalWorkouts, earnedBadges, weightLogs, resetAll, updateProfile } = useUserStore();
  const { user, signOut } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  if (!profile) {
    return <PageWrapper><div className="text-center py-20"><User size={48} className="text-text-muted mx-auto mb-4" /><p className="text-text-muted">No profile found.</p></div></PageWrapper>;
  }

  const levelProgress = getLevelProgress(xp);
  const levelTitle = getLevelTitle(level);

  const startEdit = () => { setEditData({ name: profile.name, age: profile.age, height: profile.height, weight: profile.weight }); setEditing(true); };
  const saveEdit = () => { updateProfile(editData); setEditing(false); };
  const handleReset = () => { if (confirm('This will delete ALL your data, you cannot undo this action. Are you sure?')) { resetAll(); navigate('/dashboard'); } };
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const goalLabel = { weightLoss: 'Weight Loss', muscleGain: 'Muscle Gain', maintenance: 'Maintenance' };
  const actLabel = { sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', active: 'Active', veryActive: 'Very Active' };

  return (
    <PageWrapper>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-8">
        <span className="gradient-text">Profile</span>
      </h1>

      {/* Avatar + Level */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-white/[0.06] rounded-xl p-6 sm:p-8 mb-6 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white mx-auto mb-4 flex items-center justify-center text-2xl sm:text-3xl font-black text-black">
          {profile.name?.[0]?.toUpperCase() || '?'}
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-text-primary">{profile.name}</h2>
        <p className="text-accent text-sm font-medium">Level {level} — {levelTitle}</p>
        <div className="mt-4 max-w-xs mx-auto">
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full progress-fill" style={{ width: `${levelProgress.percentage}%` }} />
          </div>
          <p className="text-[11px] text-text-muted mt-1.5">{levelProgress.current}/{levelProgress.needed} XP to next level</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Dumbbell, value: totalWorkouts, label: 'Workouts' },
          { icon: Flame, value: currentStreak, label: 'Streak', accent: true },
          { icon: Zap, value: xp, label: 'Total XP' },
          { icon: Trophy, value: longestStreak, label: 'Best Streak' },
        ].map((s) => (
          <div key={s.label} className="border border-white/[0.06] rounded-xl p-3 sm:p-4 text-center">
            <s.icon size={16} className={`mx-auto mb-2 ${s.accent ? 'text-accent' : 'text-text-muted'}`} />
            <div className={`text-lg sm:text-xl font-black ${s.accent ? 'text-accent' : 'text-text-primary'}`}>{s.value}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border border-white/[0.06] rounded-xl p-5 mb-6">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-text-secondary">
          <Award size={16} /> Badges
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {BADGES.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <div key={badge.id} className={`text-center p-3 rounded-lg transition-all ${earned ? 'bg-accent/5 border border-accent/20' : 'bg-white/[0.02] opacity-30'}`}>
                <div className="text-2xl mb-1">{badge.icon}</div>
                <p className="text-[11px] font-semibold text-text-primary">{badge.name}</p>
                <p className="text-[10px] text-text-muted">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

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
        <div className="space-y-2">
          <button onClick={handleSignOut} className="w-full py-3 rounded-lg text-sm font-medium text-text-muted border border-white/[0.06] hover:border-white/[0.12] hover:text-text-secondary transition-all flex items-center justify-center gap-2">
            <LogOut size={14} /> Sign Out
          </button>
          <button onClick={handleReset} className="w-full py-3 rounded-lg text-sm font-medium text-accent/50 border border-accent/10 hover:bg-accent/5 hover:text-accent transition-all flex items-center justify-center gap-2">
            <RotateCcw size={14} /> Reset All Data
          </button>
        </div>
      </motion.div>
    </PageWrapper>
  );
}
