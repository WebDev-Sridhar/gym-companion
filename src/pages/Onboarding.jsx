import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Ruler,
  Weight,
  Sparkles,
  Calculator,
} from 'lucide-react';
import useUserStore from '../store/useUserStore';
import { calculateBMR, calculateTDEE, getTargetCalories } from '../utils/tdee';
import { showCoach } from '../components/ui/CoachPopup';

const TOTAL_STEPS = 10;

const activityLevels = [
  { key: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { key: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
  { key: 'moderate', label: 'Moderately Active', desc: 'Exercise 3-5 days/week' },
  { key: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
  { key: 'veryActive', label: 'Extra Active', desc: 'Very hard exercise + physical job' },
];

const goals = [
  { key: 'weightLoss', label: 'Weight Loss', desc: 'Lose fat while preserving muscle' },
  { key: 'muscleGain', label: 'Muscle Gain', desc: 'Build muscle and get stronger' },
  { key: 'maintenance', label: 'Maintenance', desc: 'Stay fit and healthy' },
];

// Body fat ranges per gender
const bodyFatRanges = {
  male: [
    { key: 'lean', label: '8–12%', desc: 'Very lean / Athletic', level: 0 },
    { key: 'fit', label: '13–17%', desc: 'Fit / Visible definition', level: 1 },
    { key: 'average', label: '18–22%', desc: 'Average / Healthy', level: 2 },
    { key: 'aboveAvg', label: '23–27%', desc: 'Above average', level: 3 },
    { key: 'high', label: '28%+', desc: 'High body fat', level: 4 },
  ],
  female: [
    { key: 'lean', label: '16–19%', desc: 'Athletic / Very lean', level: 0 },
    { key: 'fit', label: '20–24%', desc: 'Fit / Toned', level: 1 },
    { key: 'average', label: '25–29%', desc: 'Average / Healthy', level: 2 },
    { key: 'aboveAvg', label: '30–34%', desc: 'Above average', level: 3 },
    { key: 'high', label: '35%+', desc: 'High body fat', level: 4 },
  ],
};

// Simple inline SVG body silhouette — torso width scales with fat level
function BodySilhouette({ fatLevel = 2, selected = false }) {
  const color = selected ? '#c8ee44' : '#4a4a4a';
  const torsoRx = [8, 9.5, 11, 13, 15][fatLevel];
  const cx = 28;

  return (
    <svg viewBox="0 0 56 110" xmlns="http://www.w3.org/2000/svg" className="w-10 h-16 mx-auto">
      {/* Head */}
      <circle cx={cx} cy="9" r="7" fill={color} />
      {/* Neck */}
      <rect x={cx - 2.5} y="16" width="5" height="5" rx="1" fill={color} />
      {/* Torso */}
      <ellipse cx={cx} cy="43" rx={torsoRx} ry="19" fill={color} />
      {/* Left arm */}
      <ellipse cx={cx - torsoRx - 3} cy="41" rx="3" ry="13" fill={color} />
      {/* Right arm */}
      <ellipse cx={cx + torsoRx + 3} cy="41" rx="3" ry="13" fill={color} />
      {/* Left leg */}
      <ellipse cx={cx - 7} cy="82" rx="5" ry="17" fill={color} />
      {/* Right leg */}
      <ellipse cx={cx + 7} cy="82" rx="5" ry="17" fill={color} />
    </svg>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const preparePlan = useUserStore((s) => s.preparePlan);

  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gymExperience: '',   // 'never' | 'beginner'
    name: '',
    gender: '',
    age: 25,
    height: 170,
    weight: 70,
    bodyFat: 'average',  // default average
    activityLevel: '',
    goal: '',
    workoutDays: 4,
    workoutDuration: 60,
    dietType: 'nonVeg',
    useSupplements: false,
  });

  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const canProceed = () => {
    switch (step) {
      case 1: return formData.gymExperience !== '';
      case 2: return formData.gender !== '';
      case 3: return formData.name.trim() !== '';
      case 4: return formData.age > 0;
      case 5: return formData.height > 0 && formData.weight > 0;
      case 6: return formData.bodyFat !== '';
      case 7: return formData.activityLevel !== '';
      case 8: return formData.goal !== '';
      case 9: return formData.workoutDays > 0;
      case 10: return true;
      default: return true;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      setSaving(true);
      await new Promise((r) => setTimeout(r, 300));
      preparePlan(formData);
      navigate('/plan-summary', { replace: true });
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const bmr = calculateBMR(formData.weight, formData.height, formData.age, formData.gender || 'male');
  const tdee = calculateTDEE(bmr, formData.activityLevel || 'moderate');
  const targetCals = getTargetCalories(tdee, formData.goal || 'maintenance');

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);
  const goNext = () => { setDirection(1); handleNext(); };
  const goBack = () => { setDirection(-1); handleBack(); };

  useEffect(() => {
    setTimeout(() => showCoach('onboarding'), 600);
  }, []);

  const bfRanges = bodyFatRanges[formData.gender || 'male'];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-5 py-8">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-accent/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-text-muted mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="border border-white/[0.06] rounded-2xl p-6 sm:p-8 min-h-[400px] flex flex-col bg-[#0a0a0a]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {/* STEP 1 — Gym Experience */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-text-primary">Your gym experience?</h2>
                  <p className="text-text-muted text-sm mb-6">We'll build the right program for where you are right now.</p>
                  <div className="space-y-4">
                    {[
                      {
                        key: 'never',
                        label: 'First time at the gym',
                        desc: "I've never trained before or just starting out. I need a beginner-friendly starter program.",
                        icon: '🌱',
                      },
                      {
                        key: 'beginner',
                        label: 'Some experience',
                        desc: "I've trained before or know the basics. Ready for a structured split program.",
                        icon: '💪',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => update('gymExperience', opt.key)}
                        className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                          formData.gymExperience === opt.key
                            ? 'border-accent bg-accent/5'
                            : 'border-white/[0.08] hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">{opt.icon}</span>
                          <span className={`font-bold text-sm ${formData.gymExperience === opt.key ? 'text-accent' : 'text-text-primary'}`}>
                            {opt.label}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted ml-9">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  {formData.gymExperience === 'never' && (
                    <div className="mt-4 bg-accent/5 border border-accent/10 rounded-lg px-4 py-3">
                      <p className="text-xs text-accent font-medium">
                        You'll start with a 3-day Full Body program — designed to build solid habits and safe movement patterns before advancing.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 — Gender */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-text-primary">What's your gender?</h2>
                  <p className="text-text-muted text-sm mb-6">Helps calculate your calorie needs accurately.</p>
                  <div className="grid grid-cols-2 gap-4">
                    {['male', 'female'].map((g) => (
                      <button
                        key={g}
                        onClick={() => update('gender', g)}
                        className={`p-6 rounded-xl border-2 transition-all text-center ${
                          formData.gender === g
                            ? 'border-accent bg-accent/5 text-accent'
                            : 'border-white/[0.08] hover:border-white/[0.15] text-text-muted'
                        }`}
                      >
                        <div className="text-4xl mb-2">{g === 'male' ? '♂' : '♀'}</div>
                        <span className="font-semibold capitalize text-sm">{g}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3 — Name */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-text-primary">What's your name?</h2>
                  <p className="text-text-muted text-sm mb-6">So we can personalize your experience.</p>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Enter your name"
                    autoFocus
                    className="w-full px-5 py-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-text-primary text-lg focus:border-white/20 focus:outline-none transition-colors placeholder:text-text-muted"
                  />
                </div>
              )}

              {/* STEP 4 — Age */}
              {step === 4 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-text-primary">How old are you?</h2>
                  <p className="text-text-muted text-sm mb-6">Age affects your metabolic rate.</p>
                  <div className="text-center">
                    <div className="text-7xl font-black text-text-primary mb-6">{formData.age}</div>
                    <input
                      type="range" min="14" max="80" value={formData.age}
                      onChange={(e) => update('age', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-text-muted text-xs mt-2">
                      <span>14</span><span>80</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5 — Height & Weight */}
              {step === 5 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-text-primary">Height & Weight</h2>
                  <p className="text-text-muted text-sm mb-6">Used to calculate your BMR and calorie needs.</p>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs text-text-muted mb-2 flex items-center gap-2 uppercase tracking-wider"><Ruler size={14} /> Height (cm)</label>
                      <div className="text-center">
                        <span className="text-4xl font-black text-text-primary">{formData.height} <span className="text-base text-text-muted">cm</span></span>
                        <input type="range" min="120" max="220" value={formData.height} onChange={(e) => update('height', parseInt(e.target.value))} className="w-full mt-3" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-2 flex items-center gap-2 uppercase tracking-wider"><Weight size={14} /> Weight (kg)</label>
                      <div className="text-center">
                        <span className="text-4xl font-black text-text-primary">{formData.weight} <span className="text-base text-text-muted">kg</span></span>
                        <input type="range" min="30" max="200" value={formData.weight} onChange={(e) => update('weight', parseInt(e.target.value))} className="w-full mt-3" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6 — Body Fat % */}
              {step === 6 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-text-primary">Body fat estimate</h2>
                  <p className="text-text-muted text-sm mb-5">Pick the range that closest describes you. Used to personalise your plan.</p>
                  <div className="grid grid-cols-5 gap-2">
                    {bfRanges.map((range) => (
                      <button
                        key={range.key}
                        onClick={() => update('bodyFat', range.key)}
                        className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                          formData.bodyFat === range.key
                            ? 'border-accent bg-accent/5'
                            : 'border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <BodySilhouette fatLevel={range.level} selected={formData.bodyFat === range.key} />
                        <span className={`text-[11px] font-bold mt-1 ${formData.bodyFat === range.key ? 'text-accent' : 'text-text-primary'}`}>
                          {range.label}
                        </span>
                        <span className="text-[9px] text-text-muted text-center leading-tight mt-0.5">{range.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7 — Activity Level */}
              {step === 7 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-text-primary">Activity Level</h2>
                  <p className="text-text-muted text-sm mb-4">How active are you in your daily life?</p>
                  <div className="space-y-2">
                    {activityLevels.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => update('activityLevel', a.key)}
                        className={`w-full p-4 rounded-xl border transition-all text-left ${
                          formData.activityLevel === a.key
                            ? 'border-accent bg-accent/5'
                            : 'border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <span className={`font-semibold text-sm ${formData.activityLevel === a.key ? 'text-accent' : 'text-text-primary'}`}>{a.label}</span>
                        <p className="text-xs text-text-muted mt-0.5">{a.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 8 — Goal */}
              {step === 8 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-text-primary">What's your goal?</h2>
                  <p className="text-text-muted text-sm mb-6">Determines your calorie target and workout style.</p>
                  <div className="space-y-3">
                    {goals.map((g) => (
                      <button
                        key={g.key}
                        onClick={() => update('goal', g.key)}
                        className={`w-full p-5 rounded-xl border transition-all text-left ${
                          formData.goal === g.key
                            ? 'border-accent bg-accent/5'
                            : 'border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <span className={`text-base font-bold ${formData.goal === g.key ? 'text-accent' : 'text-text-primary'}`}>{g.label}</span>
                        <p className="text-sm text-text-muted mt-1">{g.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 9 — Workout Schedule */}
              {step === 9 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-text-primary">Workout Schedule</h2>
                  <p className="text-text-muted text-sm mb-6">How many days per week can you train?</p>
                  {formData.gymExperience === 'never' ? (
                    <div className="bg-accent/5 border border-accent/10 rounded-xl p-5">
                      <p className="text-sm font-semibold text-accent mb-1">Starting with 3 days/week</p>
                      <p className="text-xs text-text-muted">As a first-timer, we'll run a full-body program 3 days a week. After building a strong foundation you can increase frequency.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs text-text-muted mb-3 block uppercase tracking-wider">Days per week</label>
                        <div className="flex gap-2 flex-wrap">
                          {[3, 4, 5, 6].map((d) => (
                            <button
                              key={d}
                              onClick={() => update('workoutDays', d)}
                              className={`w-14 h-14 rounded-xl font-bold text-lg transition-all ${
                                formData.workoutDays === d
                                  ? 'bg-white text-black'
                                  : 'border border-white/[0.08] text-text-muted hover:border-white/[0.15]'
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-text-muted mt-2">
                          {formData.workoutDays <= 3 ? 'Full Body Split' : formData.workoutDays === 4 ? 'Upper/Lower Split' : 'Push/Pull/Legs Split'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-text-muted mb-3 block uppercase tracking-wider">Duration per session</label>
                        <div className="flex gap-2 flex-wrap">
                          {[30, 45, 60, 75, 90].map((d) => (
                            <button
                              key={d}
                              onClick={() => update('workoutDuration', d)}
                              className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                                formData.workoutDuration === d
                                  ? 'bg-accent text-white'
                                  : 'border border-white/[0.08] text-text-muted hover:border-white/[0.15]'
                              }`}
                            >
                              {d} min
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 10 — Diet Type & Supplements */}
              {step === 10 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-text-primary">Almost done!</h2>
                  <p className="text-text-muted text-sm mb-4">Diet preference & your results</p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-xs text-text-muted mb-2 block uppercase tracking-wider">Diet Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'veg', label: 'Vegetarian' },
                          { key: 'nonVeg', label: 'Non-Veg' },
                        ].map((d) => (
                          <button
                            key={d.key}
                            onClick={() => update('dietType', d.key)}
                            className={`p-4 rounded-xl border font-medium text-sm transition-all ${
                              formData.dietType === d.key
                                ? 'border-accent bg-accent/5 text-accent'
                                : 'border-white/[0.06] text-text-muted hover:border-white/[0.12]'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => update('useSupplements', !formData.useSupplements)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        formData.useSupplements
                          ? 'border-accent bg-accent/5'
                          : 'border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      <span className={`font-medium text-sm ${formData.useSupplements ? 'text-accent' : 'text-text-primary'}`}>Include Supplements</span>
                      <p className="text-xs text-text-muted mt-0.5">Whey protein, creatine recommendations</p>
                    </button>
                  </div>

                  {/* TDEE Summary */}
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator size={16} className="text-accent" />
                      <span className="font-medium text-sm text-text-primary">Your Estimated Numbers</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-black text-text-primary">{Math.round(bmr)}</div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider">BMR</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-text-primary">{tdee}</div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider">TDEE</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-accent">{targetCals}</div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider">Target</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04]">
            <button
              onClick={goBack}
              disabled={step === 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                step === 1 ? 'text-text-muted cursor-not-allowed' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <ChevronLeft size={16} /> Back
            </button>

            <button
              onClick={goNext}
              disabled={!canProceed() || saving}
              className={`flex items-center gap-1 px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                canProceed() && !saving
                  ? 'btn-primary'
                  : 'bg-white/[0.04] text-text-muted cursor-not-allowed'
              }`}
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Generating...</>
              ) : step === TOTAL_STEPS ? (
                <><Sparkles size={16} /> Generate My Plan</>
              ) : (
                <>Next <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
