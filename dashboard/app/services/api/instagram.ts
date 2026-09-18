import axios from "../_db";
import { POST, GET, DELETE } from "../_api";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";
import { Model } from "@/app/models/instagram";
import { Model as CacheModel } from "@/app/models/cache";
import { getFormData, getMeta } from "@/app/utils";
import IGError, { IGErrorType } from "./errors/instagram";
import puppeteer, { HTTPResponse, Page, Browser } from "puppeteer";
import { InstagramProfile } from "@/types/instagram-profile";
import { uploadSvc } from "./upload";
import { userAgentSvc } from "./userAgent";
import { proxySvc } from "./proxy";

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

const CONCURRENCY = 5;
const TIMEOUT = 15_000;

const browserInstance: Record<string, Page | Browser | null> = {
  browser: null,
  page: null,
};

let accessToken: string | any = null;

const getAccessToken = async (instance: any) => instance.findOne({ id: "instagram" });

const deleteAccessToken = async (instance: any) => instance.delete({ id: "instagram" });

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

const getCachedConversations = async (
  instance: any,
  limit: number = MAX_LIMITS.CONVERSATIONS,
  after: string | null = null,
  conversations: any[] = [],
  maxDate: any = null
): Promise<any> => getConversations(instance, limit, after, conversations, maxDate, true);

const getConversations = async (
  instance: any,
  limit: number = MAX_LIMITS.CONVERSATIONS,
  after: string | null = null,
  conversations: any[] = [],
  maxDate: any = null,
  onlyCache: boolean = false
): Promise<any> => {
  try {
    if (!after) {
      const cachedConversations = await GET(cache, "", { type: CACHE_KEYS.CONVERSATIONS });
      if (cachedConversations.data) {
        conversations = JSON.parse(cachedConversations.data.data);
        maxDate = conversations.length ? conversations[0].updated_time : null;
      }
    }

    if (onlyCache && conversations.length > 0) {
      return conversations;
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

const getCachedMessages = async (
  instance: any,
  conversationId: string,
  limit: number = MAX_LIMITS.MESSAGES,
  next: string | null = null,
  conversationMessages: any[] = []
): Promise<any[]> => {
  return getMessages(
    instance,
    conversationId,
    limit,
    next,
    conversationMessages,
    null,
    false,
    true
  );
};

const getMessages = async (
  instance: any,
  conversationId: string,
  limit: number = MAX_LIMITS.MESSAGES,
  next: string | null = null,
  conversationMessages: any[] = [],
  maxDate: any = null,
  nonCached: boolean = false,
  onlyCache: boolean = false
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

    if (onlyCache && conversationMessages.length > 0) {
      return conversationMessages;
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
      return nextMessages ? [...messages, ...nextMessages] : [...messages];
    }

    return messages || [];
  } catch (error) {
    if (IGError.isExpired(error as IGErrorType)) {
      await deleteAccessToken(instance);
      return ["REVOKED"];
    }
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

const fetchInstagramProfile = async (
  username: string,
  headers?: Record<string, any>,
  agents?: { httpAgent?: any; httpsAgent?: any }
) => {
  const response = await fetch(
    `https://www.instagram.com/${username}/`,
    {
      headers: {
        "User-Agent": headers?.["User-Agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        Referer: "https://www.instagram.com/",
      },
      ...(agents?.httpsAgent && { agent: agents.httpsAgent }),
      cache: "no-store",
      redirect: "manual",
    }
  );


  if (!response.ok && response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");

    if (location?.includes("/accounts/login")) {
      console.log(`Redirected to login for user ${username}, retrying with new User-Agent and Proxy`);

      try {
        // Obtener proxy
        const proxy = await proxySvc.getProxyForPuppeteer();
        const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.ip}`;

        // Crear agents
        const { HttpProxyAgent } = await import('http-proxy-agent');
        const { HttpsProxyAgent } = await import('https-proxy-agent');

        const httpAgent = new HttpProxyAgent(proxyUrl);
        const httpsAgent = new HttpsProxyAgent(proxyUrl);

        console.log(`Using proxy: ${proxy.ip}`);

        return fetchInstagramProfile(
          username,
          userAgentSvc.getForFetch(),
          { httpAgent, httpsAgent }
        );
      } catch (proxyError) {
        console.warn(`Failed to get proxy, retrying without proxy:`, proxyError);
        return fetchInstagramProfile(username, userAgentSvc.getForFetch());
      }
    }
  }

  const html = await response.text();

  const fullName = getMeta(html, "og:title");
  const image = getMeta(html, "og:image");
  const ogDescription = getMeta(html, "og:description");
  const description = getMeta(html, "description")?.replace(`${ogDescription?.split(" - ")[0]}${" - "}`, "");
  console.log(`Fetched Instagram profile for ${username}: fullName=${fullName}, image=${image}, description=${description}`);

  return {
    username,
    full_name: fullName,
    description: description,
    profile_pic_url: image,
  };
}

const fetchInstagramProfileData = async (users: string[], cb: (result: Record<string, any>) => void = () => { }, concurrency = CONCURRENCY) => {
  console.log(`fetchInstagramProfileData called with ${users?.length || 0} users`);

  if (!users || users.length === 0) {
    console.log("fetchInstagramProfileData: No users to process, returning empty array");
    return [];
  }

  console.log(`fetchInstagramProfileData: Starting with concurrency=${concurrency}`);
  const results: Record<string, any>[] = new Array(users.length);
  let processedIndex = 0;

  async function worker() {
    while (processedIndex < users.length) {
      const currentIndex = processedIndex++;
      const user = users[currentIndex];
      console.log(`Worker processing user ${currentIndex + 1}/${users.length}: ${user}`);

      try {
        results[currentIndex] = { ...await fetchInstagramProfile(user) };
        console.log(`Worker got profile for ${user}`);
        await cb(results[currentIndex]);
      } catch (error) {
        console.error(`Error fetching profile for ${user}:`, error);
        results[currentIndex] = {
          username: user,
        };
      }
    }
  }

  try {
    const numWorkers = Math.min(concurrency, users.length);
    console.log(`fetchInstagramProfileData: Starting ${numWorkers} workers`);
    await Promise.all(Array.from({ length: numWorkers }, () => worker()));
    console.log(`fetchInstagramProfileData: All workers completed, returning ${results.length} results`);
    return results;
  } catch (error) {
    console.error("Error in fetchInstagramProfileData:", error);
    return results;
  }
};

function parseInstagramProfile(
  text: string
): InstagramProfile | null {
  const marker = '"xig_user_by_username":';

  const markerIndex = text.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const objectStart = text.indexOf(
    "{",
    markerIndex + marker.length
  );

  if (objectStart === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = objectStart; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;

      if (depth === 0) {
        try {
          const user = JSON.parse(
            text.slice(objectStart, i + 1)
          );

          return {
            id: user.pk ?? null,
            username: user.username ?? null,
            full_name: user.full_name ?? null,
            biography: user.biography ?? null,
            profile_pic_url: user.profile_pic_url ?? null,
            isPrivate: user.is_private ?? null,
            isVerified: user.is_verified ?? null,
          };
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

async function getInstagramProfile(
  page: Page,
  username: string,
): Promise<InstagramProfile | null> {

  try {
    await page.goto(
      `https://www.instagram.com/${username}/`,
      { waitUntil: "networkidle2" }
    );
    try {
      await page.waitForFunction(
        () =>
          document.documentElement.innerHTML.includes(
            "xig_user_by_username"
          ),
        {
          timeout: 10_000,
        }
      );
    } catch {
      console.log(`[PUPPETEER] Not found: ${username}`);
      return null;
    }

    const html = await page.content();
    const profile = parseInstagramProfile(html);

    return profile;

  } catch (err) {
    console.error(`[PUPPETEER] Error fetching Instagram profile for ${username}:`, err);
    return null;
  }
};


const getPuppeteerEnvironment = async () => {
  if (!browserInstance.browser && !browserInstance.page) {
    browserInstance.browser = await puppeteer.launch({
      headless: true,
    });
    browserInstance.page = await browserInstance.browser.newPage();
    await browserInstance.page.setRequestInterception(true);

    browserInstance.page.on("request", (request: any) => {
      const blocked = [
        "image",
        "font",
        "stylesheet",
        "media",
      ];

      if (blocked.includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  return { browser: browserInstance.browser, page: browserInstance.page };
};

const fetchInstagramData = async (user: Record<string, any>) => {
  try {

    const profile = await getInstagramProfile(
      browserInstance.page as Page,
      user.username
    );


    return profile;
  } catch (error) {
    console.error(`[PUPPETEER] Error fetching Instagram data for user: ${user.username}`, error);
    return null;
  }
}

const mimeTypesToExtensions: { [key: string]: string } = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/apng": "apng",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

const getFileExtensionFromMimeType = (mimeType: string): string => {
  const extension = mimeTypesToExtensions[mimeType.toLowerCase()];
  if (extension) {
    return extension;
  }
  return ""; // Si no se encuentra, devolver una cadena vacía
};

export const getUserImage = async (user: any) => {
  try {
    const response = await fetch(user.profile_pic_url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.instagram.com/",
      },
    });

    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.status}: ${response.statusText}`);

    const mimeType = response.headers.get("Content-Type") || "image/jpeg";

    const arrayBuffer = await response.arrayBuffer();

    const blob = new Blob([arrayBuffer], { type: mimeType });

    const fileName = `${user.username}.${getFileExtensionFromMimeType(mimeType)}`;
    const file = new File([blob], fileName, { type: mimeType });

    return file;
  } catch (error: any) {
    console.log(`ERROR!!!!!! ${error.message} ${user.profile_pic_url}`);
    return null;
  }
};

const updateUser = async (user: Record<string, any>, users: any[], col: any, match: any[] = [], logProcess = (str: string) => { }) => {

  if (!user || !user.username) {
    throw new Error("Invalid user or missing username");
  }
  try {
    const fol = users.find((item: any) => item.username === user.username);

    logProcess(`UPDATING USER: ${user.username}`);
    logProcess(`USER: ${user.username} DATA: ${JSON.stringify(user)}`);
    logProcess(`FOLLOWER: ${fol ? fol.username : "N/A"} DATA: ${JSON.stringify(fol)}`);

    // Follower doesn't have S3 image stored, proceed
    if ((fol && !fol.hasS3Image) || !fol) {
      if (user.profile_pic_url) {
        logProcess(`USER: ${user.username} DOESN'T HAVE S3 IMAGE`);
        user.instagram_profile_pic_url = user.profile_pic_url;
        const file = await getUserImage(user);

        if (file) {
          await uploadSvc.uploadS3(file, "/imgs/users");
          logProcess(`USER: ${user.username} IMAGE UPLOADED TO S3`);

          user.profile_pic_url = `/imgs/users/${file.name}`;
          user.hasS3Image = true;
        } else {
          logProcess(`USER: ${user.username} IMAGE NOT UPLOADED TO S3`);
          user.hasS3Image = false;
        }
      } else {
        user.extracted = false;
      }
    } else if (fol.hasS3Image && fol.instagram_profile_pic_url !== user.profile_pic_url) {
      const file = await getUserImage(user);
      if (file) {
        try {
          await uploadSvc.deleteS3(fol.profile_pic_url);
        } catch { }
        await uploadSvc.uploadS3(file, "/imgs/users");
        user.profile_pic_url = `/imgs/users/${file.name}`;
        logProcess(`USER: ${user.username} IMAGE UPDATED TO S3`);
      } else {
        fol.hasS3Image = false;
        logProcess(`USER: ${user.username} IMAGE NOT UPDATED TO S3`);
      }
    }

    if (match.length) {
      const matched = match.includes(user.username);
      if (matched) {
        user.followed_back = true;
      }
    }

    await col.updateOne(
      { username: user.username },
      {
        $set: Object.keys(user).reduce((acc: Record<string, any>, key) => {
          acc[key] = user[key];
          acc.unfollow = false;
          return acc;
        }, {}),
      },
      { upsert: true }
    );

    return await col.findOne({ username: user.username });
  } catch (error: any) {
    logProcess(`Failed to update user ${error.message}`);
    throw error;
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
  deleteAccessToken,
  getAccessToken,
  parseAuthToken,
  getConversations,
  getCachedConversations,
  cacheConversations,
  cacheConversation,
  getCachedMessages,
  getNonCachedMessages,
  getMessages,
  getMessage,
  sendMessage,
  fetchInstagramProfileData,
  fetchInstagramProfile,
  getInstagramProfile,
  fetchInstagramData,
  updateUser,
  getPuppeteerEnvironment,
});
