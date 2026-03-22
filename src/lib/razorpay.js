import supabase from './supabase';

const PLAN_AMOUNTS = {
  monthly: 14900, // ₹149 in paise
  yearly: 99900,  // ₹999 in paise
};

let scriptLoaded = null;

export function loadRazorpayScript() {
  if (scriptLoaded) return scriptLoaded;

  scriptLoaded = new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptLoaded = null;
      reject(new Error('Failed to load Razorpay SDK'));
    };
    document.head.appendChild(script);
  });

  return scriptLoaded;
}

export async function createPendingSubscription(planType, userId) {
  const amount = PLAN_AMOUNTS[planType];
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_type: planType,
      status: 'pending',
      amount,
      currency: 'INR',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function activateSubscription(subscriptionId, paymentId, planType) {
  const now = new Date();
  const expiresAt = new Date(now);
  if (planType === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      razorpay_payment_id: paymentId,
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export function openCheckout({ amount, planType, userEmail, userName, onSuccess, onFailure }) {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount,
    currency: 'INR',
    name: 'GymThozhan',
    description: planType === 'monthly' ? 'Pro Monthly Plan' : 'Pro Yearly Plan',
    prefill: {
      name: userName || '',
      email: userEmail || '',
    },
    theme: {
      color: '#c8ee44',
      backdrop_color: 'rgba(0, 0, 0, 0.8)',
    },
    handler: (response) => {
      onSuccess(response);
    },
    modal: {
      ondismiss: () => {
        onFailure?.('cancelled');
      },
      confirm_close: true,
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response) => {
    onFailure?.(response.error?.description || 'Payment failed');
  });
  rzp.open();
}
