import { FieldTypesType } from '@/types/field-types';
import { SizeType } from '@/types/size';

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
  FORMDATA: 'multipart/form-data',
  URLENCODED: 'application/x-www-form-urlencoded; charset=UTF-8',
  JSON: 'application/json',
};

export const USER_PROFILES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const TOKENS = {
  ADMIN: 'admin',
  ACCESS: 'access',
};

export const STORAGE = {
  SESSION: 'session',
  LOCAL: 'local',
  COOKIES: 'cookies',
};

export const ERRORS = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  CORS: 'CORS not allowed',
  IMAGE_URL_MISSING: 'Missing URL',
};

export const ACTIONS = {
  ADD: 'add',
  SAVE: 'save',
  DATA_UPDATE: 'need-data-update',
};

export const IMAGE_SIZES = {
  sm: 24,
  md: 48,
  lg: 96,
  xl: 192,
};

export const SIZES: Record<string, SizeType> = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
};

export const SORT: Record<string, number> = {
  ASC: 1,
  DESC: -1,
};

export const FIELD_TYPES: Record<string, FieldTypesType> = {
  HIDDEN: 'hidden',
  TEXT: 'text',
  TEXTAREA: 'textarea',
  UPLOADER: 'uploader',
  IMAGE_UPLOADER: 'imageUploader',
  VIDEO_UPLOADER: 'videoUploader',
  DATE: 'date',
  SELECT: 'select',
  MULTISELECT: 'multiSelect',
  CHECKBOX: 'checkbox',
  IMAGE: 'image',
  VIDEO: 'video',
  HOUR: 'hour',
  FILTER_COUNTRY: 'filterCountry',
  FILTER_STATE: 'filterState',
  FILTER_CITY: 'filterCity',
  CITY: 'city',
  NONE: 'none',
  LABEL: 'label',
  DATE_LABEL: 'dateLabel',
  PASSWORD: 'password',
};

export const IG = {
  USER: 'instagram:user',
  TOKEN: 'instagram:authToken',
  EXPIRES: 'instagram:expires',
};
export const RENDER_TYPES: Record<string, string> = {
  TAG: 'tag',
  LINK: 'link',
  COLOR: 'color',
  STATUS_MESSAGE: 'statusMessage',
  INSTAGRAM_MESSAGE: 'instagramMessage',
};

export const FIELD_DEFAULTS: Record<string, any> = {
  COUNTRY: '205',
};

export const TREATMENTS = ['treatments.person', 'treatments.collective'];

export const TAG_TYPES: (
  | 'red'
  | 'magenta'
  | 'purple'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'gray'
  | 'cool-gray'
  | 'warm-gray'
)[] = ['red', 'magenta', 'purple', 'blue', 'cyan', 'teal', 'green', 'gray'];

export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  LAPTOP: 1024,
  DESKTOP: 1280,
};

export const ICON_SIZES = {
  SM: 16,
  MD: 20,
  LG: 32,
};

export const VARIABLES = [
  { id: 'short_name', text: 'Nombre corto', replacement: '{{short_name}}' },
];
