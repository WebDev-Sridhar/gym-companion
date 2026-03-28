import { useState, useEffect } from 'react';
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
  Trash2,
  RefreshCw,
  Undo2,
  Image,
  Video,
  Timer,
  Zap,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import ProLock from '../components/ui/ProLock';
import { showCoach } from '../components/ui/CoachPopup';
import useUserStore from '../store/useUserStore';
import { exercises as exerciseDB, getAlternatives } from '../data/exercises';

const EMPTY_OBJ = {};

export default function Workout() {
  const { workoutPlan, logWorkout, deleteWorkoutLog, plan, swapExercise, resetExerciseSwap, currentWorkoutDay, setActiveWorkoutLog, clearActiveWorkoutLog } = useUserStore();
  const exerciseSwaps = useUserStore((s) => s.exerciseSwaps);
  const activeWorkoutLog = useUserStore((s) => s.activeWorkoutLog);
  const transformationLevel = useUserStore((s) => s.transformationLevel);
  const isPro = plan === 'pro';

  // Restore in-progress workout from store if navigating back
  const [activeDay, setActiveDay] = useState(() => activeWorkoutLog?.activeDay ?? currentWorkoutDay);
  const [isLogging, setIsLogging] = useState(() => !!activeWorkoutLog);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [logData, setLogData] = useState(() => activeWorkoutLog?.logData || {});
  const [showHistory, setShowHistory] = useState(false);
  const [mediaMode, setMediaMode] = useState({}); // { [exerciseId]: 'gif' | 'video' }
  const [showMedia, setShowMedia] = useState({}); // mobile toggle { [exerciseId]: true/false }
  const [swapOpen, setSwapOpen] = useState({}); // { [exerciseId]: true/false }
  const [saveError, setSaveError] = useState('');
  const [cardioLog, setCardioLog] = useState(() => activeWorkoutLog?.cardioLog || { duration: '', distance: '', speed: '' });
  const workoutLogs = useUserStore((s) => s.workoutLogs);

  const today = new Date().toISOString().split('T')[0];
  const todaysLogs = workoutLogs.filter((l) => l.date === today);
  const hasLoggedToday = todaysLogs.length > 0;
  const todaysLoggedDays = new Set(todaysLogs.map((l) => l.dayName));

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

  // Resolve exercise swaps (persistent — no date key)
  const daySwaps = exerciseSwaps[currentDay.day] || EMPTY_OBJ;

  // Most recent log for this day — used to show avg/max reps in exercise cards
  const dayPreviousLog = [...workoutLogs].reverse().find((l) => l.dayName === currentDay.day);

  // Build a map: exerciseName → { avgReps, maxReps } from the last logged session
  const loggedStatsMap = {};
  if (dayPreviousLog) {
    dayPreviousLog.exercises?.forEach((ex) => {
      const sets = Array.isArray(ex.logged?.sets) ? ex.logged.sets : [];
      const reps = sets.map((s) => Number(s.reps)).filter(Boolean);
      if (reps.length) {
        const avg = Math.round(reps.reduce((a, b) => a + b, 0) / reps.length);
        const max = Math.max(...reps);
        loggedStatsMap[ex.name] = { avgReps: avg, maxReps: max, sets };
      }
    });
  }

  const resolveExercise = (originalExercise, index) => {
    const swappedKey = daySwaps[index];
    if (!swappedKey) return originalExercise;
    const swappedEx = exerciseDB[swappedKey];
    if (!swappedEx) return originalExercise;
    // Preserve sets/reps from original but use swapped exercise's details
    return {
      ...swappedEx,
      exerciseKey: swappedKey,
      sets: originalExercise.sets,
      reps: originalExercise.reps,
      _swapped: true,
      _originalName: originalExercise.name,
    };
  };

  // Stringify daySwaps for stable dependency comparison (avoids infinite re-render)
  const daySwapsKey = JSON.stringify(daySwaps);

  // Initialize set data for all exercises when logging starts or day changes
  useEffect(() => {
    if (!isLogging || !currentDay) return;
    setLogData((prev) => {
      const updated = { ...prev };
      currentDay.exercises.forEach((ex, i) => {
        const resolved = resolveExercise(ex, i);
        if (!updated[resolved.id]?.sets?.length) {
          updated[resolved.id] = { sets: Array.from({ length: resolved.sets }, () => ({ reps: '', weight: '' })) };
        }
      });
      return updated;
    });
  }, [isLogging, currentDay, daySwapsKey]);

  // Persist in-progress workout to store so it survives navigation
  useEffect(() => {
    if (isLogging) {
      setActiveWorkoutLog({ dayName: currentDay?.day, activeDay, logData, cardioLog });
    }
  }, [isLogging, logData, cardioLog, activeDay]);

  const handleSetEntry = (exerciseId, setIndex, field, value) => {
    setLogData((prev) => {
      const exercise = prev[exerciseId] || { sets: [] };
      const sets = [...exercise.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      return { ...prev, [exerciseId]: { sets } };
    });
  };

  const handleAddSet = (exerciseId) => {
    setLogData((prev) => {
      const exercise = prev[exerciseId] || { sets: [] };
      return {
        ...prev,
        [exerciseId]: { sets: [...exercise.sets, { reps: '', weight: '' }] },
      };
    });
  };

  const handleRemoveSet = (exerciseId) => {
    setLogData((prev) => {
      const exercise = prev[exerciseId] || { sets: [] };
      if (exercise.sets.length <= 1) return prev;
      return {
        ...prev,
        [exerciseId]: { sets: exercise.sets.slice(0, -1) },
      };
    });
  };

  const handleSaveWorkout = () => {
    setSaveError('');

    if (hasLoggedToday) {
      setSaveError('You\'ve already logged a workout today. Only one workout per day is allowed.');
      return;
    }

    if (todaysLoggedDays.size > 0 && !todaysLoggedDays.has(currentDay.day)) {
      setSaveError('You\'ve already logged a different workout today.');
      return;
    }

    // Validate: at least 3 exercises with at least 2 filled sets each
    let qualifiedExercises = 0;
    for (let idx = 0; idx < currentDay.exercises.length; idx++) {
      const ex = resolveExercise(currentDay.exercises[idx], idx);
      const logged = logData[ex.id];
      let filledSets = 0;
      if (logged?.sets) {
        for (const s of logged.sets) {
          if (Number(s.reps) > 0) filledSets++;
        }
      }
      if (filledSets >= 2) qualifiedExercises++;
    }
    if (qualifiedExercises < 3) {
      setSaveError('Log at least 3 exercises with 2 sets each before saving.');
      return;
    }

    const exercises = currentDay.exercises.map((origEx, idx) => {
      const ex = resolveExercise(origEx, idx);
      const logged = logData[ex.id];
      return {
        name: ex.name,
        muscle: ex.muscle,
        planned: { sets: ex.sets, reps: ex.reps },
        logged: logged?.sets?.length
          ? { sets: logged.sets.filter((s) => Number(s.reps) > 0).map((s) => ({ reps: Number(s.reps), weight: Number(s.weight) || 0 })) }
          : { sets: [] },
      };
    });
    const cardioData = currentDay.cardio && (cardioLog.duration || cardioLog.distance)
      ? {
          type: currentDay.cardio.type,
          duration: Number(cardioLog.duration) || 0,
          distance: Number(cardioLog.distance) || 0,
          speed: cardioLog.speed,
        }
      : null;

    logWorkout({ dayName: currentDay.day, exercises, cardio: cardioData });
    setIsLogging(false);
    setLogData({});
    setCardioLog({ duration: '', distance: '', speed: '' });
    clearActiveWorkoutLog();
    showCoach('workoutComplete');
  };

  const handleSwap = (exerciseIndex, newKey) => {
    swapExercise(currentDay.day, exerciseIndex, newKey);
    // Keep the dropdown open on the new exercise and keep swap panel open
    const newExId = exerciseDB[newKey]?.id;
    if (newExId) {
      setExpandedExercise(newExId);
      setSwapOpen(() => ({ [newExId]: true }));
    }
  };

  const handleResetSwap = (exerciseIndex) => {
    resetExerciseSwap(currentDay.day, exerciseIndex);
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{new Date(log.timestamp || log.date).toLocaleDateString()}</span>
                    <button
                      onClick={() => { if (confirm('Delete this workout log?')) deleteWorkoutLog(log.id); }}
                      className="p-1 rounded text-text-muted/40 hover:text-red-400 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {log.exercises?.map((ex, i) => (
                  <div key={i} className="py-2 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-muted text-sm">{ex.name}</span>
                      <span className="text-[11px] text-text-muted">
                        {Array.isArray(ex.logged?.sets) ? `${ex.logged.sets.length} sets` : `${ex.logged?.sets || ex.planned?.sets} sets`}
                      </span>
                    </div>
                    {Array.isArray(ex.logged?.sets) ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {ex.logged.sets.map((s, si) => (
                          <span key={si} className="text-[11px] font-mono bg-white/[0.04] px-2 py-0.5 rounded text-text-muted">
                            S{si + 1}: {s.reps}×{s.weight > 0 ? `${s.weight}kg` : '—'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-text-muted font-mono text-xs">
                        {ex.logged?.sets || ex.planned?.sets}×{ex.logged?.reps || ex.planned?.reps}
                        {ex.logged?.weight > 0 && ` @ ${ex.logged.weight}kg`}
                      </span>
                    )}
                  </div>
                ))}
                {log.cardio && (
                  <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center gap-2 flex-wrap">
                    <Zap size={11} className="text-accent shrink-0" />
                    <span className="text-[11px] text-accent font-medium capitalize">{log.cardio.type}</span>
                    {log.cardio.duration > 0 && <span className="text-[11px] text-text-muted">{log.cardio.duration} min</span>}
                    {log.cardio.distance > 0 && <span className="text-[11px] text-text-muted">{log.cardio.distance} km</span>}
                    {log.cardio.speed && <span className="text-[11px] text-text-muted">{log.cardio.speed} {log.cardio.type === 'treadmill' ? 'km/h' : 'resistance'}</span>}
                  </div>
                )}
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
                onClick={() => { setActiveDay(i); setExpandedExercise(null); setIsLogging(false); setLogData({}); setCardioLog({ duration: '', distance: '', speed: '' }); clearActiveWorkoutLog(); }}
                className={`shrink-0 px-4 py-2.5 rounded-lg text-xs font-medium transition-all relative ${
                  activeDay === i
                    ? 'bg-white text-black'
                    : 'border border-white/[0.06] text-text-muted hover:text-text-secondary'
                }`}
              >
                {day.day}
                {i === currentWorkoutDay && activeDay !== i && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mb-4">
            <div className="flex gap-2">
              {!isLogging ? (
                isPro ? (
                  <button
                    onClick={() => { setSaveError(''); setIsLogging(true); showCoach('workoutStart'); }}
                    disabled={hasLoggedToday}
                    className="btn-primary px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Play size={16} /> {hasLoggedToday ? 'Already Logged Today' : 'Start Workout'}
                  </button>
                ) : (
                  <ProLock message="Workout logging">
                    <button
                      disabled
                      className="btn-primary px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 opacity-40 cursor-not-allowed"
                    >
                      <Play size={16} /> Start Workout
                    </button>
                  </ProLock>
                )
              ) : (
                <>
                  <button
                    onClick={handleSaveWorkout}
                    className="btn-secondary px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2"
                  >
                    <Save size={16} /> Save Workout
                  </button>
                  <button
                    onClick={() => { setIsLogging(false); setLogData({}); setSaveError(''); setCardioLog({ duration: '', distance: '', speed: '' }); clearActiveWorkoutLog(); showCoach('workoutCancel', 'left'); }}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted border border-white/[0.06] hover:text-text-secondary"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
            {saveError && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                <AlertTriangle size={12} /> {saveError}
              </p>
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
                Log your sets honestly — track what you actually lifted, not what you wish you did. Consistent progress beats ego numbers.
              </p>
            </motion.div>
          )}

          {/* Progressive Overload Note — only show at intermediate+ level (Level 5+) */}
          <div className="space-y-2 mb-6">
            {transformationLevel >= 5 && (
              <div className="flex items-start gap-2.5 border border-white/[0.06] rounded-lg px-4 py-3">
                <Dumbbell size={14} className="text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted">
                  <span className="text-text-secondary font-medium">How to progress:</span> Pick a weight you can do for 8 reps with good form. Stick with that weight until you can do 12 reps easily, then increase the weight and go back to 8 reps. Push to failure on your last set.
                </p>
              </div>
            )}
            <div className="flex items-start gap-2.5 bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3">
              <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted">
                <span className="text-red-400 font-medium">No ego lifting!</span> Lifting too heavy with bad form leads to injuries, not gains. Control the weight, feel the muscle, and leave your ego at the door. Slow reps with proper form beat heavy sloppy reps every time.
              </p>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-2">
            {currentDay.exercises.map((originalExercise, i) => {
              const exercise = resolveExercise(originalExercise, i);
              const isSwapped = !!exercise._swapped;
              const alternatives = getAlternatives(originalExercise.exerciseKey || '');
              const mode = mediaMode[exercise.id] || 'gif';

              return (
                <motion.div
                  key={`${exercise.id}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border rounded-xl overflow-hidden ${isSwapped ? 'border-accent/20' : 'border-white/[0.06]'}`}
                >
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => {
                      const closing = expandedExercise === exercise.id;
                      setExpandedExercise(closing ? null : exercise.id);
                      if (closing) setShowMedia((prev) => ({ ...prev, [exercise.id]: false }));
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* GIF Thumbnail */}
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 overflow-hidden">
                        {exercise.gifUrl ? (
                          <img
                            src={exercise.gifUrl}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                          />
                        ) : null}
                        <Dumbbell size={16} className="text-text-muted" style={{ display: exercise.gifUrl ? 'none' : 'block' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-text-primary text-sm">{exercise.name}</h3>
                          {isSwapped && (
                            <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">SWAPPED</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-accent font-medium">{exercise.muscle}</span>
                          {(() => {
                            const logged = loggedStatsMap[exercise.name];
                            const repDisplay = logged
                              ? (logged.avgReps === logged.maxReps ? `${logged.maxReps}` : `${logged.avgReps}–${logged.maxReps}`)
                              : exercise.reps;
                            return <span className="text-[11px] text-text-muted">{exercise.sets} × {repDisplay} · Rest {exercise.rest}</span>;
                          })()}
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
                          {/* Swapped indicator with reset (only show if Pro since swap is Pro) */}
                          {isSwapped && isPro && (
                            <div className="flex items-center justify-between bg-accent/5 border border-accent/10 rounded-lg px-3 py-2 mb-4">
                              <span className="text-xs text-text-muted">
                                Swapped from <span className="text-text-secondary font-medium">{exercise._originalName}</span>
                              </span>
                              <button
                                onClick={() => handleResetSwap(i)}
                                className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                              >
                                <Undo2 size={12} /> Reset
                              </button>
                            </div>
                          )}

                          {/* Split Layout: Details Left, Media Right */}
                          <div className="flex flex-col lg:flex-row gap-4">
                            {/* Left — Exercise Details */}
                            <div className="flex-1 space-y-4">
                              {/* Sets / Reps / Rest Boxes */}
                              {(() => {
                                const logged = loggedStatsMap[exercise.name];
                                const displayReps = logged
                                  ? (logged.avgReps === logged.maxReps ? `${logged.maxReps}` : `${logged.avgReps}–${logged.maxReps}`)
                                  : exercise.reps;
                                const repsLabel = logged ? 'Last Reps' : 'Reps';
                                return (
                                  <div className="flex gap-3">
                                    {[
                                      { value: exercise.sets, label: 'Sets' },
                                      { value: displayReps, label: repsLabel },
                                      { value: exercise.rest, label: 'Rest' },
                                    ].map((stat) => (
                                      <div key={stat.label} className="bg-white/[0.04] rounded-lg px-4 py-2.5 text-center flex-1">
                                        <div className="text-base font-black text-text-primary">{stat.value}</div>
                                        <div className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}

                              {/* How to do it */}
                              <div className="bg-white/[0.03] rounded-lg p-3">
                                <h4 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">How to do it</h4>
                                <p className="text-sm text-text-muted leading-relaxed">{exercise.instructions}</p>
                              </div>

                              {/* Common Mistakes — Free */}
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

                              {/* Alternatives with Swap — Pro Only */}
                              {alternatives.length > 0 && (
                                isPro ? (
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider">Alternatives</span>
                                      <button
                                        onClick={() => setSwapOpen((prev) => ({ ...prev, [exercise.id]: !prev[exercise.id] }))}
                                        className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                                      >
                                        <RefreshCw size={11} /> {swapOpen[exercise.id] ? 'Close' : 'Swap Exercise'}
                                      </button>
                                    </div>

                                    <AnimatePresence>
                                      {swapOpen[exercise.id] ? (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="space-y-2 overflow-hidden"
                                        >
                                          {alternatives.map((alt) => (
                                            <div
                                              key={alt.key}
                                              className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5 hover:border-accent/20 transition-colors group"
                                            >
                                              {/* Alt GIF thumbnail */}
                                              <div className="w-12 h-12 rounded-lg bg-white/[0.04] shrink-0 overflow-hidden flex items-center justify-center">
                                                {alt.gifUrl ? (
                                                  <img
                                                    src={alt.gifUrl}
                                                    alt={alt.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                  />
                                                ) : null}
                                                <div className="w-full h-full items-center justify-center" style={{ display: alt.gifUrl ? 'none' : 'flex' }}>
                                                  <Dumbbell size={14} className="text-text-muted" />
                                                </div>
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate">{alt.name}</p>
                                                <p className="text-[11px] text-text-muted">{alt.muscle} · {alt.difficulty}</p>
                                              </div>
                                              <button
                                                onClick={() => handleSwap(i, alt.key)}
                                                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                                              >
                                                Swap
                                              </button>
                                            </div>
                                          ))}
                                          <p className="text-[10px] text-text-muted italic">Swaps persist until you reset them.</p>
                                        </motion.div>
                                      ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                          {alternatives.map((alt) => (
                                            <span key={alt.key} className="text-xs bg-white/[0.04] px-2.5 py-1 rounded-md text-text-muted">{alt.name}</span>
                                          ))}
                                        </div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ) : (
                                  <ProLock message="Exercise swap">
                                    <div className="bg-white/[0.03] rounded-lg p-3 h-14" />
                                  </ProLock>
                                )
                              )}
                            </div>

                            {/* Right — GIF Preview / YouTube Video (Free) */}
                            <div className="lg:w-[45%] shrink-0">
                              {/* Mobile: Show Media button */}
                              <div className="lg:hidden">
                                {!showMedia[exercise.id] ? (
                                  <button
                                    onClick={() => setShowMedia((prev) => ({ ...prev, [exercise.id]: true }))}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium btn-primary"
                                  >
                                    <Image size={14} /> Show Form Guide
                                  </button>
                                ) : (
                                  <ExerciseMedia
                                    exercise={exercise}
                                    mode={mode}
                                    onToggle={() => setMediaMode((prev) => ({ ...prev, [exercise.id]: mode === 'gif' ? 'video' : 'gif' }))}
                                    onHide={() => setShowMedia((prev) => ({ ...prev, [exercise.id]: false }))}
                                    showHide
                                  />
                                )}
                              </div>
                              {/* Desktop: always visible */}
                              <div className="hidden lg:block">
                                <div className="lg:sticky lg:top-4">
                                  <ExerciseMedia
                                    exercise={exercise}
                                    mode={mode}
                                    onToggle={() => setMediaMode((prev) => ({ ...prev, [exercise.id]: mode === 'gif' ? 'video' : 'gif' }))}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Logging Inputs — Per-Set Tracking */}
                          {isLogging && (() => {
                            const setsData = logData[exercise.id]?.sets || [];
                            return (
                              <div className="bg-white/[0.03] rounded-lg p-4 mt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Log this exercise</h4>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleRemoveSet(exercise.id)}
                                      className="p-1 rounded bg-white/[0.04] text-text-muted hover:text-text-secondary disabled:opacity-30"
                                      disabled={setsData.length <= 1}
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className="text-xs text-text-muted px-1">{setsData.length} sets</span>
                                    <button
                                      onClick={() => handleAddSet(exercise.id)}
                                      className="p-1 rounded bg-white/[0.04] text-text-muted hover:text-text-secondary"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {setsData.map((setData, si) => (
                                    <div key={si} className="flex items-center gap-3">
                                      <span className="text-xs font-bold text-accent w-12 shrink-0">Set {si + 1}</span>
                                      <div className="flex-1 flex gap-2">
                                        <div className="flex-1">
                                          {si === 0 && <label className="text-[10px] text-text-muted block mb-1">Reps</label>}
                                          <input
                                            type="number"
                                            value={setData.reps}
                                            onChange={(e) => handleSetEntry(exercise.id, si, 'reps', e.target.value)}
                                            placeholder={String(exercise.reps)}
                                            className="w-full px-2 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-center text-text-primary text-sm font-bold focus:outline-none focus:border-accent/30"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          {si === 0 && <label className="text-[10px] text-text-muted block mb-1">Weight (kg)</label>}
                                          <input
                                            type="number"
                                            value={setData.weight}
                                            onChange={(e) => handleSetEntry(exercise.id, si, 'weight', e.target.value)}
                                            placeholder="0"
                                            className="w-full px-2 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-center text-text-primary text-sm font-bold focus:outline-none focus:border-accent/30"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Cardio Section */}
          {currentDay.cardio && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 border border-accent/20 rounded-xl overflow-hidden"
            >
              <div className="px-4 py-3 bg-accent/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer size={14} className="text-accent" />
                  <span className="text-sm font-bold text-text-primary capitalize">
                    {currentDay.cardio.type} · Cardio
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-muted">
                  <span>{currentDay.cardio.targetDuration} min target</span>
                  {currentDay.cardio.targetDistance && <span>{currentDay.cardio.targetDistance} km</span>}
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-text-muted mb-3">{currentDay.cardio.note}</p>
                {isLogging ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-text-muted block mb-1 uppercase tracking-wider">Duration (min)</label>
                      <input
                        type="number"
                        value={cardioLog.duration}
                        onChange={(e) => setCardioLog((p) => ({ ...p, duration: e.target.value }))}
                        placeholder={String(currentDay.cardio.targetDuration)}
                        className="w-full px-2 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-center text-text-primary text-sm font-bold focus:outline-none focus:border-accent/30"
                      />
                    </div>
                    {currentDay.cardio.targetDistance !== null && (
                      <div>
                        <label className="text-[10px] text-text-muted block mb-1 uppercase tracking-wider">Distance (km)</label>
                        <input
                          type="number"
                          value={cardioLog.distance}
                          onChange={(e) => setCardioLog((p) => ({ ...p, distance: e.target.value }))}
                          placeholder={String(currentDay.cardio.targetDistance)}
                          className="w-full px-2 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-center text-text-primary text-sm font-bold focus:outline-none focus:border-accent/30"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] text-text-muted block mb-1 uppercase tracking-wider">
                        {currentDay.cardio.type === 'treadmill' ? 'Speed (km/h)' : 'Resistance'}
                      </label>
                      <input
                        type="number"
                        value={cardioLog.speed}
                        onChange={(e) => setCardioLog((p) => ({ ...p, speed: e.target.value }))}
                        placeholder={currentDay.cardio.type === 'treadmill' ? '7' : '5'}
                        className="w-full px-2 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-center text-text-primary text-sm font-bold focus:outline-none focus:border-accent/30"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted/50 italic">Start workout to log cardio</p>
                )}
              </div>
            </motion.div>
          )}

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

// Sub-component for GIF / YouTube video toggle
function ExerciseMedia({ exercise, mode, onToggle, onHide, showHide }) {
  const [gifFailed, setGifFailed] = useState(false);
  const hasGif = !!exercise.gifUrl && !gifFailed;
  const hasVideo = !!exercise.videoId;

  // If GIF fails, auto-switch to video
  const effectiveMode = (mode === 'gif' && !hasGif && hasVideo) ? 'video' : mode;

  return (
    <div>
      {effectiveMode === 'gif' && hasGif ? (
        <div className="rounded-lg overflow-hidden bg-white/[0.03] border border-white/[0.06]">
          <img
            src={exercise.gifUrl}
            alt={`${exercise.name} form guide`}
            className="w-full"
            loading="lazy"
            onError={() => setGifFailed(true)}
          />
        </div>
      ) : hasVideo ? (
        <div className="video-container rounded-lg overflow-hidden">
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
            <Dumbbell size={32} className="text-text-muted mx-auto mb-1" />
            <span className="text-[10px] text-text-muted uppercase tracking-wider">No media available</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          {effectiveMode === 'gif' ? 'Form Guide (GIF)' : 'Full Tutorial'}
        </span>
        <div className="flex items-center gap-2">
          {hasGif && hasVideo && (
            <button
              onClick={onToggle}
              className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
            >
              {effectiveMode === 'gif' ? <><Video size={12} /> Full Video</> : <><Image size={12} /> GIF Guide</>}
            </button>
          )}
          {showHide && onHide && (
            <button
              onClick={onHide}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Hide
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
