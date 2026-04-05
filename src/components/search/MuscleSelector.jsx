import { useState } from 'react';
import {
  FRONT_INTERACTIVE_MUSCLES,
  BACK_INTERACTIVE_MUSCLES,
  FRONT_DECORATIVE_PATHS,
  BACK_DECORATIVE_PATHS,
  FEMALE_FRONT_MUSCLES,
  FEMALE_BACK_MUSCLES,
  FEMALE_FRONT_DECORATIVE,
  FEMALE_BACK_DECORATIVE,
  VIEWBOX,
  FRONT_LABELS,
  BACK_LABELS,
  FEMALE_FRONT_LABELS,
  FEMALE_BACK_LABELS,
  BODY_OUTLINES,
} from '../../data/anatomyPaths';

const DATA = {
  male: {
    front: { muscles: FRONT_INTERACTIVE_MUSCLES, decorative: FRONT_DECORATIVE_PATHS, labels: FRONT_LABELS },
    back:  { muscles: BACK_INTERACTIVE_MUSCLES,  decorative: BACK_DECORATIVE_PATHS,  labels: BACK_LABELS },
  },
  female: {
    front: { muscles: FEMALE_FRONT_MUSCLES, decorative: FEMALE_FRONT_DECORATIVE, labels: FEMALE_FRONT_LABELS },
    back:  { muscles: FEMALE_BACK_MUSCLES,  decorative: FEMALE_BACK_DECORATIVE,  labels: FEMALE_BACK_LABELS },
  },
};

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
  const [gender, setGender] = useState('male');
  const [view, setView] = useState('front');

  const { muscles, decorative, labels } = DATA[gender][view];
  const viewBox = VIEWBOX[gender][view];

  const handleSelect = (name) => {
    onSelectMuscle(selectedMuscle === name ? null : name);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Gender toggle */}
      <div className="flex gap-1 mb-2 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
        {['male', 'female'].map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
              gender === g
                ? 'bg-[#09cadb]/20 text-[#09cadb] border border-[#09cadb]/30'
                : 'text-white/40 hover:text-white/60 border border-transparent'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

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

      {/* SVG Body Map — fixed height so toggles don't resize container */}
      <div className="w-full max-w-[360px]" style={{ height: 580 }}>
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body outline silhouette (base layer) */}
        <path
          d={BODY_OUTLINES[gender][view]}
          fill="none"
          className="stroke-white/15 stroke-[2]"
        />

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
      </div>

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
