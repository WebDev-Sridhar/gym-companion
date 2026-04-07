import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/security.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const REDEEM_COST = 500;

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit check
    const { data: allowed } = await supabase.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_action: 'redeem_points',
      p_max_requests: 3,
      p_window_seconds: 60,
    });
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }

    // Block redemption if user already has an active, non-expired subscription
    const { data: activeSub } = await supabase
      .from('subscriptions')
      .select('id, expires_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (activeSub) {
      return new Response(JSON.stringify({ error: 'You already have an active PRO subscription' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Atomically deduct points — CAS guard prevents race conditions
    const { data: deductResult } = await supabase.rpc('deduct_reward_points', {
      p_user_id: user.id,
      p_cost: REDEEM_COST,
    });

    if (!deductResult) {
      return new Response(JSON.stringify({ error: 'Insufficient points' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Create 1-month PRO subscription
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type: 'monthly',
        status: 'active',
        amount: 0,
        currency: 'INR',
        source: 'points_redemption',
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (subError) {
      // Refund points if subscription creation fails
      await supabase.rpc('increment_reward_points', { p_user_id: user.id, p_points: REDEEM_COST });
      return new Response(JSON.stringify({ error: 'Failed to create subscription' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscription.id,
          planType: subscription.plan_type,
          status: subscription.status,
          startsAt: subscription.starts_at,
          expiresAt: subscription.expires_at,
        },
      }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
