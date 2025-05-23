import axios from 'axios';
import { GET } from './_api';
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';
const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/user-profiles`,
});

export const UserProfiles = {
  getAll: async (params: Record<string, any> | null = null) => {
    if (!isBuild) {
      const response = await GET(client, '', params);
      return response.data;
    } else {
      return { items: [], total: 0, pages: 0 };
    }
  },
  getOptions: async (params: Record<string, any> | null = null) => {
    return {
      options: ((await UserProfiles.getAll(params?.query))?.items || []).map(
        (item: Record<string, string>) => ({
          id: item.type,
          value: item.type,
        })
      ),
    };
  },
  getTranslations: (i18n: any) => {
    return {
      admin: i18n.t('userProfiles.admin'),
      user: i18n.t('userProfiles.user'),
    };
  },
};
