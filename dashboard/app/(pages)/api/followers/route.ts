import { NextRequest } from 'next/server';
import { getList, postItem } from '@/app/services/api/_db';
import { SORT } from '@/app/constants';

const collection = 'followers';
const idx = '_id';

export async function GET(req: NextRequest) {
  const qp = req.nextUrl.searchParams;

  const queryObj: any = {};

  const query = qp.get('query');

  if (query) {
    queryObj.$or = [
      {
        full_name: { $regex: query, $options: 'i' },
      },
      {
        username: { $regex: query, $options: 'i' },
      },
    ];
  }

  return Response.json(
    await getList({
      req,
      collection,
      idx,
      sort: SORT.DESC,
      queryObj,
    })
  );
}
