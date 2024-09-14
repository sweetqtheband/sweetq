import { Db, MongoClient } from "mongodb";
import { v4 as uuid } from 'uuid';

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
