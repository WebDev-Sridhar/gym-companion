import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Clock, Repeat, Layers } from 'lucide-react';

export default function ExerciseConfigModal({ exercise, onConfirm, onClose, isEditing }) {
  const [sets, setSets] = useState(exercise?.sets || 3);
  const [reps, setReps] = useState(exercise?.reps || '10-12');
  const [rest, setRest] = useState(exercise?.restSeconds || 60);

  const handleConfirm = () => {
    if (!reps.trim() || sets < 1 || rest < 10) return;
    onConfirm({ sets, reps: reps.trim(), restSeconds: rest });
  };

  const isValid = reps.trim() && sets >= 1 && rest >= 10;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-md bg-dark-card border border-white/[0.06] rounded-t-2xl sm:rounded-2xl p-6 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-text-muted"
          >
            <X size={18} />
          </button>

          {/* Exercise Info */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-text-primary mb-1 pr-8">
              {exercise.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                {exercise.muscle || exercise.targetMuscle}
              </span>
              {exercise.difficulty && (
                <span className="text-xs text-text-muted capitalize">
                  {exercise.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Sets */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-secondary">
                <Layers size={16} className="text-accent/60" />
                <span className="text-sm font-medium">Sets</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSets(Math.max(1, sets - 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-lg font-bold text-text-primary w-8 text-center">
                  {sets}
                </span>
                <button
                  onClick={() => setSets(Math.min(10, sets + 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Reps */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-secondary">
                <Repeat size={16} className="text-accent/60" />
                <span className="text-sm font-medium">Reps</span>
              </div>
              <input
                type="text"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="e.g. 8-12"
                className="w-28 text-right bg-white/5 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/30"
              />
            </div>

            {/* Rest */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock size={16} className="text-accent/60" />
                <span className="text-sm font-medium">Rest (sec)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRest(Math.max(10, rest - 10))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-lg font-bold text-text-primary w-10 text-center">
                  {rest}
                </span>
                <button
                  onClick={() => setRest(Math.min(300, rest + 10))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Validation hint */}
          {!isValid && (
            <p className="text-xs text-red-400/80 mb-3">
              {sets < 1 ? 'At least 1 set required' : !reps.trim() ? 'Reps cannot be empty' : 'Rest must be at least 10 seconds'}
            </p>
          )}

          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="w-full py-3 rounded-xl font-bold text-sm btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Update Exercise' : 'Add Exercise'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
