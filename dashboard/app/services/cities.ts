import axios from 'axios';
import { GET } from './_api';

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/cities`,
});

export const Cities = {
  getAll: async (params: any = null) => {
    const response = await GET(client, '', params);

    return response.data;
  },

  getOptions: async (params: Record<string, any> | null = null) => {
    return {
      options: (await Cities.getAll(params?.query)).items.map(
        (item: Record<string, string>) => ({
          id: item.id,
          value: item.name[params?.locale],
        })
      ),
    };
  },
};
