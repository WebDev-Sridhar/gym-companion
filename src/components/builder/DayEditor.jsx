import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Edit3,
  Dumbbell,
  AlertCircle,
} from 'lucide-react';
import ExerciseSearchModal from './ExerciseSearchModal';
import ExerciseConfigModal from './ExerciseConfigModal';

const MAX_EXERCISES = 8;

export default function DayEditor({ days, onChange }) {
  const [activeDay, setActiveDay] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null); // { dayIndex, exerciseIndex }

  const currentDay = days[activeDay];

  const updateDay = (dayIndex, updates) => {
    const newDays = [...days];
    newDays[dayIndex] = { ...newDays[dayIndex], ...updates };
    onChange(newDays);
  };

  const addExercise = (exercise) => {
    if (currentDay.exercises.length >= MAX_EXERCISES) return;
    updateDay(activeDay, {
      exercises: [...currentDay.exercises, exercise],
    });
    setShowSearch(false);
  };

  const removeExercise = (exerciseIndex) => {
    updateDay(activeDay, {
      exercises: currentDay.exercises.filter((_, i) => i !== exerciseIndex),
    });
  };

  const moveExercise = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentDay.exercises.length) return;
    const newExercises = [...currentDay.exercises];
    [newExercises[index], newExercises[newIndex]] = [
      newExercises[newIndex],
      newExercises[index],
    ];
    updateDay(activeDay, { exercises: newExercises });
  };

  const updateExercise = (exerciseIndex, config) => {
    const newExercises = [...currentDay.exercises];
    newExercises[exerciseIndex] = {
      ...newExercises[exerciseIndex],
      sets: config.sets,
      reps: config.reps,
      rest: `${config.restSeconds}s`,
    };
    updateDay(activeDay, { exercises: newExercises });
    setEditingExercise(null);
  };

  const existingIds = currentDay.exercises.map((e) => e.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {days.map((day, i) => {
          const hasError = day.exercises.length === 0;
          return (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all relative ${
                activeDay === i
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : hasError
                    ? 'bg-red-500/5 border-red-500/20 text-red-400/80'
                    : 'bg-white/5 border-white/[0.06] text-text-muted hover:text-text-secondary'
              }`}
            >
              Day {i + 1}
              {day.exercises.length > 0 && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({day.exercises.length})
                </span>
              )}
              {hasError && activeDay !== i && (
                <AlertCircle
                  size={10}
                  className="absolute -top-1 -right-1 text-red-400"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Day Title */}
      <div className="mb-4">
        <input
          type="text"
          value={currentDay.title}
          onChange={(e) => updateDay(activeDay, { title: e.target.value })}
          placeholder={`Day ${activeDay + 1} title (e.g., Push, Pull, Legs)`}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.06] rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/30"
        />
      </div>

      {/* Exercise List */}
      <div className="space-y-2 mb-4">
        <AnimatePresence mode="popLayout">
          {currentDay.exercises.map((exercise, i) => (
            <motion.div
              key={exercise.id + '-' + i}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex items-center gap-2 p-3 bg-dark-card border border-white/[0.06] rounded-xl group"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveExercise(i, -1)}
                  disabled={i === 0}
                  className="p-0.5 text-text-muted/40 hover:text-text-secondary disabled:opacity-20"
                >
                  <ChevronUp size={12} />
                </button>
                <GripVertical
                  size={12}
                  className="text-text-muted/20 mx-auto"
                />
                <button
                  onClick={() => moveExercise(i, 1)}
                  disabled={i === currentDay.exercises.length - 1}
                  className="p-0.5 text-text-muted/40 hover:text-text-secondary disabled:opacity-20"
                >
                  <ChevronDown size={12} />
                </button>
              </div>

              {/* Exercise Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {exercise.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-accent/70">
                    {exercise.muscle}
                  </span>
                  <span className="text-xs text-text-muted">
                    {exercise.sets}×{exercise.reps}
                  </span>
                  <span className="text-xs text-text-muted/60">
                    {exercise.rest} rest
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    setEditingExercise({
                      dayIndex: activeDay,
                      exerciseIndex: i,
                    })
                  }
                  className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-accent transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => removeExercise(i)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {currentDay.exercises.length === 0 && (
          <div className="text-center py-10 border border-dashed border-white/[0.08] rounded-xl">
            <Dumbbell
              size={28}
              className="mx-auto text-text-muted/20 mb-3"
            />
            <p className="text-sm text-text-muted mb-1">No exercises yet</p>
            <p className="text-xs text-text-muted/60">
              Add at least 1 exercise to this day
            </p>
          </div>
        )}
      </div>

      {/* Add Button */}
      {currentDay.exercises.length < MAX_EXERCISES && (
        <button
          onClick={() => setShowSearch(true)}
          className="w-full py-3 rounded-xl text-sm font-medium border border-dashed border-accent/20 text-accent/80 bg-accent/[0.03] hover:bg-accent/[0.06] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add Exercise
          <span className="text-xs text-text-muted ml-1">
            ({currentDay.exercises.length}/{MAX_EXERCISES})
          </span>
        </button>
      )}

      {currentDay.exercises.length >= MAX_EXERCISES && (
        <p className="text-center text-xs text-yellow-500/70 mt-2">
          Maximum {MAX_EXERCISES} exercises per day reached
        </p>
      )}

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <ExerciseSearchModal
            onAdd={addExercise}
            onClose={() => setShowSearch(false)}
            existingIds={existingIds}
          />
        )}
      </AnimatePresence>

      {/* Edit Config Modal */}
      <AnimatePresence>
        {editingExercise && (
          <ExerciseConfigModal
            exercise={{
              ...days[editingExercise.dayIndex].exercises[
                editingExercise.exerciseIndex
              ],
              restSeconds:
                parseInt(
                  days[editingExercise.dayIndex].exercises[
                    editingExercise.exerciseIndex
                  ].rest
                ) || 60,
            }}
            isEditing
            onConfirm={(config) =>
              updateExercise(editingExercise.exerciseIndex, config)
            }
            onClose={() => setEditingExercise(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
