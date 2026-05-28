import axios from "./_db";
import { BaseList } from "./_list";

const fields = {};

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/finances`,
});

export const Options = {
  type: {
    options: [
      { id: "operational", value: "operations.types.operational" },
      { id: "core", value: "operations.types.core" },
    ],
    value: "operational",
  },
};

export const Finances = {
  ...BaseList(client),
  fields,
};
