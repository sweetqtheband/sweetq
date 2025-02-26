import axios from 'axios';
import { GET } from './_api';

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/countries`,
});

export const Countries = {
  getAll: async (params: Record<string, any> | null = null) => {
    const response = await GET(client, '', params);

    return response.data;
  },

  getOptions: async (params: Record<string, any> | null = null) => {
    return {
      options: (await Countries.getAll(params)).items.map(
        (item: Record<string, string>) => ({
          id: item.id,
          value: item.name[params?.locale],
        })
      ),
    };
  },
};
