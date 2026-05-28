import axios from "./_db";
import { BaseList } from "./_list";
import { FIELD_TYPES } from "../constants";
import { Options as OperationOptions } from "./finances";
export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  type: FIELD_TYPES.SELECT,
  concept: FIELD_TYPES.TEXT,
  totalAmount: FIELD_TYPES.NUMBER,
  percentageToCharge: FIELD_TYPES.NUMBER,
  amountToCharge: FIELD_TYPES.HIDDEN,
  description: FIELD_TYPES.TEXT,
  valueDate: FIELD_TYPES.DATE,
  status: FIELD_TYPES.HIDDEN,
  createdBy: FIELD_TYPES.HIDDEN,
};

export const Options = {
  type: OperationOptions.type,

  totalAmount: {
    min: 0,
    allowEmpty: false,
  },
  percentageToCharge: {
    min: 0,
    max: 100,
    step: 5,
    allowEmpty: false,
  },
};

const fields = {
  titles: {
    name: "fields.name",
    type: "fields.type",
    concept: "fields.concept",
    totalAmount: "fields.totalAmount",
    percentageToCharge: "fields.percentageToCharge",
    amountToCharge: "fields.amountToCharge",
    description: "fields.description",
    valueDate: "fields.valueDate",
    status: "fields.status",
    createdBy: "fields.createdBy",
  },
  types: Types,
  options: Options,
};

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/finance/expenses`,
});

export const Expenses = {
  ...BaseList(client),
  fields,
};
