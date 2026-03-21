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
  mealLogged: [
    'Fuel up! Muscles are built in the kitchen',
    'Good nutrition = good gains!',
    'Eating like a champion!',
    "That's the right fuel for your body!",
    'Diet on point today!',
    'Your muscles will thank you!',
    'Proper fuel for proper gains!',
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
