import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Public routes that don't require authentication
    const publicRoutes = [
      "/auth/signin",
      "/auth/signup", 
      "/auth/error",
      "/auth/verify-email",
      "/landing",
      "/api/auth",
      "/api/auth/verify-email",
      "/api/auth/resend-verification"
    ];

    // API routes that should be accessible
    const apiRoutes = pathname.startsWith("/api/");

    // Check if the current path is a public route or API route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isApiRoute = apiRoutes;

    // If user is authenticated and trying to access auth pages, redirect to home
    if (token && isPublicRoute && !isApiRoute) {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // If user is not authenticated and trying to access protected routes
    if (!token && !isPublicRoute && !isApiRoute && pathname !== "/") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Handle root route ("/") logic - let it pass through to the page component
    if (pathname === "/") {
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes and API routes
        const publicRoutes = [
          "/auth/signin",
          "/auth/signup", 
          "/auth/error",
          "/auth/verify-email",
          "/landing",
          "/api/auth",
          "/api/auth/verify-email",
          "/api/auth/resend-verification"
        ];

        const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
        const isApiRoute = pathname.startsWith("/api/");
        
        if (isPublicRoute || isApiRoute || pathname === "/") {
          return true;
        }

        // For protected routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
