"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button"
import Image from "next/image";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, CreditCard, Bell, LogOut } from "lucide-react";

const Header = () => {
  const { data: session, isPending } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
            {!isPending && session?.user && (
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
              >
                {(session.user as { image?: string })?.image ? (
                  <img
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
              <DropdownMenuItem asChild>
                <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notifications" className="flex items-center gap-2 cursor-pointer">
                  <Bell className="h-4 w-4" />
                  Notifications
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <AnimatedThemeToggler />
      </div>
    </header>
  );
};

export default Header;
