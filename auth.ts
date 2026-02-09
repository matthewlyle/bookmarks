import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [Google],
  callbacks: {
    signIn({ user }) {
      // Only allow specific email
      return user.email === process.env.AUTH_ALLOWED_EMAIL
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth-error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})
