import { bodyFront } from '../../muscle anatomy/dist/assets/bodyFront.js';
import { bodyBack } from '../../muscle anatomy/dist/assets/bodyBack.js';

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
  'head', 'hair', 'neck', 'hands', 'feet', 'ankles', 'knees', 'adductors',
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

const frontData = buildMuscleData(bodyFront, FRONT_SLUG_MAP);
const backData = buildMuscleData(bodyBack, BACK_SLUG_MAP);

export const FRONT_INTERACTIVE_MUSCLES = frontData.muscles;
export const BACK_INTERACTIVE_MUSCLES = backData.muscles;
export const FRONT_DECORATIVE_PATHS = frontData.decorativePaths;
export const BACK_DECORATIVE_PATHS = backData.decorativePaths;

// Label positions for front view (viewBox 0 0 724 1448)
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

// Label positions for back view (viewBox 724 0 724 1448)
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
