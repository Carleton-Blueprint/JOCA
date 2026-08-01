"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isJocaAdminEmail } from "@/lib/joca-admin";
import { deleteUserAccountCompletely } from "@/lib/delete-user-account";

export type AdminActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

async function requireAdmin(): Promise<
  | { ok: true; adminUserId: string; adminEmail: string }
  | { ok: false; message: string }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { ok: false, message: "You must be signed in." };
  }
  if (!isJocaAdminEmail(session.user.email)) {
    return { ok: false, message: "You are not authorized to manage members." };
  }
  return {
    ok: true,
    adminUserId: session.user.id,
    adminEmail: session.user.email,
  };
}

export async function adminDeleteUserAction(
  formData: FormData,
): Promise<AdminActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { ok: false, message: "Missing user id." };

  if (userId === gate.adminUserId) {
    return { ok: false, message: "You cannot delete your own account here." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!target) {
    return { ok: false, message: "User not found." };
  }

  if (isJocaAdminEmail(target.email)) {
    return {
      ok: false,
      message: "Staff admin accounts cannot be deleted from this screen.",
    };
  }

  try {
    await deleteUserAccountCompletely({
      id: target.id,
      email: target.email,
    });
    revalidatePath("/admin/members");
    revalidatePath("/admin/applications");
    return {
      ok: true,
      message: `Deleted ${target.name} (${target.email}) and cleaned up Stripe billing data.`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to delete user.",
    };
  }
}
