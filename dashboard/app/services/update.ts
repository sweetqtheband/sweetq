import axios from "./_db";
import { Auth } from "./auth";
import { GET } from "./_api";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/update`,
});

export const Update: any = {
  timeout: null,
  schedule: async () => {
    clearTimeout(Update.timeout);
    Update.timeout = setTimeout(async () => {
      const response = await GET(client, "", {}, Auth.headers.headers);
    }, 100);
  },
};
