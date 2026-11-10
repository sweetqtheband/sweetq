/**
 * OAuth 2.1 types for MCP authentication
 */

export interface OAuthAuthorizationRequest {
  client_id: string;
  response_type: "code";
  redirect_uri: string;
  scope: string;
  state: string;
  code_challenge: string;
  code_challenge_method: "S256";
  resource: string;
}

export interface OAuthAuthorizationCode {
  code: string;
  scope: string;
  resource: string;
  client_id: string;
  code_challenge: string;
  code_challenge_method: "S256";
  expires_at: number;
  created_at: number;
}

export interface OAuthTokenRequest {
  grant_type: "authorization_code";
  code: string;
  client_id: string;
  redirect_uri: string;
  code_verifier: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  resource: string;
}

export interface OAuthToken {
  access_token: string;
  token_type: "Bearer";
  scope: string;
  resource: string;
  issued_at: number;
  expires_at: number;
  client_id: string;
}

export interface ProtectedResourceMetadata {
  resource: string;
  authorization_servers: string[];
  scopes_supported: string[];
  resource_documentation?: string;
  resource_policy_uri?: string;
}

export interface OAuthAuthorizationServerMetadata {
  issuer: string;
  authorization_response_iss_parameter_supported: boolean;
  authorization_endpoint: string;
  token_endpoint: string;
  client_id_metadata_document_supported: boolean;
  token_endpoint_auth_methods_supported: string[];
  code_challenge_methods_supported: string[];
  scopes_supported: string[];
  registration_endpoint?: string;
  introspection_endpoint?: string;
  revocation_endpoint?: string;
}
