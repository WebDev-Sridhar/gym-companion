import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadRazorpayScript, createOrder, verifyPayment, openCheckout } from '../lib/razorpay';
import useAuthStore from '../store/useAuthStore';
import useUserStore from '../store/useUserStore';
import { showToast } from '../components/ui/Toast';

export default function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

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
            // 5. Verify payment via Edge Function (verifies HMAC + activates subscription in DB)
            const { subscription } = await verifyPayment(response);

            // 6. Update local store immediately — user sees PRO right away
            useUserStore.getState().activatePro({
              id: subscription.id,
              planType: subscription.planType,
              status: 'active',
              startsAt: subscription.startsAt,
              expiresAt: subscription.expiresAt,
            });

            // 7. Navigate to success page — page will also fetch & display details
            navigate(`/payment-success?payment_id=${response.razorpay_payment_id}`);
          } catch {
            // verifyPayment failed — payment may still have gone through.
            // Webhook will activate the subscription as backup.
            // Redirect to success page with pending flag so it polls the DB.
            navigate(`/payment-success?payment_id=${response.razorpay_payment_id}&pending=true`);
          } finally {
            setIsProcessing(false);
          }
        },

        onFailure: (reason) => {
          setIsProcessing(false);
          // User dismissed modal — no redirect, just close
          if (reason === 'cancelled') return;
          // Genuine failure — show failure page with reason
          navigate(`/payment-failure?reason=${encodeURIComponent(reason || 'Payment failed')}`);
        },
      });
    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
      setIsProcessing(false);
    }
  }, [isProcessing, navigate]);

  return { initiatePayment, isProcessing };
}
