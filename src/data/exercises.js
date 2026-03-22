// Comprehensive exercise database with YouTube video links
// shortsId = Demic (@officialdemic) Shorts, videoId = full tutorial
export const exercises = {
  // CHEST
  benchPress: {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    muscle: 'Chest',
    sets: 4,
    reps: '8-12',
    rest: '90s',
    difficulty: 'beginner',
    alternatives: ['Dumbbell Bench Press', 'Push-ups', 'Machine Chest Press'],
    videoId: 'rT7DgCr-3pg',
    shortsId: 'sRuKSZLcmWM',
    instructions: 'Lie flat on the bench with feet firmly on the floor. Grip the barbell slightly wider than shoulder-width. Unrack and lower the bar slowly to your mid-chest, keeping elbows at about 45 degrees. Press up explosively to full lockout while squeezing your chest at the top.',
    donts: [
      'Don\'t bounce the bar off your chest',
      'Don\'t flare elbows out to 90 degrees',
      'Don\'t lift your hips off the bench',
      'Don\'t use a thumbless (suicide) grip',
    ],
  },
  inclineDumbbellPress: {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscle: 'Upper Chest',
    sets: 3,
    reps: '10-12',
    rest: '60s',
    difficulty: 'beginner',
    alternatives: ['Incline Barbell Press', 'Low-to-High Cable Fly'],
    videoId: '8iPEnn-ltC8',
    instructions: 'Set the bench to 30-45 degrees. Hold dumbbells at shoulder level with palms facing forward. Press the weights up and slightly inward until arms are extended. Lower under control until you feel a stretch in your upper chest.',
    donts: [
      'Don\'t set the bench too steep (above 45 degrees) — it shifts work to shoulders',
      'Don\'t let the dumbbells drift too far forward',
      'Don\'t arch your lower back excessively',
    ],
  },
  cableFly: {
    id: 'cable-fly',
    name: 'Cable Fly',
    muscle: 'Chest',
    sets: 3,
    reps: '12-15',
    rest: '60s',
    difficulty: 'beginner',
    alternatives: ['Dumbbell Fly', 'Pec Deck Machine'],
    videoId: 'Iwe6AmxVf7o',
    shortsId: '4h1AtDNFk2Q',
    instructions: 'Stand in the center of a cable station with a slight forward lean. With a slight bend in your elbows, pull the handles together in a wide hugging motion. Squeeze your chest hard at the bottom, then slowly return to the stretched position.',
    donts: [
      'Don\'t bend your elbows too much — keep them slightly bent throughout',
      'Don\'t use momentum or swing your body',
      'Don\'t let the weight pull your shoulders back aggressively',
    ],
  },
  pushUps: {
    id: 'push-ups',
    name: 'Push-ups',
    muscle: 'Chest',
    sets: 3,
    reps: '15-20',
    rest: '45s',
    difficulty: 'beginner',
    alternatives: ['Knee Push-ups', 'Wall Push-ups'],
    videoId: 'IODxDxX7oi4',
    shortsId: '1AugTfDd3Yk',
    instructions: 'Place hands slightly wider than shoulder-width on the floor. Keep your body in a perfectly straight line from head to heels. Lower yourself until your chest nearly touches the ground, then push back up by fully extending your arms.',
    donts: [
      'Don\'t let your hips sag or pike up',
      'Don\'t flare your elbows out wide',
      'Don\'t do half reps — go through full range of motion',
    ],
  },

  // BACK
  latPulldown: {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscle: 'Back',
    sets: 4,
    reps: '10-12',
    rest: '60s',
    difficulty: 'beginner',
    alternatives: ['Pull-ups', 'Assisted Pull-ups'],
    videoId: 'CAwf7n6Luuc',
    shortsId: 'Mtpf7dI8_jE',
    instructions: 'Sit with thighs secured under the pad. Grip the bar wider than shoulder-width. Pull the bar down to your upper chest while leaning back slightly, focusing on driving your elbows down and squeezing your shoulder blades together. Control the weight on the way up.',
    donts: [
      'Don\'t lean too far back or use momentum',
      'Don\'t pull the bar behind your neck — it strains the shoulders',
      'Don\'t grip too narrow for this variation',
    ],
  },
  barbellRow: {
    id: 'barbell-row',
    name: 'Barbell Row',
    muscle: 'Back',
    sets: 4,
    reps: '8-12',
    rest: '90s',
    difficulty: 'beginner',
    alternatives: ['Dumbbell Row', 'T-Bar Row', 'Cable Row'],
    videoId: 'FWJR5Ve8bnQ',
    shortsId: 'FZ_ObAdQPEo',
    instructions: 'Hinge at the hips until your torso is roughly 45 degrees to the floor. Grip the bar just outside your knees. Pull the barbell to your lower chest or upper abdomen, driving elbows back and squeezing your lats. Lower with control.',
    donts: [
      'Don\'t round your lower back',
      'Don\'t jerk the weight up with momentum',
      'Don\'t stand too upright — maintain the hip hinge',
    ],
  },
  seatedCableRow: {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    muscle: 'Back',
    sets: 3,
    reps: '10-12',
    rest: '60s',
    difficulty: 'beginner',
    alternatives: ['Dumbbell Row', 'Machine Row'],
    videoId: 'GZbfZ033f74',
    shortsId: 'dpgKOu2eqIo',
    instructions: 'Sit upright with feet on the platform and a slight bend in your knees. Pull the handle to your lower torso, squeezing your shoulder blades together at the end. Extend arms forward with control, letting your shoulders stretch slightly.',
    donts: [
      'Don\'t round your back as you reach forward',
      'Don\'t lean too far back when pulling',
      'Don\'t shrug your shoulders — keep them down',
    ],
  },
  facePull: {
    id: 'face-pull',
    name: 'Face Pull',
    muscle: 'Rear Delts/Upper Back',
    sets: 3,
    reps: '15-20',
    rest: '45s',
    difficulty: 'beginner',
    alternatives: ['Reverse Fly', 'Band Pull-aparts'],
    videoId: 'rep-qVOkqgk',
    shortsId: 'zi7waeqXpzw',
    instructions: 'Set the cable at upper chest or face height with a rope attachment. Pull the rope toward your face, separating the ends as you pull. Externally rotate your shoulders so your hands end up beside your ears. Squeeze your rear delts and upper back.',
    donts: [
      'Don\'t use too heavy a weight — this is a control exercise',
      'Don\'t pull to your chest — aim for face level',
      'Don\'t lean back excessively',
    ],
  },

  // SHOULDERS
  overheadPress: {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscle: 'Shoulders',
    sets: 4,
    reps: '8-10',
    rest: '90s',
    difficulty: 'beginner',
    alternatives: ['Dumbbell Shoulder Press', 'Machine Shoulder Press'],
    videoId: '_RlRDWO2jfg',
    instructions: 'Stand with feet shoulder-width apart. Hold the barbell at shoulder level with a grip just outside your shoulders. Brace your core and press the bar straight overhead, moving your head slightly back to clear the bar path. Lock out at the top with the bar directly over your midfoot.',
    donts: [
      'Don\'t arch your lower back excessively',
      'Don\'t press the bar forward of your body — it should go straight up',
      'Don\'t use leg drive (that turns it into a push press)',
    ],
  },
  lateralRaise: {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    muscle: 'Side Delts',
    sets: 3,
    reps: '12-15',
    rest: '45s',
    difficulty: 'beginner',
    alternatives: ['Cable Lateral Raise', 'Machine Lateral Raise'],
    videoId: '3VcKaXpzqRo',
    shortsId: '-_XE4qbV7Yw',
    instructions: 'Stand with dumbbells at your sides, slight bend in elbows. Raise the weights out to your sides until your arms are parallel to the floor. Lead with your elbows, not your hands. Lower slowly under control.',
    donts: [
      'Don\'t swing the weights up with momentum',
      'Don\'t raise higher than shoulder level',
      'Don\'t shrug your traps — keep shoulders depressed',
    ],
  },
  rearDeltFly: {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    muscle: 'Rear Delts',
    sets: 3,
    reps: '12-15',
    rest: '45s',
    difficulty: 'beginner',
    alternatives: ['Face Pull', 'Reverse Pec Deck'],
    videoId: 'EA7u4Q_8HQ0',
    shortsId: 'UO2ADpDnYUE',
    instructions: 'Bend forward at the hips until your torso is nearly parallel to the floor. With a slight bend in your elbows, raise the dumbbells out to your sides. Focus on squeezing your shoulder blades together at the top. Lower slowly.',
    donts: [
      'Don\'t use too heavy a weight — focus on the contraction',
      'Don\'t round your back',
      'Don\'t jerk the weights up',
    ],
  },

  // BICEPS
  barbellCurl: {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    muscle: 'Biceps',
    sets: 3,
    reps: '10-12',
    rest: '60s',
    difficulty: 'beginner',
    alternatives: ['EZ-Bar Curl', 'Dumbbell Curl'],
    videoId: 'kwG2ipFRgFo',
    shortsId: 'EbaRjcixdPc',
    instructions: 'Stand with feet hip-width apart, holding the barbell with an underhand grip at arm\'s length. Keeping your elbows pinned to your sides, curl the bar up to shoulder level. Squeeze your biceps at the top, then lower under control.',
    donts: [
      'Don\'t swing your body or use momentum',
      'Don\'t let your elbows drift forward',
      'Don\'t rush the negative — control the descent',
    ],
  },
  hammerCurl: {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    muscle: 'Biceps/Forearms',
    sets: 3,
    reps: '10-12',
    rest: '60s',
    difficulty: 'beginner',
    alternatives: ['Cross-body Hammer Curl', 'Rope Curl'],
    videoId: 'zC3nLlEvin4',
    instructions: 'Hold dumbbells at your sides with a neutral grip (palms facing each other). Keeping elbows stationary at your sides, curl both dumbbells up toward your shoulders. Squeeze at the top and lower slowly. This targets the brachialis and forearms more than regular curls.',
    donts: [
      'Don\'t let your elbows flare out',
      'Don\'t swing the weights — keep it strict',
      'Don\'t rotate your wrists during the curl',
    ],
  },
  inclineCurl: {
    id: 'incline-curl',
    name: 'Incline Dumbbell Curl',
    muscle: 'Biceps',
    sets: 3,
    reps: '10-12',
    rest: '60s',
    difficulty: 'intermediate',
    alternatives: ['Preacher Curl', 'Concentration Curl'],
    videoId: 'soxrZlIl35U',
    shortsId: 's9hfCnWWhC8',
    instructions: 'Set a bench to about 45 degrees. Sit back and let your arms hang straight down with dumbbells. Curl the weights up while keeping your upper arms stationary. The incline position provides a deeper stretch on the biceps for better activation.',
    donts: [
      'Don\'t bring your elbows forward as you curl',
      'Don\'t use a bench angle that\'s too flat',
      'Don\'t rush — the stretch at the bottom is the key benefit',
    ],
  },

  // TRICEPS
  tricepPushdown: {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    muscle: 'Triceps',
    sets: 3,
    reps: '10-12',
    rest: '60s',
    difficulty: 'beginner',
    alternatives: ['Rope Pushdown', 'Overhead Extension'],
    videoId: '2-LAMcpzODU',
    shortsId: 'NhV457cRuvE',
    instructions: 'Stand at a cable station with a straight bar or V-bar attachment. Keep your elbows pinned to your sides and push the bar down until your arms are fully extended. Squeeze your triceps hard at the bottom, then let the bar come up slowly to about chest level.',
    donts: [
      'Don\'t let your elbows flare away from your body',
      'Don\'t lean over the bar to push more weight',
      'Don\'t use too heavy a weight that forces bad form',
    ],
  },
  overheadTricepExtension: {
    id: 'overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    muscle: 'Triceps',
    sets: 3,
    reps: '10-12',
    rest: '60s',
    difficulty: 'beginner',
    alternatives: ['Skull Crushers', 'Dips'],
    videoId: '_gsUck-7M74',
    shortsId: 'rFNQv9eae6I',
    instructions: 'Hold a dumbbell with both hands overhead, arms fully extended. Keeping your upper arms close to your ears, lower the weight behind your head by bending at the elbows. Extend back up to the starting position and squeeze your triceps.',
    donts: [
      'Don\'t let your elbows flare out wide',
      'Don\'t arch your lower back',
      'Don\'t lower the weight too fast — control is key',
    ],
  },
  dips: {
    id: 'dips',
    name: 'Dips',
    muscle: 'Triceps/Chest',
    sets: 3,
    reps: '8-12',
    rest: '60s',
    difficulty: 'intermediate',
    alternatives: ['Bench Dips', 'Tricep Pushdown'],
    videoId: 'sM6XUdt1rm4',
    shortsId: '1fa6wKSlSY8',
    instructions: 'Grip parallel bars with arms straight. Lean slightly forward for more chest emphasis, or stay upright for triceps focus. Lower yourself by bending your elbows until your upper arms are roughly parallel to the floor. Push back up to full lockout.',
    donts: [
      'Don\'t go too deep — it can strain your shoulders',
      'Don\'t swing or kip to get more reps',
      'Don\'t shrug your shoulders — keep them depressed',
    ],
  },

  // LEGS
  squat: {
    id: 'squat',
    name: 'Barbell Squat',
    muscle: 'Quads/Glutes',
    sets: 4,
    reps: '8-10',
    rest: '120s',
    difficulty: 'beginner',
    alternatives: ['Goblet Squat', 'Leg Press', 'Smith Machine Squat'],
    videoId: 'ultWZbUMPL8',
    shortsId: 'mqIQA1u72Jk',
    instructions: 'Position the bar on your upper back (traps area). Stand with feet shoulder-width apart, toes slightly out. Brace your core, push your hips back, and squat down until your thighs are at least parallel to the floor. Drive through your whole foot to stand back up.',
    donts: [
      'Don\'t let your knees cave inward',
      'Don\'t round your lower back at the bottom',
      'Don\'t rise on your toes — keep feet flat',
      'Don\'t look down — keep a neutral neck',
    ],
  },
  legPress: {
    id: 'leg-press',
    name: 'Leg Press',
    muscle: 'Quads/Glutes',
    sets: 4,
    reps: '10-12',
    rest: '90s',
    difficulty: 'beginner',
    alternatives: ['Squat', 'Hack Squat'],
    videoId: 'IZxyjW7MPJQ',
    shortsId: '8fSPQzY7cpY',
    instructions: 'Sit in the machine with your back flat against the pad. Place feet shoulder-width apart on the platform. Release the safety locks and lower the platform by bending your knees to about 90 degrees. Push back up without locking your knees completely.',
    donts: [
      'Don\'t let your lower back round off the pad',
      'Don\'t lock your knees fully at the top',
      'Don\'t place feet too low on the platform — it stresses the knees',
    ],
  },
  romanianDeadlift: {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscle: 'Hamstrings/Glutes',
    sets: 3,
    reps: '10-12',
    rest: '90s',
    difficulty: 'beginner',
    alternatives: ['Leg Curl', 'Stiff-Leg Deadlift'],
    videoId: '7j-2w4-P14I',
    shortsId: 'U1XmhaOyNFQ',
    instructions: 'Hold the barbell at hip level with a shoulder-width grip. Keep a slight bend in your knees. Push your hips back and lower the bar along your legs until you feel a deep stretch in your hamstrings (usually mid-shin level). Drive your hips forward to return to standing.',
    donts: [
      'Don\'t round your back at any point',
      'Don\'t bend your knees too much — this is a hip hinge, not a squat',
      'Don\'t lower the bar too far past mid-shin',
    ],
  },
  legCurl: {
    id: 'leg-curl',
    name: 'Seated Leg Curl',
    muscle: 'Hamstrings',
    sets: 3,
    reps: '10-12',
    rest: '60s',
    difficulty: 'beginner',
    alternatives: ['Romanian Deadlift', 'Lying Leg Curl', 'Nordic Curl'],
    videoId: 'GFsPuMEVMjc',
    instructions: 'Sit in the seated leg curl machine with your back against the pad and the ankle pad resting on the back of your lower legs. Adjust the thigh pad to sit snugly on your quads. Curl your legs down and back by contracting your hamstrings. Squeeze at the bottom, then return slowly to the starting position.',
    donts: [
      'Don\'t let your hips lift off the seat',
      'Don\'t use momentum — control the movement',
      'Don\'t extend your legs too fast on the way back up',
    ],
  },
  legExtension: {
    id: 'leg-extension',
    name: 'Leg Extension',
    muscle: 'Quads',
    sets: 3,
    reps: '12-15',
    rest: '60s',
    difficulty: 'beginner',
    alternatives: ['Bulgarian Split Squat', 'Lunges'],
    videoId: 'YyvSfVjQeL0',
    shortsId: 'Adi90VeEG5M',
    instructions: 'Sit in the machine with the pad on your shins just above the ankles. Extend your legs until they are straight, squeezing your quads hard at the top. Lower under control — don\'t just drop the weight. Focus on the mind-muscle connection.',
    donts: [
      'Don\'t use excessive weight that causes you to jerk',
      'Don\'t hyperextend your knees at the top',
      'Don\'t lift your hips off the seat',
    ],
  },
  calfRaise: {
    id: 'calf-raise',
    name: 'Calf Raise',
    muscle: 'Calves',
    sets: 4,
    reps: '15-20',
    rest: '45s',
    difficulty: 'beginner',
    alternatives: ['Seated Calf Raise', 'Smith Machine Calf Raise'],
    videoId: 'gwLzBJYoWlI',
    shortsId: 'QZ9TMPDnAzs',
    instructions: 'Stand on the edge of a raised platform or step with the balls of your feet. Lower your heels below the platform for a full stretch, then push up onto your toes as high as possible. Squeeze your calves at the top and hold for a moment before lowering.',
    donts: [
      'Don\'t bounce at the bottom — control the stretch',
      'Don\'t do half reps — full range of motion is crucial for calves',
      'Don\'t lean forward excessively',
    ],
  },

  // CORE
  plank: {
    id: 'plank',
    name: 'Plank',
    muscle: 'Core',
    sets: 3,
    reps: '30-60s',
    rest: '45s',
    difficulty: 'beginner',
    alternatives: ['Side Plank', 'Dead Bug'],
    videoId: 'ASdvN_XEl_c',
    shortsId: 'N31wPfeQbNs',
    instructions: 'Get into a forearm plank position with elbows directly under your shoulders. Keep your body in a perfectly straight line from head to heels. Engage your core by pulling your belly button toward your spine. Breathe steadily and hold the position for the prescribed time.',
    donts: [
      'Don\'t let your hips sag toward the floor',
      'Don\'t pike your hips up too high',
      'Don\'t hold your breath',
    ],
  },
  cableCrunch: {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    muscle: 'Abs',
    sets: 3,
    reps: '15-20',
    rest: '45s',
    difficulty: 'beginner',
    alternatives: ['Crunches', 'Ab Wheel'],
    videoId: 'AV5PmrFDEMo',
    shortsId: 'PLJyK26Grlo',
    instructions: 'Kneel below a high cable pulley with a rope attachment. Hold the rope beside your head. Crunch down by flexing your spine, bringing your elbows toward your knees. Focus on contracting your abs, not just bending at the hips. Return to the starting position with control.',
    donts: [
      'Don\'t sit back on your heels — keep hips stationary',
      'Don\'t pull with your arms — the movement comes from your abs',
      'Don\'t use too heavy a weight that prevents proper form',
    ],
  },
  hangingLegRaise: {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscle: 'Lower Abs',
    sets: 3,
    reps: '10-15',
    rest: '60s',
    difficulty: 'intermediate',
    alternatives: ['Lying Leg Raise', 'Knee Raise'],
    videoId: 'hdng3Nm1x_E',
    instructions: 'Hang from a pull-up bar with a shoulder-width grip. With legs straight (or slightly bent for beginners), raise them up until they are parallel to the floor or higher. Lower them back down slowly — don\'t just let them swing. Focus on using your abs to lift, not hip flexors.',
    donts: [
      'Don\'t swing or use momentum',
      'Don\'t let your body sway back and forth',
      'Don\'t shrug your shoulders while hanging',
    ],
  },

  // SHOULDERS (additional)
  dumbbellShoulderPress: {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    muscle: 'Shoulders',
    sets: 4,
    reps: '8-12',
    rest: '90s',
    difficulty: 'beginner',
    alternatives: ['Overhead Press', 'Machine Shoulder Press', 'Arnold Press'],
    videoId: 'qEwKCR5JCog',
    shortsId: 'NQ-JJYay1TM',
    instructions: 'Sit on a bench with back support, holding a dumbbell in each hand at shoulder height with palms facing forward. Press the dumbbells overhead until your arms are fully extended, bringing them slightly together at the top. Lower under control back to shoulder level.',
    donts: [
      'Don\'t arch your lower back — keep it pressed against the bench',
      'Don\'t let the dumbbells drift too far forward or backward',
      'Don\'t bang the dumbbells together at the top',
    ],
  },
  inclineBarbellPress: {
    id: 'incline-barbell-press',
    name: 'Incline Barbell Press',
    muscle: 'Upper Chest',
    sets: 4,
    reps: '8-10',
    rest: '90s',
    difficulty: 'beginner',
    alternatives: ['Incline Dumbbell Press', 'Low-to-High Cable Fly'],
    videoId: 'SrqOu55lrYU',
    shortsId: 'd5hmgyUPYUg',
    instructions: 'Set the bench to 30-45 degrees. Lie back and grip the barbell slightly wider than shoulder-width. Unrack the bar and lower it to your upper chest with elbows at about 45 degrees. Press up explosively to full lockout while focusing on your upper chest.',
    donts: [
      'Don\'t set the bench too steep (above 45 degrees) — it shifts work to shoulders',
      'Don\'t bounce the bar off your chest',
      'Don\'t flare your elbows out to 90 degrees',
    ],
  },

  // COMPOUND
  deadlift: {
    id: 'deadlift',
    name: 'Deadlift',
    muscle: 'Full Body',
    sets: 4,
    reps: '5-8',
    rest: '120s',
    difficulty: 'intermediate',
    alternatives: ['Trap Bar Deadlift', 'Romanian Deadlift'],
    videoId: 'op9kVnSso6Q',
    shortsId: 'GIbBiT_0TnM',
    instructions: 'Stand with feet hip-width apart, bar over mid-foot. Hinge at the hips and grip the bar just outside your knees. Brace your core, flatten your back, and drive through the floor to stand up. The bar should travel in a straight line close to your body. Lock out at the top by squeezing your glutes.',
    donts: [
      'Don\'t round your lower back — this is the number one injury risk',
      'Don\'t jerk the bar off the floor — build tension first',
      'Don\'t let the bar drift away from your body',
      'Don\'t hyperextend at the top by leaning back',
    ],
  }
};

// Workout split templates
export const workoutSplits = {
  fullBody3: {
    name: 'Full Body (3 days)',
    days: 3,
    level: 'beginner',
    schedule: [
      {
        day: 'Day 1 - Full Body A',
        exercises: ['squat', 'benchPress', 'barbellRow', 'overheadPress', 'barbellCurl', 'plank']
      },
      {
        day: 'Day 2 - Full Body B',
        exercises: ['legPress', 'inclineDumbbellPress', 'latPulldown', 'lateralRaise', 'tricepPushdown', 'cableCrunch']
      },
      {
        day: 'Day 3 - Full Body C',
        exercises: ['romanianDeadlift', 'cableFly', 'seatedCableRow', 'facePull', 'hammerCurl', 'hangingLegRaise']
      }
    ]
  },
  upperLower4: {
    name: 'Upper/Lower Split (4 days)',
    days: 4,
    level: 'beginner',
    schedule: [
      {
        day: 'Day 1 - Upper Body',
        exercises: ['benchPress', 'barbellRow', 'overheadPress', 'latPulldown', 'barbellCurl', 'tricepPushdown']
      },
      {
        day: 'Day 2 - Lower Body',
        exercises: ['squat', 'romanianDeadlift', 'legPress', 'legCurl', 'calfRaise', 'plank']
      },
      {
        day: 'Day 3 - Upper Body',
        exercises: ['inclineDumbbellPress', 'seatedCableRow', 'lateralRaise', 'cableFly', 'hammerCurl', 'overheadTricepExtension']
      },
      {
        day: 'Day 4 - Lower Body',
        exercises: ['legPress', 'romanianDeadlift', 'legExtension', 'legCurl', 'calfRaise', 'cableCrunch']
      }
    ]
  },
  ppl5: {
    name: 'Push/Pull/Legs (5 days)',
    days: 5,
    level: 'intermediate',
    schedule: [
      {
        day: 'Day 1 - Push',
        exercises: ['benchPress', 'overheadPress', 'inclineDumbbellPress', 'lateralRaise', 'tricepPushdown', 'cableFly']
      },
      {
        day: 'Day 2 - Pull',
        exercises: ['barbellRow', 'latPulldown', 'seatedCableRow', 'facePull', 'barbellCurl', 'hammerCurl']
      },
      {
        day: 'Day 3 - Legs',
        exercises: ['squat', 'romanianDeadlift', 'legPress', 'legCurl', 'legExtension', 'calfRaise']
      },
      {
        day: 'Day 4 - Push',
        exercises: ['inclineDumbbellPress', 'overheadPress', 'cableFly', 'lateralRaise', 'overheadTricepExtension', 'dips']
      },
      {
        day: 'Day 5 - Pull',
        exercises: ['latPulldown', 'barbellRow', 'facePull', 'seatedCableRow', 'inclineCurl', 'hammerCurl']
      }
    ]
  },
  ppl6: {
    name: 'Push/Pull/Legs (6 days)',
    days: 6,
    level: 'intermediate',
    schedule: [
      {
        day: 'Day 1 - Push',
        exercises: ['benchPress', 'overheadPress', 'inclineDumbbellPress', 'lateralRaise', 'tricepPushdown', 'cableFly']
      },
      {
        day: 'Day 2 - Pull',
        exercises: ['deadlift', 'latPulldown', 'seatedCableRow', 'facePull', 'barbellCurl', 'hammerCurl']
      },
      {
        day: 'Day 3 - Legs',
        exercises: ['squat', 'romanianDeadlift', 'legPress', 'legCurl', 'legExtension', 'calfRaise']
      },
      {
        day: 'Day 4 - Push',
        exercises: ['inclineDumbbellPress', 'overheadPress', 'cableFly', 'lateralRaise', 'overheadTricepExtension', 'dips']
      },
      {
        day: 'Day 5 - Pull',
        exercises: ['barbellRow', 'latPulldown', 'facePull', 'seatedCableRow', 'inclineCurl', 'hammerCurl']
      },
      {
        day: 'Day 6 - Legs',
        exercises: ['legPress', 'romanianDeadlift', 'legExtension', 'legCurl', 'calfRaise', 'hangingLegRaise']
      }
    ]
  }
};
