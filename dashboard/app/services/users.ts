import axios from 'axios';
import { BaseList } from './_list';
import { FIELD_TYPES } from '../constants';
import { onDelete, onSave } from './_methods';
import { UserProfiles } from './userProfiles';

export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  username: FIELD_TYPES.TEXT,
  password: FIELD_TYPES.PASSWORD,
  profile: FIELD_TYPES.SELECT,
};

export const Options = {};

// Fields
const fields = {
  titles: {
    name: 'fields.name',
    username: 'fields.username',
    password: 'fields.password',
    profile: 'fields.profile',
  },
  types: Types,
  options: Options,
};

// Get fields function
const getFields = async ({
  i18n,
}: Readonly<{ searchParams: any; i18n: any }>) => {
  return {
    ...Users.fields,
    options: {
      ...Users.fields.options,
      profile: {
        ...(await UserProfiles.getOptions({ locale: i18n.locale })),
        value: 'admin',
      },
    },
  };
};

const publicClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/users`,
});

const privateClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/user`,
});

// Get methods
const getMethods = (router?: any) => ({
  onSave: async (data: any, files: any) => onSave(Users, router, data, files),
  onDelete: async (ids: string[]) => onDelete(Users, router, ids),
});

/**
 * Users service
 */
export const Users = {
  ...BaseList(publicClient),
  fields,
  getFields,
  getMethods,
  async create(data: Record<string, any>) {
    return privateClient.post('', data);
  },
};
