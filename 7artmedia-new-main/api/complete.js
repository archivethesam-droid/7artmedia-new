import {
  getOAuthConfig,
  renderOAuthResult,
  sendConfigurationError,
  setNoStore,
  verifySignedState
} from '../server/oauth-config.js';

function sendHtml(response, statusCode, html) {
  setNoStore(response);
  response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
  response.status(statusCode).setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(html);
}

export default async function handler(request, response) {
  try {
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET');
      return response.status(405).end('Method Not Allowed');
    }

    const config = getOAuthConfig();
    const { code, state, error: githubError, error_description: githubDescription } = request.query || {};

    if (githubError) {
      const message = githubDescription || githubError;
      return sendHtml(response, 400, renderOAuthResult({
        origin: config.origin,
        status: 'error',
        content: message,
        display: `GitHub login failed: ${message}`
      }));
    }

    if (typeof code !== 'string' || !code) throw new Error('GitHub did not return an authorization code.');
    verifySignedState(state, config.stateSecret);

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': '7Art-Decap-CMS'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.callbackUrl
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'GitHub token exchange failed.');
    }

    return sendHtml(response, 200, renderOAuthResult({
      origin: config.origin,
      status: 'success',
      content: JSON.stringify({ token: tokenData.access_token, provider: 'github' }),
      display: 'Login successful. You can return to the CMS window.'
    }));
  } catch (error) {
    console.error('CMS OAuth callback error:', error);
    try {
      const config = getOAuthConfig();
      return sendHtml(response, 400, renderOAuthResult({
        origin: config.origin,
        status: 'error',
        content: error instanceof Error ? error.message : 'Authentication failed.',
        display: 'Authentication failed. Close this window and try again.'
      }));
    } catch (configurationError) {
      return sendConfigurationError(response, configurationError);
    }
  }
}
