"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function GoogleAuthButton() {
  const handleSignIn = () => {
    signIn("google");
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleSignIn}>
      Sign in with Google
    </Button>
  );
}
