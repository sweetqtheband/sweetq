import axios from "axios";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/countries`
});

export const Countries = {
  getAll: async (params = null) => {        
    const response = await client.get("", {
      params
    });

    return response.data;
  },
};