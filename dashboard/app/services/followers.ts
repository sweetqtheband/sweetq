import axios from 'axios';
import { BaseList } from './_list';
import { FIELD_DEFAULTS, FIELD_TYPES, TREATMENTS } from '../constants';
import { Countries } from './countries';
import { States } from './states';
import { Cities } from './cities';
import { onDelete, onSave } from './_methods';
import { Tags } from './tags';
import { ReactNode } from 'react';

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
      country: await Countries.getOptions({ locale: i18n.locale }),
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
            query: searchParams?.['filters[tags]']
              ? { tags: searchParams['filters[tags]'] }
              : null,
          }),
        },
      },
      type: FIELD_TYPES.MULTISELECT,
    },
  };
};

// Get methods function
const getMethods = (router?: any): Record<string, any> => ({
  onSave: async (data: any, files: any) => {
    if (!data.country) {
      data.country = FIELD_DEFAULTS.COUNTRY;
    }
    return onSave(Followers, router, data, files);
  },
  tags: {
    onSave: Tags.getMethods(router).onListSave,
  },
});
const getRenders = (): Record<string, Function> => ({
  tags: Tags.getRenders().items,
});

// Followers service
export const Followers = {
  ...BaseList(
    axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URI}/followers`,
    })
  ),
  fields,
  getRenders,
  getFilters,
  getFields,
  getMethods,
};
