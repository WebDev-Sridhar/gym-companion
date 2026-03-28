import { useState, useCallback } from 'react';
import { loadRazorpayScript, createOrder, verifyPayment, openCheckout } from '../lib/razorpay';
import useAuthStore from '../store/useAuthStore';
import useUserStore from '../store/useUserStore';
import { showToast } from '../components/ui/Toast';

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

      // 3. Create order via Edge Function (server creates Razorpay order + pending subscription)
      const { orderId, amount } = await createOrder(planType);

      // 4. Open Razorpay checkout with order_id
      openCheckout({
        orderId,
        amount,
        planType,
        userEmail: user?.email || '',
        userName: profile?.name || user?.user_metadata?.full_name || '',
        onSuccess: async (response) => {
          try {
            // 5. Verify payment via Edge Function (server verifies signature + activates subscription)
            const { subscription } = await verifyPayment(response);

            // 6. Update local store (subscription already activated server-side)
            useUserStore.getState().activatePro({
              id: subscription.id,
              planType: subscription.planType,
              status: 'active',
              startsAt: subscription.startsAt,
              expiresAt: subscription.expiresAt,
            });

            showToast('Pro activated! Enjoy your premium features.', 'success', 5000);
          } catch (err) {
            // Verification failed — but payment may have gone through
            // Webhook will catch it as backup
            showToast('Payment received. Activating your plan shortly...', 'info', 5000);
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
