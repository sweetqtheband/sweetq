import { NextResponse, type NextRequest } from "next/server";
import { userSvc } from "@/app/services/api/user";
import { corsOptions, signData } from "@/app/services/api/_db";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}
export async function POST(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  const body = await req.json();

  const user = await userSvc.getByUsername(body.username);

  let statusCode = HTTP_STATUS_CODES.CONFLICT;
  let data: any = "User cannot be created";

  if (!user) {
    statusCode = HTTP_STATUS_CODES.CREATED;
    data = await userSvc.create(signData(body));
  }

  return new NextResponse(data, { ...corsParams, status: statusCode });
}

export async function PUT(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  const body = await req.json();

  const user = await userSvc.getByUsername(body.username);

  let statusCode = HTTP_STATUS_CODES.NOT_ALLOWED;

  if (user) {
    statusCode = HTTP_STATUS_CODES.NO_CONTENT;
    await userSvc.update(body);
  }

  return new NextResponse(null, { ...corsParams, status: statusCode });
}
