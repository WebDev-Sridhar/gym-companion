import { useState, useCallback } from 'react';
import { loadRazorpayScript, createPendingSubscription, activateSubscription, openCheckout } from '../lib/razorpay';
import useAuthStore from '../store/useAuthStore';
import useUserStore from '../store/useUserStore';
import { showToast } from '../components/ui/Toast';

const PLAN_AMOUNTS = {
  monthly: 14900,
  yearly: 99900,
};

export default function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePayment = useCallback(async (planType) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 1. Load Razorpay script
      await loadRazorpayScript();

      // 2. Get user info
      const user = useAuthStore.getState().user;
      const profile = useUserStore.getState().profile;

      if (!user) {
        showToast('Please log in first.', 'error');
        setIsProcessing(false);
        return;
      }

      // 3. Create pending subscription in Supabase
      const pendingSub = await createPendingSubscription(planType, user.id);

      // 4. Open Razorpay Checkout
      openCheckout({
        amount: PLAN_AMOUNTS[planType],
        planType,
        userEmail: user?.email || '',
        userName: profile?.name || user?.user_metadata?.full_name || '',
        onSuccess: async (response) => {
          try {
            // 5. Activate subscription in Supabase
            const activated = await activateSubscription(
              pendingSub.id,
              response.razorpay_payment_id,
              planType
            );

            // 6. Update store
            useUserStore.getState().activatePro({
              id: activated.id,
              planType: activated.plan_type,
              status: 'active',
              startsAt: activated.starts_at,
              expiresAt: activated.expires_at,
              razorpayPaymentId: activated.razorpay_payment_id,
            });

            showToast('Pro activated! Enjoy your premium features.', 'success', 5000);
          } catch (err) {
            showToast('Failed to activate subscription. Contact support.', 'error', 5000);
          } finally {
            setIsProcessing(false);
          }
        },
        onFailure: (reason) => {
          if (reason !== 'cancelled') {
            showToast(reason || 'Payment failed. Please try again.', 'error');
          }
          setIsProcessing(false);
        },
      });
    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
      setIsProcessing(false);
    }
  }, [isProcessing]);

  return { initiatePayment, isProcessing };
}
