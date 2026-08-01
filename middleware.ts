import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next internals)
     * - favicon.ico
     * - static assets
     * - manifest.json, sw.js -- iOS fetches these to decide whether
     *   "Add to Home Screen" installs a real standalone app or just a
     *   bookmark, often without session cookies attached. Redirecting
     *   that fetch to /login (as the auth gate otherwise would) reads
     *   as an invalid manifest, so iOS silently falls back to a plain
     *   bookmark -- these have to stay reachable unauthenticated.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
