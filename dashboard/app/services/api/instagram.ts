import axios from "../_db";
import { POST, GET, DELETE } from "../_api";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";
import { Model } from "@/app/models/instagram";
import { Model as CacheModel } from "@/app/models/cache";
import { getFormData } from "@/app/utils";

const CACHE_KEYS = {
  CONVERSATIONS: "ig_conversations",
  CONVERSATION: "ig_conversation",
};

const api = axios.create({
  baseURL: process.env.API_INSTAGRAM,
});

const graph = axios.create({
  baseURL: process.env.GRAPH_INSTAGRAM,
});

const cache = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/cache`,
});

const EP = {
  OAUTH: "oauth",
  ACCESS_TOKEN: "access_token",
  REFRESH_ACCESS_TOKEN: "refresh_access_token",
};

const MAX_LIMITS = {
  CONVERSATIONS: 100,
  MESSAGES: 100,
};

let accessToken: string | any = null;

const getAccessToken = async (instance: any) => instance.findOne({ id: "instagram" });

const getShortLiveAccessToken = async (code: string) => {
  try {
    const response = await POST(
      api,
      {
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: "authorization_code",
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
    id: "instagram",
    user_id: tokenResponse.user_id,
    short_live_access_token: tokenResponse.access_token,
  });

const getLongLiveAccessToken = async (shortLiveAccessToken: string) => {
  try {
    const response = await GET(graph, `/${EP.ACCESS_TOKEN}`, {
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      grant_type: "ig_exchange_token",
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
  const item = await instance.findOne({ id: "instagram" });

  await instance.update(
    {
      ...item,
      long_live_access_token: tokenResponse.access_token,
      expires_in: tokenResponse.expires_in,
    },
    true
  );

  return parseAuthToken(await instance.findOne({ id: "instagram" }));
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

const deduplicateByLatest = (arr: any[]) => {
  const map = new Map();

  arr.forEach((obj) => {
    const existing = map.get(obj.id);
    if (!existing || new Date(obj.updated_time) > new Date(existing.updated_time)) {
      map.set(obj.id, obj);
    }
  });

  return Array.from(map.values());
};

const getConversations = async (
  instance: any,
  limit: number = MAX_LIMITS.CONVERSATIONS,
  after: string | null = null,
  conversations: any[] = [],
  maxDate: any = null
): Promise<any> => {
  try {
    if (!after) {
      const cachedConversations = await GET(cache, "", { type: CACHE_KEYS.CONVERSATIONS });
      if (cachedConversations.data) {
        conversations = JSON.parse(cachedConversations.data.data);
        maxDate = conversations.length ? conversations[0].updated_time : null;
      }
    }

    const params: Record<string, any> = {
      limit,
    };

    if (after) {
      params.after = after;
    }
    const response = await GET(graph, `/me/conversations`, params, await getHeaders(instance));

    const { data, paging } = response?.data;

    if (conversations.length && maxDate) {
      const newConversations = data.filter(
        (conversation: Record<string, any>) =>
          new Date(conversation.updated_time) > new Date(maxDate)
      );
      const idsSet = new Set(
        newConversations.map((conversation: Record<string, any>) => conversation.id)
      );
      const dedupedConversations = deduplicateByLatest(
        conversations.filter((conversation: Record<string, any>) => !idsSet.has(conversation.id))
      );

      // We have new conversations, but only a few
      if (newConversations.length < data.length) {
        return [...newConversations, ...dedupedConversations];
      } else if (newConversations.length === data.length) {
        // We fill conversations with all new ones
        conversations = [...newConversations, ...dedupedConversations];
      }
    }

    if (
      paging?.cursors?.after &&
      paging?.cursors?.after !== after &&
      limit === MAX_LIMITS.CONVERSATIONS
    ) {
      return [
        ...data,
        ...(await getConversations(instance, limit, paging.cursors.after, conversations, maxDate)),
      ];
    }

    return data || [];
  } catch {
    return [];
  }
};

const cacheConversations = async (data: any) => {
  await DELETE(cache, CACHE_KEYS.CONVERSATIONS);
  await POST(cache, getFormData(CacheModel({ type: CACHE_KEYS.CONVERSATIONS, data })));
};

const cacheConversation = async (conversationId: string, data: any) => {
  await DELETE(cache, conversationId, CACHE_KEYS.CONVERSATION + "/");
  await POST(
    cache,
    getFormData(CacheModel({ type: CACHE_KEYS.CONVERSATION, conversationId, data }))
  );
};

const getNonCachedMessages = async (
  instance: any,
  conversationId: string,
  limit: number = MAX_LIMITS.MESSAGES,
  next: string | null = null,
  conversationMessages: any[] = []
): Promise<any[]> => {
  return getMessages(instance, conversationId, limit, next, conversationMessages, null, true);
};

const getMessages = async (
  instance: any,
  conversationId: string,
  limit: number = MAX_LIMITS.MESSAGES,
  next: string | null = null,
  conversationMessages: any[] = [],
  maxDate: any = null,
  nonCached: boolean = false
): Promise<any[]> => {
  if (!accessToken) {
    await getHeaders(instance);
  }

  try {
    if (!next) {
      const cachedMessages = await GET(cache, "", {
        type: CACHE_KEYS.CONVERSATION,
        conversationId,
      });
      if (cachedMessages.data) {
        conversationMessages = JSON.parse(cachedMessages.data.data);
        maxDate = conversationMessages.length ? conversationMessages[0].created_time : null;
      }
    }

    if (nonCached && conversationMessages.length > 0) {
      return ["CACHED"];
    }

    const params: Record<string, any> = {
      limit: 100,
      fields: "messages",
      access_token: accessToken,
    };

    if (next) {
      params.next = next;
    }

    const response = await GET(
      graph,
      next ? next.replace(process.env.GRAPH_INSTAGRAM || "", "") : `/${conversationId}`,
      next ? {} : params,
      {}
    );

    const { data = [], paging } = (next ? response?.data : response?.data?.messages) || {};

    const messages = await Promise.all(
      data
        .filter((item: Record<string, any>) => {
          const createdTime = new Date(item.created_time);
          return !maxDate || createdTime > new Date(maxDate);
        })
        .map((message: Record<string, any>) => getMessage(instance, message.id))
    );

    if (messages.length && maxDate) {
      const newConversationMessages = messages;

      const idsSet = new Set(
        newConversationMessages.map((message: Record<string, any>) => message.id)
      );
      const dedupedMessages = deduplicateByLatest(
        conversationMessages.filter((message: Record<string, any>) => !idsSet.has(message.id))
      );

      // We have new conversations, but only a few
      if (newConversationMessages.length < data.length) {
        return [...newConversationMessages, ...dedupedMessages];
      } else if (newConversationMessages.length === data.length) {
        // We fill conversations with all new ones
        conversationMessages = [...newConversationMessages, ...dedupedMessages];
      }
    } else if (conversationMessages.length > 0) {
      return conversationMessages;
    }

    if (paging?.cursors?.after && paging?.cursors?.next !== next) {
      const nextMessages = await getMessages(
        instance,
        conversationId,
        limit,
        paging.next,
        conversationMessages,
        maxDate
      );
      return [...messages, ...nextMessages];
    }

    return messages || [];
  } catch {
    return [];
  }
};

const getMessage = async (instance: any, messageId: string) => {
  if (!accessToken) {
    await getHeaders(instance);
  }
  try {
    const params = {
      fields: "id,created_time,from,to,message",
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
      fields: "id,created_time,from,to,message",
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
        "Content-Type": "application/json",
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
  cacheConversations,
  cacheConversation,
  getNonCachedMessages,
  getMessages,
  getMessage,
  sendMessage,
});
