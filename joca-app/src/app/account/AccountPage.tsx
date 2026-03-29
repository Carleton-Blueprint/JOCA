"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  changePassword,
  deleteUser,
  updateUser,
  useSessionReady,
} from "@/lib/auth-client";
import { Loader } from "@/components/ui/loader";
import { NotLoggedIn } from "@/components/NotLoggedIn";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

const deleteSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;
type DeleteValues = z.infer<typeof deleteSchema>;

function splitName(fullName: string | undefined | null) {
  const name = (fullName || "").trim();
  if (!name) return { firstName: "", lastName: "" };
  const parts = name.split(/\\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

export const AccountPageComponent = () => {
  const router = useRouter();
  const { data: session, isPending } = useSessionReady();
  const [isMounted, setIsMounted] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const initialName = useMemo(
    () => splitName(session?.user?.name),
    [session?.user?.name],
  );

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: initialName.firstName,
      lastName: initialName.lastName,
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const deleteForm = useForm<DeleteValues>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmitProfile = async (values: ProfileValues) => {
    setIsSavingProfile(true);
    try {
      const name = `${values.firstName} ${values.lastName}`.trim();
      const result = await updateUser({ name });
      if (result?.error) {
        toast.error(result.error.message || "Failed to update profile");
        return;
      }
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onSubmitPassword = async (values: PasswordValues) => {
    setIsSavingPassword(true);
    try {
      const result = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });
      if (result?.error) {
        toast.error(result.error.message || "Failed to update password");
        return;
      }
      toast.success("Password updated");
      passwordForm.reset();
    } catch {
      toast.error("Failed to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const onSubmitDelete = async (values: DeleteValues) => {
    setIsDeleting(true);
    try {
      const result = await deleteUser({ password: values.password });
      if (result?.error) {
        toast.error(result.error.message || "Failed to delete account");
        return;
      }
      toast.success("Your account has been deleted");
      router.replace("/goodbye");
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isMounted || isPending) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center gap-4">
        <Loader />
      </div>
    );
  }

  if (!session?.user) {
    return <NotLoggedIn />;
  }

  return (
    <div className="container mx-auto p-8 max-w-3xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground">
          Update your name and password, or delete your account.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onSubmitProfile)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
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
                  control={profileForm.control}
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
              <Button
                type="submit"
                className="hover:cursor-pointer"
                disabled={isSavingProfile}
              >
                {isSavingProfile ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              className="space-y-6"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm new password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="hover:cursor-pointer"
                disabled={isSavingPassword}
              >
                {isSavingPassword ? "Saving..." : "Update password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription>
            Warning, this is a destructive action. This will permanently delete
            your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...deleteForm}>
            <form
              onSubmit={deleteForm.handleSubmit(onSubmitDelete)}
              className="space-y-6"
            >
              <FormField
                control={deleteForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm your password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="destructive"
                className="hover:cursor-pointer"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
