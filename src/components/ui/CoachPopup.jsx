import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNextMessage } from '../../data/coachMessages';

const coachImages = {
  workoutComplete: '/coachthumbsup.png',
  mealLogged: '/coacheating.png',
  weightLogged: '/coachthumbsup.png',
  milestone: '/coachdoublethumbsup.png',
  streak: '/coachdoublethumbsup.png',
  coachTip: '/coach.png',
};

const coachSides = {
  workoutComplete: 'right',
  mealLogged: 'left',
  weightLogged: 'right',
  milestone: 'right',
  streak: 'right',
  coachTip: 'left',
};

let coachListeners = [];
let coachId = 0;

export function showCoach(type, side, duration = 4000) {
  const id = ++coachId;
  const message = getNextMessage(type);
  if (!message) return;
  const image = coachImages[type] || '/coach.png';
  const resolvedSide = side || coachSides[type] || 'right';
  const popup = { id, message, image, side: resolvedSide, duration };
  coachListeners.forEach((fn) => fn(popup));
  return id;
}

export function CoachPopupContainer() {
  const [popup, setPopup] = useState(null);

  const showPopup = useCallback((data) => {
    setPopup(data);
    if (data.duration > 0) {
      setTimeout(() => {
        setPopup((prev) => (prev?.id === data.id ? null : prev));
      }, data.duration);
    }
  }, []);

  useEffect(() => {
    coachListeners.push(showPopup);
    return () => {
      coachListeners = coachListeners.filter((fn) => fn !== showPopup);
    };
  }, [showPopup]);

  const isRight = popup?.side === 'right';

  return (
    <AnimatePresence>
      {popup && (
        <motion.div
          key={popup.id}
          initial={{ opacity: 0, y: 40, x: isRight ? 60 : -60 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 40, x: isRight ? 60 : -60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed bottom-24 z-[110] flex items-end gap-2 ${
            isRight ? 'right-4 flex-row' : 'left-4 flex-row-reverse'
          }`}
          onClick={() => setPopup(null)}
        >
          {/* Chat bubble */}
          <div
            className={`relative max-w-[200px] bg-white/[0.08] backdrop-blur-md border border-white/[0.12] rounded-xl px-3.5 py-2.5 shadow-lg ${
              isRight ? 'rounded-br-sm' : 'rounded-bl-sm'
            }`}
          >
            <p className="text-sm text-text-primary font-medium leading-snug">{popup.message}</p>
          </div>

          {/* Coach image */}
          <img
            src={popup.image}
            alt="Coach"
            className="w-20 h-20 object-contain shrink-0 drop-shadow-lg"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
