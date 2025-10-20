"use client";

import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;


export default function Home() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginFormValues) {
    console.log("Submitted values:", values);
    // do login request here
  }

  return (
    <div className="font-sans flex flex-col items-center justify-items-center min-h-screen gap-16">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-md">
        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription className="mb-4">Enter your email and password to access your account</CardDescription>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-sm space-y-6"
              >
                {/* Email field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit button */}
                <Button type="submit" className="w-full hover:cursor-pointer">
                  Sign In
                </Button>
              </form>
            </Form>
            <div className="flex justify-center items-center">
              <span className="text-sm text-muted-foreground">
                Don't have an account?
              </span>
              <Button className="hover:cursor-pointer" variant="link" size="sm">Register</Button>
            </div>
          </CardHeader>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
