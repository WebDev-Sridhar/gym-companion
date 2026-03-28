import { useState } from 'react';

const FRONT_MUSCLES = [
  {
    name: 'Traps',
    path: 'M 128,75 Q 140,68 150,72 L 150,85 Q 140,80 128,82 Z M 172,75 Q 160,68 150,72 L 150,85 Q 160,80 172,82 Z',
  },
  {
    name: 'Shoulders',
    path: 'M 118,85 Q 108,88 105,100 L 112,108 Q 118,95 125,88 Z M 182,85 Q 192,88 195,100 L 188,108 Q 182,95 175,88 Z',
  },
  {
    name: 'Chest',
    path: 'M 125,88 Q 150,82 175,88 L 175,110 Q 150,115 125,110 Z',
  },
  {
    name: 'Biceps',
    path: 'M 105,110 Q 100,125 102,145 L 112,145 Q 115,125 112,110 Z M 195,110 Q 200,125 198,145 L 188,145 Q 185,125 188,110 Z',
  },
  {
    name: 'Forearms',
    path: 'M 102,148 Q 98,168 100,185 L 108,185 Q 112,168 112,148 Z M 198,148 Q 202,168 200,185 L 192,185 Q 188,168 188,148 Z',
  },
  {
    name: 'Abs',
    path: 'M 135,112 Q 150,108 165,112 L 165,160 Q 150,165 135,160 Z',
  },
  {
    name: 'Obliques',
    path: 'M 120,112 L 135,112 L 135,160 L 120,155 Z M 180,112 L 165,112 L 165,160 L 180,155 Z',
  },
  {
    name: 'Quads',
    path: 'M 122,170 Q 125,165 140,168 L 140,230 Q 130,235 125,230 Q 120,210 122,170 Z M 178,170 Q 175,165 160,168 L 160,230 Q 170,235 175,230 Q 180,210 178,170 Z',
  },
  {
    name: 'Calves',
    path: 'M 125,245 Q 128,240 138,242 L 136,290 Q 130,295 126,290 Q 123,270 125,245 Z M 175,245 Q 172,240 162,242 L 164,290 Q 170,295 174,290 Q 177,270 175,245 Z',
  },
];

const BACK_MUSCLES = [
  {
    name: 'Traps',
    path: 'M 128,75 Q 140,68 150,72 L 150,90 Q 140,85 128,87 Z M 172,75 Q 160,68 150,72 L 150,90 Q 160,85 172,87 Z',
  },
  {
    name: 'Rear Delts',
    path: 'M 118,85 Q 108,88 105,100 L 112,108 Q 118,95 125,88 Z M 182,85 Q 192,88 195,100 L 188,108 Q 182,95 175,88 Z',
  },
  {
    name: 'Back',
    path: 'M 125,90 Q 150,85 175,90 L 175,145 Q 150,152 125,145 Z',
  },
  {
    name: 'Triceps',
    path: 'M 105,110 Q 100,125 102,145 L 112,145 Q 115,125 112,110 Z M 195,110 Q 200,125 198,145 L 188,145 Q 185,125 188,110 Z',
  },
  {
    name: 'Forearms',
    path: 'M 102,148 Q 98,168 100,185 L 108,185 Q 112,168 112,148 Z M 198,148 Q 202,168 200,185 L 192,185 Q 188,168 188,148 Z',
  },
  {
    name: 'Glutes',
    path: 'M 122,150 Q 150,145 178,150 L 178,175 Q 150,180 122,175 Z',
  },
  {
    name: 'Hamstrings',
    path: 'M 122,178 Q 125,175 140,177 L 140,235 Q 130,240 125,235 Q 120,215 122,178 Z M 178,178 Q 175,175 160,177 L 160,235 Q 170,240 175,235 Q 180,215 178,178 Z',
  },
  {
    name: 'Calves',
    path: 'M 125,245 Q 128,240 138,242 L 136,290 Q 130,295 126,290 Q 123,270 125,245 Z M 175,245 Q 172,240 162,242 L 164,290 Q 170,295 174,290 Q 177,270 175,245 Z',
  },
];

// Body outline (silhouette)
const BODY_OUTLINE = 'M 150,20 Q 140,20 135,28 Q 130,38 132,50 Q 134,60 140,65 Q 145,70 150,70 Q 155,70 160,65 Q 166,60 168,50 Q 170,38 165,28 Q 160,20 150,20 Z M 150,72 Q 125,72 118,85 Q 108,85 102,100 Q 96,118 98,140 Q 99,155 100,165 Q 100,175 102,185 Q 104,190 108,190 Q 108,185 107,175 Q 106,165 108,155 L 118,155 L 118,165 Q 120,170 122,170 Q 122,195 124,220 Q 126,238 128,245 Q 126,250 125,260 Q 124,275 126,290 Q 128,300 132,305 Q 136,308 140,305 Q 138,298 137,290 Q 136,278 137,265 Q 138,255 140,245 Q 140,238 142,230 L 150,230 Q 150,230 158,230 Q 160,238 160,245 Q 162,255 163,265 Q 164,278 163,290 Q 162,298 160,305 Q 164,308 168,305 Q 172,300 174,290 Q 176,275 175,260 Q 174,250 172,245 Q 174,238 176,220 Q 178,195 178,170 Q 180,170 182,165 L 182,155 L 192,155 Q 194,165 193,175 Q 192,185 192,190 Q 196,190 198,185 Q 200,175 200,165 Q 201,155 202,140 Q 204,118 198,100 Q 192,85 182,85 Q 175,72 150,72 Z';

function MuscleGroup({ name, path, isSelected, onSelect }) {
  return (
    <path
      d={path}
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'fill-[#09cadb]/35 stroke-[#09cadb] stroke-[1.5]'
          : 'fill-white/[0.08] stroke-white/20 stroke-[0.5] hover:fill-[#09cadb]/15 hover:stroke-[#09cadb]/50'
      }`}
      onClick={() => onSelect(name)}
    >
      <title>{name}</title>
    </path>
  );
}

// Muscle label positions
const FRONT_LABELS = {
  Traps: { x: 150, y: 73 },
  Shoulders: { x: 98, y: 95 },
  Chest: { x: 150, y: 100 },
  Biceps: { x: 96, y: 128 },
  Forearms: { x: 93, y: 167 },
  Abs: { x: 150, y: 137 },
  Obliques: { x: 120, y: 137 },
  Quads: { x: 150, y: 200 },
  Calves: { x: 150, y: 268 },
};

const BACK_LABELS = {
  Traps: { x: 150, y: 78 },
  'Rear Delts': { x: 98, y: 95 },
  Back: { x: 150, y: 118 },
  Triceps: { x: 96, y: 128 },
  Forearms: { x: 93, y: 167 },
  Glutes: { x: 150, y: 163 },
  Hamstrings: { x: 150, y: 207 },
  Calves: { x: 150, y: 268 },
};

export default function MuscleSelector({ selectedMuscle, onSelectMuscle }) {
  const [view, setView] = useState('front');

  const muscles = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;
  const labels = view === 'front' ? FRONT_LABELS : BACK_LABELS;

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

      {/* SVG Body */}
      <svg
        viewBox="65 10 170 310"
        className="w-full max-w-[220px] h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body outline */}
        <path
          d={BODY_OUTLINE}
          className="fill-white/[0.03] stroke-white/10 stroke-[0.8]"
        />

        {/* Muscle groups */}
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
            className={`text-[5px] font-medium pointer-events-none select-none ${
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
          <button
            onClick={() => onSelectMuscle(null)}
            className="text-[10px] text-white/40 hover:text-white/60 underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
