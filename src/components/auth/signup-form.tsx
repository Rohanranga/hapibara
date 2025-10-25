"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { signUpSchema } from "@/common/auth-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, Eye, EyeOff, Check, X } from "lucide-react";

type PasswordStrength = {
  score: number;
  label: string;
  requirements: {
    length: boolean;
    letter: boolean;
    number: boolean;
  };
};

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "",
    requirements: { length: false, letter: false, number: false },
  });
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      letter: /[A-Za-z]/.test(password),
      number: /[0-9]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    let label = "";

    if (score === 0) label = "";
    else if (score === 1) label = "Weak";
    else if (score === 2) label = "Fair";
    else label = "Strong";

    return { score, label, requirements };
  };

  const handlePasswordChange = (value: string) => {
    form.setValue("password", value, { shouldValidate: true });
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        ...values,
        mode: "signup",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push("/auth/verify-email");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const password = form.watch("password");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength.score === 1 ? 'text-red-600' :
                          passwordStrength.score === 2 ? 'text-yellow-600' :
                          passwordStrength.score === 3 ? 'text-green-600' :
                          'text-muted-foreground'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      
                      <Progress
                        value={(passwordStrength.score / 3) * 100}
                        className="h-1"
                      />

                      <div className="space-y-1">
                        {Object.entries({
                          "At least 8 characters": passwordStrength.requirements.length,
                          "Contains uppercase letter": /[A-Z]/.test(password),
                          "Contains lowercase letter": /[a-z]/.test(password),
                          "Contains a number": /[0-9]/.test(password),
                          "Contains special character": /[^a-zA-Z0-9]/.test(password),
                        }).map(([requirement, met]) => (
                          <div key={requirement} className="flex items-center gap-2 text-xs">
                            {met ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <X className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className={met ? "text-green-600" : "text-muted-foreground"}>
                              {requirement}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </Form>
  );
}