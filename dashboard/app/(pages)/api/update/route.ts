import { TOKENS } from '@/app/constants';
import { authSvc } from '@/app/services/api/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/app/services/api/_db';

const collection = 'update';

export async function GET(req: NextRequest) {
  const isAuth = await authSvc.isAuth(req, TOKENS.ACCESS);
  if (isAuth) {
    const col = await getCollection(collection);
    const update = await col.findOne();
    if (!update) {
      col.insertOne({});
    }
  }

  return NextResponse.json(null);
}
