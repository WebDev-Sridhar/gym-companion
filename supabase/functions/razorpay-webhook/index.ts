import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { timingSafeEqual } from '../_shared/security.ts';

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function verifyWebhookSignature(body: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(RAZORPAY_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expected = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(expected, signature);
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Reject oversized payloads (Razorpay webhooks are typically <5KB)
    const contentLength = parseInt(req.headers.get('Content-Length') || '0', 10);
    if (contentLength > 50_000) {
      return new Response('Payload too large', { status: 413 });
    }

    const signature = req.headers.get('X-Razorpay-Signature');
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const body = await req.text();
    const isValid = await verifyWebhookSignature(body, signature);
    if (!isValid) {
      return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(body);

    // Only handle payment.captured
    if (event.event !== 'payment.captured') {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;

    if (!orderId) {
      return new Response(JSON.stringify({ received: true, note: 'no order_id' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find subscription by order_id
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (!subscription) {
      return new Response(JSON.stringify({ received: true, note: 'no matching subscription' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Idempotent — already activated by verify-payment
    if (subscription.status === 'active') {
      return new Response(JSON.stringify({ received: true, note: 'already active' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Activate subscription
    const now = new Date();
    const expiresAt = new Date(now);
    if (subscription.plan_type === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        razorpay_payment_id: payment.id,
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', subscription.id);

    // --- Referral reward on first subscription (backup path) ---
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_user_id', subscription.user_id)
      .eq('subscription_reward_given', false)
      .maybeSingle();

    if (referral) {
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
        await supabase.rpc('increment_referral_rewards', {
          p_user_id: referral.referrer_id,
          p_points: 100,
        });
      }
    }

    return new Response(JSON.stringify({ received: true, activated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
