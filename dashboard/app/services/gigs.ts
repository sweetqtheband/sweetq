import axios from "./_db";
import { BaseList } from "./_list";
import { FIELD_DEFAULTS, FIELD_TYPES } from "../constants";
import { Gig } from "@/types/gig";
import { dateFormat } from "../utils";
import { Countries } from "./countries";
import { States } from "./states";
import { Cities } from "./cities";
import { Bands } from "./bands";
import { onDelete, onSave } from "./_methods";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/gigs`,
});

export const Types = {
  id: FIELD_TYPES.HIDDEN,
  date: FIELD_TYPES.DATE,
  country: FIELD_TYPES.NONE,
  state: FIELD_TYPES.NONE,
  city: FIELD_TYPES.CITY,
  hour: FIELD_TYPES.HOUR,
  title: FIELD_TYPES.TEXT,
  venue: FIELD_TYPES.TEXT,
  map: FIELD_TYPES.TEXTMAP,
  bands: FIELD_TYPES.MULTISELECT,
  event: FIELD_TYPES.TEXT,
  tickets: FIELD_TYPES.TEXT,
  status: FIELD_TYPES.SELECT,
};

export const Options = {
  status: {
    options: [
      {
        id: "published",
        value: "status.published",
      },
      {
        id: "unpublished",
        value: "status.unpublished",
      },
    ],
  },
};

// Fields
const fields = {
  titles: {
    id: "fields.id",
    date: "fields.date",
    city: "fields.city",
    hour: "fields.hour",
    title: "fields.title",
    venue: "fields.venue",
    map: "fields.map",
    bands: "fields.bands",
    event: "fields.event",
    tickets: "fields.tickets",
    status: "fields.status",
    country: "fields.country",
    state: "fields.state",
  },
  types: Types,
  options: Options,
};

// Parse all function
const parseAll = async (data: Gig[] = [], i18n: any) => {
  return data.map((item: any) => {
    return {
      ...item,
      datehour: `${dateFormat(new Date(item.date), "short.date", i18n)} ${item.hour ?? ""}`,
    };
  });
};

// Get fields function
const getFields = async ({ searchParams, i18n }: Readonly<{ searchParams: any; i18n: any }>) => {
  try {
    if (!searchParams?.["panel.country"]) {
      searchParams["panel.country"] = FIELD_DEFAULTS.COUNTRY;
    }
    return {
      ...Gigs.fields,
      options: {
        ...Gigs.fields.options,
        country: await Countries.getOptions({ locale: i18n.locale }),
        state: await States.getOptions({
          locale: i18n.locale,
          query: searchParams?.["panel.country"]
            ? { country_id: searchParams["panel.country"] }
            : null,
        }),
        city: await Cities.getOptions({
          locale: i18n.locale,
          query: searchParams?.["panel.state"] ? { state_id: searchParams["panel.state"] } : null,
        }),
        bands: {
          ...(await Bands.getOptions()),
        },
      },
      search: {
        country: {
          deletes: ["state", "city"],
        },
        state: {
          deletes: ["city"],
        },
        city: {}, // No deletes
        params: searchParams,
      },
    };
  } catch (error) {
    return {};
  }
};

// Get methods function
const getMethods = (router?: any): Record<string, any> => ({
  onSave: async (data: any, files: any) => {
    if (!data.country) {
      data.country = FIELD_DEFAULTS.COUNTRY;
    }
    return onSave(client, router, data, files);
  },
  onDelete: async (ids: string | string[]) => onDelete(client, router, ids),
  bands: {
    onSave: Bands.getMethods(router).onListSave,
  },
});

// Gigs service
export const Gigs = {
  ...BaseList(client),
  fields,
  parseAll,
  getFields,
  getMethods,
};
