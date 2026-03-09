"use client";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { useSession } from "@/lib/auth-client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { toast } from "sonner";
import Loading from "../loading";
import { AlreadyLoggedIn } from "@/components/AlreadyLoggedIn";

//handleSubmit validates the form using this schema
const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Infers types based on schema so no external type declaration necessary
type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize form (React Hook Form provides handleSubmit here)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    await signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError(null);
        },
        onSuccess: () => {
          setIsLoading(false);
          toast.success("Signed in successfully");
          router.push("/");
        },
        onError: (ctx: any) => {
          setIsLoading(false);
          setError(ctx?.error?.message || "Failed to sign in");
        },
      },
    );
  }

  if (!isMounted || isPending) return <Loading />;

  if (session?.user) return <AlreadyLoggedIn />;

  return (
    <div className="font-sans flex flex-col items-center  justify-center gap-16">
      <main className="flex flex-col p-4 gap-[32px] row-start-2 justify-center items-center sm:items-start w-full max-w-md py-6 ">
        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription className="mb-4">
              Enter your email and password to access your account
            </CardDescription>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-sm space-y-6"
              >
                {/* Error message */}
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md">
                    {error}
                  </div>
                )}

                {/* Email field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full hover:cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader /> : "Sign In"}
                </Button>
              </form>
            </Form>
            <div className="flex justify-center items-center">
              <span className="text-sm text-muted-foreground">
                Don't have an account?
              </span>
              <Link href="/signup">
                <Button
                  className="hover:cursor-pointer"
                  variant="link"
                  size="sm"
                >
                  Register
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
};
