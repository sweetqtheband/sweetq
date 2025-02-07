import { Db, MongoClient } from 'mongodb';
import type { NextRequest } from 'next/server';
import { v4 as uuid } from 'uuid';
import config from '@/app/config';
import { uploadSvc } from '@/app/services/api/upload';
import { ERRORS, FIELD_TYPES, SORT } from '@/app/constants';
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
  try {
    const col = await getCollection(collection);
    const svc = FactorySvc(collection, col);
    const qp = req.nextUrl.searchParams;
    let sortField = qp.get('sort') || idx;
    const sortDir = Number(qp.get('sortDir')) || sort;

    if (sortReplace?.[sortField]) {
      sortField = sortReplace[sortField];
    }

    const limit = Number(qp.get('limit')) || config.table.limit;
    const skip = Number(qp.get('cursor')) || 0;

    if (!queryObj.$or) {
      const query = qp.get('query');

      if (query) {
        queryObj.$or = [
          {
            [idx]: { $regex: query, $options: 'i' },
          },
        ];
      }
    }

    const filters: Record<string, any> = {};
    qp.forEach((value, key) => {
      const match = key.match(/^filters\[(.+?)\](?:\[(\d+)\])?$/);
      if (match) {
        const [, filterKey, index] = match;

        const modelizedValue = svc.modelize({ [filterKey]: value })[filterKey];
        if (index !== undefined) {
          filters[filterKey] = filters[filterKey] || [];
          filters[filterKey][+index] =
            modelizedValue instanceof Array
              ? modelizedValue.at(0)
              : modelizedValue;
        } else {
          filters[filterKey] = modelizedValue;
        }
      }
    });

    if (Object.keys(filters).length > 0) {
      if (!queryObj.$and) {
        queryObj.$and = [];
      }

      Object.keys(filters).forEach((key) => {
        if (Array.isArray(filters[key])) {
          queryObj.$and.push({ [key]: { $in: filters[key] } });
        } else {
          queryObj.$and.push({ [key]: filters[key] });
        }
      });
    }

    const total = await col.countDocuments(queryObj);

    const pages = Math.floor(total / Number(qp.get('limit'))) + 1;

    const items = await col
      .find(queryObj)
      .sort({ [sortField]: sortDir === SORT.ASC ? 1 : -1 })
      .limit(limit)
      .skip(skip)
      .collation({ locale: 'es', caseLevel: true })
      .toArray();

    const parsedItems = await Promise.all(
      items.map(async (item) => svc.parse(item))
    );

    const data = {
      total,
      items: parsedItems,
      pages,
      next: { limit, cursor: skip + limit },
      last: (pages - 1) * Number(limit) || 10,
    };
    return data;
  } catch (error) {
    return {};
  }
};

export const getItem = async ({
  query,
  collection,
}: Readonly<{
  query: object;
  collection: string;
}>) => {
  const col = await getCollection(collection);
  const svc = FactorySvc(collection, col);

  return svc.findOne(query);
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

  return svc.create({ ...formDataToObject(formData, types) });
};

export const putItem = async ({
  id,
  req,
  collection,
  types,
  options,
  avoidUnset = false,
}: Readonly<{
  id: string;
  req: NextRequest;
  collection: string;
  types: Record<string, any>;
  options: Record<string, any>;
  avoidUnset?: boolean;
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

  return svc.update(
    { ...formDataToObject(formData, types), _id: id },
    avoidUnset
  );
};

export const deleteItem = async ({
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

  Object.keys(types).forEach(async (key) => {
    if (
      [FIELD_TYPES.IMAGE_UPLOADER, FIELD_TYPES.VIDEO_UPLOADER].includes(
        types[key]
      )
    ) {
      if ('path' in options[key]) {
        await uploadSvc.deleteS3(item[key]);
      }
    }
  });

  return svc.remove(id);
};

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

export const corsOptions = (req: NextRequest): any => {
  const origin = req.headers.get('origin') || 'null';

  if (!origin || !allowedOrigins.includes(origin)) {
    console.log('CORS error', origin, req);
    return [{ error: ERRORS.CORS }, { status: 403 }];
  }

  return [
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin === 'null' ? '*' : origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
  ];
};
