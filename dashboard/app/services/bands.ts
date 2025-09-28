import axios from "./_db";
import { BaseList } from "./_list";
import { FIELD_TYPES } from "../constants";
import { onDelete, onSave, onCopy } from "./_methods";

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
    name: "fields.name",
    facebook: "fields.social.facebook",
    instagram: "fields.social.instagram",
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
      ...((await Bands.getAll(params, true))?.items || []).map((item: Record<string, string>) => ({
        id: item._id,
        value: item.name,
      })),
    ],
  };
};

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/bands`,
});

export const Bands = {
  ...BaseList(client),
  fields,
  getOptions,
};
