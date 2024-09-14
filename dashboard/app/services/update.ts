import axios from "axios";
import { Auth } from "./auth";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/update`
});

export const Update:any = {
  timeout: null,
  schedule: async () => {
    clearTimeout(Update.timeout)
    Update.timeout = setTimeout(async () => {
      const response = await client.get('', Auth.headers);
      console.log("SCHEDULED", response);
    }, 100);
  }
}