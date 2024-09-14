import axios from "axios";
import config from "../config";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/followers`
});

export const Followers = {
  getAll: async (query: string = '', limit: number = config.table.limit, cursor: number = 0) => {    
    const params : any = {
      limit, 
      cursor
    };

    if (query) {
      params.query = query;
    }
    
    const response = await client.get("", { params });

    return response.data;
  },

  put: async (data: Record<string, any>) => {
    const response = await client.put(data._id, data);
    console.log(response);
  }
};