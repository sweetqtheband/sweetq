export const TREATMENTS = ['Persona', 'Colectivo']

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_ALLOWED: 405,
  CONFLICT: 409,
  ERROR: 500,
};

export const HTTP_ENCTYPES = {
  FORMDATA: "multipart/form-data",
  URLENCODED: "application/x-www-form-urlencoded; charset=UTF-8",
  JSON: "application/json",
};

export const USER_PROFILES = {
  ADMIN: "admin",
  USER: "user",
};

export const TOKENS = {
  ADMIN: "admin",
  ACCESS: "access",
};


export const STORAGE = {
	SESSION: "session",
	LOCAL: "local",
	COOKIES: "cookies",
};

export const ERRORS = {
  INVALID_CREDENTIALS: "Invalid credentials"
}

export const ACTIONS = {
  DATA_UPDATE: "need-data-update",
};
