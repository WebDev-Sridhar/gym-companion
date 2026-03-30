import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 14900, // ₹149 in paise
  yearly: 99900,  // ₹999 in paise
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT
    // const authHeader = req.headers.get('Authorization');
    // if (!authHeader) {
    //   return new Response(JSON.stringify({ error: 'Missing authorization' }), {
    //     status: 401,
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //   });
    // }

    // const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    // const token = authHeader.replace('Bearer ', '');
    const authHeader = req.headers.get('Authorization');

if (!authHeader) {
  return new Response(JSON.stringify({ error: 'Missing auth' }), { status: 401 });
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: {
    headers: {
      Authorization: authHeader,
    },
  },
});
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { planType } = await req.json();
    const baseAmount = PLAN_AMOUNTS[planType];

    if (!baseAmount) {
      return new Response(JSON.stringify({ error: 'Invalid plan type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check referral discount eligibility (₹30 off first subscription)
    let discount = 0;
    const { data: profile } = await supabase
      .from('profiles')
      .select('referred_by')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile?.referred_by) {
      // One-time only: check if user ever had a paid subscription (any status)
      const { data: prevSubs } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('source', 'payment')
        .limit(1);

      if (!prevSubs || prevSubs.length === 0) {
        discount = 3000; // ₹30 in paise
      }
    }

    const amount = baseAmount - discount;

    // Create Razorpay order
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `gym_${user.id.slice(0, 8)}_${Date.now()}`,
      }),
    });

    const order = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to create order', details: order }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cancel any stale pending subscriptions for this user
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'pending');

    // Insert pending subscription
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan_type: planType,
      status: 'pending',
      amount,
      original_amount: baseAmount,
      discount,
      currency: 'INR',
      razorpay_order_id: order.id,
    });

    return new Response(
      JSON.stringify({ orderId: order.id, amount, originalAmount: baseAmount, discount, currency: 'INR' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
