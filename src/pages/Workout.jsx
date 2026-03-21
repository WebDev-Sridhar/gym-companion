import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Play,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Save,
  Plus,
  Minus,
  AlertTriangle,
  Info,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import ProLock from '../components/ui/ProLock';
import { showCoach } from '../components/ui/CoachPopup';
import useUserStore from '../store/useUserStore';

export default function Workout() {
  const { workoutPlan, logWorkout, plan } = useUserStore();
  const isPro = plan === 'pro';
  const [activeDay, setActiveDay] = useState(0);
  const [isLogging, setIsLogging] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [logData, setLogData] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const workoutLogs = useUserStore((s) => s.workoutLogs);

  if (!workoutPlan) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <Dumbbell size={48} className="text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-text-primary">No Workout Plan</h2>
          <p className="text-text-muted text-sm">Complete onboarding to get your personalized plan.</p>
        </div>
      </PageWrapper>
    );
  }

  const schedule = workoutPlan.schedule;
  const currentDay = schedule[activeDay];

  const handleLogEntry = (exerciseId, field, value) => {
    setLogData((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], [field]: value },
    }));
  };

  const handleSaveWorkout = () => {
    const exercises = currentDay.exercises.map((ex) => ({
      name: ex.name,
      muscle: ex.muscle,
      planned: { sets: ex.sets, reps: ex.reps },
      logged: logData[ex.id] || { sets: ex.sets, reps: ex.reps, weight: 0 },
    }));
    logWorkout({ dayName: currentDay.day, exercises });
    setIsLogging(false);
    setLogData({});
    showCoach('workoutComplete');
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
            <span className="gradient-text">Workout</span> <span className="text-text-primary">Plan</span>
          </h1>
          <p className="text-text-muted text-xs sm:text-sm">{workoutPlan.splitName} · {workoutPlan.level}</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            showHistory ? 'bg-white text-black' : 'border border-white/[0.08] text-text-muted hover:text-text-secondary'
          }`}
        >
          {showHistory ? 'Plan' : 'History'}
        </button>
      </div>

      {showHistory ? (
        <div className="space-y-3">
          <h2 className="text-lg font-bold mb-4 text-text-primary">Workout History</h2>
          {workoutLogs.length === 0 ? (
            <div className="text-center py-16 border border-white/[0.06] rounded-xl">
              <Clock size={40} className="text-text-muted mx-auto mb-4" />
              <p className="text-text-muted text-sm">No workouts logged yet.</p>
            </div>
          ) : (
            [...workoutLogs].reverse().slice(0, isPro ? undefined : 3).map((log) => (
              <div key={log.id} className="border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-text-primary text-sm">{log.dayName}</span>
                  <span className="text-xs text-text-muted">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
                {log.exercises?.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-text-muted">{ex.name}</span>
                    <span className="text-text-muted font-mono text-xs">
                      {ex.logged?.sets || ex.planned?.sets}×{ex.logged?.reps || ex.planned?.reps}
                      {ex.logged?.weight > 0 && ` @ ${ex.logged.weight}kg`}
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
          {!isPro && workoutLogs.length > 3 && (
            <ProLock message="Full workout history">
              <div className="border border-white/[0.06] rounded-xl p-4 h-24" />
            </ProLock>
          )}
        </div>
      ) : (
        <>
          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
            {schedule.map((day, i) => (
              <button
                key={i}
                onClick={() => { setActiveDay(i); setExpandedExercise(null); }}
                className={`shrink-0 px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeDay === i
                    ? 'bg-white text-black'
                    : 'border border-white/[0.06] text-text-muted hover:text-text-secondary'
                }`}
              >
                {day.day}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            {!isLogging ? (
              <button
                onClick={() => setIsLogging(true)}
                className="btn-primary px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <Play size={16} /> Start Workout
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveWorkout}
                  className="btn-secondary px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                  <Save size={16} /> Save Workout
                </button>
                <button
                  onClick={() => { setIsLogging(false); setLogData({}); }}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted border border-white/[0.06] hover:text-text-secondary"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* Tip Banner */}
          {isLogging && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-2.5 bg-accent/5 border border-accent/10 rounded-lg px-4 py-3"
            >
              <Info size={14} className="text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted">
                Remember to save your workout after completing all exercises. Your progress and XP will be recorded.
              </p>
            </motion.div>
          )}

          {/* Progressive Overload Note */}
          <div className="mb-6 flex items-start gap-2.5 border border-white/[0.06] rounded-lg px-4 py-3">
            <Dumbbell size={14} className="text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted">
              <span className="text-text-secondary font-medium">How to progress:</span> Pick a weight you can do for 8 reps with good form. Stick with that weight until you can do 12 reps easily, then increase the weight and go back to 8 reps. Push to failure on your last set.
            </p>
          </div>

          {/* Exercise List */}
          <div className="space-y-2">
            {currentDay.exercises.map((exercise, i) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border border-white/[0.06] rounded-xl overflow-hidden"
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                      <Dumbbell size={16} className="text-text-muted" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm">{exercise.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-accent font-medium">{exercise.muscle}</span>
                        <span className="text-[11px] text-text-muted">{exercise.sets} × {exercise.reps} · Rest {exercise.rest}</span>
                      </div>
                    </div>
                  </div>
                  {expandedExercise === exercise.id ? (
                    <ChevronUp size={16} className="text-text-muted shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-text-muted shrink-0" />
                  )}
                </div>

                <AnimatePresence>
                  {expandedExercise === exercise.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        {/* Split Layout: Details Left, Video Right */}
                        <div className="flex flex-col lg:flex-row gap-4">
                          {/* Left — Exercise Details */}
                          <div className="flex-1 space-y-4">
                            {/* Sets / Reps / Rest Boxes */}
                            <div className="flex gap-3">
                              {[
                                { value: exercise.sets, label: 'Sets' },
                                { value: exercise.reps, label: 'Reps' },
                                { value: exercise.rest, label: 'Rest' },
                              ].map((stat) => (
                                <div key={stat.label} className="bg-white/[0.04] rounded-lg px-4 py-2.5 text-center flex-1">
                                  <div className="text-base font-black text-text-primary">{stat.value}</div>
                                  <div className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</div>
                                </div>
                              ))}
                            </div>

                            {/* How to do it */}
                            <div className="bg-white/[0.03] rounded-lg p-3">
                              <h4 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">How to do it</h4>
                              <p className="text-sm text-text-muted leading-relaxed">{exercise.instructions}</p>
                            </div>

                            {/* Common Mistakes, Alternatives, Video — Pro Only */}
                            {isPro ? (
                              <>
                                {exercise.donts?.length > 0 && (
                                  <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                                    <h4 className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                      <AlertTriangle size={12} /> Common Mistakes
                                    </h4>
                                    <ul className="space-y-1.5">
                                      {exercise.donts.map((dont, j) => (
                                        <li key={j} className="text-sm text-text-muted flex items-start gap-2">
                                          <span className="text-red-400 mt-0.5 text-xs shrink-0">✕</span>
                                          {dont}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {exercise.alternatives?.length > 0 && (
                                  <div>
                                    <span className="text-[11px] text-text-muted font-medium mb-1.5 block uppercase tracking-wider">Alternatives</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {exercise.alternatives.map((alt, j) => (
                                        <span key={j} className="text-xs bg-white/[0.04] px-2.5 py-1 rounded-md text-text-muted">{alt}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="my-3">
                                <ProLock message="Common mistakes, alternatives & video tutorials">
                                  <div className="space-y-3 py-4">
                                    <div className="bg-red-500/5 rounded-lg p-3 h-20" />
                                    <div className="bg-white/[0.03] rounded-lg p-3 h-14" />
                                  </div>
                                </ProLock>
                              </div>
                            )}
                          </div>

                          {/* Right — Video */}
                          <div className="lg:w-[45%] shrink-0">
                            {isPro ? (
                              <div className="video-container rounded-lg overflow-hidden lg:sticky lg:top-4">
                                <iframe
                                  src={`https://www.youtube.com/embed/${exercise.videoId}`}
                                  title={exercise.name}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            ) : (
                              <div className="aspect-video bg-white/[0.03] rounded-lg flex items-center justify-center border border-white/[0.06]">
                                <div className="text-center">
                                  <Play size={32} className="text-text-muted mx-auto mb-1" />
                                  <span className="text-[10px] text-text-muted uppercase tracking-wider">Pro</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Logging Inputs — Full Width Below Split */}
                        {isLogging && (
                          <div className="bg-white/[0.03] rounded-lg p-4 mt-4">
                            <h4 className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">Log this exercise</h4>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="text-[11px] text-text-muted block mb-1">Sets</label>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleLogEntry(exercise.id, 'sets', Math.max(1, (logData[exercise.id]?.sets || exercise.sets) - 1))}
                                    className="p-1 rounded bg-white/[0.04] text-text-muted hover:text-text-secondary"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="text-lg font-bold text-text-primary w-8 text-center">
                                    {logData[exercise.id]?.sets || exercise.sets}
                                  </span>
                                  <button
                                    onClick={() => handleLogEntry(exercise.id, 'sets', (logData[exercise.id]?.sets || exercise.sets) + 1)}
                                    className="p-1 rounded bg-white/[0.04] text-text-muted hover:text-text-secondary"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="text-[11px] text-text-muted block mb-1">Reps</label>
                                <input
                                  type="number"
                                  value={logData[exercise.id]?.reps || ''}
                                  onChange={(e) => handleLogEntry(exercise.id, 'reps', e.target.value)}
                                  placeholder={exercise.reps}
                                  className="w-full px-2 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-center text-text-primary text-base font-bold focus:outline-none focus:border-white/20"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] text-text-muted block mb-1">Weight (kg)</label>
                                <input
                                  type="number"
                                  value={logData[exercise.id]?.weight || ''}
                                  onChange={(e) => handleLogEntry(exercise.id, 'weight', e.target.value)}
                                  placeholder="0"
                                  className="w-full px-2 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-center text-text-primary text-base font-bold focus:outline-none focus:border-white/20"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Tips */}
          {workoutPlan.tips && (
            <div className="mt-8 border border-white/[0.06] rounded-xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm text-text-secondary">
                <Target size={16} /> Pro Tips
              </h3>
              <ul className="space-y-2">
                {workoutPlan.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                    <span className="text-accent mt-0.5 text-xs">●</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
