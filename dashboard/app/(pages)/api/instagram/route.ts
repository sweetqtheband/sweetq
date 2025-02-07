import { NextRequest } from 'next/server';
import { getItem } from '@/app/services/api/_db';
import { HTTP_STATUS_CODES } from '@/app/constants';

const collection = 'instagram';

export async function GET(req: NextRequest) {
  const data = await getItem({ query: { type: 'auth_token' }, collection });
  return Response.json({ data }, { status: HTTP_STATUS_CODES.OK });
}
