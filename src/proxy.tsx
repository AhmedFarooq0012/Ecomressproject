import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ Next.js Latest Standard: Name changed from middleware to proxy
export function proxy(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const userRole = request.cookies.get("userRole")?.value;
    const currentPath = request.nextUrl.pathname;

    // 1. Agar user logged in hai toh dobarah login/signup/guest pages par na ja sake
    if (token && (currentPath === "/login" || currentPath === "/signup" || currentPath === "/guest")) {
        if (userRole === "Admin") {
            return NextResponse.redirect(new URL("/dashboard/admin", request.url));
        } else if (userRole === "Customer") {
            return NextResponse.redirect(new URL("/dashboard/customer", request.url));
        }
    }

    // 2. Guest Route Protection: Agar admin/customer ghalti se yahan aayein toh unhe sahi dashboards par bhejein
    if (currentPath === "/guest" && token) {
        if (userRole === "Admin") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
        if (userRole === "Customer") return NextResponse.redirect(new URL("/dashboard/customer", request.url));
    }

    // 3. Secure Dashboard Gates: Admin aur Customer pages bina token ke access nahi ho sakte
    if (currentPath.startsWith("/dashboard")) {
        if (!token) {
            return NextResponse.redirect(new URL("/guest", request.url));
        }

        // Admin space security check
        if (currentPath.startsWith("/dashboard/admin") && userRole !== "Admin") {
            return NextResponse.redirect(new URL(userRole === "Customer" ? "/dashboard/customer" : "/guest", request.url));
        }

        // Customer space security check
        if (currentPath.startsWith("/dashboard/customer") && userRole !== "Customer") {
            return NextResponse.redirect(new URL(userRole === "Admin" ? "/dashboard/admin" : "/guest", request.url));
        }
    }

    return NextResponse.next();
}

// 4. URL Matcher Configurations
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/login",
        "/signup",
        "/guest"
    ],
};
