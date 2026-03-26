import { motion } from 'framer-motion';

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`pt-20 sm:pt-24 pb-28 md:pb-12 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto min-h-screen ${className}`}
    >
      {children}
      <div className="mt-16 pb-4 text-center">
        <p className="text-[11px] text-text-muted/40 tracking-wide">💧 Stay hydrated — drink water throughout your workout and day</p>
      </div>
    </motion.div>
  );
}
