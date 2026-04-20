import axios from "./_db";
import { BaseList } from "./_list";
import { FIELD_TYPES } from "../constants";
import { s3File } from "../utils";

export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  logo: FIELD_TYPES.IMAGE_UPLOADER,
  link: FIELD_TYPES.TEXT,
  ordering: FIELD_TYPES.HIDDEN,
  published: FIELD_TYPES.BOOLEAN,
};

export const Options = {
  logo: { path: "/imgs/logos" },
  ordering: {
    value: 0,
  },
};

// Fields
const fields = {
  titles: {
    name: "fields.name",
    logo: "fields.logo",
    link: "fields.link",
    published: "fields.published",
    ordering: "fields.ordering",
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
      ...(await SocialNetworks.getAll(params, true)).items.map((item: Record<string, string>) => ({
        id: item._id,
        value: item.name,
      })),
    ],
  };
};

export const getList = async (params: any = {}) => {
  const list = await SocialNetworks.getAll(params);
  return parseFront(list?.items || []);
};

const parseFront = (items: any) => {
  return items.map((item: Record<string, any>) => ({
    ...item,
    logo: item.logo ? s3File(`${Options.logo.path}/${item.logo}`) : null,
  }));
};

export const SocialNetworks = {
  ...BaseList(
    axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URI}/social-networks`,
    })
  ),
  fields,
  getOptions,
  getList,
};
