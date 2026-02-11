import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Password hash will be set via env var
const DASHBOARD_PASSWORD_HASH = process.env.DASHBOARD_PASSWORD_HASH;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Password",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.password || !DASHBOARD_PASSWORD_HASH) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          DASHBOARD_PASSWORD_HASH
        );

        if (isValid) {
          return { id: "nick", name: "Nick", email: "npapadam@me.com" };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = !nextUrl.pathname.startsWith("/login");
      const isApiWebhook = nextUrl.pathname.startsWith("/api/webhook");
      
      // Allow webhook API without auth (uses separate API key)
      if (isApiWebhook) return true;
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
  },
});
