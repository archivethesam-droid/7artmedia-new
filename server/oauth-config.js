import crypto from 'node:crypto';

const TEN_MINUTES = 10 * 60 * 1000;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getOAuthConfig() {
  const siteUrl = requireEnv('SITE_URL');
  const origin = new URL(siteUrl).origin;
  return {
    origin,
    callbackUrl: `${origin}/api/complete`,
    adminUrl: `${origin}/admin/`,
    clientId: requireEnv('OAUTH_CLIENT_ID'),
    clientSecret: requireEnv('OAUTH_CLIENT_SECRET'),
    stateSecret: requireEnv('OAUTH_STATE_SECRET')
  };
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

export function createSignedState(originalState, secret) {
  const payload = base64UrlEncode(JSON.stringify({
    nonce: crypto.randomUUID(),
    createdAt: Date.now(),
    originalState: typeof originalState === 'string' ? originalState : ''
  }));
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySignedState(state, secret) {
  if (typeof state !== 'string') throw new Error('OAuth state is missing.');
  const [payload, signature, extra] = state.split('.');
  if (!payload || !signature || extra) throw new Error('OAuth state is invalid.');

  const expected = sign(payload, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw new Error('OAuth state verification failed.');
  }

  const decoded = JSON.parse(base64UrlDecode(payload));
  if (!decoded.createdAt || Date.now() - decoded.createdAt > TEN_MINUTES || decoded.createdAt > Date.now() + 60_000) {
    throw new Error('OAuth state has expired. Please try logging in again.');
  }
  return decoded;
}

export function setNoStore(response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeJsonForScript(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

export function renderOAuthResult({ origin, status, content, display }) {
  const message = `authorization:github:${status}:${content}`;
  const messageJson = safeJsonForScript(message);
  const originJson = safeJsonForScript(origin);
  const displayHtml = escapeHtml(display);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>7Art CMS Login</title>
  <style>
    :root{color-scheme:dark}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#09080c;color:#f7f3fa;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.box{width:min(620px,calc(100% - 40px));box-sizing:border-box;padding:32px;border-radius:22px;border:1px solid #403146;background:linear-gradient(145deg,#17101b,#0f0c12);box-shadow:0 24px 80px rgba(0,0,0,.45)}h1{margin:0 0 12px;font-size:1.55rem}.accent{background:linear-gradient(90deg,#8a3ffc,#d64e4e,#d97632);-webkit-background-clip:text;color:transparent}p{margin:0;color:#cfc4d4;line-height:1.6}
  </style>
</head>
<body>
  <main class="box"><h1 class="accent">GitHub authentication</h1><p>${displayHtml}</p></main>
  <script>
    (function () {
      var allowedOrigin = ${originJson};
      var finalMessage = ${messageJson};
      if (!window.opener) return;
      function receiveMessage(event) {
        if (event.origin !== allowedOrigin) return;
        window.removeEventListener('message', receiveMessage, false);
        window.opener.postMessage(finalMessage, allowedOrigin);
      }
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', allowedOrigin);
    }());
  </script>
</body>
</html>`;
}

export function sendConfigurationError(response, error) {
  console.error('CMS OAuth configuration error:', error);
  setNoStore(response);
  response.status(500).setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(renderOAuthResult({
    origin: 'https://invalid.local',
    status: 'error',
    content: 'CMS authentication is not configured.',
    display: 'CMS authentication is not configured. Check the Vercel environment variables and redeploy.'
  }));
}
