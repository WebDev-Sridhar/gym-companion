import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  Flame,
  Target,
  Play,
  Calendar,
  ArrowRight,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { UpgradeBanner } from '../components/ui/ProLock';
import { showCoach } from '../components/ui/CoachPopup';
import useUserStore from '../store/useUserStore';
import { getTodaysWorkout } from '../utils/planGenerator';
import { getDailyQuote } from '../data/quotes';
import { computeTransformationStats, getCurrentTransformationLevel, getNextLevel, getLevelProgress } from '../utils/gamification';
import { analyzeProgress } from '../utils/smartCoach';

export default function Dashboard() {
  const {
    profile,
    isOnboarded,
    workoutPlan,
    nutritionTargets,
    currentStreak,
    transformationLevel,
    totalWorkouts,
    checkDailyLogin,
    weightLogs,
    workoutLogs,
    foodLogs,
    nutritionTargets: nutTargets,
    plan,
  } = useUserStore();
  const isPro = plan === 'pro';

  useEffect(() => {
    if (isOnboarded) {
      checkDailyLogin();
      const today = new Date().toDateString();
      const lastWelcome = sessionStorage.getItem('coachWelcomeDate');
      if (lastWelcome !== today) {
        sessionStorage.setItem('coachWelcomeDate', today);
        setTimeout(() => showCoach('dailyWelcome'), 800);
      }
    }
  }, [isOnboarded]);

  if (!isOnboarded) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center text-center py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
              <RotateCcw size={32} className="text-text-muted" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight mb-3">
              Start Fresh
            </h1>
            <p className="text-text-muted text-sm sm:text-base max-w-sm mx-auto leading-relaxed mb-8">
              Your data has been reset. Enter your details again to get a new personalized workout and diet plan.
            </p>
            <Link
              to="/onboarding"
              className="btn-primary px-8 py-3.5 rounded-full text-sm font-bold inline-flex items-center gap-2 group"
            >
              Begin Setup
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  const todaysWorkout = getTodaysWorkout(workoutPlan);
  const quote = getDailyQuote();

  // Transformation level progress
  const stats = computeTransformationStats(workoutLogs, weightLogs, foodLogs, currentStreak, 0, nutTargets);
  const currentLevel = getCurrentTransformationLevel(stats);
  const nextLevel = getNextLevel(currentLevel.id);
  const nextProgress = nextLevel ? getLevelProgress(nextLevel.id, stats) : null;

  const coachAlerts = analyzeProgress({ profile, weightLogs, workoutLogs, foodLogs: foodLogs || [], nutritionTargets })
    .filter((r) => r.severity === 'high');

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();

  return (
    <PageWrapper>
      {/* Greeting */}
      <section className="mb-10 sm:mb-14">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2"
        >
          Hey, <span className="gradient-text">{profile?.name || 'Champion'}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-muted text-sm sm:text-base"
        >
          Ready to crush it today? Here's your game plan.
        </motion.p>
      </section>

      {/* Diet & Recovery Reminder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-10 sm:mb-14 border border-white/[0.08] rounded-xl p-5 sm:p-6 bg-white/[0.02]"
      >
        <p className="text-lg sm:text-xl font-black text-text-primary leading-snug tracking-tight">
          Diet & Sleep are <span className="gradient-text">more important</span> than workouts.
        </p>
        <p className="text-sm text-text-muted mt-2 leading-relaxed">
          Without proper nutrition and 7-9 hours of sleep, your workouts won't deliver results. Eat right, sleep well, then train hard.
        </p>
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10 sm:mb-14 pl-4 border-l-2 border-accent/40"
      >
        <p className="text-text-muted text-sm italic leading-relaxed">"{quote.text}"</p>
        <p className="text-text-muted text-xs mt-2">— {quote.author}</p>
      </motion.div>

      {/* Coach Alert */}
      {coachAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-10"
        >
          <Link to="/progress" className="block border border-accent/20 rounded-xl p-5 hover:border-accent/40 transition-all group bg-accent/[0.03]">
            <div className="flex items-start gap-4">
              <img src="/coach.png" alt="Coach" className="w-30 h-30 object-contain shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-accent mb-1">Coach Alert</h3>
                <p className="text-sm text-text-muted leading-relaxed">{coachAlerts[0].message}</p>
                <span className="text-xs text-accent font-medium mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14"
      >
        {[
          { Icon: Flame, value: currentStreak, label: 'Day Streak', accent: true },
          { Icon: Dumbbell, value: totalWorkouts, label: 'Workouts' },
          { Icon: TrendingUp, value: transformationLevel, label: 'Level' },
          { Icon: Target, value: nextProgress ? `${nextProgress.completedTasks}/${nextProgress.totalTasks}` : 'Max', label: 'Tasks' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="border border-white/[0.06] rounded-xl p-4 sm:p-5 text-center"
          >
            <stat.Icon className={`mb-3 ${stat.accent ? 'text-accent' : 'text-text-muted'}`} size={18} />
            <div className={`text-2xl sm:text-3xl font-black ${stat.accent ? 'text-accent' : 'text-text-primary'}`}>
              {stat.value}
            </div>
            <div className="text-[11px] text-text-muted mt-1 uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Transformation Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-10 sm:mb-14 border border-white/[0.06] rounded-xl p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <span className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Level {currentLevel.id}</span>
            <h3 className="text-lg sm:text-xl font-bold text-text-primary">{currentLevel.name}</h3>
          </div>
          {nextLevel && (
            <span className="text-xs font-medium text-text-muted">{nextProgress?.completedTasks}/{nextProgress?.totalTasks} tasks</span>
          )}
        </div>
        {currentLevel.id > 0 && (
          <p className="text-xs text-accent/80 italic mb-3">{currentLevel.rewardMessage}</p>
        )}
        {nextLevel && nextProgress ? (
          <>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${nextProgress.percentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-accent rounded-full"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-1">Next: {nextLevel.name}</p>
              {nextProgress.taskDetails.map((task, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={task.completed ? 'text-accent' : 'text-text-muted/40'}>{task.completed ? '✓' : '○'}</span>
                  <span className={task.completed ? 'text-text-secondary line-through opacity-60' : 'text-text-muted'}>{task.text}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-accent font-medium mt-2">All levels completed!</p>
        )}
      </motion.div>

      {/* Workout + Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-10 sm:mb-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Link to="/workout" className="block border border-white/[0.06] rounded-xl p-5 sm:p-6 hover:border-white/[0.12] transition-all group h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <Dumbbell size={18} className="text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm">Today's Workout</h3>
                  <p className="text-xs text-text-muted mt-0.5">{todaysWorkout?.isRestDay ? 'Rest Day' : todaysWorkout?.day}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:text-text-muted group-hover:translate-x-0.5 transition-all" />
            </div>
            {todaysWorkout && !todaysWorkout.isRestDay ? (
              <div>
                {todaysWorkout.exercises?.slice(0, 4).map((ex, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-sm text-text-secondary">{ex.name}</span>
                    <span className="text-xs text-text-muted font-mono">{ex.sets}×{ex.reps}</span>
                  </div>
                ))}
                {todaysWorkout.exercises?.length > 4 && (
                  <p className="text-xs text-accent font-medium pt-2">+{todaysWorkout.exercises.length - 4} more</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Recovery day. Light stretching or walking recommended.</p>
            )}
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Link to="/diet" className="block border border-white/[0.06] rounded-xl p-5 sm:p-6 hover:border-white/[0.12] transition-all group h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <UtensilsCrossed size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm">Today's Nutrition</h3>
                  <p className="text-xs text-text-muted mt-0.5">Daily targets</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:text-text-muted group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: nutritionTargets?.targetCalories, label: 'Calories' },
                { value: `${nutritionTargets?.macros?.protein}g`, label: 'Protein' },
                { value: `${nutritionTargets?.macros?.carbs}g`, label: 'Carbs' },
              ].map((item) => (
                <div key={item.label} className="text-center bg-white/[0.03] rounded-lg p-3">
                  <div className="text-base sm:text-xl font-black text-text-primary">{item.value}</div>
                  <div className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Weekly Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="border border-white/[0.06] rounded-xl p-5 sm:p-6 mb-10 sm:mb-14"
      >
        <h3 className="font-bold mb-5 text-sm text-text-muted uppercase tracking-wider flex items-center gap-2">
          <Calendar size={15} /> This Week
        </h3>
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {days.map((day, i) => {
            const isPast = i < today;
            const isToday = i === today;
            return (
              <div key={i} className="text-center">
                <div className="text-[10px] text-text-muted mb-2 font-medium">{day}</div>
                <div className={`w-9 h-9 sm:w-11 sm:h-11 mx-auto rounded-lg flex items-center justify-center text-xs font-bold ${
                  isToday
                    ? 'bg-accent text-white'
                    : isPast
                    ? 'bg-white/[0.06] text-text-muted'
                    : 'bg-white/[0.02] text-text-muted'
                }`}>
                  {isPast ? '✓' : isToday ? '●' : '·'}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Upgrade Banner */}
      {!isPro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="mb-10 sm:mb-14"
        >
          <UpgradeBanner />
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { to: '/workout', icon: Play, label: 'Start Workout', accent: true },
          { to: '/progress', icon: TrendingUp, label: 'View Progress' },
          { to: '/knowledge', icon: BookOpen, label: 'Learn More' },
          { to: '/profile', icon: Target, label: 'My Profile' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-xl p-4 sm:p-5 text-center hover:bg-white/[0.04] transition-all group ${
                item.accent ? 'bg-accent/[0.06] border border-accent/20' : 'border border-white/[0.06]'
              }`}
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:scale-105 transition-transform ${
                item.accent ? 'bg-accent' : 'bg-white/[0.06]'
              }`}>
                <Icon size={18} className={item.accent ? 'text-white' : 'text-text-muted'} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-text-muted group-hover:text-text-secondary transition-colors">{item.label}</span>
            </Link>
          );
        })}
      </motion.div>
    </PageWrapper>
  );
}
