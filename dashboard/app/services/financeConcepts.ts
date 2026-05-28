import axios from "./_db";
import { BaseList } from "./_list";
import { FIELD_TYPES } from "../constants";
import { Options as OperationOptions } from "./finances";

export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  type: FIELD_TYPES.SELECT,
};

export const Options = {
  type: OperationOptions.type,
};

const fields = {
  titles: {
    name: "fields.name",
    type: "fields.type",
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
      ...(await FinanceConcepts.getAll(params, true)).items.map((item: Record<string, string>) => ({
        id: item._id,
        value: item.name,
      })),
    ],
  };
};

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/finance-concepts`,
});

export const FinanceConcepts = {
  ...BaseList(client),
  fields,
  getOptions,
};
