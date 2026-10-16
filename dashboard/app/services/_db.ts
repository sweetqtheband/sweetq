import axios, { AxiosResponse } from "axios";

const MAX_CACHE_ENTRIES = 100;
const cache = new Map<string, AxiosResponse<string, any>>();
const create = (...args: any[]) => {
  const instance = axios.create(...args);

  instance.interceptors.response.use((response: AxiosResponse<string, any>) => {
    const baseURL = response.config.baseURL || "";
    const url = response.config.url || "";
    const params = JSON.stringify(response.config.params || {});

    const cacheKey = baseURL + url + params;

    if (response.config.method === "get") {
      cache.delete(cacheKey);
      cache.set(cacheKey, response);
      while (cache.size > MAX_CACHE_ENTRIES) {
        cache.delete(cache.keys().next().value as string);
      }
    }

    if (["put", "post", "delete"].includes(response.config.method || "")) {
      for (const key of cache.keys()) {
        if (key.startsWith(baseURL)) {
          cache.delete(key);
        }
      }
    }

    return response;
  });

  return instance;
};

const dbApi = { create, cache };
export default dbApi;
