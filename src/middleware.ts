export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/((?!api/webhook|_next/static|_next/image|favicon.ico).*)"],
};
