import axios from "axios";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/user`,
});

/**
 * Users service
 */
export const Users = {
  async create (data:Record<string, any>) {
    return client.post("", data)
  }
}