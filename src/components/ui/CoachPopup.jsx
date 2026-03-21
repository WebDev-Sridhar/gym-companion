import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNextMessage } from '../../data/coachMessages';

const coachImages = {
  workoutStart: '/coachthumbsup.png',
  workoutComplete: '/coachthumbsup.png',
  workoutCancel: '/coach.png',
  mealLogged: '/coacheating.png',
  mealUndo: '/coach.png',
  weightLogged: '/coachthumbsup.png',
  milestone: '/coachdoublethumbsup.png',
  streak: '/coachdoublethumbsup.png',
  coachTip: '/coach.png',
  dailyWelcome: '/coachdoublethumbsup.png',
  onboarding: '/coachthumbsup.png',
  planReady: '/coachdoublethumbsup.png',
  letsGo: '/coachdoublethumbsup.png',
};

const coachSides = {
  workoutStart: 'right',
  workoutComplete: 'right',
  workoutCancel: 'left',
  mealLogged: 'left',
  mealUndo: 'left',
  weightLogged: 'right',
  milestone: 'right',
  streak: 'right',
  coachTip: 'left',
  dailyWelcome: 'right',
  onboarding: 'right',
  planReady: 'right',
  letsGo: 'right',
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
          initial={{ opacity: 0, y: 80, x: isRight ? 40 : -40 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 80, x: isRight ? 40 : -40 }}
          transition={{ type: 'spring', stiffness: 170, damping: 20, mass: 1.2 }}
          className={`fixed bottom-24 z-[110] flex flex-col items-center ${
            isRight ? 'right-4' : 'left-4'
          }`}
          onClick={() => setPopup(null)}
        >
          {/* Chat bubble — above the coach */}
          <div className="max-w-[220px] bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg mb-2">
            <p className="text-sm text-black font-semibold leading-snug">{popup.message}</p>
          </div>

          {/* Coach image */}
          <img
            src={popup.image}
            alt="Coach"
            className="w-52 h-52 object-contain shrink-0 drop-shadow-lg"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
