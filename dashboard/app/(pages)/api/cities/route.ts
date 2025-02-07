import { type NextRequest } from 'next/server';
import { getCollection, corsOptions } from '@/app/services/api/_db';

const collection = 'cities';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const col = await getCollection(collection);
  const qp = req.nextUrl.searchParams;
  const queryObj: any = {};

  const query = qp.get('query');

  if (query) {
    queryObj.$or = [
      {
        name: { $regex: query, $options: 'i' },
      },
    ];
  }

  const state_id = qp.get('state_id');
  if (state_id) {
    queryObj.$and = [{ state_id }];
  }

  const total = await col.countDocuments(queryObj);

  const items = await col
    .find(queryObj)
    .sort({ name: 1 })
    .collation({ locale: 'es', caseLevel: true })
    .toArray();

  const data = {
    total,
    items,
  };

  return Response.json(data);
}
