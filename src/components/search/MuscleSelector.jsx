import { useState } from 'react';

const BODY_OUTLINE_FRONT = 'M 120 40 C 120 20 180 20 180 40 C 180 60 165 70 150 70 C 135 70 120 60 120 40 Z M 135 70 L 130 90 L 170 90 L 165 70 Z M 130 90 C 80 95 60 110 40 140 C 30 180 30 250 50 340 L 65 340 C 55 260 60 180 85 180 C 85 240 100 300 120 310 L 120 580 C 100 590 100 600 120 600 L 140 600 L 145 320 L 155 320 L 160 600 L 180 600 C 200 600 200 590 180 580 L 180 310 C 200 300 215 240 215 180 C 240 180 245 260 235 340 L 250 340 C 270 250 270 180 260 140 C 240 110 220 95 170 90 Z';

const BODY_OUTLINE_BACK = 'M 120 40 C 120 20 180 20 180 40 C 180 60 165 70 150 70 C 135 70 120 60 120 40 Z M 135 70 L 130 90 L 170 90 L 165 70 Z M 130 90 C 80 95 60 110 40 140 C 30 180 30 250 50 340 L 65 340 C 55 260 60 180 85 180 C 85 240 100 300 120 310 L 120 580 C 100 590 100 600 120 600 L 140 600 L 145 320 L 155 320 L 160 600 L 180 600 C 200 600 200 590 180 580 L 180 310 C 200 300 215 240 215 180 C 240 180 245 260 235 340 L 250 340 C 270 250 270 180 260 140 C 240 110 220 95 170 90 Z';

const FRONT_MUSCLES = [
  {
    name: 'Chest',
    path: 'M 148 110 C 110 110 90 120 90 150 C 90 180 120 185 148 185 Z M 152 110 C 190 110 210 120 210 150 C 210 180 180 185 152 185 Z',
  },
  {
    name: 'Shoulders',
    path: 'M 90 100 C 60 105 45 130 45 160 C 45 190 65 200 85 170 C 85 140 90 120 90 100 Z M 210 100 C 240 105 255 130 255 160 C 255 190 235 200 215 170 C 215 140 210 120 210 100 Z',
  },
  {
    name: 'Biceps',
    path: 'M 45 165 C 35 195 35 230 55 250 C 65 230 75 190 60 165 Z M 255 165 C 265 195 265 230 245 250 C 235 230 225 190 240 165 Z',
  },
  {
    name: 'Forearms',
    path: 'M 53 255 C 33 290 33 320 48 340 C 63 320 68 290 60 255 Z M 247 255 C 267 290 267 320 252 340 C 237 320 232 290 240 255 Z',
  },
  {
    name: 'Abs',
    path: 'M 135 190 C 135 230 140 285 150 295 C 160 285 165 230 165 190 C 150 195 150 195 135 190 Z',
  },
  {
    name: 'Obliques',
    path: 'M 90 190 C 80 230 90 280 125 290 C 125 250 110 210 90 190 Z M 210 190 C 220 230 210 280 175 290 C 175 250 190 210 210 190 Z',
  },
  {
    name: 'Quads',
    path: 'M 135 310 C 105 310 85 390 95 460 C 120 460 140 400 143 310 Z M 165 310 C 195 310 215 390 205 460 C 180 460 160 400 157 310 Z',
  },
  {
    name: 'Calves',
    path: 'M 97 470 C 75 510 85 560 105 585 C 115 560 125 510 115 470 Z M 203 470 C 225 510 215 560 195 585 C 185 560 175 510 185 470 Z',
  },
];

const BACK_MUSCLES = [
  {
    name: 'Back',
    path: 'M 150 95 C 120 105 100 150 90 200 C 110 260 135 290 148 295 C 152 295 165 295 165 295 C 165 295 190 260 210 200 C 200 150 180 105 150 95 Z',
  },
  {
    name: 'Rear Delts',
    path: 'M 90 100 C 60 105 45 130 45 160 C 45 190 65 200 85 170 C 85 140 90 120 90 100 Z M 210 100 C 240 105 255 130 255 160 C 255 190 235 200 215 170 C 215 140 210 120 210 100 Z',
  },
  {
    name: 'Triceps',
    path: 'M 45 160 C 30 190 40 235 55 250 C 70 210 65 175 65 160 Z M 255 160 C 270 190 260 235 245 250 C 230 210 235 175 235 160 Z',
  },
  {
    name: 'Forearms',
    path: 'M 53 255 C 33 290 33 320 48 340 C 63 320 68 290 60 255 Z M 247 255 C 267 290 267 320 252 340 C 237 320 232 290 240 255 Z',
  },
  {
    name: 'Glutes',
    path: 'M 148 295 C 110 295 90 325 100 365 C 120 375 140 355 148 355 Z M 152 295 C 190 295 210 325 200 365 C 180 375 160 355 152 355 Z',
  },
  {
    name: 'Hamstrings',
    path: 'M 100 375 C 90 415 100 445 105 455 C 125 445 135 415 140 375 Z M 200 375 C 210 415 200 445 195 455 C 175 445 165 415 160 375 Z',
  },
  {
    name: 'Calves',
    path: 'M 97 470 C 75 510 85 560 105 585 C 115 560 125 510 115 470 Z M 203 470 C 225 510 215 560 195 585 C 185 560 175 510 185 470 Z',
  },
];

// Label positions for the 300x600 viewBox
const FRONT_LABELS = {
  Chest: { x: 150, y: 150 },
  Shoulders: { x: 52, y: 140 },
  Biceps: { x: 40, y: 210 },
  Forearms: { x: 38, y: 300 },
  Abs: { x: 150, y: 245 },
  Obliques: { x: 95, y: 240 },
  Quads: { x: 150, y: 390 },
  Calves: { x: 150, y: 530 },
};

const BACK_LABELS = {
  Back: { x: 150, y: 200 },
  'Rear Delts': { x: 52, y: 140 },
  Triceps: { x: 40, y: 210 },
  Forearms: { x: 38, y: 300 },
  Glutes: { x: 150, y: 335 },
  Hamstrings: { x: 150, y: 420 },
  Calves: { x: 150, y: 530 },
};

function MuscleGroup({ name, path, isSelected, onSelect }) {
  return (
    <path
      d={path}
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'fill-[#09cadb]/35 stroke-[#09cadb] stroke-[2]'
          : 'fill-white/[0.08] stroke-white/20 stroke-[0.8] hover:fill-[#09cadb]/15 hover:stroke-[#09cadb]/50'
      }`}
      onClick={() => onSelect(name)}
    >
      <title>{name}</title>
    </path>
  );
}

export default function MuscleSelector({ selectedMuscle, onSelectMuscle }) {
  const [view, setView] = useState('front');

  const muscles = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;
  const labels = view === 'front' ? FRONT_LABELS : BACK_LABELS;
  const bodyOutline = view === 'front' ? BODY_OUTLINE_FRONT : BODY_OUTLINE_BACK;

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
        viewBox="0 0 300 600"
        className="w-full max-w-[240px] h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body outline */}
        <path
          d={bodyOutline}
          className="fill-white/[0.03] stroke-white/10 stroke-[1]"
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
            className={`text-[10px] font-medium pointer-events-none select-none ${
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
