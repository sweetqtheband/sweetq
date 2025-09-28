import axios from "./_db";
import { BaseList } from "./_list";

export const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/instagram/messages`,
});
// Messages service
export const InstagramMessages = {
  ...BaseList(client),
};
