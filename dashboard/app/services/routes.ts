import axios from "./_db";
import { BaseList } from "./_list";
import { FIELD_TYPES } from "../constants";

export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  path: FIELD_TYPES.TEXT,
};

export const Options = {
  name: {
    language: true,
  },
};

// Fields
const fields = {
  titles: {
    name: "fields.name",
    path: "fields.path",
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
      ...(await Routes.getAll(params, true)).items.map((item: Record<string, string>) => ({
        id: item._id,
        value: item.name,
      })),
    ],
  };
};

export const Routes = {
  ...BaseList(
    axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URI}/routes`,
    })
  ),
  fields,
  getOptions,
};
