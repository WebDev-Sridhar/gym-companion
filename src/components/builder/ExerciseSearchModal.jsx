import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Dumbbell } from 'lucide-react';
import useWorkoutSearch from '../../hooks/useWorkoutSearch';
import { exercises as exerciseDB, getExercisesByMuscle } from '../../data/exercises';
import ExerciseConfigModal from './ExerciseConfigModal';

// Map a searchWorkout result back to exercises.js for full data
function mapToExerciseData(searchResult) {
  const entry = Object.entries(exerciseDB).find(
    ([, ex]) => ex.id === searchResult.id
  );
  if (entry) {
    const [key, ex] = entry;
    return { ...ex, exerciseKey: key, _source: 'db' };
  }
  // Not in exercises.js — treat as external
  return {
    id: searchResult.id,
    exerciseKey: null,
    name: searchResult.name,
    muscle: searchResult.targetMuscle,
    sets: 3,
    reps: '10-12',
    rest: '60s',
    difficulty: searchResult.difficulty || 'intermediate',
    alternatives: getExercisesByMuscle(searchResult.targetMuscle || '')
      .slice(0, 3)
      .map((e) => e.key),
    videoId: searchResult.videoId || null,
    gifUrl: null,
    instructions: searchResult.instructions
      ? searchResult.instructions.join(' ')
      : `Perform ${searchResult.name} with controlled form and full range of motion.`,
    donts: [],
    isCustom: true,
    _source: 'search',
  };
}

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs',
];

export default function ExerciseSearchModal({ onAdd, onClose, existingIds }) {
  const {
    query,
    setQuery,
    selectedMuscle,
    setSelectedMuscle,
    paginatedResults,
    totalResults,
    currentPage,
    setCurrentPage,
    totalPages,
    clearFilters,
  } = useWorkoutSearch();

  const [configExercise, setConfigExercise] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState('Chest');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleSelect = (workout) => {
    const mapped = mapToExerciseData(workout);
    setConfigExercise({
      ...mapped,
      sets: mapped.sets || 3,
      reps: mapped.reps || '10-12',
      restSeconds: parseInt(mapped.rest) || 60,
    });
  };

  const handleConfigConfirm = (config) => {
    if (!configExercise) return;
    const exercise = {
      ...configExercise,
      sets: config.sets,
      reps: config.reps,
      rest: `${config.restSeconds}s`,
    };
    delete exercise._source;
    delete exercise.restSeconds;
    onAdd(exercise);
    setConfigExercise(null);
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;
    const customExercise = {
      id: `custom-${Date.now()}`,
      exerciseKey: null,
      name: customName.trim(),
      muscle: customMuscle,
      sets: 3,
      reps: '10-12',
      rest: '60s',
      restSeconds: 60,
      difficulty: 'intermediate',
      alternatives: getExercisesByMuscle(customMuscle)
        .slice(0, 3)
        .map((e) => e.key),
      videoId: null,
      gifUrl: null,
      instructions: `Perform ${customName.trim()} with controlled form and full range of motion.`,
      donts: [],
      isCustom: true,
    };
    setConfigExercise(customExercise);
    setShowCustomForm(false);
  };

  const isDuplicate = (id) => existingIds?.includes(id);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-lg h-[85vh] sm:h-[80vh] bg-dark-card border border-white/[0.06] rounded-t-2xl sm:rounded-2xl flex flex-col relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <h3 className="text-base font-bold text-text-primary">Add Exercise</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exercises..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/[0.06] rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/30"
                autoFocus
              />
            </div>

            {/* Muscle chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {MUSCLE_GROUPS.map((muscle) => (
                <button
                  key={muscle}
                  onClick={() =>
                    setSelectedMuscle(selectedMuscle === muscle ? null : muscle)
                  }
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedMuscle === muscle
                      ? 'bg-accent/10 border-accent/30 text-accent'
                      : 'bg-white/5 border-white/[0.06] text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {paginatedResults.length > 0 ? (
              paginatedResults.map((workout) => {
                const dup = isDuplicate(workout.id);
                return (
                  <button
                    key={workout.id}
                    onClick={() => !dup && handleSelect(workout)}
                    disabled={dup}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      dup
                        ? 'border-white/[0.03] bg-white/[0.02] opacity-40 cursor-not-allowed'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-accent/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {workout.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-accent/80">
                            {workout.targetMuscle}
                          </span>
                          {workout.equipment && (
                            <span className="text-xs text-text-muted">
                              {workout.equipment}
                            </span>
                          )}
                          {dup && (
                            <span className="text-xs text-yellow-500/80">
                              Already added
                            </span>
                          )}
                        </div>
                      </div>
                      {!dup && (
                        <Plus
                          size={16}
                          className="text-accent/60 flex-shrink-0 ml-2"
                        />
                      )}
                    </div>
                  </button>
                );
              })
            ) : query || selectedMuscle ? (
              <div className="text-center py-12">
                <Dumbbell size={24} className="mx-auto text-text-muted/30 mb-3" />
                <p className="text-sm text-text-muted">No exercises found</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search size={24} className="mx-auto text-text-muted/30 mb-3" />
                <p className="text-sm text-text-muted">
                  Search or pick a muscle group
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/[0.06] text-text-muted disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="text-xs text-text-muted">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/[0.06] text-text-muted disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}

            {totalResults > 0 && (
              <p className="text-center text-xs text-text-muted pt-1">
                {totalResults} exercise{totalResults !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Custom Exercise Toggle */}
          <div className="p-4 border-t border-white/[0.06]">
            {showCustomForm ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Exercise name"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/[0.06] rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/30"
                />
                <div className="flex gap-2">
                  <select
                    value={customMuscle}
                    onChange={(e) => setCustomMuscle(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white/5 border border-white/[0.06] rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent/30"
                  >
                    {MUSCLE_GROUPS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleCustomAdd}
                    disabled={!customName.trim()}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold btn-primary disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="w-full text-xs text-text-muted hover:text-text-secondary"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-accent/80 border border-accent/15 bg-accent/[0.04] hover:bg-accent/[0.08] transition-colors"
              >
                + Add Custom Exercise
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Config Modal (overlays search modal) */}
      {configExercise && (
        <ExerciseConfigModal
          exercise={configExercise}
          onConfirm={handleConfigConfirm}
          onClose={() => setConfigExercise(null)}
        />
      )}
    </>
  );
}
