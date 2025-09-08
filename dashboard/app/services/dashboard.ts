import axios from "./_db";
import { BaseList } from "./_list";
import { GET } from "./_api";

const fields = {};

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/dashboard`,
});

export const Dashboard = {
  ...BaseList(client),
  fields,
  getFollowersByState: async (params: Record<string, any> | null = null) => {
    const response = await GET(client, "followersByState", params);
    return response.data;
  },
  getTotalFollowers: async (params: Record<string, any> | null = null) => {
    const response = await GET(client, "totalFollowers", params);
    return response.data;
  },
};
