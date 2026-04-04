import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  ChevronDown,
  Search,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  Trophy,
  Crown,
  Heart,
  User,
  Rocket,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';

const faqData = [
  {
    category: 'Getting Started',
    icon: Rocket,
    color: 'text-accent',
    questions: [
      {
        q: 'What is OwnGainz?',
        a: 'OwnGainz is your personal gym companion app. It generates a customized workout plan, a calorie-matched South Indian diet plan, tracks your progress, and keeps you motivated with XP, streaks, and transformation levels — all tailored to your body and goals.',
      },
      {
        q: 'How do I create an account?',
        a: 'Tap "Get Started" on the landing page and sign in with your Google account. That\'s it — no separate signup needed. Your data syncs securely to the cloud.',
      },
      {
        q: 'What happens during onboarding?',
        a: 'You\'ll go through 8 quick steps: gender, name, age, height & weight, activity level, fitness goal (weight loss / muscle gain / maintenance), workout preferences (days per week & duration), and diet type (veg or non-veg + supplements). Based on your answers, the app calculates your TDEE, calorie targets, and generates personalized workout and diet plans.',
      },
      {
        q: 'Can I change my profile details later?',
        a: 'Yes! Go to your Profile page and tap "Edit Profile" to update your name, age, height, or weight. Changes to your goal or diet type require re-onboarding to regenerate your plans.',
      },
      {
        q: 'How is my workout plan generated?',
        a: 'Based on how many days per week you can train, the app selects the best split: 3 days → Full Body, 4 days → Upper/Lower, 5 days → Push/Pull/Legs, 6 days → PPL twice. Each exercise includes sets, reps, rest times, form instructions, and common mistakes to avoid.',
      },
      {
        q: 'How is my diet plan calculated?',
        a: 'Your BMR (Basal Metabolic Rate) is calculated using the Mifflin-St Jeor equation, then adjusted for activity level to get your TDEE (Total Daily Energy Expenditure). A calorie surplus or deficit is applied based on your goal. The app then selects the closest calorie tier (1500–3000 cal) and serves meals that match your target.',
      },
    ],
  },
  {
    category: 'Workout',
    icon: Dumbbell,
    color: 'text-accent',
    questions: [
      {
        q: 'How do I log a workout?',
        a: 'Go to the Workout page, select your day, and tap "Start Workout". For each exercise, enter the reps and weight (kg) for each set. When done, tap "Save Workout". You need to fill in at least 2 sets with reps before saving.',
      },
      {
        q: 'Why can I only log one workout per day?',
        a: 'To prevent accidental duplicate entries and encourage proper rest, the app limits you to one workout log per day. If you made a mistake, you can delete the log from your workout history and re-log.',
      },
      {
        q: 'What does "at least 2 sets" mean?',
        a: 'To ensure meaningful data, you must enter reps for at least 2 sets across your exercises before saving. This prevents empty or accidental logs that would mess up your progress tracking.',
      },
      {
        q: 'Can I add or remove sets for an exercise?',
        a: 'Yes! When logging, each exercise shows +/- buttons next to the set count. Add extra sets if you\'re feeling strong, or remove sets if you need to cut short. The app tracks exactly what you did.',
      },
      {
        q: 'What is progressive overload?',
        a: 'Progressive overload is the key to building muscle. Pick a weight you can do for 8 reps with good form. Stick with that weight until you can do 12 reps easily, then increase the weight and go back to 8 reps. This gradual increase forces your muscles to adapt and grow.',
      },
      {
        q: 'What is ego lifting and why should I avoid it?',
        a: 'Ego lifting means using weight that\'s too heavy just to look impressive, sacrificing form in the process. This leads to injuries, not gains. Control the weight, feel the muscle working, and use slow, controlled reps. Proper form with moderate weight beats heavy sloppy reps every single time. Leave your ego at the door.',
      },
      {
        q: 'How do I delete a workout log?',
        a: 'Go to the Workout page, tap "History", and find the log you want to remove. Each log has a small trash icon on the right — tap it and confirm to delete. The log is removed from both your device and the cloud database.',
      },
      {
        q: 'What are workout splits?',
        a: 'A split is how you divide your training across the week. Full Body (3 days) trains everything each session. Upper/Lower (4 days) alternates between upper and lower body. Push/Pull/Legs (5-6 days) groups muscles by movement pattern — pushing (chest, shoulders, triceps), pulling (back, biceps), and legs.',
      },
      {
        q: 'How do rest periods work?',
        a: 'Each exercise has a recommended rest time (e.g., 60s, 90s). For heavy compound lifts like squats and deadlifts, rest 90-120 seconds. For isolation exercises like curls, 45-60 seconds is enough. Shorter rest keeps your heart rate up (good for fat loss), longer rest lets you lift heavier (good for strength).',
      },
      {
        q: 'Can I see video tutorials for exercises?',
        a: 'Yes — all users get free access to YouTube video tutorials and GIF form guides for every exercise. Tap "Show Video" when viewing an exercise to watch the tutorial. No Pro subscription needed for videos.',
      },
    ],
  },
  {
    category: 'Diet & Nutrition',
    icon: UtensilsCrossed,
    color: 'text-green-400',
    questions: [
      {
        q: 'How does the meal plan work?',
        a: 'Your meal plan has 5 slots: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, and Dinner. Each slot has 7 different meal options that rotate daily — so you get a different meal every day of the week automatically. All meals are South Indian focused and calorie-matched to your tier.',
      },
      {
        q: 'Why do I see different meals each day?',
        a: 'The app rotates through 7 meal options for each slot based on the day of the week. Monday shows option 1, Tuesday shows option 2, and so on. This ensures variety so you don\'t eat the same thing every day.',
      },
      {
        q: 'How do I swap a meal?',
        a: 'Expand any meal card and tap the "Swap Meal" button. You\'ll see all 7 available options for that slot with their calories and protein. Tap any option to replace the current meal. Your swap is saved for that date.',
      },
      {
        q: 'How do I add custom food items?',
        a: 'Expand a meal card and tap "Add Items". Type the food name — the app searches its database of 490+ meals and food items first. If found, calories and protein auto-fill. If not found, you\'ll be asked to enter the values manually. The custom item gets added to that meal\'s log.',
      },
      {
        q: 'What does the food search do?',
        a: 'When you type a food name in the custom food input, the app searches through all meals and individual food items across all calorie tiers. It finds matches by name — for example, searching "chicken" will show chicken curry, chicken 65, grilled chicken breast, and more. Select one to auto-fill the nutrition values.',
      },
      {
        q: 'How are calories adjusted when I deselect items?',
        a: 'Each meal shows checkboxes next to individual food items. Uncheck items you didn\'t eat, and the calories and protein are recalculated proportionally. For example, if a 400-cal meal has 4 items and you uncheck 1, the adjusted total becomes ~300 cal.',
      },
      {
        q: 'Why should I stay hydrated?',
        a: 'Water is essential for muscle recovery, metabolism, digestion, and mental focus. Aim for at least 3-4 litres daily. Dehydration can reduce workout performance by up to 25% and slow down fat loss. Carry a water bottle everywhere — if you feel thirsty, you\'re already dehydrated.',
      },
      {
        q: 'What are supplements and should I take them?',
        a: 'During onboarding, you can choose to include supplements. If enabled, your plan adds pre-workout (banana + coffee), post-workout (whey protein + banana), and before-bed (milk + nuts) supplements totaling ~500 extra calories and 73g protein. Supplements are helpful but not required — whole foods come first.',
      },
      {
        q: "What's the difference between veg and non-veg plans?",
        a: 'Both plans are calorie-matched to the same tier. Veg plans use paneer, dal, curd, soya chunks, chickpeas, and eggs as protein sources. Non-veg plans include chicken, fish, eggs, and mutton. Non-veg plans typically have higher protein per meal. If you\'re vegetarian and need high protein (100g+), consider adding whey protein.',
      },
      {
        q: 'How are my daily calorie targets set?',
        a: 'Your target calories = TDEE adjusted for your goal. Weight loss gets a 300-500 cal deficit (based on body weight). Muscle gain gets a 250-400 cal surplus. Maintenance stays at TDEE. The app then matches you to the nearest calorie tier (1500, 1800, 2000, 2200, 2500, 2800, or 3000) so meals add up correctly.',
      },
    ],
  },
  {
    category: 'Progress & Tracking',
    icon: TrendingUp,
    color: 'text-blue-400',
    questions: [
      {
        q: 'How do I log my weight?',
        a: 'Go to the Progress page and enter your current weight in the "Log Weight" section. Your weight is tracked over time and displayed on a trend chart so you can see your transformation.',
      },
      {
        q: 'Why can I only log weight once a week?',
        a: 'Weight fluctuates daily due to water retention, food intake, and other factors. Logging once every 7 days gives a more accurate picture of your actual trend. You can log on any day, but the next log will be available after 7 days. This prevents anxiety from daily fluctuations and helps you focus on the long-term trajectory.',
      },
      {
        q: 'How is my streak calculated?',
        a: 'Your streak counts consecutive days where you logged a workout. Miss a day and it resets to 0. The app also tracks your longest streak ever. Streaks are a great motivator — try to beat your personal best!',
      },
      {
        q: 'What do the progress charts show?',
        a: 'Pro users get two charts: a Weight Trend chart (area graph showing your weight over time) and a Workout Frequency chart (bar graph showing how many workouts you did each week over the last 4 weeks). These help you spot patterns and stay accountable.',
      },
      {
        q: 'How does the Smart Coach work?',
        a: 'The Smart Coach analyzes your workout compliance, protein adherence, calorie consistency, and progress metrics to give personalized recommendations. It might suggest increasing calories if you\'re not gaining, or adjusting your training split if you\'re not recovering well.',
      },
    ],
  },
  {
    category: 'Gamification & XP',
    icon: Trophy,
    color: 'text-yellow-400',
    questions: [
      {
        q: 'How does the XP system work?',
        a: 'You earn XP (Experience Points) for actions like logging workouts (+50 XP), logging meals (+20 XP), logging weight (+15 XP), and daily login (+10 XP). Streak milestones give bonus XP (7-day: +100, 14-day: +200, 30-day: +500). XP accumulates over time, determines your medal tier, and feeds into the weekly leaderboard rankings.',
      },
      {
        q: 'What are transformation levels?',
        a: 'There are 12 transformation levels that represent your fitness journey: from First Step all the way up to Transformed (Elite). Levels are based on actual metrics — workout consistency, streak milestones, strength gains, body weight changes, and protein adherence. Each level has specific tasks to complete. Check your current level on your Profile page.',
      },
      {
        q: 'How do I earn medals?',
        a: 'There are 8 medal tiers based on your total XP: Starter (0), Bronze (100 XP), Silver (500 XP), Gold (1500 XP), Platinum (3000 XP), Diamond (5000 XP), Master (8000 XP), and Champion (12000 XP). Keep logging workouts and meals consistently to climb the ranks.',
      },
      {
        q: 'What actions give XP?',
        a: 'Logging a workout: +50 XP. Logging a meal: +20 XP. Logging weight: +15 XP. Daily login: +10 XP. Streak bonuses: +100 XP at 7 days, +200 XP at 14 days, +500 XP at 30 days. The more consistent you are, the faster you level up.',
      },
    ],
  },
  {
    category: 'Free vs Pro',
    icon: Crown,
    color: 'text-purple-400',
    questions: [
      {
        q: 'What features are free?',
        a: 'Free users get: personalized workout plan, video tutorials and GIF form guides for every exercise, diet plan with calorie and macro targets, weight logging (weekly), explore 400+ exercises, gamification (XP, streaks, 12 levels, 8 medals), leaderboard, Knowledge Hub guides, and referral rewards.',
      },
      {
        q: 'What do I get with Pro?',
        a: 'Pro unlocks: save and track workout logs, custom workout builder, exercise swap alternatives, full meal tracking with swaps and custom food logging, supplements tracking, today\'s intake tracking, complete workout history, progress charts and analytics, and Smart Coach AI recommendations.',
      },
      {
        q: 'How do I upgrade to Pro?',
        a: 'Tap the "Upgrade" banner on your Dashboard or look for the lock icon on Pro features. Pro is available as a monthly (₹149/month) or yearly (₹999/year) subscription via Razorpay. You can cancel anytime from your Profile page.',
      },
      {
        q: 'What is the leaderboard?',
        a: 'The leaderboard lets you compete with other users across three categories: Weekly XP (resets every week), All-Time XP, and Streak (consecutive workout days). Top 5 users on the weekly leaderboard earn reward points every Sunday — 1st place gets 50 points, 2nd gets 40, 3rd gets 30, and so on. You need at least 300 weekly XP to qualify.',
      },
      {
        q: 'How do referral rewards work?',
        a: 'Share your unique referral link from the Rewards page. When a friend signs up, you earn 10 points. When they subscribe to Pro, you earn 100 points and they get ₹30 off. Accumulate 500 points to redeem 1 month of free Pro. Invite 5 friends who subscribe and you get free Pro!',
      },
    ],
  },
  {
    category: 'General Fitness',
    icon: Heart,
    color: 'text-red-400',
    questions: [
      {
        q: 'How much protein do I need daily?',
        a: 'For muscle building: 1.6-2.2g per kg of body weight. For weight loss: 2.0g per kg (higher protein helps preserve muscle during a deficit). For maintenance: 1.4-1.6g per kg. Example: a 70kg person aiming for muscle gain needs 126-154g protein daily.',
      },
      {
        q: 'How much water should I drink?',
        a: 'Aim for 3-4 litres daily, more if you sweat heavily during workouts. Water aids digestion, nutrient absorption, muscle recovery, and fat metabolism. A simple check: your urine should be light yellow. Dark yellow means you need more water.',
      },
      {
        q: "What's the best time to work out?",
        a: 'The best time is whenever you can be consistent. Research shows minimal difference between morning and evening training for muscle growth. Some people have more energy in the evening, others prefer getting it done in the morning. Pick a time you can stick to 4-6 days a week.',
      },
      {
        q: 'How many days a week should I train?',
        a: 'For beginners: 3-4 days. For intermediate: 4-5 days. For advanced: 5-6 days. Each muscle group needs 48-72 hours of recovery. More isn\'t always better — recovery is when muscles actually grow. Listen to your body and take rest days when needed.',
      },
      {
        q: 'Should I do cardio with weight training?',
        a: 'For weight loss: yes, add 15-20 minutes of walking after your weight session. For muscle gain: keep cardio minimal (2-3 light sessions per week) to avoid burning excess calories. Walking is the best form of cardio — it burns fat without affecting recovery.',
      },
      {
        q: 'How important is sleep for muscle growth?',
        a: 'Critical. Most muscle repair and growth hormone release happens during deep sleep. Aim for 7-9 hours per night. Poor sleep reduces testosterone, increases cortisol (stress hormone), and kills your recovery. No amount of training or nutrition can compensate for consistently bad sleep.',
      },
      {
        q: 'What should I eat before and after a workout?',
        a: 'Pre-workout (1-2 hours before): carbs + moderate protein — like a banana with peanut butter, or oats with milk. Post-workout (within 1-2 hours): protein + carbs — like a whey shake with banana, or rice with chicken/dal. Post-workout nutrition helps muscle recovery and glycogen replenishment.',
      },
      {
        q: 'How long does it take to see results?',
        a: 'Strength gains: 2-4 weeks (neural adaptations). Visible muscle growth: 8-12 weeks of consistent training. Fat loss: noticeable in 4-6 weeks with proper diet. Full body transformation: 6-12 months. Consistency is everything — trust the process and don\'t expect overnight changes.',
      },
      {
        q: 'What if I miss a workout?',
        a: 'Missing one day won\'t ruin your progress. Don\'t try to "make up" by doing double workouts — that increases injury risk. Just get back on track the next day. What matters is your consistency over weeks and months, not one individual session.',
      },
    ],
  },
  {
    category: 'Account & Data',
    icon: User,
    color: 'text-cyan-400',
    questions: [
      {
        q: 'Is my data synced across devices?',
        a: 'Yes! Your workout logs, meal logs, progress data, and profile are stored in the cloud via Supabase. When you switch devices, your data loads automatically after signing in. The app also refreshes data when you switch back to the tab, so changes from other devices appear within 30 seconds.',
      },
      {
        q: 'How do I sign out?',
        a: 'On desktop: click the logout button in the top navigation bar. On mobile: open the hamburger menu (three lines icon) and tap "Sign Out". Signing out clears your local data but everything is safely stored in the cloud.',
      },
      {
        q: 'How do I reset my data?',
        a: 'Go to your Profile page and scroll to the bottom. You\'ll find a "Reset Data" option. This clears all your local data including workout logs, meal logs, and progress. Use this if you want a fresh start. Note: this action cannot be undone.',
      },
      {
        q: 'Can I change my goal after onboarding?',
        a: 'Currently, changing your fitness goal (weight loss, muscle gain, maintenance) requires re-onboarding to regenerate your workout and diet plans. Go to Profile and use the reset option, then complete onboarding again with your new goal.',
      },
    ],
  },
];

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [expandedQ, setExpandedQ] = useState(null); // "category-index"
  const [expandedCat, setExpandedCat] = useState(null);

  const filtered = search.length < 2
    ? faqData
    : faqData
        .map((cat) => ({
          ...cat,
          questions: cat.questions.filter(
            (item) =>
              item.q.toLowerCase().includes(search.toLowerCase()) ||
              item.a.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((cat) => cat.questions.length > 0);

  const totalQuestions = faqData.reduce((sum, cat) => sum + cat.questions.length, 0);

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
          <span className="gradient-text">FAQ</span> <span className="text-text-primary">& Help</span>
        </h1>
        <p className="text-text-muted text-sm">{totalQuestions} questions across {faqData.length} categories</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setExpandedQ(null); }}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent/30 transition-colors"
        />
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="text-center py-16 border border-white/[0.06] rounded-xl">
          <HelpCircle size={40} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted text-sm">No questions match "{search}"</p>
        </div>
      )}

      {/* FAQ Categories */}
      <div className="space-y-3">
        {filtered.map((cat, ci) => {
          const Icon = cat.icon;
          const isCatOpen = expandedCat === ci || search.length >= 2;

          return (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.03 }}
              className="border border-white/[0.06] rounded-xl"
            >
              {/* Category Header */}
              <button
                onClick={() => setExpandedCat(isCatOpen && search.length < 2 ? null : ci)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <Icon size={16} className={cat.color} />
                  </div>
                  <div className="text-left">
                    <h2 className="font-semibold text-sm text-text-primary">{cat.category}</h2>
                    <span className="text-[11px] text-text-muted">{cat.questions.length} questions</span>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isCatOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="text-text-muted" />
                </motion.div>
              </button>

              {/* Questions */}
              <AnimatePresence>
                {isCatOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-1">
                      {cat.questions.map((item, qi) => {
                        const qKey = `${ci}-${qi}`;
                        const isOpen = expandedQ === qKey;

                        return (
                          <div key={qi} className="border border-white/[0.04] rounded-lg overflow-hidden">
                            <button
                              onClick={() => setExpandedQ(isOpen ? null : qKey)}
                              className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/[0.02] transition-colors"
                            >
                              <HelpCircle size={14} className={`shrink-0 mt-0.5 ${isOpen ? 'text-accent' : 'text-text-muted/40'}`} />
                              <span className={`text-sm flex-1 ${isOpen ? 'text-accent font-medium' : 'text-text-secondary'}`}>
                                {item.q}
                              </span>
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="shrink-0"
                              >
                                <ChevronDown size={14} className="text-text-muted" />
                              </motion.div>
                            </button>

                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-3 pl-10">
                                    <p className="text-sm text-text-muted leading-relaxed">{item.a}</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-text-muted/50 pb-4">
        Can't find your answer? Reach out to us — we're always improving.
      </div>
    </PageWrapper>
  );
}
