import axios from "./_db";
import { BaseList } from "./_list";
import { FIELD_TYPES, HTTP_STATUS_CODES, RENDER_TYPES } from "../constants";
import { onDelete, onSave } from "./_methods";
import { getFormData, s3File } from "../utils";
import { POST } from "./_api";
import type { ConfigType } from "@/types/config";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/config`,
});

export const Types: Record<string, string> = {
  _id: FIELD_TYPES.HIDDEN,
  name: FIELD_TYPES.TEXT,
  description: FIELD_TYPES.TEXTAREA,
  keywords: FIELD_TYPES.TEXTAREA,
  robots: FIELD_TYPES.SELECT,
  from: FIELD_TYPES.DATE_HOUR_LABEL,
  created: FIELD_TYPES.HIDDEN_DATE,
  default: FIELD_TYPES.HIDDEN_BOOLEAN,
  headerImage: FIELD_TYPES.IMAGE_UPLOADER,
  headerImageMobile: FIELD_TYPES.IMAGE_UPLOADER,
  headerVideo: FIELD_TYPES.VIDEO_UPLOADER,
  headerVideoMobile: FIELD_TYPES.VIDEO_UPLOADER,
  spotifyId: FIELD_TYPES.TEXT,
};

export const Options: Record<string, any> = {
  headerImage: { path: "/imgs/header" },
  headerImageMobile: { path: "/imgs/header" },
  headerVideo: { path: "/video/header" },
  headerVideoMobile: { path: "/video/header" },
  description: {
    maxLength: 160,
    language: true,
  },
  keywords: {
    language: true,
  },
  robots: {
    options: [
      {
        id: "index, follow",
        value: "robots.indexFollow",
      },
      {
        id: "noindex, follow",
        value: "robots.noIndexFollow",
      },
      {
        id: "index, nofollow",
        value: "robots.indexNoFollow",
      },
      {
        id: "noindex, nofollow",
        value: "robots.noIndexNoFollow",
      },
    ],
  },
};

export const Groups: Record<string, string[]> = {
  metadata: ["_id", "name", "description", "keywords", "robots", "from"],
  header: ["headerImage", "headerImageMobile", "headerVideo", "headerVideoMobile", "spotifyId"],
};

// Fields
const fields = {
  titles: {
    name: "fields.name",
    description: "fields.description",
    keywords: "fields.keywords",
    robots: "fields.robots",
    from: "fields.from",
    headerImage: "fields.headerImage",
    headerImageMobile: "fields.headerImageMobile",
    headerVideo: "fields.headerVideo",
    headerVideoMobile: "fields.headerVideoMobile",
    spotifyId: "fields.spotifyId",
    groups: {
      metadata: "groups.metadata",
      header: "groups.header",
    },
    panel: {
      title: "panels.config",
    },
  },
  types: Types,
  options: Options,
  groups: Groups,
};

let options: Record<string, any>[] = [];

// Get options
const getOptions = async (params: any = {}) => {
  params.limit = 10000;
  return {
    options: [
      ...options,
      ...(await Config.getAll(params, true)).items.map((item: Record<string, string>) => ({
        id: item._id,
        value: item.name,
      })),
    ],
  };
};

const getMetadata = async (i18n: any) => {
  const metadata = await Config.getAll({ limit: 1, sort: "from" });

  const metadataItems =
    metadata?.items instanceof Array && metadata.items.length > 0
      ? Object.keys(metadata.items[0])
      : [];
  return parseMetadata(
    metadataItems.reduce((cfg: Record<string, any>, key: string) => {
      if (Options?.[key]?.language) {
        cfg[key] = i18n.t(metadata.items[0][key][i18n.locale]);
      } else {
        cfg[key] = metadata.items[0][key];
      }
      return cfg;
    }, {})
  );
};

const getMethods = (router?: any): Record<string, any> => ({
  onSave: (data: any, files: any) => onSave(client, router, data, files),
  onDelete: (ids: string[]) => onDelete(client, router, ids),
  onCopy: async (data: any) => {
    if (data.name) {
      data.name = `Copia de ${data.name}`;
    }

    delete data._id;
    data.default = false;

    const formData = getFormData(data);
    const response = await POST(client, formData);
    router.refresh();

    setTimeout(() => {
      router.refresh();
    }, 0);
    return response.status === HTTP_STATUS_CODES.OK ? response.data : false;
  },
});

const getRenders = (): Record<string, Function> => ({
  default: (field: any, item: any, base: any) => {
    return {
      type: RENDER_TYPES.BOOLEAN,
      value: item,
    };
  },
});

const faviconMetadata = {
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicons/favicon.ico" },
      { url: "/favicons/favicon.svg", type: "image/svg+xml" },
      { url: "/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicons/favicon-96x96.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-96x96.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "57x57" },
      { url: "/favicons/apple-touch-icon.png", sizes: "60x60" },
      { url: "/favicons/apple-touch-icon.png", sizes: "72x72" },
      { url: "/favicons/apple-touch-icon.png", sizes: "76x76" },
      { url: "/favicons/apple-touch-icon.png", sizes: "114x114" },
      { url: "/favicons/apple-touch-icon.png", sizes: "120x120" },
      { url: "/favicons/apple-touch-icon.png", sizes: "144x144" },
      { url: "/favicons/apple-touch-icon.png", sizes: "152x152" },
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicons/safari-pinned-tab.svg",
        color: "#5bbad5", // Safari pinned tabs
      },
    ],
  },
};

const parseMetadata = (metadata: Record<string, any>) => {
  const obj: Record<string, any> = {
    title: "Sweet Q",
    description: metadata.description,
    keywords: metadata.keywords,
    robots: (metadata.robots || "index, follow")
      .split(", ")
      .reduce((acc: Record<string, boolean>, value: string) => {
        acc[value] = true;
        return acc;
      }, {}),
    alternates: {
      canonical: process.env.NEXT_PUBLIC_URL,
    },
    ...faviconMetadata,
  };

  return obj;
};

// Parse all method
const parseAll = (data: ConfigType[] = []) =>
  data.map((item: any) => {
    return {
      ...item,
      headerImage: s3File(`${Config.fields.options.headerImage.path}/${item.headerImage}`),
      headerImageMobile: s3File(
        `${Config.fields.options.headerImageMobile.path}/${item.headerImageMobile}`
      ),
      headerVideo: s3File(`${Config.fields.options.headerVideo.path}/${item.headerVideo}`),
      headerVideoMobile: s3File(
        `${Config.fields.options.headerVideoMobile.path}/${item.headerVideoMobile}`
      ),
    };
  });

export const Config = {
  ...BaseList(client),
  fields,
  faviconMetadata,
  getRenders,
  getOptions,
  getMetadata,
  getMethods,
  parseAll,
};
