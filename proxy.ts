import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Supabase SSR proxy (Next.js 16+ file convention, replaces middleware.ts).
 *
 * Responsibilities:
 *  1. Refresh the Supabase auth session on every request so that
 *     `auth.getUser()` in Server Components always returns an up-to-date user.
 *  2. Redirect unauthenticated requests to /dashboard → /auth/login.
 *  3. Redirect authenticated requests away from auth pages → /dashboard.
 */
export default async function proxy(request: NextRequest) {
  // We need a mutable response so that the Supabase client can set/update
  // the session cookies before we return.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          // Apply cookies to both the request (for subsequent proxy hops) and
          // the response (sent back to the browser).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Always call getUser() — never getSession() — in proxy/middleware.
  // getUser() validates the token server-side; getSession() only reads the
  // local cookie and cannot detect revoked/expired tokens.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect /dashboard (and any future routes under it).
  if (pathname.startsWith("/dashboard") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from the auth pages.
  if (
    user &&
    (pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/signup"))
  ) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run proxy on all routes except:
     *  - Next.js internals (_next/static, _next/image)
     *  - Static files (favicon.ico, images, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
