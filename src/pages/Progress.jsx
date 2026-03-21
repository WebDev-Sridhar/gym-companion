import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Scale, Dumbbell, Lightbulb, Check } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import ProLock from '../components/ui/ProLock';
import useUserStore from '../store/useUserStore';
import { analyzeProgress } from '../utils/smartCoach';

export default function Progress() {
  const { weightLogs, workoutLogs, foodLogs, logWeight, profile, nutritionTargets, adjustNutrition, plan } = useUserStore();
  const isPro = plan === 'pro';
  const [newWeight, setNewWeight] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [appliedActions, setAppliedActions] = useState(new Set());

  const weightData = weightLogs.map((l) => ({
    date: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: l.weight,
  }));
  if (weightData.length === 0 && profile?.weight) weightData.push({ date: 'Start', weight: profile.weight });

  const workoutFreq = [];
  for (let i = 3; i >= 0; i--) {
    const ws = new Date(); ws.setDate(ws.getDate() - (i * 7 + ws.getDay()));
    const we = new Date(ws); we.setDate(we.getDate() + 6);
    workoutFreq.push({ week: `Week ${4 - i}`, workouts: workoutLogs.filter((l) => { const d = new Date(l.date); return d >= ws && d <= we; }).length });
  }

  const startW = profile?.weight || 0;
  const curW = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : startW;
  const change = curW - startW;

  const recommendations = analyzeProgress({
    profile, weightLogs, workoutLogs, foodLogs: foodLogs || [], nutritionTargets,
  });

  const handleApplyAction = (rec, index) => {
    if (rec.action?.type === 'adjustCalories') {
      adjustNutrition(rec.action.value);
      setAppliedActions((prev) => new Set([...prev, index]));
    }
  };

  const handleLog = () => { if (newWeight > 0) { logWeight(parseFloat(newWeight)); setNewWeight(''); setShowInput(false); } };

  const tooltipStyle = { background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' };

  return (
    <PageWrapper>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
        <span className="gradient-text">Progress</span> <span className="text-text-primary">Tracker</span>
      </h1>
      <p className="text-text-muted text-sm mb-8">Track your transformation journey</p>

      {/* Weight Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { value: startW, label: 'Start', suffix: 'kg' },
          { value: curW, label: 'Current', suffix: 'kg' },
          { value: `${change > 0 ? '+' : ''}${change.toFixed(1)}`, label: 'Change', suffix: 'kg', colored: true },
        ].map((s) => (
          <div key={s.label} className="border border-white/[0.06] rounded-xl p-3 sm:p-4 text-center">
            <div className={`text-lg sm:text-2xl font-black ${
              s.colored ? (change > 0 ? 'text-accent' : change < 0 ? 'text-text-primary' : 'text-text-muted') : 'text-text-primary'
            }`}>
              {s.value}<span className="text-xs text-text-muted ml-0.5">{s.suffix}</span>
            </div>
            <div className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Log Weight */}
      {!showInput ? (
        <button onClick={() => setShowInput(true)} className="btn-primary w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mb-8">
          <Scale size={16} /> Log Today's Weight
        </button>
      ) : (
        <div className="border border-white/[0.06] rounded-xl p-3 flex gap-2 mb-8">
          <input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="Weight (kg)" autoFocus className="flex-1 min-w-0 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-text-primary font-bold focus:outline-none focus:border-white/20 text-center" />
          <button onClick={handleLog} disabled={!newWeight} className="btn-primary px-6 py-3 rounded-lg font-bold disabled:opacity-30">Save</button>
          <button onClick={() => setShowInput(false)} className="px-3 py-3 rounded-lg text-text-muted border border-white/[0.06]">✕</button>
        </div>
      )}

      {/* Charts & Smart Coach */}
      {isPro ? (
        <>
          {/* Weight Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-white/[0.06] rounded-xl p-5 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-text-secondary">
              <TrendingUp size={16} /> Weight Trend
            </h3>
            {weightData.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weightData}>
                  <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#09cadb" stopOpacity={0.2} /><stop offset="95%" stopColor="#09cadb" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#555', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="weight" stroke="#09cadb" strokeWidth={2} fill="url(#wg)" dot={{ fill: '#09cadb', r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-text-muted">
                <Scale size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Log weight twice to see trend.</p>
              </div>
            )}
          </motion.div>

          {/* Workout Frequency */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border border-white/[0.06] rounded-xl p-5 mb-8">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-text-secondary">
              <Dumbbell size={16} /> Workout Frequency
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={workoutFreq}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week" tick={{ fill: '#555', fontSize: 11 }} />
                <YAxis tick={{ fill: '#555', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="workouts" fill="#fff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Smart Coach */}
          <div className="space-y-3">
            <h3 className="font-bold flex items-center gap-2 text-sm text-text-secondary">
              <Lightbulb size={16} className="text-accent" /> Smart Coach
            </h3>
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className={`border rounded-xl p-4 ${
                  rec.severity === 'high' ? 'border-accent/30' : 'border-white/[0.06]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{rec.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-text-primary mb-1">{rec.title}</h4>
                    <p className="text-sm text-text-muted">{rec.message}</p>
                    {rec.action && !appliedActions.has(i) && (
                      <button
                        onClick={() => handleApplyAction(rec, i)}
                        className="mt-2 px-4 py-1.5 text-xs font-medium rounded-md bg-accent/10 text-accent border border-accent/20 hover:bg-accent/15 transition-all"
                      >
                        Apply: {rec.action.value > 0 ? '+' : ''}{rec.action.value} cal/day
                      </button>
                    )}
                    {appliedActions.has(i) && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-accent font-medium">
                        <Check size={12} /> Applied
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <ProLock message="Charts, analytics & AI coaching insights">
          <div className="space-y-4">
            <div className="border border-white/[0.06] rounded-xl p-5 h-[240px]" />
            <div className="border border-white/[0.06] rounded-xl p-5 h-[180px]" />
            <div className="border border-white/[0.06] rounded-xl p-4 h-20" />
          </div>
        </ProLock>
      )}
    </PageWrapper>
  );
}
