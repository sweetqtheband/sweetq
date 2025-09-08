import axios from "./_db";
import { BaseList } from "./_list";
import type { New } from "@/types/new";
import { FIELD_TYPES } from "../constants";
import { s3File } from "../utils";

export const Types = {
  _id: FIELD_TYPES.HIDDEN,
  title: FIELD_TYPES.TEXT,
  subtitle: FIELD_TYPES.TEXT,
  type: FIELD_TYPES.SELECT,
  text: FIELD_TYPES.TEXTAREA,
  image: FIELD_TYPES.IMAGE_UPLOADER,
  button: FIELD_TYPES.CHECKBOX,
  buttonText: FIELD_TYPES.TEXT,
  link: FIELD_TYPES.TEXT,
  linkType: FIELD_TYPES.SELECT,
};

export const Options = {
  image: { path: "/imgs/news" },
  type: {
    options: [
      {
        id: "news",
        value: "news.types.news",
      },
      {
        id: "release",
        value: "news.types.release",
      },
      {
        id: "gig",
        value: "news.types.gig",
      },
    ],
  },
  linkType: {
    options: [
      {
        id: "link",
        value: "fields.link",
      },
      {
        id: "youtube",
        value: "fields.social.youtube",
      },
      {
        id: "spotify",
        value: "fields.social.spotify",
      },
    ],
  },
};

// Fields
const fields = {
  titles: {
    title: "fields.title",
    subtitle: "fields.subtitle",
    type: "fields.type",
    text: "fields.text",
    image: "fields.image",
    button: "fields.button",
    buttonText: "fields.buttonText",
    href: "fields.href",
    linkType: "fields.linkType",
  },
  types: Types,
  options: Options,
};

// Parse all method
const parseAll = (data: New[] = []) =>
  data.map((item: any) => {
    return {
      ...item,
      thumbnail: item.image ? s3File(`${News.fields.options.image.path}/${item.image}`) : undefined,
    };
  });

export const News = {
  ...BaseList(
    axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URI}/news`,
    })
  ),
  fields,
  parseAll,
};
