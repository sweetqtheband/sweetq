import axios from 'axios';

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/cities`,
});

export const Cities = {
  getAll: async (params: any = null) => {
    const response = await client.get('', {
      params,
    });

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
