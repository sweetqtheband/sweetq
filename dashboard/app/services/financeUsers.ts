import axios from "./_db";
import { BaseList } from "./_list";
import { FIELD_TYPES, RENDER_TYPES } from "../constants";

export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  userId: FIELD_TYPES.HIDDEN,
  percentage: FIELD_TYPES.NUMBER,
  ordering: FIELD_TYPES.HIDDEN,
  memberType: FIELD_TYPES.SELECT,
};

export const Options = {
  percentage: {
    min: 0,
    max: 100,
    step: 5,
    allowEmpty: true,
  },
  memberType: {
    options: [
      { value: "core", label: "Core Member" },
      { value: "operative", label: "Operative Member" },
    ],
  },
};

export const Messages = {
  percentage: {
    invalidText: "invalidMessages.percentage",
  },
};
const fields = {
  titles: {
    name: "fields.name",
    userId: "fields.userId",
    percentage: "fields.percentage",
    ordering: "fields.ordering",
    memberType: "fields.memberType",
  },
  types: Types,
  options: Options,
  messages: Messages,
};

let options: Record<string, any>[] = [];

// Get options
const getOptions = async (params: any = {}) => {
  params.limit = 10000;
  return {
    options: [
      ...options,
      ...(await FinanceUsers.getAll(params, true)).items.map((item: Record<string, string>) => ({
        id: item._id,
        value: item.name,
      })),
    ],
  };
};

const getRenders = (): Record<string, Function> => ({
  percentage: (field: any, item: any, base: any) => {
    return {
      type: RENDER_TYPES.PERCENTAGE,
      value: item,
    };
  },
});

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/finance/users`,
});

export const FinanceUsers = {
  ...BaseList(client),
  fields,
  getOptions,
  getRenders,
};
