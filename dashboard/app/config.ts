import { STORAGE } from "./constants";

const config = {
  table: {
    shown: 15,
    limit: 25,
  },
  tokens: {
    expireDays: 365,
  },
  storages: {
    default: STORAGE.SESSION,
    cookies: {
      expireDays: 1,
    },
  },
};

export default config;
