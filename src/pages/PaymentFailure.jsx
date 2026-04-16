import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { showUpgradeModal } from '../components/ui/PaymentModal';

const COMMON_REASONS = {
  'Payment was unsuccessful due to insufficient funds.': 'Insufficient funds in your account.',
  'Payment was unsuccessful due to bank server error.': 'Your bank server returned an error.',
  'Payment cancelled by user': 'You closed the payment window.',
};

function friendlyReason(raw) {
  if (!raw) return null;
  return COMMON_REASONS[raw] || raw;
}

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawReason = searchParams.get('reason');
  const reason = friendlyReason(decodeURIComponent(rawReason || ''));

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-sm w-full text-center"
      >
        {/* Icon */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 rounded-full bg-red-500/15 blur-xl scale-150" />
          <div className="relative w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <motion.svg
              className="w-9 h-9 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M6 18L18 6M6 6l12 12"
              />
            </motion.svg>
          </div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-text-primary mb-2"
        >
          Payment Failed
        </motion.h1>

        {/* Reason */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-text-muted text-sm leading-relaxed mb-2"
        >
          {reason || 'Something went wrong during the payment process.'}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-text-muted/60 text-xs mb-8"
        >
          No money has been deducted. You can try again safely.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => {
              navigate('/dashboard');
              // Small delay so navigation completes before modal opens
              setTimeout(() => showUpgradeModal(), 100);
            }}
            className="w-full py-3.5 rounded-xl font-semibold text-sm btn-primary"
          >
            Retry Payment
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 rounded-xl font-medium text-sm text-text-muted
                       border border-white/10 hover:border-white/20 hover:text-text-secondary
                       transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
