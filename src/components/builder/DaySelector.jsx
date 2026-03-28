import { motion } from 'framer-motion';
import { Calendar, ChevronRight } from 'lucide-react';

const DAY_OPTIONS = [3, 4, 5, 6];

const DAY_LABELS = {
  3: 'Full Body / PPL Lite',
  4: 'Upper / Lower',
  5: 'Push / Pull / Legs',
  6: 'PPL × 2',
};

export default function DaySelector({ selectedDays, onSelect, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
          <Calendar size={22} className="text-accent" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          How many days per week?
        </h2>
        <p className="text-sm text-text-muted">
          Choose your training frequency to get started
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {DAY_OPTIONS.map((days) => (
          <motion.button
            key={days}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(days)}
            className={`relative p-4 rounded-xl border text-left transition-all ${
              selectedDays === days
                ? 'border-accent/40 bg-accent/[0.06]'
                : 'border-white/[0.06] bg-dark-card hover:border-white/10'
            }`}
          >
            <span
              className={`text-2xl font-bold block mb-1 ${
                selectedDays === days ? 'text-accent' : 'text-text-primary'
              }`}
            >
              {days}
            </span>
            <span className="text-xs text-text-muted">{DAY_LABELS[days]}</span>
            {selectedDays === days && (
              <motion.div
                layoutId="day-indicator"
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent"
              />
            )}
          </motion.button>
        ))}
      </div>

      <button
        onClick={onContinue}
        disabled={!selectedDays}
        className="w-full py-3.5 rounded-xl font-bold text-sm btn-primary flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Continue <ChevronRight size={16} />
      </button>
    </motion.div>
  );
}
