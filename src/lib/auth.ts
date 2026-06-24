import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  logger: {
    warn(...args) { console.warn("[next-auth warn]", ...args); },
    error(...args) { console.error("[next-auth error]", ...args); },
  },
  providers: [
    // ── Password login: email or phone + password ────────
    Credentials({
      id: "credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const identifier = credentials.identifier as string;
        const isEmail = identifier.includes("@");

        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: identifier }
            : { phone: identifier.replace(/\D/g, "").slice(-10) },
        });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.avatar, role: user.role };
      },
    }),

    // ── Customer: mobile OTP ─────────────────────────────
    Credentials({
      id: "otp",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        otp: { label: "OTP", type: "text" },
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        mode: { label: "Mode", type: "text" },
      },
      async authorize(credentials) {
        const mobile = (credentials?.mobile as string) ?? "";
        const otp = (credentials?.otp as string) ?? "";
        const name = (credentials?.name as string) ?? "";
        const email = (credentials?.email as string) ?? "";
        const mode = (credentials?.mode as string) ?? "login";

        if (!mobile || !otp) return null;

        const otpRecord = await prisma.otpCode.findFirst({
          where: { mobile, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        });

        if (!otpRecord) return null;

        if (otpRecord.code !== otp) {
          const newAttempts = otpRecord.attempts + 1;
          if (newAttempts >= 3) {
            await prisma.otpCode.delete({ where: { id: otpRecord.id } });
          } else {
            await prisma.otpCode.update({
              where: { id: otpRecord.id },
              data: { attempts: newAttempts },
            });
          }
          return null;
        }

        await prisma.otpCode.delete({ where: { id: otpRecord.id } });

        let user = await prisma.user.findUnique({ where: { phone: mobile } });

        if (!user && mode === "login") return null;

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: name || "Customer",
              phone: mobile,
              email: email || null,
              role: "CUSTOMER",
              phoneVerified: new Date(),
            },
          });
        }

        if (user.role === "ADMIN") return null;

        return { id: user.id, email: user.email, name: user.name, image: user.avatar, role: user.role };
      },
    }),

    // ── Google (customer sign-in) ────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: { name: user.name ?? "", avatar: user.image },
          create: {
            email: user.email,
            name: user.name ?? "User",
            avatar: user.image,
            role: "CUSTOMER",
            emailVerified: new Date(),
          },
        });
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
      }
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
});
