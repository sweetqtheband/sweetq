import { AxiosInstance } from 'axios';
import config from '../config';

export const getAll = async (client: AxiosInstance, searchParams?: any) => {
  const limit = Number(searchParams?.limit) || config.table.limit;
  const currentPage = Number(searchParams?.page) || 0;
  const query = searchParams?.query ? String(searchParams?.query) : '';
  const sort = searchParams?.sort ? String(searchParams?.sort) : '';
  const sortDir = searchParams?.sortDir ? String(searchParams?.sortDir) : '';
  const cursor = limit * currentPage;

  const params: any = {
    limit,
    cursor,
  };

  if (query) {
    params.query = query;
  }

  if (sort && sortDir) {
    params.sort = sort;
    params.sortDir = sortDir;
  }
  const response = await client.get('', { params });

  return response.data;
};

export const POST = async (client: AxiosInstance, data: any) => {
  const response = await client.request({
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const PUT = async (client: AxiosInstance, id: string, data: any) => {
  const response = await client.put(id, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const DELETE = async (client: AxiosInstance, ids: string | string[]) => {
  const response = await (ids instanceof Array
    ? Promise.all(ids.map((id) => client.delete(id)))
    : client.delete(ids));
  return response;
};
