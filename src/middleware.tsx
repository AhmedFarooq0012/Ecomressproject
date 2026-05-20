import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const userRole = request.cookies.get("userRole")?.value;

    const currentPath = request.nextUrl.pathname;

    // 1. Logged-in verified user dobarah pages bypass na kar sake
    if (token && (currentPath === "/login" || currentPath === "/signup" || currentPath === "/guest")) {
        if (userRole === "Admin") {
            return NextResponse.redirect(new URL("/dashboard/admin", request.url));
        } else if (userRole === "Customer") {
            return NextResponse.redirect(new URL("/dashboard/customer", request.url));
        } else {
            return NextResponse.redirect(new URL("/guest", request.url));
        }
    }

    // 2. Dynamic check targeting raw unauthenticated visitor entry zone
    if (currentPath === "/guest") {
        // Agar logged in admin/customer ghalti se organic guest link type karein, secure panels par wapis bhejein
        if (token) {
            if (userRole === "Admin") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
            if (userRole === "Customer") return NextResponse.redirect(new URL("/dashboard/customer", request.url));
        }
        return NextResponse.next(); // Public flow pass directly without token verification boundaries
    }

    // 3. SECURE PROTECTED DASHBOARD ROUTES BLOCK
    if (currentPath.startsWith("/dashboard")) {
        // Access denied safely if token disappears
        if (!token) {
            return NextResponse.redirect(new URL("/guest", request.url));
        }

        // Condition A: Admin folder security gate
        if (currentPath.startsWith("/dashboard/admin") && userRole !== "Admin") {
            if (userRole === "Customer") return NextResponse.redirect(new URL("/dashboard/customer", request.url));
            return NextResponse.redirect(new URL("/guest", request.url));
        }

        // Condition B: Customer folder security gate
        if (currentPath.startsWith("/dashboard/customer") && userRole !== "Customer") {
            if (userRole === "Admin") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
            return NextResponse.redirect(new URL("/guest", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/login",
        "/signup",
        "/guest" // Explicitly monitoring guest path matching sequences
    ],
};
