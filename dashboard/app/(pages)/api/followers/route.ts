import { NextRequest } from 'next/server';
import { getList, corsOptions } from '@/app/services/api/_db';
import { ERRORS, SORT } from '@/app/constants';

const collection = 'followers';
const idx = '_id';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  const qp = req.nextUrl.searchParams;

  const queryObj: any = {};

  const query = qp.get('query');
  const filterShow = qp.get('filters[show][0]');
  if (filterShow !== '2') {
    queryObj.$and = [
      {
        unfollow: filterShow === '1',
      },
    ];
  }
  console.log(req.nextUrl.searchParams);
  req.nextUrl.searchParams.delete('filters[show][0]');

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
    }),
    corsParams
  );
}
