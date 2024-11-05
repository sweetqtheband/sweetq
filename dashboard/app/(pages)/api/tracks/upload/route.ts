import { type NextRequest } from 'next/server';
import { getList } from '@/app/(pages)/api/db';

const collection = 'tracks';
const idx = 'title';

export async function POST(req: NextRequest) {
  console.log(req.body);
}
