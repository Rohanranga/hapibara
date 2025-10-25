"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GoogleAuthButton from "@/components/auth/google-button";
import SignInForm from "@/components/auth/signin-form";
import SignUpForm from "@/components/auth/signup-form";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/home");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-6 min-h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-semibold text-center">Welcome to HapiBara</h1>

      <GoogleAuthButton />

      <div className="text-center text-sm text-muted-foreground">— or —</div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <SignInForm />
        </TabsContent>
        <TabsContent value="signup">
          <SignUpForm />
        </TabsContent>
      </Tabs>
    </main>
  );
}
