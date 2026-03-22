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

      // 2. Create order via Edge Function
      const order = await createOrder(planType);

      // 3. Get user info for prefill
      const user = useAuthStore.getState().user;
      const profile = useUserStore.getState().profile;

      // 4. Open Razorpay Checkout
      openCheckout({
        orderId: order.orderId,
        amount: order.amount,
        planType,
        userEmail: user?.email || '',
        userName: profile?.name || user?.user_metadata?.full_name || '',
        onSuccess: async (response) => {
          try {
            // 5. Verify payment via Edge Function
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (result.success) {
              // 6. Activate Pro in store
              useUserStore.getState().activatePro(result.subscription);
              showToast('Pro activated! Enjoy your premium features.', 'success', 5000);
            }
          } catch (err) {
            showToast('Payment verification failed. Contact support.', 'error', 5000);
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
