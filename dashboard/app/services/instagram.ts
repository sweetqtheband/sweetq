import axios from "./_db";
import { BaseList } from "./_list";
import { DELETE, GET, POST } from "./_api";
import { Storage } from "./storage";
import { IG, STORAGE } from "@/app/constants";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/instagram`,
});

const ENDPOINTS = {
  CHAT: "/chat",
  OAUTH: "/oauth",
};

// Messages service
export const instagram = {
  ...BaseList(client),
  getMessages: async (conversationId: string) => {
    return GET(client, ENDPOINTS.CHAT, {
      cid: conversationId,
    });
  },
  sendMessage: async (data: Record<string, any>) => {
    return POST(client, data, ENDPOINTS.CHAT);
  },
  deleteAccessToken: async () => {
    return DELETE(client, "", ENDPOINTS.OAUTH) as Record<string, any>;
  },
  revokeAccessToken: async () => {
    Storage.remove(IG.TOKEN, STORAGE.LOCAL);
    Storage.remove(IG.EXPIRES, STORAGE.LOCAL);
  },
  checkAuth: async () => {
    return GET(client, ENDPOINTS.OAUTH);
  },
};
