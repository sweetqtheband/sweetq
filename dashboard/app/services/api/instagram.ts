import axios from 'axios';
import { POST, GET } from '../_api';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';
import { Model } from '@/app/models/instagram';

const api = axios.create({
  baseURL: process.env.API_INSTAGRAM,
});

const graph = axios.create({
  baseURL: process.env.GRAPH_INSTAGRAM,
});

const EP = {
  OAUTH: 'oauth',
  ACCESS_TOKEN: 'access_token',
  REFRESH_ACCESS_TOKEN: 'refresh_access_token',
};

const MAX_LIMITS = {
  CONVERSATIONS: 100,
  MESSAGES: 100,
};

let accessToken: string | any = null;

const getAccessToken = async (instance: any) =>
  instance.findOne({ id: 'instagram' });

const getShortLiveAccessToken = async (code: string) => {
  try {
    const response = await POST(
      api,
      {
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI,
        code,
      },
      `/${EP.OAUTH}/${EP.ACCESS_TOKEN}`
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const storeShortLiveAccessToken = async (instance: any, tokenResponse: any) =>
  instance.create({
    id: 'instagram',
    user_id: tokenResponse.user_id,
    short_live_access_token: tokenResponse.access_token,
  });

const getLongLiveAccessToken = async (shortLiveAccessToken: string) => {
  try {
    const response = await GET(graph, `/${EP.ACCESS_TOKEN}`, {
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      grant_type: 'ig_exchange_token',
      access_token: shortLiveAccessToken,
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const parseAuthToken = (item: any) => ({
  auth_token: item.long_live_access_token,
  expires: item.expires.toString(),
});

const storeLongLiveAccessToken = async (instance: any, tokenResponse: any) => {
  const item = await instance.findOne({ id: 'instagram' });

  await instance.update(
    {
      ...item,
      long_live_access_token: tokenResponse.access_token,
      expires_in: tokenResponse.expires_in,
    },
    true
  );

  return parseAuthToken(await instance.findOne({ id: 'instagram' }));
};

const getHeaders = async (instance: any) => {
  if (!accessToken) {
    const { long_live_access_token: token } = await getAccessToken(instance);
    accessToken = token;
  }
  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

const getConversations = async (
  instance: any,
  limit: number = MAX_LIMITS.CONVERSATIONS,
  after: string | null = null
): Promise<any> => {
  try {
    const params: Record<string, any> = {
      limit,
    };

    if (after) {
      params.after = after;
    }
    const response = await GET(
      graph,
      `/me/conversations`,
      params,
      await getHeaders(instance)
    );

    const { data, paging } = response?.data;

    if (
      paging?.cursors?.after &&
      paging?.cursors?.after !== after &&
      limit === MAX_LIMITS.CONVERSATIONS
    ) {
      return [
        ...data,
        ...(await getConversations(instance, limit, paging.cursors.after)),
      ];
    } else {
      return data || [];
    }
  } catch {
    return [];
  }
};

const getMessages = async (
  instance: any,
  conversationId: string,
  limit: number = MAX_LIMITS.MESSAGES,
  next: string | null = null
): Promise<any[]> => {
  if (!accessToken) {
    await getHeaders(instance);
  }

  try {
    const params: Record<string, any> = {
      limit: 100,
      fields: 'messages',
      access_token: accessToken,
    };

    const response = await GET(
      graph,
      next
        ? next.replace(process.env.GRAPH_INSTAGRAM || '', '')
        : `/${conversationId}`,
      next ? {} : params,
      {}
    );

    const { data = [], paging } =
      (next ? response?.data : response?.data?.messages) || {};

    const messages = await Promise.all(
      data.map((message: Record<string, any>) =>
        getMessage(instance, message.id)
      )
    );

    if (paging?.cursors?.after && paging?.cursors?.next !== next) {
      const nextMessages = await getMessages(
        instance,
        conversationId,
        limit,
        paging.next
      );
      return [...messages, ...nextMessages];
    }

    return messages;
  } catch (error) {
    console.error('Error en getMessages:', error);
    return [];
  }
};

const getMessage = async (instance: any, messageId: string) => {
  if (!accessToken) {
    await getHeaders(instance);
  }
  try {
    const params = {
      fields: 'id,created_time,from,to,message',
      access_token: accessToken,
    };
    const response = await GET(graph, `/${messageId}`, params);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const sendMessage = async (instance: any, data: Record<string, any>) => {
  if (!accessToken) {
    await getHeaders(instance);
  }
  try {
    const params = {
      fields: 'id,created_time,from,to,message',
      access_token: accessToken,
    };
    const response = await POST(
      graph,
      {
        recipient: {
          id: data.recipient,
        },
        message: {
          text: data.text,
        },
      },
      `/me/messages`,
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Instagram service
 */
export const instagramSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
  getShortLiveAccessToken,
  storeShortLiveAccessToken,
  getLongLiveAccessToken,
  storeLongLiveAccessToken,
  getAccessToken,
  parseAuthToken,
  getConversations,
  getMessages,
  getMessage,
  sendMessage,
});
