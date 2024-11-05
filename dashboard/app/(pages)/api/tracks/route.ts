import { NextRequest } from 'next/server';
import { getList } from '@/app/(pages)/api/db';

const collection = 'tracks';
const idx = 'title';

export async function GET(req: NextRequest) {
  return Response.json(await getList({ req, collection, idx }));
}

export async function POST(req: NextRequest) {
  console.log(req.body);
}
