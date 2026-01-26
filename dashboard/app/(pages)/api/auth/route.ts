import { ERRORS, HTTP_STATUS_CODES, TOKENS } from "@/app/constants";
import { corsOptions } from "@/app/services/api/_db";
import { authSvc } from "@/app/services/api/auth";
import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const [message, params] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new NextResponse(message, params);
  }
  const isAuth = await authSvc.isAuth(req, TOKENS.ACCESS);

  if (!isAuth) {
    return NextResponse.json("Not authorized", {
      ...params,
      status: HTTP_STATUS_CODES.UNAUTHORIZED,
    });
  } else {
    return NextResponse.json(null, params);
  }
}
