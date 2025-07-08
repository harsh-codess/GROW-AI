// auth.ts or auth.js file in your project root or src directory
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { User, Account } from "next-auth";
import { setSessionCookie } from "@/lib/auth/auth";

// console.log(process.env.GOOGLE_CLIENT_ID);
const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    // e.g., GithubProvider, GoogleProvider, etc.
  ],
  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      if (account?.provider === "google") {
        try {
          const baseUrl = process.env.NEXTAUTH_URL || "https://flow-ai-ruddy.vercel.app"

          // First try to login
          const loginResponse = await fetch(`${baseUrl}/api/auth/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              provider: "google",
            }),
          });

          // If user doesn't exist, try to signup
          if (loginResponse.status === 404) {
            const signupResponse = await fetch(`${baseUrl}/api/auth/google-signup`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                provider: "google",
              }),
            });

            const signupData = await signupResponse.json();

            if (!signupResponse.ok) {
              return false;
            }

            // Set session cookie for new user
            if (signupData.user) {
              await setSessionCookie({
                id: signupData.user.id,
                email: signupData.user.email,
                name: signupData.user.name,
                role: signupData.user.role,
                companyId: signupData.user.companyId,
              });
            }

            // Return the onboarding URL for redirection
            return signupData.redirectTo || "/onboarding";
          }

          const loginData = await loginResponse.json();

          if (!loginResponse.ok) {
            return false;
          }

          // Set session cookie for existing user
          if (loginData.user) {
            await setSessionCookie({
              id: loginData.user.id,
              email: loginData.user.email,
              name: loginData.user.name,
              role: loginData.user.role,
              companyId: loginData.user.companyId,
            });
          }

          return true;
        } catch (error) {
          console.error("Error during Google sign-in:", error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allows relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({ session, token }: { session: any; token: any }) {
      // Add custom session data
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.companyId = token.companyId;
      }
      return session;
    },
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      // Add custom JWT data
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
      }
      return token;
    }
  },
  pages: {
    signIn: "/auth/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const { auth, signIn, signOut } = handler;
