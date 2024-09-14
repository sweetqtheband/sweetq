import { type NextRequest } from 'next/server'
import { getCollection } from "@/app/(pages)/api/db";
import { FindOptions } from 'mongodb';
import config from '@/app/config';

const collection = 'followers';
const limit = config.table.limit;

export async function GET(req: NextRequest) {
  const col = await getCollection(collection);  
  const qp = req.nextUrl.searchParams;
  
  const params: FindOptions = {
    limit: Number(qp.get("limit")) || limit,
    skip: Number(qp.get("cursor")) || 0,
  }; 

  const queryObj: any = {};

  const query = qp.get("query");
    
  if (query) {
    queryObj.$or = [
      {
        full_name: { $regex: query,  $options: 'i'} ,
      },
      {
        username: { $regex: query,  $options: 'i'},
      },
    ]
  }  
  
  const total = await col.countDocuments(queryObj);

  const pages = Math.round(total / Number(qp.get("limit")) + 1 || 10);

  const items = await col.find(queryObj, params).toArray();  

  const data = {
    total,
    items,
    pages,
    next: params.limit,
    last: ((pages - 1) * Number(params.limit) || 10)
  }
  
  return Response.json(data);
}