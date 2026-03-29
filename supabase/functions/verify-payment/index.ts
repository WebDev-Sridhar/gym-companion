import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifySignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(RAZORPAY_KEY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return expectedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify HMAC signature
    const isValid = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid payment signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the pending subscription to get plan_type
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      return new Response(JSON.stringify({ error: 'Subscription not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Idempotent — already activated
    if (subscription.status === 'active') {
      return new Response(
        JSON.stringify({
          success: true,
          subscription: {
            id: subscription.id,
            planType: subscription.plan_type,
            status: 'active',
            startsAt: subscription.starts_at,
            expiresAt: subscription.expires_at,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (subscription.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Subscription is not in pending state' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate expiry
    const now = new Date();
    const expiresAt = new Date(now);
    if (subscription.plan_type === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Update subscription to active
    const { data: updated, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        razorpay_payment_id,
        razorpay_signature,
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', subscription.id)
      .select()
      .single();

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to activate subscription' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Referral reward on first subscription ---
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_user_id', user.id)
      .eq('subscription_reward_given', false)
      .maybeSingle();

    if (referral) {
      // CAS guard: only update if still not rewarded
      const { data: rewarded } = await supabase
        .from('referrals')
        .update({
          status: 'subscribed',
          subscription_reward_given: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', referral.id)
        .eq('subscription_reward_given', false)
        .select('id')
        .maybeSingle();

      if (rewarded) {
        // Award referrer: +100 points, +1 successful_referral (with 5-milestone check)
        await supabase.rpc('increment_referral_rewards', {
          p_user_id: referral.referrer_id,
          p_points: 100,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: updated.id,
          planType: updated.plan_type,
          status: updated.status,
          startsAt: updated.starts_at,
          expiresAt: updated.expires_at,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
