import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPaymentStatus } from '../lib/razorpay';
import useUserStore from '../store/useUserStore';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 8; // 16 seconds max

function formatAmount(paise, currency = 'INR') {
  const amount = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatPlanName(planType) {
  if (planType === 'monthly') return 'Pro Monthly';
  if (planType === 'yearly') return 'Pro Yearly';
  return 'Pro Plan';
}

function truncatePaymentId(id) {
  if (!id || id.length <= 20) return id;
  return `${id.slice(0, 10)}...${id.slice(-6)}`;
}

// Animated SVG checkmark
function CheckmarkCircle() {
  return (
    <svg
      viewBox="0 0 52 52"
      className="w-20 h-20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-neon-green"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      {/* Checkmark */}
      <motion.path
        d="M14 26l8 8 16-16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-neon-green"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
      />
    </svg>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span
        className={`text-sm font-medium text-text-primary ${mono ? 'font-mono text-xs tracking-wide' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activatePro = useUserStore((s) => s.activatePro);

  const paymentId = searchParams.get('payment_id');

  const [phase, setPhase] = useState('loading'); // 'loading' | 'success' | 'pending' | 'error'
  const [details, setDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const pollCount = useRef(0);
  const pollTimer = useRef(null);

  useEffect(() => {
    if (!paymentId) {
      setPhase('error');
      setErrorMsg('No payment ID provided.');
      return;
    }

    async function poll() {
      try {
        const data = await getPaymentStatus(paymentId);

        if (data.status === 'active') {
          setDetails(data);
          setPhase('success');
          // Ensure local store reflects active PRO (webhook may have activated it)
          activatePro({
            planType: data.planType,
            status: 'active',
            startsAt: data.startsAt,
            expiresAt: data.expiresAt,
          });
          return; // stop polling
        }

        // Subscription still pending — keep polling
        pollCount.current += 1;
        if (pollCount.current >= MAX_POLLS) {
          setPhase('pending');
          return;
        }
        pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        setPhase('error');
        setErrorMsg(err.message || 'Could not verify payment.');
      }
    }

    poll();

    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [paymentId, activatePro]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin mx-auto mb-5" />
          <p className="text-text-secondary text-sm">Verifying your payment…</p>
        </div>
      </div>
    );
  }

  // ── Webhook still processing ─────────────────────────────────────────────
  if (phase === 'pending') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Payment Received</h1>
          <p className="text-text-muted text-sm leading-relaxed mb-6">
            Your payment was received successfully. Your Pro plan is being activated — this usually takes
            under a minute. Refresh the app or check your profile shortly.
          </p>
          {paymentId && (
            <p className="text-xs text-text-muted font-mono mb-6">
              Ref: {truncatePaymentId(paymentId)}
            </p>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 rounded-xl font-semibold text-sm btn-primary"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Verification Failed</h1>
          <p className="text-text-muted text-sm leading-relaxed mb-6">
            {errorMsg || 'We could not verify your payment. If money was deducted, contact support with your payment ID.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 rounded-xl font-semibold text-sm btn-primary"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          {/* Glow backdrop */}
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 rounded-full bg-neon-green/20 blur-xl scale-150" />
            <div className="relative text-neon-green">
              <CheckmarkCircle />
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-2xl font-bold text-text-primary mb-1"
          >
            Payment Successful
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-text-muted text-sm"
          >
            Welcome to OwnGains Pro
          </motion.p>
        </div>

        {/* Details card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-2 mb-6"
        >
          <DetailRow label="Member" value={details?.memberName || '—'} />
          <DetailRow label="Plan" value={formatPlanName(details?.planType)} />
          <DetailRow label="Amount Paid" value={formatAmount(details?.amount, details?.currency)} />
          <DetailRow label="Payment ID" value={truncatePaymentId(details?.paymentId)} mono />
          <DetailRow label="Valid Until" value={formatDate(details?.expiresAt)} />
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          onClick={() => navigate('/dashboard')}
          className="w-full py-3.5 rounded-xl font-semibold text-sm btn-primary"
        >
          Go to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}
