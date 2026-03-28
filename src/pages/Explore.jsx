import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Dumbbell, Zap, Target, ChevronDown, ChevronUp } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import SearchBar from '../components/search/SearchBar';
import MuscleSelector from '../components/search/MuscleSelector';
import WorkoutCard from '../components/search/WorkoutCard';
import Pagination from '../components/search/Pagination';
import useWorkoutSearch from '../hooks/useWorkoutSearch';

const equipmentOptions = [
  { label: 'Barbell & Dumbbell', icon: Dumbbell },
  { label: 'Machine & Cable', icon: Zap },
  { label: 'Bodyweight', icon: Target },
];

const difficultyOptions = ['beginner', 'intermediate', 'advanced'];

const difficultyColors = {
  beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  intermediate: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  advanced: 'bg-red-500/15 text-red-400 border-red-500/25',
};

export default function Explore() {
  const {
    query,
    setQuery,
    selectedMuscle,
    setSelectedMuscle,
    selectedEquipment,
    setSelectedEquipment,
    selectedDifficulty,
    setSelectedDifficulty,
    suggestions,
    paginatedResults,
    totalResults,
    currentPage,
    setCurrentPage,
    totalPages,
    clearFilters,
  } = useWorkoutSearch();

  const [showMuscleSelector, setShowMuscleSelector] = useState(false);
  const hasFilters = selectedMuscle || selectedEquipment || selectedDifficulty || query;

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Explore{' '}
            <span className="bg-gradient-to-r from-[#09cadb] to-[#09cadb]/60 bg-clip-text text-transparent">
              Workouts
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Search 411+ exercises with video demonstrations
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar
            query={query}
            setQuery={setQuery}
            suggestions={suggestions}
            onSelectSuggestion={(workout) => setQuery(workout.name)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Equipment filters */}
          {equipmentOptions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() =>
                setSelectedEquipment(selectedEquipment === label ? null : label)
              }
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                selectedEquipment === label
                  ? 'bg-[#09cadb]/15 text-[#09cadb] border-[#09cadb]/30'
                  : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:text-white/60 hover:border-white/[0.1]'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}

          <div className="w-px h-6 bg-white/[0.06] self-center mx-1" />

          {/* Difficulty filters */}
          {difficultyOptions.map((diff) => (
            <button
              key={diff}
              onClick={() =>
                setSelectedDifficulty(selectedDifficulty === diff ? null : diff)
              }
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all capitalize ${
                selectedDifficulty === diff
                  ? difficultyColors[diff]
                  : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:text-white/60 hover:border-white/[0.1]'
              }`}
            >
              {diff}
            </button>
          ))}

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50 px-2 py-1.5 transition-colors"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>

        {/* Main Layout */}
        <div className="grid md:grid-cols-[240px_1fr] gap-6">
          {/* Left: Muscle Selector */}
          <div>
            {/* Mobile toggle */}
            <button
              onClick={() => setShowMuscleSelector(!showMuscleSelector)}
              className="md:hidden w-full flex items-center justify-between px-4 py-3 mb-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/60"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={14} />
                Muscle Selector
                {selectedMuscle && (
                  <span className="text-xs text-[#09cadb]">({selectedMuscle})</span>
                )}
              </span>
              {showMuscleSelector ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {/* Desktop: always visible / Mobile: toggle */}
            <div
              className={`${
                showMuscleSelector ? 'block' : 'hidden'
              } md:block md:sticky md:top-20`}
            >
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                  Target Muscle
                </h3>
                <MuscleSelector
                  selectedMuscle={selectedMuscle}
                  onSelectMuscle={setSelectedMuscle}
                />
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div>
            {/* Results count */}
            <p className="text-xs text-white/30 mb-4">
              {totalResults} exercise{totalResults !== 1 ? 's' : ''} found
            </p>

            {/* Results grid */}
            {paginatedResults.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginatedResults.map((workout) => (
                    <WorkoutCard key={workout.id} workout={workout} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search size={40} className="text-white/10 mb-4" />
                <p className="text-white/40 text-sm mb-1">No exercises found</p>
                <p className="text-white/20 text-xs mb-4">
                  Try a different search or clear filters
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#09cadb] hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </PageWrapper>
  );
}
