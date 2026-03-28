import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { allExercises } from '../data/exerciseDatabase';

const PAGE_SIZE = 6;
const DEBOUNCE_MS = 300;

const SYNONYMS = {
  chest: ['pec', 'pectoral', 'bench', 'pecs'],
  back: ['lat', 'lats', 'latissimus', 'row', 'pull'],
  shoulders: ['delts', 'deltoid', 'shoulder'],
  biceps: ['bis', 'curls', 'guns', 'bicep'],
  triceps: ['tris', 'pushdown', 'tricep'],
  abs: ['core', 'abdominal', 'six pack', 'stomach', 'ab'],
  quads: ['legs', 'quadriceps', 'lower body', 'quad'],
  hamstrings: ['hammies', 'hamstring', 'ham'],
  glutes: ['butt', 'booty', 'hip thrust', 'glute'],
  calves: ['calf'],
  traps: ['trapezius', 'trap'],
  forearms: ['forearm', 'wrist', 'grip'],
  obliques: ['oblique', 'side abs'],
  'rear delts': ['rear deltoid', 'posterior deltoid'],
  hips: ['hip', 'adductor', 'abductor'],
  'full body': ['compound', 'total body', 'cardio'],
};

function expandQuery(query) {
  const lower = query.toLowerCase().trim();
  const tokens = new Set(lower.split(/\s+/));

  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    const allTerms = [key, ...synonyms];
    for (const term of allTerms) {
      if (lower.includes(term)) {
        allTerms.forEach(t => tokens.add(t));
        break;
      }
    }
  }

  return tokens;
}

function scoreWorkout(workout, query) {
  if (!query) return 0;

  const normalizedQuery = query.toLowerCase().trim();
  const tokens = expandQuery(query);
  const nameLower = workout.name.toLowerCase();
  const muscleLower = workout.muscle.toLowerCase();

  let score = 0;

  // Exact name match
  if (nameLower === normalizedQuery) {
    score += 5;
  } else if (nameLower.includes(normalizedQuery)) {
    score += 4;
  }

  // Muscle match
  for (const token of tokens) {
    if (muscleLower === token || muscleLower.includes(token)) {
      score += 3;
      break;
    }
  }

  // Keyword matches
  for (const kw of workout.keywords) {
    for (const token of tokens) {
      if (kw.includes(token) || token.includes(kw)) {
        score += 2;
        break;
      }
    }
  }

  // Alias matches
  for (const alias of workout.aliases) {
    for (const token of tokens) {
      if (alias.includes(token)) {
        score += 1;
        break;
      }
    }
  }

  return score;
}

export default function useWorkoutSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const debounceRef = useRef(null);

  // Debounce query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMuscle, selectedEquipment, selectedDifficulty]);

  // Filter and score
  const { results, suggestions } = useMemo(() => {
    let filtered = allExercises;

    // Apply muscle filter
    if (selectedMuscle) {
      filtered = filtered.filter(w => w.muscle === selectedMuscle);
    }

    // Apply equipment filter
    if (selectedEquipment) {
      filtered = filtered.filter(w => w.equipment === selectedEquipment);
    }

    // Apply difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(w => w.difficulty === selectedDifficulty);
    }

    // Apply search scoring
    if (debouncedQuery.trim()) {
      const scored = filtered
        .map(w => ({ workout: w, score: scoreWorkout(w, debouncedQuery) }))
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score);

      return {
        results: scored.map(s => s.workout),
        suggestions: scored.slice(0, 8).map(s => s.workout),
      };
    }

    return {
      results: filtered,
      suggestions: [],
    };
  }, [debouncedQuery, selectedMuscle, selectedEquipment, selectedDifficulty]);

  // Live suggestions (not debounced, for instant feedback)
  const liveSuggestions = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];

    const scored = allExercises
      .map(w => ({ workout: w, score: scoreWorkout(w, query) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    return scored.map(s => s.workout);
  }, [query]);

  const totalResults = results.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const paginatedResults = results.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const clearFilters = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedMuscle(null);
    setSelectedEquipment(null);
    setSelectedDifficulty(null);
    setCurrentPage(1);
  }, []);

  return {
    query,
    setQuery,
    selectedMuscle,
    setSelectedMuscle,
    selectedEquipment,
    setSelectedEquipment,
    selectedDifficulty,
    setSelectedDifficulty,
    suggestions: liveSuggestions,
    paginatedResults,
    totalResults,
    currentPage,
    setCurrentPage,
    totalPages,
    clearFilters,
  };
}
