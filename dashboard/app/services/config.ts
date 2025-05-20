import axios from 'axios';
import { BaseList } from './_list';
import { FIELD_TYPES } from '../constants';
import { onDelete, onSave } from './_methods';

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/config`,
});

export const Types: Record<string, string> = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  description: FIELD_TYPES.TEXTAREA,
  keywords: FIELD_TYPES.TEXTAREA,
  robots: FIELD_TYPES.SELECT,
  from: FIELD_TYPES.DATE_LABEL,
  created: FIELD_TYPES.HIDDEN,
  default: FIELD_TYPES.HIDDEN,
};

export const Options: Record<string, any> = {
  description: {
    maxLength: 160,
    language: true,
  },
  keywords: {
    language: true,
  },
  robots: {
    options: [
      {
        id: 'index, follow',
        value: 'robots.indexFollow',
      },
      {
        id: 'noindex, follow',
        value: 'robots.noIndexFollow',
      },
      {
        id: 'index, nofollow',
        value: 'robots.indexNoFollow',
      },
      {
        id: 'noindex, nofollow',
        value: 'robots.noIndexNoFollow',
      },
    ],
  },
};

// Fields
const fields = {
  titles: {
    name: 'fields.name',
    description: 'fields.description',
    keywords: 'fields.keywords',
    robots: 'fields.robots',
    from: 'fields.from',
  },
  types: Types,
  options: Options,
};

let options: Record<string, any>[] = [];

// Get options
const getOptions = async (params: any = {}) => {
  params.limit = 10000;
  return {
    options: [
      ...options,
      ...(await Config.getAll(params, true)).items.map(
        (item: Record<string, string>) => ({
          id: item._id,
          value: item.name,
        })
      ),
    ],
  };
};

// Get methods
const getMethods = (router?: any) => ({
  onListSave: async (value: string) =>
    onSave(Config, router, { name: value }, {}),
  onSave: async (data: any, files: any) => onSave(Config, router, data, files),
  onDelete: async (ids: string[]) => onDelete(Config, router, ids),
});

const getMetadata = async (i18n: any) => {
  const metadata = await Config.getAll({ limit: 1, sort: 'from' });
  return metadata?.items.length
    ? parseMetadata(
        Object.keys(metadata.items[0]).reduce(
          (cfg: Record<string, any>, key: string) => {
            if (Options?.[key]?.language) {
              cfg[key] = i18n.t(metadata.items[0][key][i18n.locale]);
            } else {
              cfg[key] = metadata.items[0][key];
            }
            return cfg;
          },
          {}
        )
      )
    : {};
};

const parseMetadata = (metadata: Record<string, any>) => {
  const obj: Record<string, any> = {
    title: 'Sweet Q',
    description: metadata.description,
    keywords: metadata.keywords,
    robots: (metadata.robots || 'index, follow')
      .split(', ')
      .reduce((acc: Record<string, boolean>, value: string) => {
        acc[value] = true;
        return acc;
      }, {}),
    alternates: {
      canonical: process.env.NEXT_PUBLIC_URL,
    },
    icons: {
      icon: '/favicons/favicon.ico',
      apple: [
        { url: '/favicons/apple-icon-57x57.png', sizes: '57x57' },
        { url: '/favicons/apple-icon-60x60.png', sizes: '60x60' },
        { url: '/favicons/apple-icon-72x72.png', sizes: '72x72' },
        { url: '/favicons/apple-icon-76x76.png', sizes: '76x76' },
        { url: '/favicons/apple-icon-114x114.png', sizes: '114x114' },
        { url: '/favicons/apple-icon-120x120.png', sizes: '120x120' },
        { url: '/favicons/apple-icon-144x144.png', sizes: '144x144' },
        { url: '/favicons/apple-icon-152x152.png', sizes: '152x152' },
        { url: '/favicons/apple-icon-180x180.png', sizes: '180x180' },
      ],
      other: [
        {
          rel: 'icon',
          url: '/favicons/android-icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          rel: 'icon',
          url: '/favicons/favicon-32x32.png',
          sizes: '32x32',
          type: 'image/png',
        },
        {
          rel: 'icon',
          url: '/favicons/favicon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
        },
        {
          rel: 'icon',
          url: '/favicons/favicon-16x16.png',
          sizes: '16x16',
          type: 'image/png',
        },
      ],
    },
  };

  return obj;
};

export const Config = {
  ...BaseList(client),
  fields,
  getOptions,
  getMethods,
  getMetadata,
};
