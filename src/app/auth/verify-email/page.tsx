"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"pending" | "success" | "error" | "resending">("pending");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const verifyEmail = useCallback(async (verificationToken: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Email verified successfully! You can now sign in.");
        setTimeout(() => router.push("/auth/signin"), 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Email verification failed");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const resendVerification = async () => {
    setStatus("resending");
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Verification email sent! Check your inbox.");
        setStatus("pending");
      } else {
        setMessage(data.error || "Failed to resend verification email");
        setStatus("error");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {status === "pending" && <Loader2 className="h-6 w-6 text-primary animate-spin" />}
              {status === "success" && <CheckCircle className="h-6 w-6 text-green-600" />}
              {status === "error" && <XCircle className="h-6 w-6 text-destructive" />}
              {status === "resending" && <RefreshCw className="h-6 w-6 text-primary animate-spin" />}
              {!token && <Mail className="h-6 w-6 text-primary" />}
            </div>
            <CardTitle className="mt-4">
              {!token ? "Check Your Email" : 
               status === "pending" ? "Verifying Email" :
               status === "success" ? "Email Verified" :
               status === "resending" ? "Sending Email" :
               "Verification Failed"}
            </CardTitle>
            <CardDescription>
              {!token 
                ? "We've sent a verification link to your email address"
                : status === "pending"
                ? "Please wait while we verify your email address"
                : status === "success"
                ? "Your email has been successfully verified"
                : "There was a problem verifying your email"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {message && (
              <Alert variant={status === "error" ? "destructive" : "default"}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {!token && (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Please check your email and click the verification link to activate your account.</p>
                <p>Cant find the email? Check your spam folder.</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {status === "success" && (
                <Button onClick={() => router.push("/auth/signin")} className="w-full">
                  Continue to Sign In
                </Button>
              )}

              {(status === "error" || !token) && (
                <Button
                  onClick={resendVerification}
                  disabled={status === "resending"}
                  variant="outline"
                  className="w-full"
                >
                  {status === "resending" && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Resend Verification Email
                </Button>
              )}

              <Button
                variant={status === "success" ? "outline" : "secondary"}
                onClick={() => router.push("/auth/signin")}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Having trouble? Contact support for assistance
        </div>
      </div>
    </div>
  );
}