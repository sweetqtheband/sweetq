import axios from "./_db";
import { BaseList } from "./_list";
import { FIELD_TYPES } from "../constants";

export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  concept: FIELD_TYPES.TEXT,
  amount: FIELD_TYPES.NUMBER,
  source: FIELD_TYPES.TEXT,
  description: FIELD_TYPES.TEXT,
  valueDate: FIELD_TYPES.DATE,
  receivedAt: FIELD_TYPES.DATE,
};

export const Options = {
  amount: {
    min: 0,
    allowEmpty: false,
  },
};

const fields = {
  titles: {
    name: "fields.name",
    concept: "fields.concept",
    amount: "fields.amount",
    source: "fields.source",
    description: "fields.description",
    valueDate: "fields.valueDate",
    receivedAt: "fields.receivedAt",
  },
  types: Types,
  options: Options,
};

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/finance/incomes`,
});

export const Incomes = {
  ...BaseList(client),
  fields,
};
