import supabase from './supabase';

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
  // const { data, error } = await supabase.functions.invoke('create-order', {
  //   body: { planType },
  // });
  const { data: { session } } = await supabase.auth.getSession();

const { data, error } = await supabase.functions.invoke('create-order', {
  body: { planType },
  headers: {
    Authorization: `Bearer ${session.access_token}`, // 🔥 THIS IS CRITICAL
  },
});

  if (error) throw new Error(error.message || 'Failed to create order');
  return data;
}

export async function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
  });

  if (error) throw new Error(error.message || 'Payment verification failed');
  return data;
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
