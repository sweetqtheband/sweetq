import axios from "axios";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/states`,
});

export const States = {
  getAll: async (params:any = null) => {
    const response = await client.get("", {
      params,
    });

    return response.data;
  },
};
