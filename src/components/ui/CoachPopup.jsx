import { useState, useEffect, useCallback, useRef } from 'react';
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
  onboarding: '/coach.png',
  planReady: '/coachdoublethumbsup.png',
  letsGo: '/coachdoublethumbsup.png',
  resetData: '/coach.png',
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
  onboarding: 'left',
  planReady: 'right',
  letsGo: 'right',
  resetData: 'left',
};

let coachListeners = [];
let coachId = 0;

export function showCoach(type, side) {
  const id = ++coachId;
  const message = getNextMessage(type);
  if (!message) return;
  const image = coachImages[type] || '/coach.png';
  const resolvedSide = side || coachSides[type] || 'right';
  const popup = { id, message, image, side: resolvedSide };
  coachListeners.forEach((fn) => fn(popup));
  return id;
}

export function CoachPopupContainer() {
  const [popup, setPopup] = useState(null);
  const queueRef = useRef(null);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPopup(null);
  }, []);

  const showPopup = useCallback((data) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPopup((prev) => {
      if (prev) {
        queueRef.current = data;
        return null;
      }
      return data;
    });
  }, []);

  // Auto-dismiss after 10 seconds as safety
  useEffect(() => {
    if (popup) {
      timerRef.current = setTimeout(dismiss, 10000);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [popup, dismiss]);

  // Queue handling
  useEffect(() => {
    if (!popup && queueRef.current) {
      const queued = queueRef.current;
      queueRef.current = null;
      const timer = setTimeout(() => setPopup(queued), 350);
      return () => clearTimeout(timer);
    }
  }, [popup]);

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
        <>
          {/* Full-screen click overlay to dismiss */}
          <motion.div
            key={`overlay-${popup.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[109]"
            onClick={dismiss}
          />

          {/* Coach popup */}
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, y: 80, x: isRight ? 40 : -40 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 80, x: isRight ? 40 : -40 }}
            transition={{ type: 'spring', stiffness: 170, damping: 20, mass: 1.2 }}
            className={`fixed bottom-4 z-[110] flex flex-col items-center ${
              isRight ? 'right-4' : 'left-4'
            }`}
          >
            {/* Chat bubble */}
            <div className="max-w-[220px] sm:max-w-[280px] bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg mb-2">
              <p className="text-sm sm:text-base text-black font-semibold leading-snug">{popup.message}</p>
            </div>

            {/* Coach image — medium on mobile, half-screen on laptop */}
            <img
              src={popup.image}
              alt="Coach"
              className="w-40 h-40 sm:w-56 sm:h-56 lg:w-[45vh] lg:h-[45vh] object-contain shrink-0 drop-shadow-lg"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
