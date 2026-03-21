export const quotes = [
  { text: "The only bad workout is the one that didn't happen.", author: "One Of Us" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "One Of Us" },
  { text: "Strive for progress, not perfection.", author: "One Of Us" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
  { text: "Don't limit your challenges, challenge your limits.", author: "One Of Us" },
  { text: "It never gets easier, you just get stronger.", author: "One Of Us" },
  { text: "The gym is not about getting a six-pack. It's about finding your strength.", author: "One Of Us" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Sweat is just fat crying.", author: "One Of Us" },
  { text: "Exercise is king. Nutrition is queen. Put them together and you've got a kingdom.", author: "Jack LaLanne" },
  { text: "Wake up with determination, go to bed with satisfaction.", author: "One Of Us" },
  { text: "No matter how slow you go, you are still lapping everybody on the couch.", author: "One Of Us" },
  { text: "Train insane or remain the same.", author: "One Of Us" },
  { text: "A year from now you will wish you had started today.", author: "Karen Lamb" },
  { text: "Your only limit is you.", author: "One Of Us" },
  { text: "Push harder than yesterday if you want a different tomorrow.", author: "One Of Us" },
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { text: "If you still look good at the end of your workout, you didn't train hard enough.", author: "One Of Us" },
  { text: "Rome wasn't built in a day, but they worked on it every single day.", author: "One Of Us" },
  { text: "You don't have to be extreme, just consistent.", author: "One Of Us" },
  { text: "The harder you work, the luckier you get.", author: "Gary Player" },
  { text: "Champions are made in the off-season.", author: "One Of Us" },
  { text: "Results happen over time, not overnight. Work hard, stay consistent, and be patient.", author: "One Of Us" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Every champion was once a contender that refused to give up.", author: "Rocky Balboa" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", author: "Muhammad Ali" },
  { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Khloe Kardashian" },
];

export function getRandomQuote() {
  const today = new Date();
  const dayIndex = today.getDate() % quotes.length;
  return quotes[dayIndex];
}

export function getDailyQuote() {
  // Returns a consistent quote for the day based on the date
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return quotes[seed % quotes.length];
}
