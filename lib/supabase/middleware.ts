import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup", "/review", "/progress"];

// Unlike the routes above, /guide is meant to stay reachable no matter
// who's looking at it -- a signed-in operator should be able to open it
// from the sidebar without being bounced to /brief the way visiting
// /login or /progress while signed in would.
const ALWAYS_ACCESSIBLE_ROUTES = ["/guide"];

/**
 * Refreshes the Supabase auth session on every request and redirects
 * unauthenticated users away from protected (dashboard) routes.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Root is public too (the marketing landing page), but must be an exact
  // match — startsWith("/") would match every path and disable the gate.
  // /progress is the read-only progress page the landing page links to.
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    PUBLIC_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));
  const isAlwaysAccessible = ALWAYS_ACCESSIBLE_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!user && !isPublicRoute && !isAlwaysAccessible) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/brief";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
