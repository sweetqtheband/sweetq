import axios from 'axios';
import { BaseList } from './_list';
import { cacheHeaders, GET } from './_api';

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/dashboard`,
});

export const Dashboard = {
  ...BaseList(client),
  getFollowersByState: async (params: Record<string, any> | null = null) => {
    const response = await GET(client, 'followersByState', params, cacheHeaders);
    return response.data;
  },
};
