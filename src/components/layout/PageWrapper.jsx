import { motion } from 'framer-motion';
import Footer from './Footer';

export default function PageWrapper({ children, className = '' }) {
  return (
    <div className="min-h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`pt-20 sm:pt-24 pb-10 md:pb-12 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full flex-1 ${className}`}
      >
        {children}
      </motion.div>
      <Footer />
    </div>
  );
}
