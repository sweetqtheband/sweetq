import { Db, FindOptions, MongoClient } from 'mongodb';
import type { NextRequest } from 'next/server';
import { v4 as uuid } from 'uuid';
import config from '@/app/config';
import { uploadSvc } from '@/app/services/api/upload';
import { FIELD_TYPES, SORT } from '@/app/constants';
import { FactorySvc } from '@/app/services/api/factory';
import { formDataToObject } from '@/app/utils';

let _db: Db;

export const getDb = async () => {
  if (!_db) {
    const client = new MongoClient(process.env.MONGODB_URI as string);

    await client.connect();

    _db = client.db(process.env.MONGODB_DATABASE);
  }
  return _db;
};

export const getCollection = async (collection: string) => {
  const db = await getDb();
  return db.collection(collection);
};

export const signData = (
  data: Record<string, any>,
  params?: Readonly<{
    id: boolean;
    timestamp: boolean;
  }>
) => {
  const signedData = { ...data };

  if (params?.id && !data.id) {
    signedData.id = uuid();
  }

  if (params?.timestamp) {
    if (!data.createdAt) {
      signedData.createdAt = new Date().toISOString();
    }
    signedData.updatedAt = new Date().toISOString();
  }

  return signedData;
};

export const toTimestamp = (date: Date) => Math.floor(date.getTime() / 1000);

export const getList = async ({
  req,
  collection,
  idx = 'name',
  sort = SORT.ASC,
  queryObj = {},
  sortReplace = {},
}: Readonly<{
  req: NextRequest;
  collection: string;
  idx?: string;
  sort?: number;
  queryObj?: Record<string, any>;
  sortReplace?: Record<string, any>;
}>) => {
  const limit = config.table.limit;

  const col = await getCollection(collection);
  const qp = req.nextUrl.searchParams;
  let sortField = qp.get('sort') || idx;
  const sortDir = Number(qp.get('sortDir')) || sort;

  if (sortReplace?.[sortField]) {
    sortField = sortReplace[sortField];
  }

  const params: FindOptions = {
    limit: Number(qp.get('limit')) || limit,
    skip: Number(qp.get('cursor')) || 0,
  };

  const query = qp.get('query');

  if (query) {
    queryObj.$or = [
      {
        [idx]: { $regex: query, $options: 'i' },
      },
    ];
  }

  const total = await col.countDocuments(queryObj);

  const pages = Math.floor(total / Number(qp.get('limit')));

  const items = await col
    .find(queryObj, params)
    .sort({ [sortField]: sortDir === SORT.ASC ? 1 : -1 })
    .collation({ locale: 'es', caseLevel: true })
    .toArray();

  const data = {
    total,
    items,
    pages,
    next: params,
    last: (pages - 1) * Number(params.limit) || 10,
  };
  return data;
};

export const postItem = async ({
  req,
  collection,
  types,
  options,
}: Readonly<{
  req: NextRequest;
  collection: string;
  types: Record<string, any>;
  options: Record<string, any>;
}>) => {
  const col = await getCollection(collection);
  const svc = FactorySvc(collection, col);

  const formData = await req.formData();

  Object.keys(types).forEach(async (key) => {
    const [value] = formData.getAll(key);
    if (value instanceof File) {
      if ('path' in options[key]) {
        await uploadSvc.uploadS3(value, options[key].path as string);
      }
    }
  });

  return svc.create({ ...formDataToObject(formData) });
};

export const putItem = async ({
  id,
  req,
  collection,
  types,
  options,
}: Readonly<{
  id: string;
  req: NextRequest;
  collection: string;
  types: Record<string, any>;
  options: Record<string, any>;
}>) => {
  const col = await getCollection(collection);
  const svc = FactorySvc(collection, col);
  const item = await svc.getById(id);

  const formData = await req.formData();

  Object.keys(types).forEach(async (key) => {
    const [value] = formData.getAll(key);
    if (value instanceof File) {
      if ('path' in options[key]) {
        await uploadSvc.uploadS3(value, options[key].path as string);
      }
    }

    if (
      !value &&
      [FIELD_TYPES.IMAGE_UPLOADER, FIELD_TYPES.VIDEO_UPLOADER].includes(
        types[key]
      )
    ) {
      if ('path' in options[key]) {
        await uploadSvc.deleteS3(item[key]);
      }
    }
  });

  return svc.update({ ...formDataToObject(formData), _id: id });
};
