import axios from "./_db";
import { cacheHeaders, GET } from "./_api";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/cities`,
});

export const Cities = {
  store: {} as Record<string, any>,
  getAll: async (params: any = null) => {
    let storeKey = "all";
    if (params) {
      storeKey += JSON.stringify(params);
    }

    if (Cities.store[storeKey]) {
      return Cities.store[storeKey];
    }

    const response = await GET(client, "", params, cacheHeaders);
    Cities.store[storeKey] = response.data;

    return Cities.store[storeKey];
  },

  getOptions: async (params: Record<string, any> | null = null) => {
    return {
      options: ((await Cities.getAll(params?.query))?.items || []).map(
        (item: Record<string, string>) => ({
          id: item.id,
          value: item.name[params?.locale],
        })
      ),
    };
  },
};
