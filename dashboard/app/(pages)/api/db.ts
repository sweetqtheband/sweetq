import { Db, FindOptions, MongoClient } from "mongodb";
import type { NextRequest } from "next/server";
import { v4 as uuid } from 'uuid';
import config from '@/app/config';

let _db: Db;

export const getDb = async () => {
  if (!_db) {
    const client = new MongoClient(process.env.MONGODB_URI as string);

    await client.connect();

    _db = client.db(process.env.MONGODB_DATABASE);
  } 
  return _db;
}

export const getCollection = async (collection:string) => {
  const db = await getDb();
  return db.collection(collection);
}

export const signData = ( 
  data: Record<string, any>, 
  params?:Readonly<{
    id: boolean,
    timestamp: boolean
  }>
  ) => {
    
  const signedData = {...data};

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
}

export const toTimestamp = (date: Date) => Math.floor(date.getTime() / 1000);

export const getList = async ({req, collection, idx = "name", queryObj = {}}:Readonly<{
  req: NextRequest;
  collection: string;
  idx?: string;
  queryObj?: Record<string, any>;
}>) => {
  const limit = config.table.limit;
  
  const col = await getCollection(collection);  
  const qp = req.nextUrl.searchParams;  

  const params: FindOptions = {
    limit: Number(qp.get("limit")) || limit,
    skip: Number(qp.get("cursor")) || 0,
  }; 

  const query = qp.get("query");  

  if (query) {
    queryObj.$or = [
      {
        [idx]: { $regex: query, $options: "i" },
      },
    ];
  }  

  const total = await col.countDocuments(queryObj);

  const pages = Math.round(total / Number(qp.get("limit")) + 1 || 10);
  
  const items = await col
    .find(queryObj, params)
    .sort({[idx]: 1 })
    .collation({ locale: "es", caseLevel: true })
    .toArray();  

  const data = {
    total,
    items,
    pages,
    next: params,
    last: ((pages - 1) * Number(params.limit) || 10)
  }
  return data;
}