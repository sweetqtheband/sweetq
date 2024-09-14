import { type NextRequest } from 'next/server'
import { getCollection } from "@/app/(pages)/api/db";
import config from '@/app/config';

const collection = 'states';
const limit = config.table.limit;

export async function GET(req: NextRequest) {
  const col = await getCollection(collection);  
  const qp = req.nextUrl.searchParams;  
  const queryObj: any = {};  

  const query = qp.get("query");    

  if (query) {
    queryObj.$or = [
      {
        name: { $regex: query, $options: "i" },
      },
    ];
  }  

  const country_id = qp.get("country_id");    
  if (country_id) {
    queryObj.$and = [{ country_id }];
  }  

  const total = await col.countDocuments(queryObj);
  
  const items = await col
    .find(queryObj)
    .sort({ name: 1 })
    .collation({ locale: "es", caseLevel: true })
    .toArray();  


  const data = {
    total,
    items    
  }
  
  return Response.json(data);
}
