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
  Check,
  Lock,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { showUpgradeModal } from '../components/ui/PaymentModal';

function ProPricingButton({ planType, accent }) {
  const session = useAuthStore((s) => s.session);
  const handleClick = () => {
    if (session) {
      showUpgradeModal(planType);
    } else {
      window.location.href = `/auth?upgrade=${planType}`;
    }
  };
  return (
    <button
      onClick={handleClick}
      className={`w-full py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all ${
        accent
          ? 'bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25'
          : 'border border-white/10 hover:border-white/25 text-text-primary hover:text-white'
      }`}
    >
      <Sparkles size={14} /> Get Pro
    </button>
  );
}

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
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.jpeg" alt="GymThozhan" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover" />
              <span className="text-base font-bold tracking-tight text-text-primary">GymThozhan</span>
            </Link>
            <Link
              to="/auth"
              className="btn-primary px-5 py-2 rounded-full text-sm font-bold inline-flex items-center gap-1.5"
            >
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 pt-16">
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
              progress tracking — start free, upgrade anytime.
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
              { value: 'Free', label: 'To Start' },
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

      {/* Why GymThozhan */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} custom={0} className="text-center mb-12">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
                Can't afford a <span className="gradient-text">personal trainer?</span>
              </h2>
            </motion.div>

            <motion.div variants={fadeInUp} custom={1} className="border border-white/[0.06] rounded-2xl p-8 sm:p-12 bg-white/[0.02] text-center">
              <p className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-6">
                Personal trainers charge <span className="text-text-primary font-bold">₹3,000–₹10,000/month</span>. Online fitness courses cost <span className="text-text-primary font-bold">₹5,000–₹15,000</span>. Most beginners can't afford either.
              </p>
              <p className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-8">
                <span className="text-accent font-black">GymThozhan is your solution.</span> The same personalized workout plans, Indian diet plans, and progress tracking — at a fraction of the cost. Or completely free.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {[
                  { label: 'Personal Trainer', price: '₹5,000+/mo', crossed: true },
                  { label: 'Online Course', price: '₹8,000+', crossed: true },
                  { label: 'GymThozhan Pro', price: '₹83/mo', highlight: true },
                ].map((item) => (
                  <div key={item.label} className={`px-5 py-3 rounded-xl border ${item.highlight ? 'border-accent/30 bg-accent/5' : 'border-white/[0.06]'}`}>
                    <span className="text-text-muted text-xs block">{item.label}</span>
                    <span className={`font-black text-base ${item.crossed ? 'line-through text-text-muted' : 'text-accent'}`}>{item.price}</span>
                  </div>
                ))}
              </div>
            </motion.div>
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

      {/* Pricing */}
      <section id="pricing" className="py-24 sm:py-32 px-5 sm:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} custom={0} className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
              Simple pricing
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-text-muted text-lg max-w-xl mx-auto">
              Start free. Upgrade when you're ready for more.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto"
          >
            {/* Free Plan */}
            <motion.div variants={fadeInUp} custom={0} className="border border-white/[0.06] rounded-2xl p-7 sm:p-8 bg-white/[0.02]">
              <h3 className="text-lg font-bold text-text-primary mb-1">Free</h3>
              <p className="text-text-muted text-xs mb-6">Everything to get started</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-text-primary">₹0</span>
                <span className="text-text-muted text-sm ml-1">/ forever</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Personalized workout plan',
                  'Full diet plan with macros',
                  'Workout logging',
                  'Weight logging',
                  'XP, levels & streaks',
                  'Daily dashboard',
                  'All Knowledge Hub guides',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check size={14} className="text-accent flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className="w-full py-3 rounded-full text-sm font-bold border border-white/10 hover:border-white/25 text-text-primary hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Get Started Free
              </Link>
            </motion.div>

            {/* Pro Monthly */}
            <motion.div variants={fadeInUp} custom={1} className="border border-white/[0.08] rounded-2xl p-7 sm:p-8 bg-white/[0.02] relative overflow-hidden">
              <h3 className="text-lg font-bold text-text-primary mb-1">Pro Monthly</h3>
              <p className="text-text-muted text-xs mb-6">Unlock your full potential</p>
              <div className="mb-2">
                <span className="text-4xl font-black text-text-primary">₹149</span>
                <span className="text-text-muted text-sm ml-1">/ month</span>
              </div>
              <p className="text-xs text-text-muted font-medium mb-6">Build muscle at the cost of a haircut</p>
              <ul className="space-y-2.5 mb-4">
                <li className="text-[11px] text-text-muted font-medium uppercase tracking-wider mb-1">Everything in Free, plus:</li>
                {[
                  'Video tutorials & form guides',
                  'Common mistakes & alternatives',
                  'Meal logging, swaps & supplements',
                  'Smart Coach AI insights',
                  'Progress charts & analytics',
                  'Full workout history',
                  'Today\'s intake tracking',
                  'All badges unlocked',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Sparkles size={12} className="text-text-muted flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <ProPricingButton planType="monthly" />
            </motion.div>

            {/* Pro Yearly */}
            <motion.div variants={fadeInUp} custom={2} className="border border-accent/30 rounded-2xl p-7 sm:p-8 bg-accent/[0.03] relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                Best Value
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1">Pro Yearly</h3>
              <p className="text-text-muted text-xs mb-6">Maximum savings</p>
              <div className="mb-1">
                <span className="text-4xl font-black text-accent">₹999</span>
                <span className="text-text-muted text-sm ml-1">/ year</span>
              </div>
              <p className="text-xs text-text-muted mb-1">
                Just <span className="text-accent font-bold">₹83/month</span> — save 44%
              </p>
              <p className="text-xs text-accent font-medium mb-6">Transform your body at the cost of a movie ticket</p>
              <ul className="space-y-2.5 mb-4">
                <li className="text-[11px] text-text-muted font-medium uppercase tracking-wider mb-1">Everything in Pro, plus:</li>
                {[
                  'All Pro features included',
                  '5 months free vs monthly',
                  'Lock in the lowest price',
                  'Priority support',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Sparkles size={12} className="text-accent flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <ProPricingButton planType="yearly" accent />
            </motion.div>
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
            <img src="/logo.jpeg" alt="GymThozhan" className="w-5 h-5 rounded object-cover" />
            <span className="font-bold text-text-secondary text-sm">GymThozhan</span>
          </div>
          <p className="text-text-muted text-xs">
            Built for beginners everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
