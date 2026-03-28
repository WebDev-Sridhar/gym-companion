import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ query, setQuery, suggestions, onSelectSuggestion }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (workout) => {
    onSelectSuggestion(workout);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search exercises... (e.g., bench press, biceps, chest workout)"
          className="w-full pl-11 pr-10 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#09cadb]/40 focus:ring-1 focus:ring-[#09cadb]/20 transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} className="text-white/40" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl max-h-80 overflow-y-auto">
          {suggestions.map((workout) => (
            <button
              key={workout.id}
              onClick={() => handleSelect(workout)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors border-b border-white/[0.04] last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{workout.name}</p>
                <p className="text-xs text-white/30 mt-0.5">{workout.equipment}</p>
              </div>
              <span className="flex-shrink-0 ml-3 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#09cadb]/10 text-[#09cadb] border border-[#09cadb]/20">
                {workout.targetMuscle}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
