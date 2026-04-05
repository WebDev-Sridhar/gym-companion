import { bodyFront } from '../assets/bodyFront.js';
import { bodyBack } from '../assets/bodyBack.js';
import { bodyFemaleFront } from '../assets/bodyFemaleFront.js';
import { bodyFemaleBack } from '../assets/bodyFemaleBack.js';

// Combine all path arrays (common, left, right) into a single d-string
function flattenPaths(pathObj) {
  if (!pathObj) return '';
  return [
    ...(pathObj.common || []),
    ...(pathObj.left || []),
    ...(pathObj.right || []),
  ].join(' ');
}

// Slug → app muscle name mappings (interactive muscles only)
const FRONT_SLUG_MAP = {
  chest: 'Chest',
  obliques: 'Obliques',
  abs: 'Abs',
  biceps: 'Biceps',
  triceps: 'Triceps',
  deltoids: 'Shoulders',
  trapezius: 'Traps',
  quadriceps: 'Quads',
  calves: 'Calves',
  tibialis: 'Calves',
  forearm: 'Forearms',
};

const BACK_SLUG_MAP = {
  'upper-back': 'Back',
  'lower-back': 'Back',
  deltoids: 'Rear Delts',
  trapezius: 'Traps',
  triceps: 'Triceps',
  gluteal: 'Glutes',
  hamstring: 'Hamstrings',
  calves: 'Calves',
  forearm: 'Forearms',
};

const DECORATIVE_SLUGS = new Set([
  'head', 'hair', 'neck', 'hands', 'feet', 'ankles', 'knees', 'adductors', 'abductors',
]);

function buildMuscleData(bodyData, slugMap) {
  const muscleMap = new Map(); // name → paths[]
  const decorativePaths = [];

  for (const part of bodyData) {
    const flat = flattenPaths(part.path);
    if (!flat) continue;

    if (DECORATIVE_SLUGS.has(part.slug)) {
      decorativePaths.push(flat);
      continue;
    }

    const name = slugMap[part.slug];
    if (!name) {
      // Unmapped slug → treat as decorative
      decorativePaths.push(flat);
      continue;
    }

    if (!muscleMap.has(name)) {
      muscleMap.set(name, []);
    }
    muscleMap.get(name).push(flat);
  }

  const muscles = [];
  for (const [name, paths] of muscleMap) {
    muscles.push({ name, path: paths.join(' ') });
  }

  return { muscles, decorativePaths };
}

// ─── MALE DATA ──────────────────────────────────────────────────────

const maleFront = buildMuscleData(bodyFront, FRONT_SLUG_MAP);
const maleBack = buildMuscleData(bodyBack, BACK_SLUG_MAP);

export const FRONT_INTERACTIVE_MUSCLES = maleFront.muscles;
export const BACK_INTERACTIVE_MUSCLES = maleBack.muscles;
export const FRONT_DECORATIVE_PATHS = maleFront.decorativePaths;
export const BACK_DECORATIVE_PATHS = maleBack.decorativePaths;

// ─── FEMALE DATA ────────────────────────────────────────────────────

const femaleFront = buildMuscleData(bodyFemaleFront, FRONT_SLUG_MAP);
const femaleBack = buildMuscleData(bodyFemaleBack, BACK_SLUG_MAP);

export const FEMALE_FRONT_MUSCLES = femaleFront.muscles;
export const FEMALE_BACK_MUSCLES = femaleBack.muscles;
export const FEMALE_FRONT_DECORATIVE = femaleFront.decorativePaths;
export const FEMALE_BACK_DECORATIVE = femaleBack.decorativePaths;

// ─── VIEWBOX CONSTANTS ──────────────────────────────────────────────

export const VIEWBOX = {
  male:   { front: '0 0 724 1448',    back: '724 0 724 1448' },
  female: { front: '-50 -40 734 1538', back: '756 0 774 1448' },
};

// ─── LABEL POSITIONS ────────────────────────────────────────────────

// Male labels (viewBox center x≈362 front, x≈1086 back)
export const FRONT_LABELS = {
  Chest: { x: 362, y: 400 },
  Shoulders: { x: 175, y: 360 },
  Biceps: { x: 185, y: 470 },
  Triceps: { x: 540, y: 470 },
  Forearms: { x: 155, y: 660 },
  Abs: { x: 362, y: 550 },
  Obliques: { x: 280, y: 480 },
  Traps: { x: 290, y: 300 },
  Quads: { x: 362, y: 870 },
  Calves: { x: 362, y: 1100 },
};

export const BACK_LABELS = {
  Back: { x: 1086, y: 460 },
  'Rear Delts': { x: 900, y: 360 },
  Traps: { x: 1086, y: 340 },
  Triceps: { x: 920, y: 480 },
  Forearms: { x: 880, y: 650 },
  Glutes: { x: 1086, y: 700 },
  Hamstrings: { x: 1086, y: 870 },
  Calves: { x: 1086, y: 1100 },
};

// Female labels (viewBox center x≈317 front, x≈1143 back)
export const FEMALE_FRONT_LABELS = {
  Chest: { x: 317, y: 400 },
  Shoulders: { x: 150, y: 340 },
  Biceps: { x: 155, y: 450 },
  Triceps: { x: 490, y: 450 },
  Forearms: { x: 130, y: 620 },
  Abs: { x: 317, y: 530 },
  Obliques: { x: 240, y: 470 },
  Traps: { x: 255, y: 290 },
  Quads: { x: 317, y: 830 },
  Calves: { x: 317, y: 1080 },
};

export const FEMALE_BACK_LABELS = {
  Back: { x: 1143, y: 440 },
  'Rear Delts': { x: 960, y: 350 },
  Traps: { x: 1143, y: 330 },
  Triceps: { x: 975, y: 460 },
  Forearms: { x: 940, y: 620 },
  Glutes: { x: 1143, y: 680 },
  Hamstrings: { x: 1143, y: 850 },
  Calves: { x: 1143, y: 1080 },
};
