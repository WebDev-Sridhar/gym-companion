import { useState } from 'react';
import {
  FRONT_INTERACTIVE_MUSCLES,
  BACK_INTERACTIVE_MUSCLES,
  FRONT_DECORATIVE_PATHS,
  BACK_DECORATIVE_PATHS,
  FRONT_LABELS,
  BACK_LABELS,
} from '../../data/anatomyPaths';

function MuscleGroup({ name, path, isSelected, onSelect }) {
  return (
    <path
      d={path}
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'fill-[#09cadb]/35 stroke-[#09cadb] stroke-[4]'
          : 'fill-white/[0.08] stroke-white/20 stroke-[1.5] hover:fill-[#09cadb]/15 hover:stroke-[#09cadb]/50'
      }`}
      onClick={() => onSelect(name)}
    >
      <title>{name}</title>
    </path>
  );
}

export default function MuscleSelector({ selectedMuscle, onSelectMuscle }) {
  const [view, setView] = useState('front');

  const muscles = view === 'front' ? FRONT_INTERACTIVE_MUSCLES : BACK_INTERACTIVE_MUSCLES;
  const decorative = view === 'front' ? FRONT_DECORATIVE_PATHS : BACK_DECORATIVE_PATHS;
  const labels = view === 'front' ? FRONT_LABELS : BACK_LABELS;
  const viewBox = view === 'front' ? '0 0 724 1448' : '724 0 724 1448';

  const handleSelect = (name) => {
    onSelectMuscle(selectedMuscle === name ? null : name);
  };

  return (
    <div className="flex flex-col items-center">
      {/* View toggle */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
        {['front', 'back'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
              view === v
                ? 'bg-[#09cadb]/20 text-[#09cadb] border border-[#09cadb]/30'
                : 'text-white/40 hover:text-white/60 border border-transparent'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* SVG Body Map */}
      <svg
        viewBox={viewBox}
        className="w-full max-w-[240px] h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Decorative body parts (non-interactive base layer) */}
        {decorative.map((d, i) => (
          <path
            key={`dec-${i}`}
            d={d}
            className="fill-white/[0.04] stroke-white/[0.08] stroke-[1]"
          />
        ))}

        {/* Interactive muscle groups */}
        {muscles.map((m) => (
          <MuscleGroup
            key={m.name}
            name={m.name}
            path={m.path}
            isSelected={selectedMuscle === m.name}
            onSelect={handleSelect}
          />
        ))}

        {/* Labels */}
        {Object.entries(labels).map(([name, pos]) => (
          <text
            key={name}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            className={`text-[22px] font-medium pointer-events-none select-none ${
              selectedMuscle === name ? 'fill-[#09cadb]' : 'fill-white/30'
            }`}
          >
            {name}
          </text>
        ))}
      </svg>

      {/* Active muscle indicator */}
      {selectedMuscle && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-[#09cadb] font-medium">
            Filtering: {selectedMuscle}
          </span>
          <button onClick={() => onSelectMuscle(null)} className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition">
  Clear
</button>
        </div>
      )}
    </div>
  );
}
