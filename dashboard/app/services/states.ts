import axios from "./_db";
import { cacheHeaders, GET } from "./_api";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/states`,
});

export const States = {
  store: {} as Record<string, any>,

  getAll: async (params: any = null) => {
    let storeKey = "all";
    if (params) {
      storeKey += JSON.stringify(params);
    }

    if (States.store[storeKey]) {
      return States.store[storeKey];
    }

    const response = await GET(client, "", params, cacheHeaders);
    States.store[storeKey] = response.data;

    return States.store[storeKey];
  },

  getOptions: async (params: Record<string, any> | null = null) => {
    return {
      options: ((await States.getAll(params?.query))?.items || []).map(
        (item: Record<string, string>) => ({
          id: item.id,
          value: item.name[params?.locale],
        })
      ),
    };
  },
};
