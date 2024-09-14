import { STORAGE } from "./constants";

const config = {
  facebookApi: {
    appId: 2403257386540617,
    version: "v19.0",
  },
  table: {
    limit: 50,
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