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
import Link from "next/link";
import { EmailVerificationPage } from "./EmailVerificationPage";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionReady } from "@/lib/auth-client";
import Loading from "../loading";
import { AlreadyLoggedIn } from "@/components/AlreadyLoggedIn";

const signupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(
        /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
        "Invalid phone number",
      ),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupForm = () => {
  const { data: session, isPending } = useSessionReady();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerificationPageVisible, setIsEmailVerificationPageVisible] =
    useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignupFormValues) {
    await signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.firstName + " " + values.lastName,
        phoneNumber: values.phoneNumber,
        callbackURL: "/payment",
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError(null);
        },
        onSuccess: () => {
          setIsLoading(false);
          toast.success("Account created!");
          if (process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION === "true") {
            router.push("/payment");
          } else {
            setIsEmailVerificationPageVisible(true);
          }
        },
        onError: (ctx: any) => {
          setIsLoading(false);
          setError(ctx?.error?.message || "Signup failed");
        },
      },
    );
  }

  if (!isMounted || isPending) return <Loading />;

  if (session?.user) return <AlreadyLoggedIn />;

  if (
    isEmailVerificationPageVisible &&
    process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION !== "true"
  ) {
    return (
      <EmailVerificationPage
        name={form.getValues("firstName")}
        email={form.getValues("email")}
      />
    );
  }

  return (
    <div className="font-sans my-12 flex flex-col items-center justify-items-center h-full gap-16">
      <main className="flex flex-col p-4 gap-[32px] row-start-2 items-center sm:items-start w-full max-w-2xl">
        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription className="mb-4">
              Enter your information to register for JOCA membership
            </CardDescription>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                {/* Error message */}
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md">
                    {error}
                  </div>
                )}

                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="613-555-0123"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full hover:cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing up..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="flex justify-center items-center mt-6">
              <span className="text-sm text-muted-foreground">
                Already have an account?
              </span>
              <Link href="/login">
                <Button
                  className="hover:cursor-pointer"
                  variant="link"
                  size="sm"
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
};
