import { motion } from 'framer-motion';
import { ArrowLeft, Dumbbell, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

const values = [
  {
    icon: Dumbbell,
    title: 'Fitness Made Simple',
    description: 'No more confusing workout splits or generic programs. OwnGainz generates a personalized plan based on your body, goals, and experience — so you know exactly what to do every time you walk into the gym.',
  },
  {
    icon: Target,
    title: 'Smart Workout Discovery',
    description: 'Our intelligent plan generator creates optimized workout splits tailored to your schedule. Swap exercises, track progressive overload, and watch your strength grow with real-time logging.',
  },
  {
    icon: Sparkles,
    title: 'Personalized Experience',
    description: 'From diet plans matched to your calorie needs and preferences, to a gamification system that keeps you motivated with XP, levels, and streaks — every part of OwnGainz adapts to you.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto w-full py-12 sm:py-16 px-5 sm:px-8 flex-1"
      >
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-8">
          <ArrowLeft size={16} /> Back
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">About OwnGainz</h1>
        <p className="text-text-muted text-sm mb-10">Your personal fitness companion</p>

        <div className="border border-white/[0.06] rounded-2xl p-8 sm:p-10 bg-white/[0.02] mb-10">
          <p className="text-text-secondary leading-relaxed text-lg">
            OwnGainz was built with a single mission: make fitness accessible, personal, and rewarding for everyone — especially beginners who don't know where to start.
          </p>
          <p className="text-text-secondary leading-relaxed mt-4">
            We believe that the biggest barrier to fitness isn't motivation — it's confusion. What exercises should I do? How much should I eat? Am I making progress? OwnGainz answers all of these questions with smart, personalized plans and intuitive tracking.
          </p>
        </div>

        <h2 className="text-xl font-semibold text-text-primary mb-6">What sets us apart</h2>
        <div className="space-y-5">
          {values.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-5 border border-white/[0.06] rounded-xl p-6 bg-white/[0.01]">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}
