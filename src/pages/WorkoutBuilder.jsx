import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  ChevronLeft,
  Save,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Trash2,
} from 'lucide-react';
import useUserStore from '../store/useUserStore';
import ProLock from '../components/ui/ProLock';
import { showToast } from '../components/ui/Toast';
import DaySelector from '../components/builder/DaySelector';
import DayEditor from '../components/builder/DayEditor';
import PageWrapper from '../components/layout/PageWrapper';

function buildEmptyDay() {
  return { title: '', exercises: [] };
}

function buildDayFromDefault(defaultPlan, dayIndex) {
  const defaultDay = defaultPlan?.schedule?.[dayIndex];
  if (!defaultDay) return buildEmptyDay();
  return {
    title: defaultDay.day.replace(/^Day \d+\s*-?\s*/, ''),
    exercises: defaultDay.exercises.map((ex) => ({ ...ex })),
  };
}

function buildPlanFromState(daysPerWeek, days) {
  const schedule = days.map((day, i) => ({
    day: day.title.trim()
      ? `Day ${i + 1} - ${day.title.trim()}`
      : `Day ${i + 1}`,
    exercises: day.exercises.map((ex) => ({
      id: ex.id,
      exerciseKey: ex.exerciseKey || null,
      name: ex.name,
      muscle: ex.muscle,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      difficulty: ex.difficulty || 'intermediate',
      alternatives: ex.alternatives || [],
      videoId: ex.videoId || null,
      gifUrl: ex.gifUrl || null,
      instructions: ex.instructions || '',
      donts: ex.donts || [],
      ...(ex.isCustom ? { isCustom: true } : {}),
    })),
    cardio: null,
  }));

  return {
    splitName: 'Custom Plan',
    splitKey: 'custom',
    level: 'custom',
    daysPerWeek,
    schedule,
    tips: [
      'This is your custom-built plan — adjust it anytime from the Builder.',
      'Focus on progressive overload: increase weight or reps each week.',
      'Rest 48 hours before training the same muscle group again.',
    ],
  };
}

function validatePlan(days) {
  const errors = [];
  days.forEach((day, i) => {
    if (day.exercises.length === 0) {
      errors.push(`Day ${i + 1} has no exercises`);
    }
    day.exercises.forEach((ex, j) => {
      if (ex.sets < 1) errors.push(`Day ${i + 1}, ${ex.name}: sets must be ≥ 1`);
      if (!ex.reps?.trim()) errors.push(`Day ${i + 1}, ${ex.name}: reps is empty`);
      const restSec = parseInt(ex.rest);
      if (restSec < 10) errors.push(`Day ${i + 1}, ${ex.name}: rest must be ≥ 10s`);
    });
  });
  return errors;
}

export default function WorkoutBuilder() {
  const navigate = useNavigate();
  const plan = useUserStore((s) => s.plan);
  const customPlan = useUserStore((s) => s.customPlan);
  const defaultPlan = useUserStore((s) => s.defaultPlan);
  const setCustomWorkoutPlan = useUserStore((s) => s.setCustomWorkoutPlan);
  const deleteCustomWorkoutPlan = useUserStore((s) => s.deleteCustomWorkoutPlan);

  const [step, setStep] = useState(1); // 1 = days, 2 = editor
  const [daysPerWeek, setDaysPerWeek] = useState(null);
  const [days, setDays] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load existing custom plan on mount, or pre-select default plan's day count
  useEffect(() => {
    if (customPlan?.schedule?.length) {
      // Edit existing custom plan
      setDaysPerWeek(customPlan.daysPerWeek);
      setDays(
        customPlan.schedule.map((s) => ({
          title: s.day.replace(/^Day \d+\s*-?\s*/, ''),
          exercises: s.exercises.map((ex) => ({ ...ex })),
        }))
      );
      setStep(2);
    } else if (defaultPlan?.schedule?.length) {
      // Pre-select day count from default plan
      setDaysPerWeek(defaultPlan.daysPerWeek);
    }
  }, []);

  // Adjust days array when daysPerWeek changes (populate new days from default plan)
  const handleDaysSelect = (count) => {
    setDaysPerWeek(count);
    setDays((prev) => {
      if (prev.length === count) return prev;
      if (prev.length < count) {
        return [
          ...prev,
          ...Array.from({ length: count - prev.length }, (_, i) =>
            buildDayFromDefault(defaultPlan, prev.length + i)
          ),
        ];
      }
      return prev.slice(0, count);
    });
  };

  const handleContinue = () => {
    if (!daysPerWeek) return;
    if (days.length === 0) {
      // Pre-populate with default plan exercises so users can edit them
      setDays(
        Array.from({ length: daysPerWeek }, (_, i) =>
          buildDayFromDefault(defaultPlan, i)
        )
      );
    }
    setStep(2);
  };

  const validationErrors = useMemo(() => validatePlan(days), [days]);

  const handleSave = async () => {
    if (validationErrors.length > 0) {
      showToast(validationErrors[0], 'error');
      return;
    }

    setSaving(true);
    try {
      const customPlan = buildPlanFromState(daysPerWeek, days);
      setCustomWorkoutPlan(customPlan);
      showToast('Custom workout plan saved!', 'success');
      navigate('/workout');
    } catch {
      showToast('Failed to save plan. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // PRO gate
  if (plan !== 'pro') {
    return (
      <PageWrapper>
        <div className="max-w-lg mx-auto pt-8 px-5">
          <ProLock message="Build Your Custom Workout Plan">
            <div className="h-96 bg-dark-card rounded-xl" />
          </ProLock>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-32">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1);
              } else {
                navigate(-1);
              }
            }}
            className="p-2 rounded-lg hover:bg-white/5 text-text-muted"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-accent" />
              <h1 className="text-lg font-bold text-text-primary">
                Workout Builder
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {step === 1
                ? 'Choose your training days'
                : `Building ${daysPerWeek}-day plan`}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                step === 1 ? 'bg-accent' : 'bg-accent/30'
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full ${
                step === 2 ? 'bg-accent' : 'bg-accent/30'
              }`}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <DaySelector
              key="selector"
              selectedDays={daysPerWeek}
              onSelect={handleDaysSelect}
              onContinue={handleContinue}
            />
          )}

          {step === 2 && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DayEditor days={days} onChange={setDays} />

              {/* Validation Summary */}
              {validationErrors.length > 0 && (
                <div className="mt-6 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-xs font-medium text-red-400">
                      Fix before saving
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {validationErrors.slice(0, 3).map((err, i) => (
                      <li
                        key={i}
                        className="text-xs text-red-400/70 pl-5"
                      >
                        {err}
                      </li>
                    ))}
                    {validationErrors.length > 3 && (
                      <li className="text-xs text-red-400/50 pl-5">
                        +{validationErrors.length - 3} more issues
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Save Status */}
              {validationErrors.length === 0 && days.some((d) => d.exercises.length > 0) && (
                <div className="mt-6 p-3 rounded-xl bg-green-500/5 border border-green-500/15 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-400" />
                  <span className="text-xs text-green-400/80">
                    Plan is valid and ready to save
                  </span>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || validationErrors.length > 0}
                className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm btn-primary flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Plan
                  </>
                )}
              </button>

              <p className="text-center text-xs text-text-muted/60 mt-3">
                This will replace your current workout plan.
                <br />
                Your workout history will not be affected.
              </p>

              {/* Delete Custom Plan */}
              {customPlan && (
                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-2.5 rounded-xl text-xs font-medium text-red-400/70 border border-red-500/10 bg-red-500/[0.03] hover:bg-red-500/[0.06] transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={13} /> Delete Custom Plan
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                      <p className="text-xs text-red-400/80 mb-3 text-center">
                        Delete your custom plan and revert to the default plan?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-2 rounded-lg text-xs font-medium border border-white/[0.06] text-text-muted hover:text-text-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            deleteCustomWorkoutPlan();
                            showToast('Custom plan deleted', 'success');
                            navigate('/workout');
                          }}
                          className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
