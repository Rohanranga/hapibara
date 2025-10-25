import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number | string;
      isAdmin?: boolean;
      provider?: "google" | "creds";
      isEmailVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: number | string;
    isAdmin?: boolean;
    provider?: "google" | "creds";
    isEmailVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: number | string;
    isAdmin?: boolean;
    provider?: "google" | "creds";
    isEmailVerified?: boolean;
  }
}
