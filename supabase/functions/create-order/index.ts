import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, safeParseJson } from '../_shared/security.ts';

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 9900, // ₹99 in paise
  yearly: 79900, // ₹799 in paise
};

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Safe JSON parsing with size limit
    const { data: body, error: parseError } = await safeParseJson(req);
    if (parseError) {
      return new Response(JSON.stringify({ error: parseError }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { planType } = body;
    const baseAmount = PLAN_AMOUNTS[planType];

    if (!baseAmount) {
      return new Response(JSON.stringify({ error: "Invalid plan type" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Rate limit check
    const { data: allowed } = await supabase.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_action: 'create_order',
      p_max_requests: 5,
      p_window_seconds: 60,
    });
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json", "Retry-After": "60" },
      });
    }

    // Check referral discount eligibility (₹20 off first subscription)
    let discount = 0;
    const { data: profile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.referred_by) {
      // One-time only: check if user ever had a paid subscription (any status)
      const { data: prevSubs } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("source", "payment")
        .limit(1);

      if (!prevSubs || prevSubs.length === 0) {
        discount = 2000; // ₹20 in paise
      }
    }

    const amount = baseAmount - discount;

    // Create Razorpay order
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `og_${user.id.slice(0, 8)}_${Date.now()}`,
      }),
    });

    const order = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to create order", details: order }),
        {
          status: 500,
          headers: { ...cors, "Content-Type": "application/json" },
        },
      );
    }

    // Cancel any stale pending subscriptions for this user
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("status", "pending");

    // Insert pending subscription
    await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_type: planType,
      status: "pending",
      amount,
      original_amount: baseAmount,
      discount,
      currency: "INR",
      razorpay_order_id: order.id,
    });

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount,
        originalAmount: baseAmount,
        discount,
        currency: "INR",
      }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
