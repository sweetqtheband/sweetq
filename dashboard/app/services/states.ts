import axios from "./_db";
import { cacheHeaders, GET } from "./_api";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/states`,
});

export const States = {
  getAll: async (params: any = null) => {
    const response = await GET(client, "", params, cacheHeaders);

    return response.data;
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
