import { createSignedState, getOAuthConfig, sendConfigurationError, setNoStore } from '../server/oauth-config.js';

export default async function handler(request, response) {
  try {
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET');
      return response.status(405).end('Method Not Allowed');
    }

    const config = getOAuthConfig();
    const state = createSignedState(request.query?.state, config.stateSecret);
    const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
    authorizeUrl.searchParams.set('client_id', config.clientId);
    authorizeUrl.searchParams.set('redirect_uri', config.callbackUrl);
    authorizeUrl.searchParams.set('scope', 'repo user');
    authorizeUrl.searchParams.set('state', state);

    setNoStore(response);
    return response.redirect(302, authorizeUrl.toString());
  } catch (error) {
    return sendConfigurationError(response, error);
  }
}
