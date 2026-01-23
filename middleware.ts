import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized({ token }) {
      console.log("Token no middleware:", token)
      return token?.role != "USER"
    },
  },
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
