import { AxiosInstance, AxiosResponse } from "axios";
import config from "@/app/config";
import { HTTP_ENCTYPES, HTTP_STATUS_CODES } from "../constants";
import dbClient from "./_db";

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

const fetchWithCache = async (
  client: AxiosInstance,
  url: string,
  params: Record<string, any> | null,
  headers: Record<string, any>
) => {
  const slug = client.defaults.baseURL + url + JSON.stringify(params);

  if (dbClient.cache.has(slug)) {
    return dbClient.cache.get(slug); // Devuelve la data desde el cache
  }

  const data = await client.get(url, { params, headers });

  return data;
};

export const getAll = async (
  client: AxiosInstance,
  searchParams: any = {},
  cache: boolean = false
) => {
  try {
    const limit =
      searchParams.limit !== undefined ? Number(searchParams.limit) : config.table.limit;
    const currentPage = searchParams.page !== undefined ? Number(searchParams.page) : 0;
    const query = searchParams.query !== undefined ? String(searchParams.query) : "";
    const sort = searchParams.sort !== undefined ? String(searchParams.sort) : "";
    const sortDir = searchParams.sortDir !== undefined ? String(searchParams.sortDir) : "";
    const cursor = limit * currentPage;
    const filters: Record<string, any> = Object.entries(searchParams).reduce(
      (acc, [key, value]) => {
        const match = key.match(/^filters\[(.+)\]$/); // Detectar claves como 'filters[...]'
        if (match) {
          const filterKey = match[1]; // Extraer el nombre del filtro (e.g., "treatment")
          acc[filterKey] = String(value).split(","); // Añadirlo al objeto `filters`
        } else if (key === "filters") {
          acc = {
            ...acc,
            ...searchParams[key],
          };
        }
        return acc;
      },
      {} as Record<string, any> // Inicializar como objeto vacío
    );

    const params: any = {
      limit,
      cursor,
      filters: filters || {},
    };

    if (query && query !== "null") {
      params.query = query;
    }

    if (sort && sortDir) {
      params.sort = sort;
      params.sortDir = sortDir;
    }

    if (!isBuild) {
      const response = await GET(client, "", params, cache ? cacheHeaders : {});

      return response.data;
    } else {
      return { items: [], total: 0, pages: 0 };
    }
  } catch (error) {
    return [];
  }
};

export const GET = async (
  client: AxiosInstance,
  url: string,
  params: Record<string, any> | null = {},
  headers: Record<string, any> = {}
): Promise<any> => {
  if (!isBuild) {
    if (headers?.["Cache-Control"]) {
      return await fetchWithCache(client, url, params, headers);
    } else {
      return await client.get(url, { params, headers });
    }
  } else {
    return {
      data: { items: [], total: 0, pages: 0 },
      status: HTTP_STATUS_CODES.OK,
    } as AxiosResponse;
  }
};

export const POST = async (
  client: AxiosInstance,
  data: any,
  url: string = "",
  headers: Record<string, any> = {}
) => {
  const response = await client.request({
    method: "post",
    data,
    url,
    headers: {
      "Content-Type": HTTP_ENCTYPES.FORMDATA,
      ...headers,
    },
  });
  return response;
};

export const PUT = async (client: AxiosInstance, id: string, data: any, url: string = "") => {
  const response = await client.put(url + id, data, {
    headers: {
      "Content-Type": HTTP_ENCTYPES.FORMDATA,
    },
  });
  return response;
};

export const DELETE = async (client: AxiosInstance, ids: string | string[], url: string = "") => {
  const response = await (ids instanceof Array
    ? Promise.all(ids.map((id) => client.delete(url + id)))
    : client.delete(url + ids));
  return response;
};

export const cacheHeaders = {
  "Cache-Control": "max-age=86400",
};
