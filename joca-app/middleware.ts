import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export const runtime = "nodejs";      // or "edge" / "nodejs" per‑route
export async function middleware(request: NextRequest) {
    // Get the pathname
    const { pathname } = request.nextUrl;

    // Only protect the elections route
    if (pathname.startsWith("/elections")) {
        try {
            const session = await auth.api.getSession({
                headers: request.headers,
            });

            // If not authenticated, redirect to login
            if (!session?.user) {
                return NextResponse.redirect(new URL("/login", request.url));
            }

            // If authenticated but hasn't paid, redirect to payment page
            if (!session.user.hasPaid) {
                return NextResponse.redirect(new URL("/payment", request.url));
            }
        } catch (error) {
            // If there's an error checking auth, redirect to login
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/elections/:path*"],
};