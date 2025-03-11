import axios from 'axios';
import { BaseList } from './_list';
import { GET, POST } from './_api';

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/instagram`,
});

const ENDPOINTS = {
  CHAT: '/chat',
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
};
