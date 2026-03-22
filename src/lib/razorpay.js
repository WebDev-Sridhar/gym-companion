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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('create-order', {
    body: { planType },
  });

  if (error) throw new Error(error.message || 'Failed to create order');
  return data;
}

export async function verifyPayment(paymentData) {
  const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: paymentData,
  });

  if (error) throw new Error(error.message || 'Payment verification failed');
  return data;
}

export function openCheckout({ orderId, amount, planType, userEmail, userName, onSuccess, onFailure }) {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount,
    currency: 'INR',
    name: 'GymThozhan',
    description: planType === 'monthly' ? 'Pro Monthly Plan' : 'Pro Yearly Plan',
    order_id: orderId,
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
