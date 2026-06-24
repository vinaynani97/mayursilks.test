import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name: string;
      image?: string | null;
      role: "CUSTOMER" | "ADMIN";
    };
  }
  interface User {
    role?: "CUSTOMER" | "ADMIN";
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
