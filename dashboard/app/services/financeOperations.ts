import axios from "./_db";
import { BaseList } from "./_list";
export const Types = {};

export const Options = {};

const fields = {
  titles: {},
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
      ...(await FinanceOperations.getAll(params, true)).items.map(
        (item: Record<string, string>) => ({
          id: item._id,
          value: item.name, 
        })
      ),
    ],
  };
};

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/finance/operations`,
});

export const FinanceOperations = {
  ...BaseList(client),
  fields,
  getOptions,
};
