import type { NextAuthOptions, User } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as z from "zod";
import crypto from "crypto";
import { sendVerificationEmail } from "@/utils/email";

const credsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  name: z.string().min(1, "Name is required").optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //   allowDangerousEmailAccountLinking: false,
    // }),

    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        mode: { label: "Mode", type: "text" },
      },
      async authorize(raw) {
        try {
          const parsed = credsSchema.safeParse(raw);
          if (!parsed.success) {
            throw new Error("Please check your input and try again");
          }

          const { email, password, name, mode } = parsed.data;

          // Check if user exists
          const [existing] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

          // SIGNUP MODE
          if (mode === "signup" || (!existing && name)) {
            if (existing) {
              throw new Error("An account with this email already exists. Please sign in instead.");
            }
            
            if (!name) {
              throw new Error("Name is required to create an account");
            }

            const hash = await bcrypt.hash(password, 12);
            const verificationToken = crypto.randomBytes(32).toString("hex");
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            const [created] = await db
              .insert(users)
              .values({
                email,
                name,
                password: hash,
                provider: "creds",
                isEmailVerified: false,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires,
              })
              .returning();

            // Send verification email
            try {
              await sendVerificationEmail(created.email, verificationToken, created.name);
            } catch (emailError) {
              console.error("Failed to send verification email:", emailError);
              // Don't throw error - allow user to be created but they can resend email
            }

            return {
              id: String(created.id),
              name: created.name,
              email: created.email,
              isEmailVerified: created.isEmailVerified,
              provider: created.provider,
            } as User;
          }

          // SIGNIN MODE
          if (!existing) {
            throw new Error("No account found with this email. Please sign up first.");
          }

          if (existing.provider === "google") {
            throw new Error("This email is registered with Google. Please use 'Continue with Google' to sign in.");
          }

          if (!existing.password) {
            throw new Error("This account doesn't have a password set. Please use Google sign-in or reset your password.");
          }

          const isValidPassword = await bcrypt.compare(password, existing.password);
          if (!isValidPassword) {
            throw new Error("Invalid email or password. Please check your credentials and try again.");
          }

          return {
            id: String(existing.id),
            name: existing.name,
            email: existing.email,
            isEmailVerified: existing.isEmailVerified,
            provider: existing.provider,
          } as User;
        } catch (error) {
          console.error("Auth error:", error);
          throw error instanceof Error ? error : new Error("Authentication failed. Please try again.");
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider !== "google") return true;

        if (!user?.email) {
          console.error("No email provided by Google");
          return false;
        }

        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email));

        if (!existing) {
          // Create user for first-time Google login
          await db.insert(users).values({
            email: user.email,
            name: user.name ?? "Google User",
            provider: "google",
            password: null,
            isEmailVerified: true, // Google accounts are pre-verified
          });
          return true;
        }

        // Update existing user to mark email as verified if signing in with Google
        if (existing.provider === "google" && !existing.isEmailVerified) {
          await db
            .update(users)
            .set({ isEmailVerified: true })
            .where(eq(users.id, existing.id));
        }

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      try {
        if (user?.email) {
          const [u] = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email));
          
          if (u) {
            token.id = u.id;
            token.name = u.name;
            token.email = u.email;
            token.provider = u.provider;
            token.isEmailVerified = u.isEmailVerified;
            token.isAdmin = false;
          }
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },

    async session({ session, token }) {
      if (session.user) {
        type ExtendedUser = typeof session.user & {
          id?: string | number;
          isAdmin?: boolean;
          provider?: string;
          isEmailVerified?: boolean;
        };
        
        const userExt = session.user as ExtendedUser;
        userExt.id = token.id ?? "";
        userExt.name = String(token.name ?? session.user.name);
        userExt.email = String(token.email ?? session.user.email);
        userExt.isAdmin = token.isAdmin ?? false;
        userExt.provider = token.provider;
        userExt.isEmailVerified = Boolean(token.isEmailVerified);
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/home`;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
};