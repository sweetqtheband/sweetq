import { NextResponse, NextRequest } from "next/server";
import { AuthEdge } from "./app/services/auth-edge";
import Translate from "@/app/services/translate";

export async function middleware(request: NextRequest) {
  await Translate.init();

  // If the request is for the admin dashboard, check if the user is authenticated
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth-token");
    const user = request.cookies.get("user");

    // Basic validation (Edge-compatible, no external calls)
    const isAuthenticated = AuthEdge.isAuthBasic({
      token: token?.value || null,
      user: user?.value || null,
    });

    // If the user is authenticated, continue as normal
    if (isAuthenticated) {
      return NextResponse.next();
    }

    // Redirect to login page if not authenticated
    return NextResponse.redirect(new URL("/admin/login", request.url));
  } else {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/"], // Ignora rutas específicas
};
