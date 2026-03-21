import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  Target,
  UtensilsCrossed,
  TrendingUp,
  Trophy,
  BookOpen,
  ChevronRight,
  Sparkles,
  Zap,
  Star,
  ArrowRight,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

const features = [
  {
    icon: Dumbbell,
    title: 'Smart Workout Plans',
    description: 'Personalized routines with video guides for every exercise. Beginner to intermediate.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Indian Diet Plans',
    description: 'Budget-friendly, practical Indian meals. Veg & Non-veg options with calorie tracking.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Visual charts for weight and strength progress. Watch yourself transform over time.',
  },
  {
    icon: Target,
    title: 'Daily Dashboard',
    description: 'Know exactly what to do today. Workout, calories, and motivation — all in one place.',
  },
  {
    icon: Trophy,
    title: 'Gamification',
    description: 'Earn XP, level up, unlock badges, and maintain streaks. Fitness made addictive.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Hub',
    description: 'A-to-Z fitness guides written for complete beginners. Learn as you grow.',
  },
];

const steps = [
  { num: '01', title: 'Tell Us About You', desc: 'Quick onboarding to understand your goals, body type, and preferences.' },
  { num: '02', title: 'Get Your Plan', desc: 'Receive a personalized workout + diet plan tailored just for you.' },
  { num: '03', title: 'Track & Level Up', desc: 'Log workouts, track progress, earn XP, and watch yourself transform.' },
];

const testimonials = [
  { name: 'Rahul S.', text: 'As a complete beginner, this app made the gym feel less scary. The workout videos are a lifesaver!', rating: 5 },
  { name: 'Priya M.', text: 'The Indian diet plans are exactly what I needed. No fancy Western meals I can\'t find ingredients for.', rating: 5 },
  { name: 'Arjun K.', text: 'The gamification keeps me coming back. I\'m on a 30-day streak now. Never thought I\'d say that!', rating: 5 },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-5 sm:px-8">
        {/* Subtle background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 mb-8 text-xs text-text-secondary font-medium tracking-wide uppercase">
              <Sparkles size={14} className="text-accent" />
              Your Free Personal Trainer
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-8 tracking-tight">
              <span className="text-text-primary">Transform</span>
              <br />
              <span className="gradient-text">Your Body</span>
            </h1>

            <p className="text-base sm:text-lg text-text-muted max-w-xl mx-auto mb-12 leading-relaxed">
              Zero gym knowledge? No problem. Personalized workouts, Indian diet plans,
              progress tracking — all free, forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="btn-primary px-8 py-4 rounded-full text-base font-bold inline-flex items-center justify-center gap-2 group"
              >
                Start Your Journey
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-full text-base font-medium text-text-muted border border-white/10 hover:border-white/25 hover:text-text-secondary transition-all inline-flex items-center justify-center gap-2"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 flex justify-center gap-12 sm:gap-16"
          >
            {[
              { value: '30+', label: 'Exercises' },
              { value: '7', label: 'Diet Tiers' },
              { value: '100%', label: 'Free' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-text-primary">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronRight size={20} className="text-text-muted rotate-90" />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 sm:py-32 px-5 sm:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight"
            >
              Everything you need
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-text-muted text-lg max-w-xl mx-auto">
              From your first day in the gym to your hundredth.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  custom={i}
                  className="bg-black p-8 sm:p-10 hover:bg-white/[0.02] transition-colors duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center mb-5 group-hover:bg-accent/10 transition-colors">
                    <Icon size={20} className="text-text-secondary group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-2">{feature.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
              Three steps. That's it.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-0 border-l border-white/10 ml-6 sm:ml-8"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeInUp}
                custom={i}
                className="relative pl-10 sm:pl-14 py-8 sm:py-10"
              >
                <div className="absolute left-0 top-8 sm:top-10 -translate-x-1/2 w-3 h-3 rounded-full bg-accent border-4 border-black" />
                <span className="text-xs text-text-muted font-mono tracking-widest uppercase">{step.num}</span>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mt-1 mb-2">{step.title}</h3>
                <p className="text-text-muted leading-relaxed max-w-lg">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight">
              Real results
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                custom={i}
                className="border border-white/[0.06] rounded-2xl p-6 sm:p-8"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }, (_, j) => (
                    <Star key={j} size={14} className="text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">"{t.text}"</p>
                <p className="text-text-primary font-semibold text-sm">{t.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-accent/[0.04] rounded-3xl blur-3xl" />
            <div className="relative border border-white/[0.06] rounded-3xl p-10 sm:p-16">
              <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">Ready to start?</h2>
              <p className="text-text-muted mb-10 max-w-md mx-auto">
                Join thousands of beginners who went from confused to confident. 2 minutes to get started.
              </p>
              <Link
                to="/auth"
                className="btn-primary px-10 py-4 rounded-full text-base font-bold inline-flex items-center gap-2 group"
              >
                Start Now — It's Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 sm:px-8 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell size={18} className="text-text-muted" />
            <span className="font-bold text-text-secondary text-sm">GymBuddy</span>
          </div>
          <p className="text-text-muted text-xs">
            Built for beginners everywhere. Free forever.
          </p>
        </div>
      </footer>
    </div>
  );
}
