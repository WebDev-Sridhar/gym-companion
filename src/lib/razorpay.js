import supabase from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

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

export async function createOrder(planType) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ planType }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create order');
  }
  return res.json();
}

export async function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Payment verification failed');
  }
  return res.json();
}

export function openCheckout({ orderId, amount, planType, userEmail, userName, onSuccess, onFailure }) {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount,
    currency: 'INR',
    order_id: orderId,
    name: 'GymThozhan',
    description: planType === 'monthly' ? 'Pro Monthly Plan' : 'Pro Yearly Plan',
    prefill: {
      name: userName || '',
      email: userEmail || '',
    },
    theme: {
      color: '#0A798F',
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
