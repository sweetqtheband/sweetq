import axios from 'axios';
import { BaseList } from './_list';
import {
  FIELD_DEFAULTS,
  FIELD_TYPES,
  RENDER_TYPES,
  TREATMENTS,
} from '../constants';
import { Countries } from './countries';
import { States } from './states';
import { Cities } from './cities';
import { onSave } from './_methods';
import { Tags } from './tags';
import { SendAlt } from '@carbon/react/icons';
import { InstagramMessages } from './instagramMessages';
import { instagram } from './instagram';

export const Types = {
  id: FIELD_TYPES.HIDDEN,
  updated: FIELD_TYPES.HIDDEN,
  created: FIELD_TYPES.HIDDEN,
  is_private: FIELD_TYPES.HIDDEN,
  is_verified: FIELD_TYPES.HIDDEN,
  profile_pic_url: FIELD_TYPES.IMAGE,
  requested_by_viewer: FIELD_TYPES.HIDDEN,
  username: FIELD_TYPES.LABEL,
  full_name: FIELD_TYPES.LABEL,
  short_name: FIELD_TYPES.TEXT,
  country: FIELD_TYPES.NONE,
  state: FIELD_TYPES.NONE,
  city: FIELD_TYPES.CITY,
  treatment: FIELD_TYPES.SELECT,
  tags: FIELD_TYPES.MULTISELECT,
};

export const Options = {
  treatment: {
    options: TREATMENTS.map((treatment: string, index: number) => ({
      id: index + 1,
      value: treatment,
    })),
  },
};

// Fields
const fields = {
  titles: {
    id: 'fields.id',
    username: 'fields.username',
    short_name: 'fields.shortName',
    full_name: 'fields.fullName',
    profile_pic_url: 'fields.profileImage',
    country: 'fields.country',
    state: 'fields.state',
    city: 'fields.city',
    treatment: 'fields.treatment',
    tags: 'fields.tags',
  },
  types: Types,
  options: Options,
};

// Get fields function
const getFields = async ({
  searchParams,
  i18n,
}: Readonly<{ searchParams: any; i18n: any }>) => {
  if (!searchParams?.['panel.country']) {
    searchParams['panel.country'] = FIELD_DEFAULTS.COUNTRY;
  }

  return {
    ...Followers.fields,
    options: {
      ...Followers.fields.options,
      country: {
        ...(await Countries.getOptions({ locale: i18n.locale })),
        value: FIELD_DEFAULTS.COUNTRY,
      },
      state: await States.getOptions({
        locale: i18n.locale,
        query: searchParams?.['panel.country']
          ? { country_id: searchParams['panel.country'] }
          : null,
      }),
      city: await Cities.getOptions({
        locale: i18n.locale,
        query: searchParams?.['panel.state']
          ? { state_id: searchParams['panel.state'] }
          : null,
      }),
      treatment: {
        options: Followers.fields.options.treatment.options.map((option) => ({
          ...option,
          value: i18n.t(option.value),
        })),
      },
      tags: {
        ...(await Tags.getOptions()),
      },
    },
    search: {
      country: {
        deletes: ['state', 'city'],
      },
      state: {
        deletes: ['city'],
      },
      city: {}, // No deletes
    },
  };
};

// Get filters function
const getFilters = async ({
  searchParams,
  i18n,
}: Readonly<{ searchParams: any; i18n: any }>) => {
  return {
    treatment: {
      translations: {
        fields: {
          treatment: i18n.t('fields.treatment'),
        },
        options: {
          treatment: Followers.fields.options.treatment.options.reduce(
            (acc, option) => ({
              ...acc,
              [option.id]: i18n.t(option.value),
            }),
            {}
          ),
        },
      },
      fields: {
        options: {
          treatment: {
            options: Followers.fields.options.treatment.options,
          },
        },
      },
      type: FIELD_TYPES.CHECKBOX,
    },
    country: {
      translations: {
        fields: {
          country: i18n.t('fields.country'),
        },
      },
      fields: {
        options: {
          country: await Countries.getOptions({ locale: i18n.locale }),
        },
      },
      type: FIELD_TYPES.FILTER_COUNTRY,
    },
    state: {
      translations: {
        fields: {
          state: i18n.t('fields.state'),
        },
      },
      fields: {
        options: {
          state: await States.getOptions({
            locale: i18n.locale,
            query: searchParams?.['filters[country]']
              ? { country_id: searchParams['filters[country]'] }
              : null,
          }),
        },
      },
      type: FIELD_TYPES.FILTER_STATE,
    },
    city: {
      translations: {
        fields: {
          city: i18n.t('fields.city'),
        },
      },
      fields: {
        options: {
          city: await Cities.getOptions({
            locale: i18n.locale,
            query: searchParams?.['filters[state]']
              ? { state_id: searchParams['filters[state]'] }
              : null,
          }),
        },
      },
      type: FIELD_TYPES.FILTER_CITY,
    },
    show: {
      translations: {
        fields: {
          show: i18n.t('filters.show.label'),
        },
      },
      fields: {
        options: {
          show: {
            options: [
              { id: '0', value: i18n.t('filters.show.following') },
              { id: '1', value: i18n.t('filters.show.notFollowing') },
              { id: '2', value: i18n.t('filters.show.all') },
            ],
          },
        },
      },
      value: '0',
      type: FIELD_TYPES.SELECT,
    },
    tags: {
      translations: {
        fields: {
          tags: i18n.t('fields.tags'),
        },
      },
      fields: {
        options: {
          tags: await Tags.getOptions({
            locale: i18n.locale,
            filters: searchParams?.['filters[tags]']
              ? { tags: searchParams['filters[tags]'] }
              : null,
          }),
        },
      },
      type: FIELD_TYPES.MULTISELECT,
    },
    withoutTags: {
      translations: {
        fields: {
          withoutTags: i18n.t('filters.withoutTags'),
        },
      },
      fields: {
        options: {
          withoutTags: await Tags.getOptions({
            locale: i18n.locale,
            filters: searchParams?.['filters[withoutTags]']
              ? { tags: searchParams['filters[withoutTags]'] }
              : null,
          }),
        },
      },
      type: FIELD_TYPES.MULTISELECT,
    },
  };
};

// Get methods function
const getMethods = (router?: any, translations?: any): Record<string, any> => ({
  onSave: async (data: any, files: any) => {
    if (!data.country) {
      data.country = FIELD_DEFAULTS.COUNTRY;
    }

    if (data.tags && data.tags instanceof Array && data.tags.length === 0) {
      data.tags = null;
    }
    return onSave(Followers, router, data, files);
  },
  tags: {
    onSave: Tags.getMethods(router).onListSave,
  },
  onMessageSave: async (data: any) => {
    if (!data.layoutId) {
      delete data.layoutId;
    }
    return onSave(InstagramMessages, router, data, []);
  },
  onSendInstagramMessage: async (data: any) => {
    return instagram.sendMessage(data);
  },
  action: {
    onClick: async (data: any, setItem: Function) => {
      setItem(data);
    },
    check: (data: any) => data?.instagram_id,
    icon: RENDER_TYPES.INSTAGRAM_MESSAGE,
    label: translations?.openChat,
  },
});
const getRenders = (): Record<string, Function> => ({
  username: (field: any, item: any, base: any) => {
    return {
      type: RENDER_TYPES.LINK,
      value: item,
      href: `https://instagram.com/${item}`,
    };
  },
  tags: Tags.getRenders().items,
  pending_messages: (field: any, item: any, base: any) => {
    return {
      type: RENDER_TYPES.STATUS_MESSAGE,
      value: item,
    };
  },
});

const getBatchActions = (setIds: Function, translations: any) => {
  return {
    message: {
      translations: {
        title: translations.sendMessage,
      },
      icon: SendAlt,
      onClick: (selectedRows: string[]) =>
        openMessagePanel(selectedRows, setIds),
    },
  };
};

// Followers service
export const Followers = {
  ...BaseList(
    axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URI}/followers`,
    })
  ),
  fields,
  getBatchActions,
  getRenders,
  getFilters,
  getFields,
  getMethods,
};

// ACTIONS

const openMessagePanel = async (selectedRows: string[], setIds: Function) => {
  setIds(selectedRows);
};
