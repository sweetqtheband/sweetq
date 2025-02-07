import { ERRORS, HTTP_STATUS_CODES, TOKENS } from '@/app/constants';
import { corsOptions } from '@/app/services/api/_db';
import { authSvc } from '@/app/services/api/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function POST(req: NextRequest) {
  const [message, params] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new NextResponse(message, params);
  }
  try {
    const body = await req.json();

    const data = await authSvc.getToken(body, TOKENS.ACCESS);
    // Add a new header
    // And produce a response with the new headers
    const response = NextResponse.json({ ...data }, params);
    response.headers.set('auth-token', data.token);

    return response;
  } catch (err: any) {
    return NextResponse.json(err.message, {
      ...params,
      status: HTTP_STATUS_CODES.ERROR,
    });
  }
}
