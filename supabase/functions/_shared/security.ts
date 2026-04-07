// Shared security utilities for all edge functions

const ALLOWED_ORIGINS = [
  'https://OwnGains.vercel.app',
  'http://localhost:5173',
];

/** Returns CORS headers with origin restricted to allowlist */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

/** Constant-time string comparison to prevent timing attacks on HMAC signatures */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Safe JSON body parser with size limit and type checking */
export async function safeParseJson(req: Request): Promise<{ data: any; error: string | null }> {
  try {
    const text = await req.text();
    if (text.length > 10_000) {
      return { data: null, error: 'Request body too large' };
    }
    const data = JSON.parse(text);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return { data: null, error: 'Expected JSON object' };
    }
    return { data, error: null };
  } catch {
    return { data: null, error: 'Invalid JSON' };
  }
}
