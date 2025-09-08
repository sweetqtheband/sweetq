import axios from "./_db";
import { BaseList } from "./_list";
import { FIELD_TYPES } from "../constants";
import { onDelete, onSave } from "./_methods";

export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  type: FIELD_TYPES.HIDDEN,
  personalMessage: FIELD_TYPES.CONTENTAREA,
  collectiveMessage: FIELD_TYPES.CONTENTAREA,
};

export const Options = {};

// Fields
const fields = {
  titles: {
    name: "fields.name",
    type: "fields.type",
    personalMessage: "pages.instagram.panel.personalMessage",
    collectiveMessage: "pages.instagram.panel.collectiveMessage",
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
      ...(await Layouts.getAll(params, true)).items.map((item: Record<string, string>) => ({
        id: item._id,
        value: item.name,
      })),
    ],
  };
};

// Get methods
const getMethods = (router?: any) => ({
  onListSave: async (value: string) => onSave(Layouts, router, { name: value }, {}),
  onSave: async (data: any, files: any) => onSave(Layouts, router, data, files),
  onDelete: async (ids: string[]) => onDelete(Layouts, router, ids),
});

// Parse all method
const parseAll = (data: any[] = []) =>
  data.map((item: any) => {
    return {
      ...item,
      personalMessage: item.tpl.personalMessage,
      collectiveMessage: item.tpl.collectiveMessage,
    };
  });

export const Layouts = {
  ...BaseList(
    axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URI}/layouts`,
    })
  ),
  fields,
  getOptions,
  getMethods,
  parseAll,
};
