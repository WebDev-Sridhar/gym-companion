/**
 * Script to process raw workout data from searchWorkout.js
 * and generate a structured dataset.
 *
 * Run: node scripts/generateWorkouts.cjs
 */

const fs = require('fs');
const path = require('path');

// Read the raw file
const rawContent = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'data', 'searchWorkout.js'),
  'utf-8'
);

// Parse the 3 JSON arrays from the file
const arrays = [];
let depth = 0;
let start = -1;
for (let i = 0; i < rawContent.length; i++) {
  if (rawContent[i] === '[') {
    if (depth === 0) start = i;
    depth++;
  } else if (rawContent[i] === ']') {
    depth--;
    if (depth === 0 && start !== -1) {
      arrays.push(JSON.parse(rawContent.substring(start, i + 1)));
      start = -1;
    }
  }
}

const equipmentLabels = ['Barbell & Dumbbell', 'Machine & Cable', 'Bodyweight'];

// ─── Title Cleaning ───
function cleanTitle(title) {
  let name = title;
  // Remove prefixes
  name = name.replace(/^(HOW TO:|How To:|My Tricks:|BENCH:)\s*/i, '');
  // Remove "HOW TO BUILD BIG TRAPS WITH" → "Barbell Shrugs" pattern
  name = name.replace(/^HOW TO BUILD BIG TRAPS WITH\s*/i, '');
  // Remove "Don't Do Chest Flys Like This!" → "Chest Flys"
  name = name.replace(/^Don't Do\s+/i, '').replace(/\s+Like This!?/i, '');
  // Remove "1 Exercise For Capped Shoulders!" prefix → keep after |
  name = name.replace(/^\d+\s+Exercise[s]?\s+(For|YOU NEED)[^|]*\|\s*/i, '');
  // Remove "1 Exercise YOU NEED..." without pipe
  name = name.replace(/^\d+\s+Exercise[s]?\s+(For|YOU NEED)\s+[^!]*!?\s*/i, '');
  // Remove "Seated Barbell Curls Build Bigger Biceps?!" → "Seated Barbell Curls"
  name = name.replace(/\s+Build\s+Bigger\s+\w+\?!?/i, '');
  // Remove "How To Do More Advanced" prefix
  name = name.replace(/^How To Do More Advanced\s*/i, 'Advanced ');
  name = name.replace(/^How To Do\s*/i, '');
  // Remove pipe-separated tails
  name = name.replace(/\s*\|\|?\s*(PERFECT FORM|3 GOLDEN RULES|BUILD[^|]*|INCREASE[^|]*|TARGET[^|]*|BEST[^|]*|TIGHTER[^|]*|2 MOST COMMON[^|]*|NO SHOULDER[^|]*|BICEPS BUILDER|MADE BETTER!?|FOR GROWTH).*$/i, '');
  // Remove parenthetical marketing
  name = name.replace(/\s*\([^)]*(?:BUILDER|BEST|HUGE|BIGGER|PERFECT|POWERBOMB|GROWTH|STRENGTH|EXPLOSIVE|MUSCLE|BICEPS|TRICEPS|CHEST|BACK|INTENSE|HARDCORE|BUILD|INCREASE|LOWER ABS|RIPPED|SCIENCED|MORE RESULTS|CHEAT|OVERLOAD|SAFELY|RECOVER|Beginners Too)[^)]*\)/gi, '');
  // Remove remaining marketing parentheticals
  name = name.replace(/\s*\(Lift HEAVY[^)]*\)/gi, '');
  name = name.replace(/\s*\(Bodyweight INNER CHEST[^)]*\)/gi, '');
  // Remove trailing marketing
  name = name.replace(/\s*[-–]\s*(Tips For Building|Why Using|The ONE TIP|Improve Form|Learn The Differences|Ultimate Bicep|Build Leg Strength|Total Body|Targeting|Train Your)[^$]*/i, '');
  // Remove exclamation-heavy marketing suffixes
  name = name.replace(/\s*[-–]?\s*(?:BRUTAL|INSANE|INSTANT|DUMB OR SMART)[^$]*/i, '');
  // Remove "3 GOLDEN RULES" standalone
  name = name.replace(/\s*3 GOLDEN RULES!?\s*/gi, '');
  name = name.replace(/\s*MADE BETTER!?\s*/gi, '');
  // Remove "Top 10 HOME Bodyweight" prefix
  name = name.replace(/^Top \d+\s+HOME\s+Bodyweight\s*/i, '');
  // Remove "ABS & Obliques Exercises" → keep meaningful
  name = name.replace(/^(\d+\s+)?INSANE\s+/i, '');
  // Clean quotes
  name = name.replace(/"/g, '').replace(/"/g, '').replace(/"/g, '');
  // Remove (LF Cable), (Cybex), (Hammer Strength), (BM), (Cable Machine) - keep for equipment but remove from name display
  name = name.replace(/\s*\((?:LF Cable|Cybex|Hammer Strength|BM|Cable Machine|Life Fitness Cable)\)/gi, '');
  // Remove "Version 1", "Version 2" etc standalone
  // Keep them if part of actual name
  // Clean up extra whitespace
  name = name.replace(/\s+/g, ' ').trim();
  // Remove trailing punctuation
  name = name.replace(/[!?]+$/, '').trim();
  // Remove trailing dashes
  name = name.replace(/[-–]+$/, '').trim();
  // Remove leading numbers like "8 Best Weight Plate Exercises"
  if (/^\d+\s+Best\s+/i.test(name)) {
    name = name.replace(/^\d+\s+Best\s+/i, '');
  }
  return name;
}

// ─── Slug generation ───
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Muscle Mapping ───
const MUSCLE_RULES = [
  // Specific first (order matters)
  { patterns: [/rear delt/i, /rear fly/i, /rear raise/i, /rear lateral/i, /face pull/i, /row\/rear delt/i], muscle: 'Rear Delts' },
  { patterns: [/oblique/i, /torso.?twist/i, /windmill/i, /wood chop/i, /windshield wiper/i], muscle: 'Obliques' },
  { patterns: [/shrug/i, /trap/i], muscle: 'Traps' },
  { patterns: [/wrist curl/i, /forearm twist/i, /forearm/i], muscle: 'Forearms' },
  { patterns: [/calf raise/i, /calf press/i, /standing calf/i, /rotary calf/i, /donkey calf/i, /single-leg calf/i], muscle: 'Calves' },
  { patterns: [/glute bridge/i, /hip thrust/i, /glute(?!s?\s)/i, /glutes/i], muscle: 'Glutes' },
  { patterns: [/hamstring curl/i, /leg curl/i, /prone leg curl/i, /seated leg curl/i, /standing leg curl/i, /romanian deadlift/i, /stiff-leg deadlift/i, /stiff.?leg/i, /good morning/i, /single-leg curl/i], muscle: 'Hamstrings' },
  { patterns: [/hip abduction/i, /hip adduction/i], muscle: 'Hips' },
  { patterns: [/bench press/i, /chest press/i, /chest fly/i, /cable fly/i, /cable chest/i, /dumbbell fly/i, /flat.*fly/i, /incline.*fly/i, /floor press/i, /push.?up/i, /dip(?!.*to.*leg)/i, /pec\b/i, /pull-?over(?!.*press)/i, /plate press/i, /crossover/i, /low.?to.?high/i, /chest.*lunge/i, /lunge.*chest/i, /one-arm chest/i, /bench slide/i, /chest shredder/i, /inner chest/i, /knuckle/i, /chest throw/i], muscle: 'Chest' },
  { patterns: [/lat pull/i, /pull.?up/i, /chin.?up/i, /row(?!.*rear)/i, /inverted row/i, /t-bar/i, /monkey pull/i, /canoe/i, /bow and arrow/i, /lat push/i, /hyperextension/i, /superman(?!\s)/i], muscle: 'Back' },
  { patterns: [/squat/i, /lunge(?!.*chest|.*pull|.*low row)/i, /leg press/i, /leg extension/i, /pistol/i, /wall.?sit/i, /box jump/i, /squat jump/i, /lateral hop/i, /lateral shuffle/i, /cone drill/i, /duck walk/i, /leg stabilizer/i, /stepping lunge/i, /hang-lunge/i, /hang-squat/i], muscle: 'Quads' },
  { patterns: [/shoulder press/i, /overhead press/i, /military press/i, /lateral raise/i, /side lateral/i, /front raise/i, /upright.?row/i, /shoulder fly/i, /arm circles/i, /push.?press/i, /w raise/i], muscle: 'Shoulders' },
  { patterns: [/bicep|biceps/i, /curl(?!.*tricep)/i, /hammer curl/i, /spider curl/i, /preacher/i, /concentration curl/i, /drag curl/i, /zottman/i, /ez.?bar curl/i, /bicep punch/i, /bicep kiss/i, /bicep contraction/i, /mercy 30/i], muscle: 'Biceps' },
  { patterns: [/tricep/i, /skull crush/i, /close.?grip.*bench/i, /kickback/i, /pull-?over.*press/i, /push.?down/i, /rope push/i, /tate press/i, /arm extension/i], muscle: 'Triceps' },
  { patterns: [/crunch/i, /sit.?up/i, /ab\b/i, /abs\b/i, /leg.?lift/i, /leg.?raise/i, /plank/i, /v-up/i, /toe.?touch/i, /flutter/i, /scissor/i, /cannonball/i, /stomach vacuum/i, /ball pass/i, /floor wiper/i, /hover glide/i, /hip-thrust crunch/i, /toe-2-bar/i, /ab rollout/i, /ab pulldown/i, /toe-driver/i, /mr\. t-up/i, /knee raise/i], muscle: 'Abs' },
  { patterns: [/deadlift/i, /rack pull/i, /hinge/i], muscle: 'Back' },
  { patterns: [/burpee/i, /bear crawl/i, /sprint/i, /groiner/i, /charging star/i, /star spangled/i, /fusion glide/i, /duck.*dodge/i, /eagle.?knee/i, /shield slash/i, /burp n/i, /shin slap/i, /postural/i, /jumping.*landing/i, /triple.?threat/i], muscle: 'Full Body' },
  { patterns: [/rear kick/i, /side kick/i], muscle: 'Glutes' },
];

function mapMuscle(cleanedName, rawTitle) {
  const combined = `${cleanedName} ${rawTitle}`.toLowerCase();
  for (const rule of MUSCLE_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(combined)) {
        return rule.muscle;
      }
    }
  }
  return 'General';
}

// ─── Difficulty ───
function classifyDifficulty(cleanedName, equipment) {
  const lower = cleanedName.toLowerCase();
  // Advanced
  if (/muscle.?up/i.test(lower)) return 'advanced';
  if (/pistol squat/i.test(lower)) return 'advanced';
  if (/weighted (pull.?up|chin.?up|dip)/i.test(lower)) return 'advanced';
  if (/windshield wiper/i.test(lower)) return 'advanced';
  if (/explosive plyo/i.test(lower)) return 'advanced';
  if (/deficit deadlift/i.test(lower)) return 'advanced';
  if (/jefferson squat/i.test(lower)) return 'advanced';
  if (/zercher squat/i.test(lower)) return 'advanced';
  if (/sumo deadlift/i.test(lower)) return 'advanced';
  if (/pendlay row/i.test(lower)) return 'advanced';
  if (/tennis ball pull/i.test(lower)) return 'advanced';
  if (/hanging.*windshield/i.test(lower)) return 'advanced';
  if (/advanced/i.test(lower)) return 'advanced';
  if (/ring/i.test(lower)) return 'advanced';

  // Beginner
  if (/push.?up$/i.test(lower)) return 'beginner';
  if (/^plank/i.test(lower)) return 'beginner';
  if (/^air squat/i.test(lower)) return 'beginner';
  if (/wall.?sit/i.test(lower)) return 'beginner';
  if (/beginner/i.test(lower)) return 'beginner';
  if (/glute bridge$/i.test(lower)) return 'beginner';
  if (/bench dip/i.test(lower)) return 'beginner';
  if (/flutter kick/i.test(lower)) return 'beginner';
  if (/floor crunch/i.test(lower)) return 'beginner';
  if (/toe touch$/i.test(lower)) return 'beginner';
  if (/arm circles/i.test(lower)) return 'beginner';
  if (/standing oblique twist/i.test(lower)) return 'beginner';
  if (/ball crunch$/i.test(lower)) return 'beginner';
  if (/lateral raise/i.test(lower)) return 'beginner';
  if (equipment === 'Machine & Cable') return 'beginner';

  return 'intermediate';
}

// ─── Instructions ───
const INSTRUCTION_TEMPLATES = {
  'Chest': [
    'Position yourself and grip the handles/bar at chest height.',
    'Press forward or upward, squeezing your chest at the top.',
    'Lower slowly with control back to the starting position.'
  ],
  'Back': [
    'Grip the bar or handle with the appropriate grip width.',
    'Pull toward your body, squeezing your shoulder blades together.',
    'Return to the starting position with a controlled negative.'
  ],
  'Shoulders': [
    'Hold the weight at shoulder height with proper grip.',
    'Press or raise the weight in a controlled motion.',
    'Lower back to the starting position slowly.'
  ],
  'Biceps': [
    'Grip the weight with palms facing up or in a neutral position.',
    'Curl the weight up, keeping your elbows stationary.',
    'Lower the weight slowly, fully extending your arms.'
  ],
  'Triceps': [
    'Position your arms with elbows close to your body.',
    'Extend your arms fully, squeezing the triceps at lockout.',
    'Return to the starting position with control.'
  ],
  'Quads': [
    'Position your feet at shoulder width or as required.',
    'Lower your body by bending at the knees and hips.',
    'Drive through your heels to return to standing.'
  ],
  'Hamstrings': [
    'Position yourself with proper hip hinge alignment.',
    'Lower the weight or your body by hinging at the hips.',
    'Squeeze your hamstrings to return to the starting position.'
  ],
  'Glutes': [
    'Position your hips for the movement with feet planted firmly.',
    'Drive through your heels, squeezing your glutes at the top.',
    'Lower back down with control.'
  ],
  'Abs': [
    'Lie down or hang in the starting position with core engaged.',
    'Contract your abs to perform the movement.',
    'Return to the starting position with control, maintaining tension.'
  ],
  'Obliques': [
    'Position yourself for the rotational or lateral movement.',
    'Twist or crunch to the side, engaging the obliques.',
    'Return to center with control and repeat.'
  ],
  'Calves': [
    'Position the balls of your feet on the edge of the platform.',
    'Rise up onto your toes, squeezing the calves at the top.',
    'Lower your heels below the platform for a full stretch.'
  ],
  'Traps': [
    'Hold the weight with arms fully extended at your sides.',
    'Shrug your shoulders straight up toward your ears.',
    'Hold briefly at the top, then lower with control.'
  ],
  'Forearms': [
    'Rest your forearms on a bench or your thighs for support.',
    'Curl or twist the weight using only your wrists.',
    'Return to the starting position slowly.'
  ],
  'Rear Delts': [
    'Bend at the hips with a slight bend in the elbows.',
    'Raise the weight out to the sides, squeezing the rear delts.',
    'Lower back down slowly with control.'
  ],
  'Hips': [
    'Position yourself on the machine with proper pad alignment.',
    'Move your legs outward or inward against the resistance.',
    'Return to the starting position with control.'
  ],
  'Full Body': [
    'Start in the ready position with feet shoulder-width apart.',
    'Perform the movement explosively with proper form.',
    'Return to the starting position and repeat.'
  ],
  'General': [
    'Set up in the proper starting position.',
    'Perform the movement with controlled form.',
    'Return to start and repeat for desired reps.'
  ],
};

// ─── Keywords ───
function generateKeywords(cleanedName, muscle, equipment) {
  const words = cleanedName.toLowerCase().split(/[\s-]+/).filter(w => w.length > 2);
  const keywords = [...new Set(words)];

  // Add muscle
  keywords.push(muscle.toLowerCase());

  // Add equipment keywords
  if (equipment === 'Barbell & Dumbbell') {
    if (/dumbbell/i.test(cleanedName)) keywords.push('dumbbell', 'free weight');
    if (/barbell/i.test(cleanedName)) keywords.push('barbell', 'free weight');
    if (/ez.?bar/i.test(cleanedName)) keywords.push('ez bar', 'barbell');
  } else if (equipment === 'Machine & Cable') {
    keywords.push('machine');
    if (/cable/i.test(cleanedName)) keywords.push('cable');
    if (/smith/i.test(cleanedName)) keywords.push('smith machine');
  } else {
    keywords.push('bodyweight', 'no equipment');
  }

  // Add movement type
  if (/press|push/i.test(cleanedName)) keywords.push('push');
  if (/row|pull|curl/i.test(cleanedName)) keywords.push('pull');
  if (/squat|deadlift|lunge/i.test(cleanedName)) keywords.push('compound');
  if (/curl|raise|fly|extension/i.test(cleanedName)) keywords.push('isolation');

  return [...new Set(keywords)];
}

// ─── Aliases ───
function generateAliases(cleanedName, muscle) {
  const aliases = [];
  const lower = cleanedName.toLowerCase();

  // Common alias patterns
  if (/dumbbell/i.test(lower)) aliases.push(lower.replace('dumbbell', 'db'));
  if (/barbell/i.test(lower)) aliases.push(lower.replace('barbell', 'bb'));

  // Muscle-based aliases
  aliases.push(`${muscle.toLowerCase()} workout`);
  aliases.push(`${muscle.toLowerCase()} exercise`);

  // "how to" alias
  aliases.push(`how to do ${lower}`);

  return [...new Set(aliases)].slice(0, 5);
}

// ─── Process All Entries ───
const allWorkouts = [];
const seenSlugs = new Set();

arrays.forEach((arr, playlistIndex) => {
  arr.forEach((entry) => {
    const cleaned = cleanTitle(entry.title);
    let slug = toSlug(cleaned);

    // Handle duplicates
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${playlistIndex + 1}`;
    }
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${entry.id.substring(0, 4)}`;
    }
    seenSlugs.add(slug);

    const equipment = equipmentLabels[playlistIndex];
    const muscle = mapMuscle(cleaned, entry.title);
    const difficulty = classifyDifficulty(cleaned, equipment);
    const instructions = INSTRUCTION_TEMPLATES[muscle] || INSTRUCTION_TEMPLATES['General'];
    const keywords = generateKeywords(cleaned, muscle, equipment);
    const aliases = generateAliases(cleaned, muscle);

    allWorkouts.push({
      id: slug,
      name: cleaned,
      targetMuscle: muscle,
      difficulty,
      equipment,
      videoId: entry.id,
      instructions,
      keywords,
      aliases,
    });
  });
});

// Collect unique muscle groups and equipment types
const muscleGroups = [...new Set(allWorkouts.map(w => w.targetMuscle))].sort();
const equipmentTypes = [...new Set(allWorkouts.map(w => w.equipment))];

// Generate the output file
let output = `// Auto-generated structured workout dataset
// Total: ${allWorkouts.length} workouts
// Generated: ${new Date().toISOString().split('T')[0]}

export const workouts = ${JSON.stringify(allWorkouts, null, 2)};

export const muscleGroups = ${JSON.stringify(muscleGroups)};

export const equipmentTypes = ${JSON.stringify(equipmentTypes)};
`;

// Write the output
fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'searchWorkout.js'),
  output,
  'utf-8'
);

console.log(`Generated ${allWorkouts.length} workouts`);
console.log(`Muscle groups: ${muscleGroups.join(', ')}`);
console.log(`Equipment types: ${equipmentTypes.join(', ')}`);

// Print some stats
const muscleCount = {};
allWorkouts.forEach(w => {
  muscleCount[w.targetMuscle] = (muscleCount[w.targetMuscle] || 0) + 1;
});
console.log('\nMuscle distribution:');
Object.entries(muscleCount).sort((a, b) => b[1] - a[1]).forEach(([m, c]) => {
  console.log(`  ${m}: ${c}`);
});

// Print difficulty distribution
const diffCount = {};
allWorkouts.forEach(w => {
  diffCount[w.difficulty] = (diffCount[w.difficulty] || 0) + 1;
});
console.log('\nDifficulty distribution:');
Object.entries(diffCount).sort((a, b) => b[1] - a[1]).forEach(([d, c]) => {
  console.log(`  ${d}: ${c}`);
});
