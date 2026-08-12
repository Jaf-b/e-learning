import { NextRequest, NextResponse } from "next/server";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Récupération directe du cookie de session (remplacez "session_token" par le nom exact de votre cookie)
    const sessionCookie = request.cookies.get("better-auth.session_token")?.value;

    // Si pas de cookie -> Redirection vers /login
    if (!sessionCookie) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    // 2. Récupération du rôle (si vous le stockez dans un autre cookie, ex: "user_role")
    if(! session){
        return NextResponse.redirect(new URL("/login", request.url));
    }
    const userRole = session.user.role;

    // 3. Contrôle des accès
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/teacher") && userRole !== "TEACHER" && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/student") && userRole !== "STUDENT" && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/teacher/:path*",
        "/student/:path*",
    ],
};