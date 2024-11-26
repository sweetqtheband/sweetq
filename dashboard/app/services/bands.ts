import axios from 'axios';
import { BaseList } from './_list';
import { FIELD_TYPES } from '../constants';
import { onDelete, onSave } from './_methods';

export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  facebook: FIELD_TYPES.TEXT,
  instagram: FIELD_TYPES.TEXT,
};

export const Options = {};

// Fields
const fields = {
  titles: {
    name: 'fields.name',
    facebook: 'fields.social.facebook',
    instagram: 'fields.social.instagram',
  },
  types: Types,
  options: Options,
};

let options: Record<string, any>[] = [];

// Get options
const getOptions = async (params: any = null) => {
  return {
    options: [
      ...options,
      ...(await Bands.getAll(params)).items.map(
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
    onSave(Bands, router, { name: value }, {}),
  onSave: async (data: any, files: any) => onSave(Bands, router, data, files),
  onDelete: async (ids: string[]) => onDelete(Bands, router, ids),
});

export const Bands = {
  ...BaseList(
    axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URI}/bands`,
    })
  ),
  fields,
  getOptions,
  getMethods,
};
