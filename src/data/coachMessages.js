export const coachMessages = {
  workoutComplete: [
    'Beast mode activated!',
    "That's how champions train!",
    'Another workout crushed!',
    "You're stronger than yesterday!",
    "Iron doesn't lie — great session!",
    'Consistency beats everything. Well done!',
    'One step closer to your goal!',
    'Your future self will thank you!',
  ],
  workoutStart: [
    'Time to battle! Give it everything!',
    'The arena awaits — let\'s go!',
    'No mercy! Push through every rep!',
    'Lock in, this is where champions are made!',
    'The iron doesn\'t lift itself — attack it!',
    'Dominate every set. No excuses!',
  ],
  workoutCancel: [
    'Rest up — come back stronger tomorrow!',
    'Every champion needs a breather. See you soon!',
    'Take your time. The iron will wait.',
    'No worries — recovery matters too!',
  ],
  mealLogged: [
    'Fuel up! Muscles are built in the kitchen',
    'Good nutrition = good gains!',
    'Eating like a champion!',
    "That's the right fuel for your body!",
    'Diet on point today!',
    'Your muscles will thank you!',
    'Proper fuel for proper gains!',
  ],
  mealUndo: [
    'No problem — log when you\'re ready!',
    'Mistakes happen. Adjust and keep going!',
    'All good — accuracy matters!',
  ],
  weightLogged: [
    'Tracking is the first step to progress!',
    "Numbers don't lie — keep logging!",
    'Every weigh-in tells a story!',
    'Consistency in tracking = consistency in results!',
    'Data is power — keep it up!',
  ],
  milestone: [
    'LEGENDARY! You just hit a milestone!',
    "Now THAT'S progress! Keep going!",
    "You're on fire! Nothing can stop you!",
    'Badge unlocked! You are leveling up!',
    "That's what I'm talking about!",
  ],
  streak: [
    "Streak machine! Don't break the chain!",
    'Consistency is your superpower!',
    "Day after day — that's dedication!",
    'The streak continues! Unstoppable!',
  ],
  coachTip: [
    'Remember: progressive overload is key!',
    'Sleep 7-9 hours — growth happens at rest',
    'Drink at least 3L water today',
    'Rest days are growth days!',
    'Form over ego — always!',
    'Warm up before every session',
  ],
  dailyWelcome: [
    'Rise and grind, soldier! Time to conquer the day!',
    'Welcome back, warrior! The iron awaits!',
    'The fighter has returned! Let\'s make today count!',
    'Reporting for duty? Good. Let\'s dominate!',
    'A true champion never misses a day. Let\'s go!',
    'Back for more? That\'s the winning mindset!',
    'The battlefield awaits! No retreat, no surrender!',
    'Another day, another chance to level up!',
  ],
  onboarding: [
    'Let\'s get you set up! First things first.',
    'Nice to meet you! Let\'s make this personal.',
    'Good — every champion started right here.',
    'Getting your numbers right is half the battle!',
    'Show me what you\'re working with!',
    'A clear goal makes all the difference.',
    'Time to plan your training schedule!',
    'Almost done — the finish line is right there!',
  ],
  planReady: [
    'Your battle plan is ready! Time to execute!',
    'The blueprint is set. No excuses now!',
    'Everything\'s locked in. Now GO CONQUER!',
  ],
  letsGo: [
    'Let\'s get it, champion! The grind starts NOW!',
    'Time to turn plans into results!',
    'The journey begins — give it everything!',
    'All set! Now make every rep count!',
  ],
  resetData: [
    'Starting fresh? Respect. Let\'s rebuild stronger!',
    'Clean slate — time to come back even better!',
    'A new beginning. Make this one count!',
  ],
};

const counters = {};

export function getNextMessage(type) {
  if (!counters[type]) counters[type] = 0;
  const messages = coachMessages[type];
  if (!messages) return '';
  const msg = messages[counters[type] % messages.length];
  counters[type]++;
  return msg;
}
