import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Dumbbell, Flame, Beef, Wheat, Droplets, Calendar, Target, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import useUserStore from '../store/useUserStore';

const goalConfig = {
  weightLoss: {
    icon: TrendingDown,
    title: 'Fat Loss Mode',
    color: 'text-accent',
    getMessage: (nt) =>
      `To lose fat safely and sustainably, you'll eat ${nt.deficit} calories below your maintenance level of ${nt.tdee} cal/day. Your daily target is ${nt.targetCalories} calories. This creates a healthy deficit that translates to roughly 0.5 kg of fat loss per week — the sweet spot where you lose fat while preserving muscle mass.`,
    getAdvice: () =>
      'Focus on high-protein meals to preserve muscle, stay consistent with your workouts, and trust the process. Results compound over weeks, not days.',
  },
  muscleGain: {
    icon: TrendingUp,
    title: 'Muscle Building Mode',
    color: 'text-accent',
    getMessage: (nt) =>
      `To build lean muscle, you'll eat ${nt.surplus} calories above your maintenance level of ${nt.tdee} cal/day. Your daily target is ${nt.targetCalories} calories. This controlled surplus provides the extra energy your body needs to build new muscle tissue without excessive fat gain.`,
    getAdvice: () =>
      'Progressive overload is key — aim to increase weight or reps each week. Prioritize protein timing around workouts and get 7-9 hours of sleep for optimal recovery.',
  },
  maintenance: {
    icon: Activity,
    title: 'Maintenance Mode',
    color: 'text-text-primary',
    getMessage: (nt) =>
      `Your maintenance calories are ${nt.tdee} cal/day. We'll keep your intake right around this level at ${nt.targetCalories} cal/day to maintain your current physique while steadily improving your fitness, strength, and endurance.`,
    getAdvice: () =>
      'Consistency is everything in maintenance. Keep showing up, keep pushing yourself in workouts, and your body composition will gradually improve even at the same weight.',
  },
};

const anim = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

export default function PlanSummary() {
  const navigate = useNavigate();
  const { profile, nutritionTargets, workoutPlan, dietPlan } = useUserStore();

  if (!profile || !nutritionTargets || !workoutPlan) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
  const goal = goalConfig[profile.goal] || goalConfig.maintenance;
  const GoalIcon = goal.icon;

  return (
    <PageWrapper>
      {/* Greeting */}
      <motion.div {...anim(0)} className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-white mx-auto mb-4 flex items-center justify-center text-2xl font-black text-black">
          {profile.name?.[0]?.toUpperCase() || '?'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
          Here's your plan, <span className="gradient-text">{profile.name}</span>
        </h1>
        <p className="text-text-muted text-sm mt-2 max-w-md mx-auto">
          We've analyzed your data and built a personalized program just for you. Here's what you need to know.
        </p>
      </motion.div>

      {/* Your Numbers */}
      <motion.div {...anim(0.1)} className="border border-white/[0.06] rounded-xl p-5 sm:p-6 mb-5">
        <h2 className="font-bold text-sm text-text-secondary mb-4">Your Numbers</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Height', value: `${profile.height}`, unit: 'cm' },
            { label: 'Weight', value: `${profile.weight}`, unit: 'kg' },
            { label: 'BMI', value: bmi, unit: '' },
            { label: 'BMR', value: `${nutritionTargets.bmr}`, unit: 'cal' },
            { label: 'TDEE', value: `${nutritionTargets.tdee}`, unit: 'cal' },
            { label: 'Target', value: `${nutritionTargets.targetCalories}`, unit: 'cal', accent: true },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 bg-white/[0.03] rounded-lg">
              <div className={`text-lg font-black ${stat.accent ? 'text-accent' : 'text-text-primary'}`}>
                {stat.value}
                {stat.unit && <span className="text-[10px] text-text-muted ml-0.5">{stat.unit}</span>}
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Goal Explanation */}
      <motion.div {...anim(0.2)} className="border border-accent/20 rounded-xl p-5 sm:p-6 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <GoalIcon size={18} className={goal.color} />
          <h2 className="font-bold text-sm text-accent">{goal.title}</h2>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed mb-4">
          {goal.getMessage(nutritionTargets)}
        </p>
        <div className="bg-accent/5 rounded-lg p-3 border border-accent/10">
          <p className="text-xs text-text-muted leading-relaxed">
            <span className="text-accent font-semibold">Coach tip:</span> {goal.getAdvice()}
          </p>
        </div>
      </motion.div>

      {/* Workout Overview */}
      <motion.div {...anim(0.3)} className="border border-white/[0.06] rounded-xl p-5 sm:p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm text-text-secondary flex items-center gap-2">
            <Dumbbell size={16} /> Workout Plan
          </h2>
          <span className="text-[11px] text-text-muted bg-white/[0.04] px-2.5 py-1 rounded-md">
            {workoutPlan.level}
          </span>
        </div>
        <div className="mb-4">
          <div className="text-lg font-black text-text-primary">{workoutPlan.splitName}</div>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={13} className="text-text-muted" />
            <span className="text-xs text-text-muted">{workoutPlan.daysPerWeek} days per week</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {workoutPlan.schedule.map((day, i) => (
            <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2.5">
              <span className="text-sm font-medium text-text-primary">{day.day}</span>
              <span className="text-xs text-text-muted">{day.exercises.length} exercises</span>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-accent/5 border border-accent/10 rounded-lg p-3">
          <p className="text-xs text-text-muted leading-relaxed">
            <span className="text-accent font-semibold">How to progress:</span> Pick a weight you can do for 8 reps. Stick with it until 12 reps feel easy, then increase the weight. Push to failure on your last set — that's where growth happens.
          </p>
        </div>
      </motion.div>

      {/* Diet Overview */}
      <motion.div {...anim(0.4)} className="border border-white/[0.06] rounded-xl p-5 sm:p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm text-text-secondary flex items-center gap-2">
            <Flame size={16} className="text-accent" /> Diet Plan
          </h2>
          <span className="text-[11px] text-text-muted bg-white/[0.04] px-2.5 py-1 rounded-md capitalize">
            {profile.dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { icon: Flame, value: nutritionTargets.targetCalories, label: 'Calories', accent: true },
            { icon: Beef, value: `${nutritionTargets.macros.protein}g`, label: 'Protein' },
            { icon: Wheat, value: `${nutritionTargets.macros.carbs}g`, label: 'Carbs' },
            { icon: Droplets, value: `${nutritionTargets.macros.fat}g`, label: 'Fats' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="text-center">
                <Icon size={16} className={`mx-auto mb-1.5 ${item.accent ? 'text-accent' : 'text-text-muted'}`} />
                <div className={`text-base font-black ${item.accent ? 'text-accent' : 'text-text-primary'}`}>{item.value}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">{item.label}</div>
              </div>
            );
          })}
        </div>

        {/* Macro bar */}
        <div>
          <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden flex">
            <div className="h-full bg-white" style={{ width: `${(nutritionTargets.macros.protein * 4 / nutritionTargets.targetCalories) * 100}%` }} />
            <div className="h-full bg-white/40" style={{ width: `${(nutritionTargets.macros.carbs * 4 / nutritionTargets.targetCalories) * 100}%` }} />
            <div className="h-full bg-white/15" style={{ width: `${(nutritionTargets.macros.fat * 9 / nutritionTargets.targetCalories) * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-[11px] text-text-muted">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white"></span> Protein</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white/40"></span> Carbs</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white/15"></span> Fats</span>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div {...anim(0.5)} className="text-center">
        <p className="text-text-muted text-xs mb-4">Your plan is ready. Let's make it happen.</p>
        <button
          onClick={() => navigate('/dashboard', { replace: true })}
          className="btn-primary w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
        >
          Let's Go <ArrowRight size={16} />
        </button>
      </motion.div>
    </PageWrapper>
  );
}
