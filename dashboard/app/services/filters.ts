import axios from "./_db";
import { cacheHeaders, GET, POST } from "./_api";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/filters`,
});

const getMethods = (router?: any): Record<string, any> => ({
  onSave: async (data: any) => {
    const response = await POST(client, data);

    return response.data;
  },
});

export const Filters = {
  getMethods,
  getAll: async (searchParams: any = {}, cache: boolean = false) => {
    const response = await GET(client, `/${searchParams.filter}`, {}, cache ? cacheHeaders : {});
    return response.data;
  },
};
