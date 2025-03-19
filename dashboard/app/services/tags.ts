import axios from 'axios';
import { BaseList } from './_list';
import { FIELD_TYPES, RENDER_TYPES } from '../constants';
import { onDelete, onSave } from './_methods';

export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  color: FIELD_TYPES.SELECT,
};

const colors = [
  'red',
  'magenta',
  'purple',
  'blue',
  'cyan',
  'teal',
  'green',
  'gray',
  'cool-gray',
  'warm-gray',
  'high-contrast',
  'outline',
];

export const Options = {
  color: {
    options: colors.map((color: string) => ({
      id: color,
      value: `colors.${color}`,
    })),
  },
};

// Fields
const fields = {
  titles: {
    name: 'fields.name',
    color: 'fields.color',
  },
  types: Types,
  options: Options,
};

let options: Record<string, any>[] = [];

// Get options
const getOptions = async (params: any = {}) => {
  params.limit = 10000;
  const options = (await Tags.getAll(params, true)).items.map(
    (item: Record<string, string>) => ({
      id: item._id,
      value: item.name,
    })
  );

  return {
    options,
  };
};

// Get methods
const getMethods = (router?: any) => ({
  onListSave: async (value: string) =>
    onSave(Tags, router, { name: value }, {}),
  onSave: async (data: any, files: any) => onSave(Tags, router, data, files),
  onDelete: async (ids: string[]) => onDelete(Tags, router, ids),
});

// Get item render
const itemRender = (field: string, id: any, base: any) => {
  let value = id;
  let color = null;
  if (base?.relations[field]) {
    const item = base.relations[field].find(
      (item: Record<string, any>) => item._id === id
    );
    if (item) {
      value = item.name;
      color = item.color;
    }
  }

  return { type: RENDER_TYPES.TAG, value, color };
};

// Get items render
const itemsRender = (field: string, items: any, base: any): any => {
  if (items instanceof Array) {
    return items.map((item) => itemRender(field, item, base));
  } else {
    return itemRender(field, items, base);
  }
};

const getRenders = () => ({
  item: (field: string, item: any, base: any) => itemRender(field, item, base),
  items: (field: string, items: any, base: any) =>
    itemsRender(field, items, base),
  color: {
    itemToString: (field: string, item: any) => {
      return {
        type: RENDER_TYPES.COLOR,
        value: item.text,
        color: item.id,
      };
    },
    render: (field: string, item: any, base: any) => {
      return {
        type: RENDER_TYPES.TAG,
        value: item,
        color: base.color,
      };
    },
  },
});

export const Tags = {
  ...BaseList(
    axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URI}/tags`,
    })
  ),
  fields,
  getRenders,
  getOptions,
  getMethods,
};
