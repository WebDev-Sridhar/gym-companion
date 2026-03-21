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

const TOTAL_STEPS = 8;

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

export default function Onboarding() {
  const navigate = useNavigate();
  const preparePlan = useUserStore((s) => s.preparePlan);

  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: 25,
    height: 170,
    weight: 70,
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
      case 1: return formData.gender !== '';
      case 2: return formData.name.trim() !== '';
      case 3: return formData.age > 0;
      case 4: return formData.height > 0 && formData.weight > 0;
      case 5: return formData.activityLevel !== '';
      case 6: return formData.goal !== '';
      case 7: return formData.workoutDays > 0;
      case 8: return true;
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
              {step === 1 && (
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

              {step === 2 && (
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

              {step === 3 && (
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

              {step === 4 && (
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

              {step === 5 && (
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

              {step === 6 && (
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

              {step === 7 && (
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-text-primary">Workout Schedule</h2>
                  <p className="text-text-muted text-sm mb-6">How many days per week can you train?</p>
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
                </div>
              )}

              {step === 8 && (
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
