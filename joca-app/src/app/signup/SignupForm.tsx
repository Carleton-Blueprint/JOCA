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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionReady } from "@/lib/auth-client";
import Loading from "../loading";
import { AlreadyLoggedIn } from "@/components/AlreadyLoggedIn";
import {
  MEMBERSHIP_PLANS,
  type MembershipPlanId,
} from "@/lib/membership-plans";

const planIds = MEMBERSHIP_PLANS.map((p) => p.id) as [
  MembershipPlanId,
  ...MembershipPlanId[],
];

const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    phoneNumber: z
      .string()
      .trim()
      .min(10, "Phone number must be at least 10 digits")
      .regex(
        /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
        "Invalid phone number",
      ),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    requestedPlan: z.enum(planIds, {
      message: "Please select a membership type",
    }),
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
      requestedPlan: undefined,
    },
  });

  async function onSubmit(values: SignupFormValues) {
    await signUp.email(
      {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        name: values.firstName + " " + values.lastName,
        phoneNumber: values.phoneNumber,
        requestedPlan: values.requestedPlan,
        callbackURL: "/pending",
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError(null);
        },
        onSuccess: () => {
          setIsLoading(false);
          if (process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION === "true") {
            toast.success("Account created! Your application is pending review.");
            router.push("/pending");
          } else {
            // Better Auth may return synthetic success for existing emails
            // (anti-enumeration). Keep messaging honest either way.
            toast.success(
              "If this email is available, check your inbox to verify your account.",
            );
            router.push(
              `/email-verification?name=${encodeURIComponent(values.firstName)}&email=${encodeURIComponent(values.email)}`,
            );
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
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md">
                    {error}
                  </div>
                )}

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

                  <FormField
                    control={form.control}
                    name="requestedPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suggested membership type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="space-y-2"
                          >
                            {MEMBERSHIP_PLANS.map((plan) => (
                              <div
                                key={plan.id}
                                className="flex items-center space-x-3 rounded-md border p-3"
                              >
                                <RadioGroupItem value={plan.id} id={plan.id} />
                                <Label
                                  htmlFor={plan.id}
                                  className="cursor-pointer flex-1 leading-5"
                                >
                                  {plan.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          JOCA reviews applications and confirms the final
                          membership type before sending a payment link.
                        </p>
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
