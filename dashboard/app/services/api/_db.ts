import { Db, MongoClient } from "mongodb";
import type { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import config from "@/app/config";
import { uploadSvc } from "@/app/services/api/upload";
import { ERRORS, FIELD_TYPES, HTTP_STATUS_CODES, SORT } from "@/app/constants";
import { FactorySvc } from "@/app/services/api/factory";
import { formDataToObject } from "@/app/utils";
import qs from "qs";

let _db: Db | null = null;
let _client: MongoClient | null = null;
let _connecting = false;

const MONGODB_URI = process.env.MONGODB_URI as string;

async function connectWithRetry(retries = 5, delayMs = 5000): Promise<MongoClient> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      const client = new MongoClient(MONGODB_URI, {
        auth: {
          username: process.env.MONGODB_USER,
          password: process.env.MONGODB_PASSWORD,
        },
        authSource: process.env.MONGODB_AUTH_SOURCE,
      });
      await client.connect();
      return client;
    } catch (error: any) {
      lastError = error;
      console.error(`MongoDB conexión fallida. Intento ${i + 1} de ${retries}:`, error.message);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

export const getDb = async (): Promise<Db> => {
  if (_db) {
    return _db;
  }
  if (_connecting) {
    while (_connecting) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (_db) return _db;
  }

  _connecting = true;
  try {
    _client = await connectWithRetry(5, 5000);
    _db = _client.db(process.env.MONGODB_DATABASE);
    return _db;
  } finally {
    _connecting = false;
  }
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
  idx = "name",
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
    let sortField = qp.get("sort") || idx;
    const sortDir = Number(qp.get("sortDir")) || sort;

    if (sortReplace?.[sortField]) {
      sortField = sortReplace[sortField];
    }

    const limit = Number(qp.get("limit")) || config.table.limit;
    const skip = Number(qp.get("cursor")) || 0;

    if (!queryObj.$or) {
      const query = qp.get("query");
      if (query) {
        queryObj.$or = [
          {
            [idx]: { $regex: query, $options: "i" },
          },
        ];
      }
    }

    const searchParams = req.nextUrl.searchParams.toString();

    const params = qs.parse(searchParams, {
      ignoreQueryPrefix: true,
    });

    const filters = Object.keys(params.filters || {}).reduce(
      (acc: Record<string, any>, name: string) => {
        const modelizedValue = svc.modelize({
          [name]: (params.filters as Record<string, any>)[name],
        });
        acc[name] = modelizedValue[name];
        return acc;
      },
      {}
    );

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

    const pages = Math.floor(total / Number(qp.get("limit"))) + 1;

    const sorts: Record<string, any> =
      sortField !== "_id"
        ? { [sortField]: sortDir === SORT.ASC ? 1 : -1, _id: 1 }
        : { _id: sortDir === SORT.ASC ? 1 : -1 };

    const items = await col
      .find(queryObj)
      .sort(sorts)
      .limit(limit)
      .skip(skip)
      .collation({ locale: "es", caseLevel: true })
      .toArray();

    const parsedItems = await Promise.all(items.map(async (item) => svc.parse(item)));

    const data = {
      timestamp: new Date().getTime(),
      total,
      items: parsedItems,
      pages,
      next: { limit, cursor: skip + limit },
      last: (pages - 1) * Number(limit) || 10,
    };
    return data;
  } catch (error) {
    console.log(error);
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
      if ("path" in options[key]) {
        await uploadSvc.uploadS3(value, options[key].path as string);
      }
    }
  });

  return svc.create({ ...formDataToObject(formData, types, options) });
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
      if ("path" in options[key]) {
        await uploadSvc.uploadS3(value, options[key].path as string);
      }
    }

    if (!value && [FIELD_TYPES.IMAGE_UPLOADER, FIELD_TYPES.VIDEO_UPLOADER].includes(types[key])) {
      if ("path" in options[key]) {
        await uploadSvc.deleteS3(item[key]);
      }
    }
  });

  const updateObject = {
    ...formDataToObject(formData, types, options),
    _id: id,
  };

  return svc.update(updateObject, avoidUnset);
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
    if ([FIELD_TYPES.IMAGE_UPLOADER, FIELD_TYPES.VIDEO_UPLOADER].includes(types[key])) {
      if ("path" in options[key]) {
        await uploadSvc.deleteS3(item[key]);
      }
    }
  });

  return svc.remove(id);
};

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

export const corsOptions = (req: NextRequest): any => {
  const origin = req.headers.get("origin") || "null";

  if (!origin || (origin !== "null" && !allowedOrigins.includes(origin))) {
    console.log("CORS error", origin, req);
    return [{ error: ERRORS.CORS }, { status: HTTP_STATUS_CODES.FORBIDDEN }];
  }

  return [
    {},
    {
      status: HTTP_STATUS_CODES.OK,
      headers: {
        "Access-Control-Allow-Origin": origin === "null" ? "*" : origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  ];
};

export const getQueryFilter = (req: NextRequest, property: string, asArray: boolean = false) => {
  const searchParams = req.nextUrl.searchParams.toString();
  const params = qs.parse(searchParams, { ignoreQueryPrefix: true }) as any;
  if (params?.filters?.[property] instanceof Array && params?.filters?.[property].length) {
    if (params.filters[property].length > 1 || asArray) {
      return params.filters[property];
    } else {
      return params.filters[property][0];
    }
  }
};

export const removeQueryFilter = (req: NextRequest, property: string) => {
  const searchParams = req.nextUrl.searchParams.toString();
  const params = qs.parse(searchParams, { ignoreQueryPrefix: true }) as any;
  if (params?.filters?.[property]) {
    if (params.filters[property].length > 0) {
      params.filters[property].forEach((value: string, index: number) => {
        req.nextUrl.searchParams.delete(`filters[${property}][${String(index)}]`);
      });
    }
  }
};
