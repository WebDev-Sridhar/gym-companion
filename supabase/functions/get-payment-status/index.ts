import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/security.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Validates Razorpay payment ID format
function isValidPaymentId(id: string): boolean {
  return typeof id === 'string' && /^pay_\w{14,}$/.test(id);
}

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Require JWT — user can only look up their own payments
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

    // Parse and validate request body
    let body: { paymentId?: string };
    try {
      const text = await req.text();
      if (text.length > 1_000) {
        return new Response(JSON.stringify({ error: 'Request body too large' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      body = JSON.parse(text);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { paymentId } = body;

    if (!paymentId || !isValidPaymentId(paymentId)) {
      return new Response(JSON.stringify({ error: 'Invalid payment ID format' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Fetch subscription — scoped to this user (prevents looking up others' payments)
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, plan_type, status, amount, currency, starts_at, expires_at, razorpay_payment_id')
      .eq('razorpay_payment_id', paymentId)
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      // Return pending — webhook may not have fired yet
      return new Response(
        JSON.stringify({ status: 'pending', paymentId }),
        { headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch member's display name from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .single();

    const memberName =
      profile?.name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'Member';

    return new Response(
      JSON.stringify({
        status: subscription.status,           // 'active' | 'pending' | 'expired' | 'cancelled'
        paymentId: subscription.razorpay_payment_id,
        planType: subscription.plan_type,      // 'monthly' | 'yearly'
        amount: subscription.amount,           // in paise (divide by 100 for ₹)
        currency: subscription.currency,
        startsAt: subscription.starts_at,
        expiresAt: subscription.expires_at,
        memberName,
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
