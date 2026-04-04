import { useState } from 'react';

// ─── BODY OUTLINES (compound paths: torso + right arm + left arm) ───

const BODY_OUTLINE_FRONT = [
  // Head, neck, torso, legs
  'M 150 20',
  'C 166 18 178 24 183 36', 'C 187 46 185 56 179 63',
  'C 174 68 169 72 167 76', 'C 164 80 170 84 186 88',
  'C 206 94 230 102 244 112', 'C 250 118 252 124 248 130',
  'C 242 138 226 142 214 140', 'C 210 140 208 152 206 166',
  'C 202 186 198 206 196 226', 'C 194 242 194 256 196 268',
  'C 198 278 200 288 202 298', 'C 204 310 208 328 212 348',
  'C 216 368 218 388 218 406', 'C 218 416 214 426 212 434',
  'C 208 444 204 452 202 460', 'C 198 478 198 496 200 514',
  'C 202 530 200 542 196 552', 'C 192 560 186 566 178 572',
  'C 170 576 164 576 160 572', 'C 156 568 158 560 162 552',
  'C 168 534 172 512 174 492', 'C 176 472 176 454 172 440',
  'C 170 432 166 422 162 414', 'C 158 396 156 376 154 356',
  'C 152 336 152 320 152 310', 'C 152 306 150 302 148 306',
  'C 148 310 148 320 146 336', 'C 144 356 142 376 138 396',
  'C 134 414 130 426 128 436', 'C 124 450 124 470 126 490',
  'C 128 510 132 532 138 550', 'C 142 558 144 568 140 572',
  'C 136 576 130 576 122 572', 'C 114 566 108 560 104 552',
  'C 100 542 98 530 100 514', 'C 102 496 102 478 98 460',
  'C 96 452 92 444 88 434', 'C 86 426 82 416 82 406',
  'C 82 388 84 368 88 348', 'C 92 328 96 310 98 298',
  'C 100 288 102 278 104 268', 'C 106 256 106 242 104 226',
  'C 102 206 98 186 94 166', 'C 92 152 90 140 86 140',
  'C 74 142 58 138 52 130', 'C 48 124 50 118 56 112',
  'C 70 102 94 94 114 88', 'C 130 84 136 80 133 76',
  'C 131 72 126 68 121 63', 'C 115 56 113 46 117 36',
  'C 122 24 134 18 150 20', 'Z',
  // Right arm
  'M 248 124',
  'C 250 142 250 162 248 182', 'C 246 202 244 218 244 228',
  'C 244 235 246 241 248 247', 'C 250 261 252 278 254 295',
  'C 256 311 254 325 250 335', 'C 248 341 244 345 240 345',
  'C 236 345 233 341 232 335', 'C 231 327 230 315 228 301',
  'C 226 285 224 269 222 255', 'C 220 245 219 237 218 229',
  'C 218 215 218 199 218 183', 'C 218 163 218 145 220 133',
  'C 222 126 234 120 248 124', 'Z',
  // Left arm
  'M 52 124',
  'C 50 142 50 162 52 182', 'C 54 202 56 218 56 228',
  'C 56 235 54 241 52 247', 'C 50 261 48 278 46 295',
  'C 44 311 46 325 50 335', 'C 52 341 56 345 60 345',
  'C 64 345 67 341 68 335', 'C 69 327 70 315 72 301',
  'C 74 285 76 269 78 255', 'C 80 245 81 237 82 229',
  'C 82 215 82 199 82 183', 'C 82 163 82 145 80 133',
  'C 78 126 66 120 52 124', 'Z',
].join(' ');

const BODY_OUTLINE_BACK = BODY_OUTLINE_FRONT;

// ─── FRONT MUSCLES ──────────────────────────────────────────────────

const FRONT_MUSCLES = [
  {
    name: 'Chest',
    path: [
      // Left pec
      'M 148 104 C 136 108 116 116 102 126 C 92 134 90 148 92 160',
      'C 94 170 108 176 124 176 C 138 176 146 168 148 158 Z',
      // Right pec
      'M 152 104 C 164 108 184 116 198 126 C 208 134 210 148 208 160',
      'C 206 170 192 176 176 176 C 162 176 154 168 152 158 Z',
    ].join(' '),
  },
  {
    name: 'Shoulders',
    path: [
      // Left deltoid
      'M 80 96 C 66 102 54 112 50 124 C 48 134 52 142 60 146',
      'C 68 148 76 144 82 138 C 88 132 90 124 90 116 C 90 108 86 100 80 96 Z',
      // Right deltoid
      'M 220 96 C 234 102 246 112 250 124 C 252 134 248 142 240 146',
      'C 232 148 224 144 218 138 C 212 132 210 124 210 116 C 210 108 214 100 220 96 Z',
    ].join(' '),
  },
  {
    name: 'Biceps',
    path: [
      // Left bicep
      'M 76 146 C 72 158 68 174 66 190 C 64 204 66 216 70 224',
      'C 76 220 80 210 82 196 C 84 180 84 162 82 150 C 80 146 78 144 76 146 Z',
      // Right bicep
      'M 224 146 C 228 158 232 174 234 190 C 236 204 234 216 230 224',
      'C 224 220 220 210 218 196 C 216 180 216 162 218 150 C 220 146 222 144 224 146 Z',
    ].join(' '),
  },
  {
    name: 'Forearms',
    path: [
      // Left forearm
      'M 68 228 C 62 248 56 270 52 290 C 48 308 48 322 52 332',
      'C 58 330 64 322 68 308 C 74 290 78 268 80 248 C 80 238 76 230 68 228 Z',
      // Right forearm
      'M 232 228 C 238 248 244 270 248 290 C 252 308 252 322 248 332',
      'C 242 330 236 322 232 308 C 226 290 222 268 220 248 C 220 238 224 230 232 228 Z',
    ].join(' '),
  },
  {
    name: 'Abs',
    path: [
      'M 140 180 C 138 200 138 224 140 248 C 142 268 146 286 150 296',
      'C 154 286 158 268 160 248 C 162 224 162 200 160 180',
      'C 156 178 144 178 140 180 Z',
    ].join(' '),
  },
  {
    name: 'Obliques',
    path: [
      // Left oblique
      'M 108 184 C 106 202 106 224 108 246 C 112 264 120 280 130 288',
      'C 136 282 138 268 138 252 C 140 232 140 210 138 192 C 132 184 120 180 108 184 Z',
      // Right oblique
      'M 192 184 C 194 202 194 224 192 246 C 188 264 180 280 170 288',
      'C 164 282 162 268 162 252 C 160 232 160 210 162 192 C 168 184 180 180 192 184 Z',
    ].join(' '),
  },
  {
    name: 'Quads',
    path: [
      // Left quad
      'M 148 308 C 138 314 120 326 108 342 C 96 360 90 382 88 402',
      'C 86 418 88 430 94 438 C 104 440 120 432 134 418',
      'C 146 404 150 386 150 366 C 150 344 150 324 148 308 Z',
      // Right quad
      'M 152 308 C 162 314 180 326 192 342 C 204 360 210 382 212 402',
      'C 214 418 212 430 206 438 C 196 440 180 432 166 418',
      'C 154 404 150 386 150 366 C 150 344 150 324 152 308 Z',
    ].join(' '),
  },
  {
    name: 'Calves',
    path: [
      // Left calf
      'M 102 454 C 98 468 96 486 98 504 C 100 520 106 534 114 544',
      'C 122 538 128 524 130 508 C 132 492 130 474 126 460 C 120 452 110 450 102 454 Z',
      // Right calf
      'M 198 454 C 202 468 204 486 202 504 C 200 520 194 534 186 544',
      'C 178 538 172 524 170 508 C 168 492 170 474 174 460 C 180 452 190 450 198 454 Z',
    ].join(' '),
  },
];

// ─── BACK MUSCLES ───────────────────────────────────────────────────

const BACK_MUSCLES = [
  {
    name: 'Back',
    path: [
      'M 150 92 C 132 98 112 110 100 128 C 90 146 88 168 92 190',
      'C 96 212 106 234 120 254 C 132 270 142 280 150 284',
      'C 158 280 168 270 180 254 C 194 234 204 212 208 190',
      'C 212 168 210 146 200 128 C 188 110 168 98 150 92 Z',
    ].join(' '),
  },
  {
    name: 'Rear Delts',
    path: [
      // Left rear delt
      'M 80 96 C 66 102 54 112 50 124 C 48 134 52 142 60 146',
      'C 68 148 76 144 82 138 C 88 132 90 124 90 116 C 90 108 86 100 80 96 Z',
      // Right rear delt
      'M 220 96 C 234 102 246 112 250 124 C 252 134 248 142 240 146',
      'C 232 148 224 144 218 138 C 212 132 210 124 210 116 C 210 108 214 100 220 96 Z',
    ].join(' '),
  },
  {
    name: 'Triceps',
    path: [
      // Left tricep
      'M 76 146 C 70 162 66 180 64 198 C 62 212 64 222 68 228',
      'C 74 224 78 214 80 200 C 82 184 84 166 84 152 C 84 148 80 144 76 146 Z',
      // Right tricep
      'M 224 146 C 230 162 234 180 236 198 C 238 212 236 222 232 228',
      'C 226 224 222 214 220 200 C 218 184 216 166 216 152 C 216 148 220 144 224 146 Z',
    ].join(' '),
  },
  {
    name: 'Forearms',
    path: [
      // Left forearm
      'M 68 228 C 62 248 56 270 52 290 C 48 308 48 322 52 332',
      'C 58 330 64 322 68 308 C 74 290 78 268 80 248 C 80 238 76 230 68 228 Z',
      // Right forearm
      'M 232 228 C 238 248 244 270 248 290 C 252 308 252 322 248 332',
      'C 242 330 236 322 232 308 C 226 290 222 268 220 248 C 220 238 224 230 232 228 Z',
    ].join(' '),
  },
  {
    name: 'Glutes',
    path: [
      // Left glute
      'M 148 278 C 136 284 118 294 106 308 C 96 322 94 338 100 350',
      'C 108 360 122 362 136 356 C 146 350 150 340 150 328 C 150 314 150 296 148 278 Z',
      // Right glute
      'M 152 278 C 164 284 182 294 194 308 C 204 322 206 338 200 350',
      'C 192 360 178 362 164 356 C 154 350 150 340 150 328 C 150 314 150 296 152 278 Z',
    ].join(' '),
  },
  {
    name: 'Hamstrings',
    path: [
      // Left hamstring
      'M 100 358 C 94 378 90 400 90 418 C 90 432 94 440 100 444',
      'C 114 446 130 440 142 428 C 150 418 152 404 150 388',
      'C 148 372 144 360 136 354 C 122 352 110 354 100 358 Z',
      // Right hamstring
      'M 200 358 C 206 378 210 400 210 418 C 210 432 206 440 200 444',
      'C 186 446 170 440 158 428 C 150 418 148 404 150 388',
      'C 152 372 156 360 164 354 C 178 352 190 354 200 358 Z',
    ].join(' '),
  },
  {
    name: 'Calves',
    path: [
      // Left calf
      'M 102 454 C 98 468 96 486 98 504 C 100 520 106 534 114 544',
      'C 122 538 128 524 130 508 C 132 492 130 474 126 460 C 120 452 110 450 102 454 Z',
      // Right calf
      'M 198 454 C 202 468 204 486 202 504 C 200 520 194 534 186 544',
      'C 178 538 172 524 170 508 C 168 492 170 474 174 460 C 180 452 190 450 198 454 Z',
    ].join(' '),
  },
];

// ─── ANATOMICAL DETAIL LINES ────────────────────────────────────────

const FRONT_DETAILS = [
  // Collarbone lines
  'M 150 96 C 138 100 118 108 102 118',
  'M 150 96 C 162 100 182 108 198 118',
  // Pec lower edges
  'M 102 158 C 118 168 136 174 150 168',
  'M 198 158 C 182 168 164 174 150 168',
  // Center torso line
  'M 150 104 L 150 296',
  // Ab horizontal divisions
  'M 140 196 L 160 196',
  'M 139 218 L 161 218',
  'M 138 240 L 162 240',
  'M 140 262 L 160 262',
  // Hip crease V-lines
  'M 128 266 C 138 282 146 296 150 304',
  'M 172 266 C 162 282 154 296 150 304',
  // Knee cap hints
  'M 168 420 C 162 426 156 426 152 420',
  'M 132 420 C 138 426 144 426 148 420',
];

const BACK_DETAILS = [
  // Spine line
  'M 150 86 C 150 140 150 220 150 286',
  // Left scapula outline
  'M 124 110 C 110 120 106 142 112 160 C 118 170 132 170 140 160 C 146 148 144 128 136 116 C 132 110 128 108 124 110',
  // Right scapula outline
  'M 176 110 C 190 120 194 142 188 160 C 182 170 168 170 160 160 C 154 148 156 128 164 116 C 168 110 172 108 176 110',
  // Lower back dimples
  'M 138 258 C 134 264 136 270 140 268',
  'M 162 258 C 166 264 164 270 160 268',
  // Lumbar curve
  'M 132 236 C 140 244 160 244 168 236',
];

// ─── LABEL POSITIONS ────────────────────────────────────────────────

const FRONT_LABELS = {
  Chest: { x: 150, y: 145 },
  Shoulders: { x: 60, y: 122 },
  Biceps: { x: 68, y: 186 },
  Forearms: { x: 58, y: 282 },
  Abs: { x: 150, y: 232 },
  Obliques: { x: 114, y: 234 },
  Quads: { x: 150, y: 380 },
  Calves: { x: 150, y: 498 },
};

const BACK_LABELS = {
  Back: { x: 150, y: 190 },
  'Rear Delts': { x: 60, y: 122 },
  Triceps: { x: 68, y: 186 },
  Forearms: { x: 58, y: 282 },
  Glutes: { x: 150, y: 328 },
  Hamstrings: { x: 150, y: 400 },
  Calves: { x: 150, y: 498 },
};

// ─── COMPONENTS ─────────────────────────────────────────────────────

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
  const details = view === 'front' ? FRONT_DETAILS : BACK_DETAILS;

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
        viewBox="0 0 300 600"
        className="w-full max-w-[240px] h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body outline (base layer) */}
        <path
          d={bodyOutline}
          className="fill-white/[0.03] stroke-white/10 stroke-[1]"
        />

        {/* Anatomical detail lines (decorative) */}
        {details.map((d, i) => (
          <path
            key={i}
            d={d}
            className="fill-none stroke-white/[0.06] stroke-[0.5]"
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
          <button onClick={() => onSelectMuscle(null)} className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition">
  Clear
</button>
        </div>
      )}
    </div>
  );
}
