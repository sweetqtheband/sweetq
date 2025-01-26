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
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
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
});
