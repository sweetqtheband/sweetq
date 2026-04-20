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
import { GooglePlace } from "./google/places";

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
  venue: FIELD_TYPES.PLACE_SEARCH,
  map: FIELD_TYPES.TEXT_MAP,
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
  map: {
    readOnly: true,
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
  venue: {
    setAddress: async (params: {
      value: string;
      field: string;
      formState: any;
      onInputHandler: any;
      fields: any;
    }) => {
      const { value, field, formState, onInputHandler, fields } = params;

      let searchParams: Record<string, any> = {};

      if (formState.country) {
        searchParams.country =
          fields.options.country.options.find((option: any) => +option.id === +formState.country)
            ?.value || formState.country;
      }
      if (formState.state) {
        searchParams.state =
          fields.options.state.options.find((option: any) => +option.id === +formState.state)
            ?.value || formState.state;
      }

      const address = await GooglePlace.search({
        address: value,
        ...searchParams,
      });

      const embedURI = address
        ? await GooglePlace.getEmbedURI({
            address: address,
            ...searchParams,
          })
        : undefined;

      onInputHandler([field, "map"], [value, embedURI ? embedURI : ""]);
    },
  },
});

export const getList = async (params: any = {}) => {
  try {
    const list = await Gigs.getAll(params);

    if (!list) return { items: [], total: 0 };

    await Promise.all(
      list?.items instanceof Array && list.items.length > 0
        ? list.items.map(async (item: any) => {
            if (item?.bands instanceof Array && item.bands.length > 0) {
              const bands = await Bands.getAll({
                filter: { _id: { $in: item.bands.map((band: any) => band) } },
              });

              item.bands = bands?.items instanceof Array ? bands.items : [];
            }
            return {
              ...item,
            };
          })
        : new Promise((resolve) => resolve([]))
    );

    return parseFront(list?.items || []);
  } catch (error) {
    return [];
  }
};

const getFutureGigs = async (params: any = {}) => {
  params.filter = {
    ...params.filter,
    date: { $gte: new Date() },
  };
  return await getList(params);
};

const getPastGigs = async (params: any = {}) => {
  params.filter = {
    ...params.filter,
    date: { $lt: new Date() },
  };
  return await getList(params);
};

const parseFront = (items: any) => {
  return items.map((item: Record<string, any>) => ({
    ...item,
  }));
};
// Gigs service
export const Gigs = {
  ...BaseList(client),
  fields,
  parseAll,
  getFields,
  getMethods,
  getList,
  getFutureGigs,
  getPastGigs,
};
