import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|quizqube.svg|quizqube_featured.png).*)"],
};

export default auth((req) => {
  const reqUrl = new URL(req.url);
  if (!req.auth && reqUrl?.pathname !== "/") {
    return NextResponse.redirect(
        // rediret to / using absolute url
        new URL("/", reqUrl.origin).toString()
    );
  }
});