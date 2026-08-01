"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSessionReady, signOut, subscription } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  CreditCard,
  LogOut,
  Bell,
  ClipboardList,
  Wallet,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import type { MembershipTodo } from "@/app/api/me/membership/route";

type MembershipState = {
  stripeBilling: boolean;
  todo: MembershipTodo;
  isAdmin: boolean;
  pendingApplicationCount: number;
};

const EMPTY_STATE: MembershipState = {
  stripeBilling: false,
  todo: null,
  isAdmin: false,
  pendingApplicationCount: 0,
};

const Header = () => {
  const { data: session, isPending } = useSessionReady();
  const [isMounted, setIsMounted] = useState(false);
  const [membership, setMembership] = useState<MembershipState>(EMPTY_STATE);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMembership() {
      if (!session?.user) {
        if (!cancelled) setMembership(EMPTY_STATE);
        return;
      }

      try {
        const res = await fetch("/api/me/membership", {
          credentials: "include",
        });
        if (!res.ok) {
          if (!cancelled) setMembership(EMPTY_STATE);
          return;
        }
        const data = (await res.json()) as Partial<MembershipState>;
        if (!cancelled) {
          setMembership({
            stripeBilling: Boolean(data.stripeBilling),
            todo: data.todo ?? null,
            isAdmin: Boolean(data.isAdmin),
            pendingApplicationCount: Number(data.pendingApplicationCount ?? 0),
          });
        }
      } catch {
        if (!cancelled) setMembership(EMPTY_STATE);
      }
    }

    void loadMembership();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const openBillingPortal = async () => {
    await subscription.billingPortal(
      {
        locale: "auto",
        referenceId: session?.user?.id,
        customerType: "user",
        returnUrl: "/",
        disableRedirect: false,
      },
      {
        onError: () => {
          toast.error(
            "No active membership found. Please purchase a membership first.",
          );
        },
      },
    );
  };

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Failed to log out:", error);
      if (typeof window !== "undefined") {
        window.alert("Logout failed. Please try again.");
      }
    }
  };

  const memberTodoHref =
    membership.todo === "review_application"
      ? "/pending"
      : membership.todo === "complete_payment"
        ? "/payment"
        : null;

  const memberTodoLabel =
    membership.todo === "review_application"
      ? "Review Application"
      : membership.todo === "complete_payment"
        ? "Complete Payment"
        : null;

  const MemberTodoIcon =
    membership.todo === "review_application"
      ? ClipboardList
      : membership.todo === "complete_payment"
        ? Wallet
        : null;

  const showMemberNotification = Boolean(membership.todo);
  const showAdminNotification =
    membership.isAdmin && membership.pendingApplicationCount > 0;
  const showNotificationBell = showMemberNotification || membership.isAdmin;

  const notificationHref = membership.isAdmin
    ? "/admin/applications"
    : (memberTodoHref ?? "/");

  return (
    <header className="mt-2 sm:mt-0 sticky flex flex-col gap-6 sm:flex-row items-center justify-center sm:justify-between p-4 px-8 top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center justify-center sm:justify-between">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <Image
                src="/logo.png"
                alt="JOCA Logo"
                width={60}
                height={40}
                className="w-15 h-10"
              />
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/events"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Events
            </Link>
            {isMounted && !isPending && session?.user && (
              <Link
                href="/elections"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Elections
              </Link>
            )}

            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isPending && <Loader />}
        {isMounted && !isPending && !session?.user && (
          <>
            <Link href="/login">
              <Button variant="ghost" className="p-2 hover:cursor-pointer">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="p-2 hover:cursor-pointer">Sign up</Button>
            </Link>
          </>
        )}
        {isMounted && !isPending && session?.user && (
          <>
            {showNotificationBell && (
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
                asChild
              >
                <Link
                  href={notificationHref}
                  aria-label={
                    showAdminNotification
                      ? `${membership.pendingApplicationCount} applications needing attention`
                      : memberTodoLabel ?? "Notifications"
                  }
                >
                  <Bell className="h-5 w-5" />
                  {showAdminNotification ? (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                      {membership.pendingApplicationCount > 99
                        ? "99+"
                        : membership.pendingApplicationCount}
                    </span>
                  ) : showMemberNotification ? (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
                  ) : null}
                </Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  {(session.user as { image?: string })?.image ? (
                    <Image
                      src={(session.user as { image: string }).image}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {memberTodoHref && memberTodoLabel && MemberTodoIcon && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={memberTodoHref}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <MemberTodoIcon className="h-4 w-4" />
                      {memberTodoLabel}
                    </Link>
                  </DropdownMenuItem>
                )}
                {membership.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/applications"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Applications
                      {membership.pendingApplicationCount > 0 && (
                        <span className="ml-auto rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {membership.pendingApplicationCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                )}
                {(memberTodoHref || membership.isAdmin) && (
                  <DropdownMenuSeparator />
                )}
                <DropdownMenuItem asChild>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                {membership.stripeBilling && (
                  <DropdownMenuItem
                    onSelect={openBillingPortal}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4" />
                    Manage membership
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <AnimatedThemeToggler />
      </div>
    </header>
  );
};

export default Header;
