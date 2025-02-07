import { NextResponse, type NextRequest } from 'next/server';
import { userSvc } from '@/app/services/api/user';
import { signData } from '@/app/services/api/_db';
import { HTTP_STATUS_CODES } from '@/app/constants';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const user = await userSvc.getByUsername(body.username);

  let statusCode = HTTP_STATUS_CODES.CONFLICT;
  let data: any = 'User cannot be created';

  if (!user) {
    statusCode = HTTP_STATUS_CODES.CREATED;
    data = await userSvc.create(signData(body));
  }

  return new NextResponse(data, { status: statusCode });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const user = await userSvc.getByUsername(body.username);

  let statusCode = HTTP_STATUS_CODES.NOT_ALLOWED;

  if (user) {
    statusCode = HTTP_STATUS_CODES.NO_CONTENT;
    await userSvc.update(body);
  }

  return new NextResponse(null, { status: statusCode });
}
