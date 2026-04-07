import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/security.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    // Require authentication — previously missing
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
      p_action: 'weekly_rewards',
      p_max_requests: 2,
      p_window_seconds: 60,
    });
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }

    // Calculate previous week's Monday-Sunday range
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon...
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Previous week's Monday
    const prevMonday = new Date(now);
    prevMonday.setUTCDate(now.getUTCDate() - daysSinceMonday - 7);
    prevMonday.setUTCHours(0, 0, 0, 0);

    // Previous week's Sunday
    const prevSunday = new Date(prevMonday);
    prevSunday.setUTCDate(prevMonday.getUTCDate() + 6);

    const weekStart = prevMonday.toISOString().split('T')[0];
    const weekEnd = prevSunday.toISOString().split('T')[0];

    const { error } = await supabase.rpc('process_weekly_rewards', {
      p_week_start: weekStart,
      p_week_end: weekEnd,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, weekStart, weekEnd }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
