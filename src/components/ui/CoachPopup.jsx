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

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

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

  // Auto-dismiss: 5s on touch devices, 10s on desktop as safety
  useEffect(() => {
    if (popup) {
      const timeout = isTouchDevice() ? 5000 : 10000;
      timerRef.current = setTimeout(dismiss, timeout);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [popup, dismiss]);

  // Dismiss on mouse move (desktop only) — with small delay to avoid instant dismiss
  useEffect(() => {
    if (!popup) return;
    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, 500);
    const handleMouseMove = () => {
      if (armed) dismiss();
    };
    if (!isTouchDevice()) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      clearTimeout(armTimer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [popup, dismiss]);

  // Dismiss on touch anywhere (mobile)
  useEffect(() => {
    if (!popup) return;
    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, 500);
    const handleTouch = () => {
      if (armed) dismiss();
    };
    if (isTouchDevice()) {
      window.addEventListener('touchstart', handleTouch);
    }
    return () => {
      clearTimeout(armTimer);
      window.removeEventListener('touchstart', handleTouch);
    };
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
        <motion.div
          key={popup.id}
          initial={{ opacity: 0, y: 80, x: isRight ? 40 : -40 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 80, x: isRight ? 40 : -40 }}
          transition={{ type: 'spring', stiffness: 170, damping: 20, mass: 1.2 }}
          className={`fixed bottom-4 z-[110] flex flex-col items-center pointer-events-none ${
            isRight ? 'right-4' : 'left-4'
          }`}
        >
          {/* Chat bubble */}
          <div className="max-w-[220px] sm:max-w-[280px] bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg mb-2">
            <p className="text-sm sm:text-base text-black font-semibold leading-snug">{popup.message}</p>
          </div>

          {/* Coach image */}
          <img
            src={popup.image}
            alt="Coach"
            className="w-40 h-40 sm:w-56 sm:h-56 lg:w-[45vh] lg:h-[45vh] object-contain shrink-0 drop-shadow-lg"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
