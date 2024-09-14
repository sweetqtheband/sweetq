import { NextResponse, NextRequest } from "next/server";
import { Auth } from "./app/services/auth";

export async function middleware(request: NextRequest) {
  
  const token = request.cookies.get("auth-token"); 
  const user = request.cookies.get("user");

  const isAuthenticated = await Auth.isAuth({
    token: token?.value ? JSON.parse(token.value) : null,
    user: user?.value ? JSON.parse(user.value) : null,
    serverSide: true
  });

  // If the user is authenticated, continue as normal
  if (isAuthenticated) {
    return NextResponse.next();
  }

  // Redirect to login page if not authenticated
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
