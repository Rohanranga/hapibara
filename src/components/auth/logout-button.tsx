"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: "/auth/signin",
      redirect: true 
    });
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleSignOut}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
