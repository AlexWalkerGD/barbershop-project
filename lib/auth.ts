import { AuthOptions } from "next-auth"
import { db } from "@/lib/prisma"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { getEffectiveUserRole } from "@/lib/subscription-access"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }

      if (!token.id) return token

      const dbUser = await db.user.findUnique({
        where: {
          id: token.id as string,
        },
        include: {
          subscription: true,
        },
      })

      if (dbUser) {
        const effectiveRole = getEffectiveUserRole(
          dbUser.role,
          dbUser.subscription,
        )

        if (
          effectiveRole !== dbUser.role &&
          (dbUser.role === "ADMIN" || dbUser.role === "USER")
        ) {
          await db.user.update({
            where: { id: dbUser.id },
            data: { role: effectiveRole },
          })
        }

        token.role = effectiveRole
      }

      return token
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role ?? "USER",
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
}
