const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  if (String(input) === "https://chatgpt.com/oauth/client.json") {
    return Response.json({
      client_id: "https://chatgpt.com/oauth/client.json",
      redirect_uris: ["https://chatgpt.com/connector_platform_oauth_redirect"],
      response_types: ["code"],
      grant_types: ["authorization_code", "refresh_token", "urn:ietf:params:oauth:grant-type:jwt-bearer"],
      token_endpoint_auth_method: "private_key_jwt",
      token_endpoint_auth_signing_alg: "RS256",
      jwks_uri: "https://chatgpt.com/oauth/jwks.json",
    });
  }
  if (String(input) === "https://chatgpt.com/oauth/jwks.json") {
    return Response.json({ keys: [JSON.parse(process.env.OAUTH_TEST_PUBLIC_JWK)] });
  }
  return originalFetch(input, init);
};
