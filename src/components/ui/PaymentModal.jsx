import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Crown, Zap } from 'lucide-react';
import usePayment from '../../hooks/usePayment';


// Global listener pattern (same as Toast/Coach)
let upgradeListeners = [];

export function showUpgradeModal(preselectedPlan) {
  upgradeListeners.forEach((fn) => fn(preselectedPlan || null));
}

export function PaymentModalContainer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const { initiatePayment, isProcessing } = usePayment();
  // Discount is computed server-side in create-order (one-time only for referred users).
  // Don't show discount UI here — the user may have already used it on a previous subscription.
  // The actual discounted amount will be reflected in the Razorpay checkout.

  useEffect(() => {
    const handler = (preselectedPlan) => {
      if (preselectedPlan) setSelectedPlan(preselectedPlan);
      setIsOpen(true);
    };
    upgradeListeners.push(handler);
    return () => {
      upgradeListeners = upgradeListeners.filter((fn) => fn !== handler);
    };
  }, []);

  const handlePurchase = useCallback(async () => {
    await initiatePayment(selectedPlan);
    setIsOpen(false);
  }, [selectedPlan, initiatePayment]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => !isProcessing && setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-dark-card border border-white/[0.08] rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-b from-accent/[0.06] to-transparent">
              <button
                onClick={() => !isProcessing && setIsOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
              >
                <X size={16} className="text-text-muted" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Crown size={20} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Upgrade to Pro</h2>
                  <p className="text-xs text-text-muted">Unlock your full potential</p>
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Monthly */}
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`relative p-4 rounded-xl border transition-all text-left ${
                    selectedPlan === 'monthly'
                      ? 'border-accent/40 bg-accent/[0.06]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="text-xs text-text-muted mb-1">Monthly</div>
                  <div className="text-xl font-black text-text-primary">₹149</div>
                  <div className="text-[10px] text-text-muted">/month</div>
                  {selectedPlan === 'monthly' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <Check size={12} className="text-dark-bg" />
                    </div>
                  )}
                </button>

                {/* Yearly */}
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`relative p-4 rounded-xl border transition-all text-left ${
                    selectedPlan === 'yearly'
                      ? 'border-accent/40 bg-accent/[0.06]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-[9px] font-bold uppercase">
                    Save 44%
                  </div>
                  <div className="text-xs text-text-muted mb-1">Yearly</div>
                  <div className="text-xl font-black text-accent">₹999</div>
                  <div className="text-[10px] text-text-muted">₹83/month</div>
                  {selectedPlan === 'yearly' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <Check size={12} className="text-dark-bg" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="px-6 pb-4">
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-3">
                  Everything in Free, plus
                </p>
                <ul className="space-y-2">
                  {[
                    'Save & track workout logs',
                    'Custom workout builder',
                    'Exercise swap alternatives',
                    'Meal logging, swaps & supplements',
                    'Smart Coach AI insights',
                    'Progress charts & analytics',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                      <Sparkles size={10} className="text-accent flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-accent text-dark-bg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    {selectedPlan === 'monthly' ? 'Pay ₹149/month' : 'Pay ₹999/year'}
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-text-muted mt-2">
                Secure payment via Razorpay. Cancel anytime.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
