import type { AxiosInstance } from 'axios';
import config from '../config';
import type { BaseListItem } from '@/types/list';

export const BaseList = (client: AxiosInstance): BaseListItem => ({
  fields: {},
  getTranslations: (i18n: any, instance) => ({
    locale: i18n.i18n.language,
    uploader: i18n.t('uploader'),
    fields: Object.keys(instance.fields.titles).reduce(
      (acc, key) => ({
        ...acc,
        [key]: i18n.t(instance.fields.titles[key]),
      }),
      {}
    ),
    options: Object.keys(instance.fields.options)
      .filter((field) => instance.fields.options[field]?.options)
      .reduce(
        (options, field) => ({
          ...options,
          [field]: Object.keys(instance.fields.options[field].options).reduce(
            (acc, key) => {
              return {
                ...acc,
                [instance.fields.options[field].options[key].id]: i18n.t(
                  instance.fields.options[field].options[key].value
                ),
              };
            },
            {}
          ),
        }),
        {}
      ),
  }),
  getAll: async (
    query: string = '',
    limit: number = config.table.limit,
    cursor: number = 0
  ) => {
    const params: any = {
      limit,
      cursor,
    };

    if (query) {
      params.query = query;
    }

    const response = await client.get('', { params });

    return response.data;
  },
  parseAll: (data: any[]) => data,
  put: async (id: string, data: any) => {
    const response = await client.put(id, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
});
