"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. You don't have permission to access this resource.",
  Verification: "The verification token has expired or is invalid.",
  Default: "An error occurred during authentication. Please try again.",
  OAuthSignin: "Error occurred while signing in with OAuth provider.",
  OAuthCallback: "Error occurred in OAuth callback.",
  OAuthCreateAccount: "Could not create OAuth account.",
  EmailCreateAccount: "Could not create email account.",
  Callback: "Error in callback.",
  OAuthAccountNotLinked: "This account is not linked to any OAuth provider.",
  EmailSignin: "Check your email address and password.",
  CredentialsSignin: "Invalid credentials provided.",
  SessionRequired: "Please sign in to access this page.",
  GoogleSignInFailed: "Google sign-in failed. Please try again.",
};

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error") || "Default";
  
  const errorMessage = errorMessages[error] || errorMessages.Default;
  const isAuthError = [
    "AccessDenied",
    "OAuthSignin", 
    "OAuthCallback",
    "OAuthCreateAccount",
    "EmailCreateAccount",
    "Callback",
    "OAuthAccountNotLinked",
    "EmailSignin",
    "CredentialsSignin",
    "GoogleSignInFailed"
  ].includes(error);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="mt-4">Authentication Error</CardTitle>
            <CardDescription>
              We encountered a problem while trying to authenticate you
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>

            {isAuthError && (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Here are some things you can try:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Double-check your email and password</li>
                  <li>Try signing in with a different method</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Disable browser extensions temporarily</li>
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => router.push("/auth/signin")}
                className="w-full"
              >
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          If the problem persists, please contact support
        </div>
      </div>
    </div>
  );
}