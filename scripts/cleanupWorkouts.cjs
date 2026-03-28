/**
 * Script to:
 * 1. Remove duplicate workouts (keep last occurrence = latest video)
 * 2. Add exercises from exercises.js that aren't in searchWorkout.js
 *
 * Run: node scripts/cleanupWorkouts.cjs
 */

const fs = require('fs');
const path = require('path');

// ─── Read current searchWorkout.js ───
const swPath = path.join(__dirname, '..', 'src', 'data', 'searchWorkout.js');
const swContent = fs.readFileSync(swPath, 'utf-8');

// Extract the workouts array from the JS module
const workoutsMatch = swContent.match(/export const workouts = (\[[\s\S]*?\]);/);
if (!workoutsMatch) {
  console.error('Could not parse workouts array from searchWorkout.js');
  process.exit(1);
}
const workouts = JSON.parse(workoutsMatch[1]);
console.log(`Loaded ${workouts.length} workouts from searchWorkout.js`);

// ─── Step 1: Remove duplicates (keep last occurrence) ───
const nameMap = new Map(); // lowercase name → array of indices
workouts.forEach((w, i) => {
  const key = w.name.toLowerCase();
  if (!nameMap.has(key)) nameMap.set(key, []);
  nameMap.get(key).push(i);
});

const duplicates = [];
const indicesToRemove = new Set();
for (const [name, indices] of nameMap) {
  if (indices.length > 1) {
    duplicates.push({ name, count: indices.length, kept: indices[indices.length - 1] });
    // Remove all but the last occurrence
    for (let i = 0; i < indices.length - 1; i++) {
      indicesToRemove.add(indices[i]);
    }
  }
}

const deduped = workouts.filter((_, i) => !indicesToRemove.has(i));
console.log(`\nRemoved ${indicesToRemove.size} duplicates (kept latest):`);
duplicates.forEach(d => console.log(`  "${d.name}" — had ${d.count} entries, kept index ${d.kept}`));
console.log(`After dedup: ${deduped.length} workouts`);

// ─── Step 2: Read exercises.js and find missing ones ───
const exPath = path.join(__dirname, '..', 'src', 'data', 'exercises.js');
const exContent = fs.readFileSync(exPath, 'utf-8');

// Parse exercise entries from the JS object
// We'll extract name, videoId, muscle, difficulty, instructions, gifUrl
const exerciseBlocks = exContent.split(/\n  \w+: \{/).slice(1);

const exerciseEntries = [];
const exerciseRegex = {
  name: /name:\s*['"]([^'"]+)['"]/,
  videoId: /videoId:\s*['"]([^'"]+)['"]/,
  muscle: /muscle:\s*['"]([^'"]+)['"]/,
  difficulty: /difficulty:\s*['"]([^'"]+)['"]/,
  instructions: /instructions:\s*['"]([^'"]+)['"]/,
  gifUrl: /gifUrl:\s*['"]([^'"]+)['"]/,
  id: /id:\s*['"]([^'"]+)['"]/,
};

for (const block of exerciseBlocks) {
  const entry = {};
  for (const [key, regex] of Object.entries(exerciseRegex)) {
    const match = block.match(regex);
    entry[key] = match ? match[1] : null;
  }
  if (entry.name && entry.videoId) {
    exerciseEntries.push(entry);
  }
}

console.log(`\nLoaded ${exerciseEntries.length} exercises from exercises.js`);

// Find exercises whose videoId is NOT in the deduped searchWorkout
const existingVideoIds = new Set(deduped.map(w => w.videoId));
const existingNames = new Set(deduped.map(w => w.name.toLowerCase()));

const missing = exerciseEntries.filter(e => {
  return !existingVideoIds.has(e.videoId) && !existingNames.has(e.name.toLowerCase());
});

console.log(`\nFound ${missing.length} exercises to add:`);
missing.forEach(e => console.log(`  "${e.name}" (${e.muscle}) — videoId: ${e.videoId}`));

// ─── Step 3: Build new entries for missing exercises ───
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Normalize muscle names from exercises.js to match searchWorkout categories
function normalizeMuscle(muscle) {
  const map = {
    'Chest': 'Chest',
    'Upper Chest': 'Chest',
    'Back': 'Back',
    'Rear Delts/Upper Back': 'Rear Delts',
    'Shoulders': 'Shoulders',
    'Side Delts': 'Shoulders',
    'Rear Delts': 'Rear Delts',
    'Biceps': 'Biceps',
    'Biceps/Forearms': 'Biceps',
    'Triceps': 'Triceps',
    'Triceps/Chest': 'Triceps',
    'Quads/Glutes': 'Quads',
    'Quads': 'Quads',
    'Hamstrings/Glutes': 'Hamstrings',
    'Hamstrings': 'Hamstrings',
    'Calves': 'Calves',
    'Core': 'Abs',
    'Abs': 'Abs',
    'Lower Abs': 'Abs',
    'Obliques/Core': 'Obliques',
    'Full Body': 'Full Body',
  };
  return map[muscle] || 'General';
}

const INSTRUCTION_TEMPLATES = {
  'Chest': ['Position yourself and grip the handles/bar at chest height.', 'Press forward or upward, squeezing your chest at the top.', 'Lower slowly with control back to the starting position.'],
  'Back': ['Grip the bar or handle with the appropriate grip width.', 'Pull toward your body, squeezing your shoulder blades together.', 'Return to the starting position with a controlled negative.'],
  'Shoulders': ['Hold the weight at shoulder height with proper grip.', 'Press or raise the weight in a controlled motion.', 'Lower back to the starting position slowly.'],
  'Biceps': ['Grip the weight with palms facing up or in a neutral position.', 'Curl the weight up, keeping your elbows stationary.', 'Lower the weight slowly, fully extending your arms.'],
  'Triceps': ['Position your arms with elbows close to your body.', 'Extend your arms fully, squeezing the triceps at lockout.', 'Return to the starting position with control.'],
  'Quads': ['Position your feet at shoulder width or as required.', 'Lower your body by bending at the knees and hips.', 'Drive through your heels to return to standing.'],
  'Hamstrings': ['Position yourself with proper hip hinge alignment.', 'Lower the weight or your body by hinging at the hips.', 'Squeeze your hamstrings to return to the starting position.'],
  'Glutes': ['Position your hips for the movement with feet planted firmly.', 'Drive through your heels, squeezing your glutes at the top.', 'Lower back down with control.'],
  'Abs': ['Lie down or hang in the starting position with core engaged.', 'Contract your abs to perform the movement.', 'Return to the starting position with control, maintaining tension.'],
  'Obliques': ['Position yourself for the rotational or lateral movement.', 'Twist or crunch to the side, engaging the obliques.', 'Return to center with control and repeat.'],
  'Calves': ['Position the balls of your feet on the edge of the platform.', 'Rise up onto your toes, squeezing the calves at the top.', 'Lower your heels below the platform for a full stretch.'],
  'Rear Delts': ['Bend at the hips with a slight bend in the elbows.', 'Raise the weight out to the sides, squeezing the rear delts.', 'Lower back down slowly with control.'],
  'Full Body': ['Start in the ready position with feet shoulder-width apart.', 'Perform the movement explosively with proper form.', 'Return to the starting position and repeat.'],
  'General': ['Set up in the proper starting position.', 'Perform the movement with controlled form.', 'Return to start and repeat for desired reps.'],
};

function generateKeywords(name, muscle, equipment) {
  const words = name.toLowerCase().split(/[\s-]+/).filter(w => w.length > 2);
  const keywords = [...new Set(words)];
  keywords.push(muscle.toLowerCase());
  if (/dumbbell/i.test(name)) keywords.push('dumbbell', 'free weight');
  if (/barbell/i.test(name)) keywords.push('barbell', 'free weight');
  if (/cable/i.test(name)) keywords.push('cable', 'machine');
  if (/machine|smith/i.test(name)) keywords.push('machine');
  if (/bodyweight|push.?up|pull.?up|dip|plank/i.test(name)) keywords.push('bodyweight');
  if (/press|push/i.test(name)) keywords.push('push');
  if (/row|pull|curl/i.test(name)) keywords.push('pull');
  if (/squat|deadlift|lunge/i.test(name)) keywords.push('compound');
  if (/curl|raise|fly|extension/i.test(name)) keywords.push('isolation');
  return [...new Set(keywords)];
}

function guessEquipment(name) {
  if (/machine|cable|smith|cybex|hammer strength|pec deck|lat pulldown/i.test(name)) return 'Machine & Cable';
  if (/bodyweight|push.?up|pull.?up|dip|plank|crunch|leg raise|dead bug|burpee/i.test(name)) return 'Bodyweight';
  return 'Barbell & Dumbbell';
}

const existingSlugs = new Set(deduped.map(w => w.id));

const newEntries = missing.map(e => {
  let slug = toSlug(e.name);
  if (existingSlugs.has(slug)) slug = `${slug}-ex`;
  existingSlugs.add(slug);

  const muscle = normalizeMuscle(e.muscle);
  const equipment = guessEquipment(e.name);
  const instructions = e.instructions
    ? e.instructions.split('. ').filter(s => s.length > 10).slice(0, 3).map(s => s.endsWith('.') ? s : s + '.')
    : INSTRUCTION_TEMPLATES[muscle] || INSTRUCTION_TEMPLATES['General'];

  return {
    id: slug,
    name: e.name,
    targetMuscle: muscle,
    difficulty: e.difficulty || 'intermediate',
    equipment,
    videoId: e.videoId,
    instructions,
    keywords: generateKeywords(e.name, muscle, equipment),
    aliases: [
      `${muscle.toLowerCase()} workout`,
      `${muscle.toLowerCase()} exercise`,
      `how to do ${e.name.toLowerCase()}`,
    ],
  };
});

// ─── Step 4: Combine and write output ───
const final = [...deduped, ...newEntries];

const muscleGroups = [...new Set(final.map(w => w.targetMuscle))].sort();
const equipmentTypes = [...new Set(final.map(w => w.equipment))];

let output = `// Auto-generated structured workout dataset
// Total: ${final.length} workouts
// Generated: ${new Date().toISOString().split('T')[0]}

export const workouts = ${JSON.stringify(final, null, 2)};

export const muscleGroups = ${JSON.stringify(muscleGroups)};

export const equipmentTypes = ${JSON.stringify(equipmentTypes)};
`;

fs.writeFileSync(swPath, output, 'utf-8');

console.log(`\n✓ Final count: ${final.length} workouts`);
console.log(`  Muscle groups: ${muscleGroups.join(', ')}`);

// Print final muscle distribution
const muscleCount = {};
final.forEach(w => { muscleCount[w.targetMuscle] = (muscleCount[w.targetMuscle] || 0) + 1; });
console.log('\nFinal muscle distribution:');
Object.entries(muscleCount).sort((a, b) => b[1] - a[1]).forEach(([m, c]) => {
  console.log(`  ${m}: ${c}`);
});
