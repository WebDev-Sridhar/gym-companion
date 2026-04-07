import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, safeParseJson } from '../_shared/security.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    // Safe JSON parsing with size limit
    const { data: body, error: parseError } = await safeParseJson(req);
    if (parseError) {
      return new Response(JSON.stringify({ error: parseError }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { referralCode } = body;

    // Validate referral code: required, string, max 20 chars, alphanumeric only
    if (
      !referralCode ||
      typeof referralCode !== 'string' ||
      referralCode.length > 20 ||
      !/^[A-Z0-9]+$/i.test(referralCode)
    ) {
      return new Response(JSON.stringify({ error: 'Invalid referral code' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit check
    const { data: allowed } = await supabase.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_action: 'referral_signup',
      p_max_requests: 5,
      p_window_seconds: 60,
    });
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }

    // Look up referrer by referral code
    const { data: referrer } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('referral_code', referralCode.toUpperCase())
      .maybeSingle();

    if (!referrer) {
      return new Response(JSON.stringify({ error: 'Invalid referral code' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Prevent self-referral
    if (referrer.user_id === user.id) {
      return new Response(JSON.stringify({ error: 'Cannot use your own referral code' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Check if referral already exists (idempotent)
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrer.user_id)
      .eq('referred_user_id', user.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, note: 'already processed' }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Insert referral row
    await supabase.from('referrals').insert({
      referrer_id: referrer.user_id,
      referred_user_id: user.id,
      referral_code: referralCode.toUpperCase(),
      status: 'signed_up',
      signup_reward_given: true,
    });

    // Award referrer +10 signup points (atomic increment)
    await supabase.rpc('increment_reward_points', { p_user_id: referrer.user_id, p_points: 10 });

    // Set referred_by on the new user's profile
    await supabase
      .from('profiles')
      .update({
        referred_by: referralCode.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
