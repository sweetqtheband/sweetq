import { HTTP_STATUS_CODES, TOKENS } from "@/app/constants";
import { authSvc } from "@/app/services/api/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest
) {
    try {
      const body = await req.json();

      const data = await authSvc.getToken(body, TOKENS.ACCESS);
      // Add a new header
      // And produce a response with the new headers
      const response = NextResponse.json({ ...data });
      response.headers.set("auth-token", data.token);

      return response;

    } catch (err:any) {
      return NextResponse.json(err.message, {status: HTTP_STATUS_CODES.ERROR});
    }
    
}
