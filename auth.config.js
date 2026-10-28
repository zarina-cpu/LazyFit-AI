export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isApp = ["/today", "/exercises", "/import", "/plan", "/chat", "/stats", "/profile"].some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      );
      if (isApp) return Boolean(auth?.user);
      return true;
    },
  },
};
