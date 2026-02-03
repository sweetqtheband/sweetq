import axios from "./_db";
import { cacheHeaders, GET } from "./_api";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/countries`,
});

export const Countries = {
  store: {} as Record<string, any>,
  getAll: async (params: Record<string, any> | null = null) => {
    let storeKey = "all";
    if (params) {
      storeKey += JSON.stringify(params);
    }

    if (Countries.store[storeKey]) {
      return Countries.store[storeKey];
    }
    const response = await GET(client, "", params, cacheHeaders);
    Countries.store[storeKey] = response.data;

    return Countries.store[storeKey];
  },

  getOptions: async (params: Record<string, any> | null = null) => {
    return {
      options: ((await Countries.getAll(params))?.items || []).map(
        (item: Record<string, string>) => ({
          id: item.id,
          value: item.name[params?.locale],
        })
      ),
    };
  },
};
