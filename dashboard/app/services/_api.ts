import { AxiosInstance } from 'axios';
import config from '../config';

export const getAll = async (client: AxiosInstance, searchParams?: any) => {
  const limit = Number(searchParams?.limit) || config.table.limit;
  const currentPage = Number(searchParams?.page) || 0;
  const query = searchParams?.query ? String(searchParams?.query) : '';
  const sort = searchParams?.sort ? String(searchParams?.sort) : '';
  const sortDir = searchParams?.sortDir ? String(searchParams?.sortDir) : '';
  const cursor = limit * currentPage;
  const filters: Record<string, any> = Object.entries(searchParams).reduce(
    (acc, [key, value]) => {
      const match = key.match(/^filters\[(.+)\]$/); // Detectar claves como 'filters[...]'
      if (match) {
        const filterKey = match[1]; // Extraer el nombre del filtro (e.g., "treatment")
        acc[filterKey] = String(value).split(','); // Añadirlo al objeto `filters`
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

  if (query) {
    params.query = query;
  }

  if (sort && sortDir) {
    params.sort = sort;
    params.sortDir = sortDir;
  }

  const response = await GET(client, '', params);
  return response.data;
};

export const GET = async (
  client: AxiosInstance,
  url: string,
  params: Record<string, any> = {}
) => {
  const response = await client.get(url, { params });
  return response;
};

export const POST = async (
  client: AxiosInstance,
  data: any,
  url: string = ''
) => {
  const response = await client.request({
    method: 'post',
    data,
    url,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const PUT = async (
  client: AxiosInstance,
  id: string,
  data: any,
  url: string = ''
) => {
  const response = await client.put(url + id, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const DELETE = async (
  client: AxiosInstance,
  ids: string | string[],
  url: string = ''
) => {
  const response = await (ids instanceof Array
    ? Promise.all(ids.map((id) => client.delete(url + id)))
    : client.delete(url + ids));
  return response;
};
