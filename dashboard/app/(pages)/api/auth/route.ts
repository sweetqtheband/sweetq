import { HTTP_STATUS_CODES, TOKENS } from "@/app/constants";
import { authSvc } from "@/app/services/api/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
) {
  const isAuth = await authSvc.isAuth(req, TOKENS.ACCESS);

  if (!isAuth) {
    return NextResponse.json("Not authorized", {
      status: HTTP_STATUS_CODES.UNAUTHORIZED,
    });
  } else {
    return NextResponse.json(null);
  }
}