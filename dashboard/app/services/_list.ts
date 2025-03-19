import type { AxiosInstance } from 'axios';
import type { BaseListItem } from '@/types/list';
import { POST, PUT, DELETE, getAll } from './_api';
import { getTranslations, getActionsTranslations } from './_i18n';
import { getMethods } from './_methods';

export const BaseList = (
  client: AxiosInstance,
  cache: boolean = false
): BaseListItem => ({
  fields: {},
  getTranslations,
  getAll: (searchParams: any, cache: boolean = false) =>
    getAll(client, searchParams, cache),
  parseAll: (data: any[] = []) => data,
  getFields: async () => ({}),
  getFilters: async () => ({}),
  getRenders: () => ({}),
  getOptions: async () => ({ options: [] }),
  getMethods: (router) => getMethods(client, router),
  getActions: async () => ({}),
  getBatchActions: async () => ({}),
  post: (data) => POST(client, data),
  put: (id, data) => PUT(client, id, data),
  delete: (id: string | string[]) => DELETE(client, id),
});

export { getActionsTranslations };
