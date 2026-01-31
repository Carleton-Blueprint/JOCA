"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button"
import Image from "next/image";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
        {isMounted && !session?.user && (
          <Link href="/signup">
            <Button className="p-2 hover:cursor-pointer">Signup</Button>
          </Link>
        )}
        {isMounted && session?.user && (
          <Button 
            onClick={handleLogout}
            className="p-2 hover:cursor-pointer"
            variant="outline"
          >
            Logout
          </Button>
        )}
        <AnimatedThemeToggler />
      </div>
    </header>
  );
};

export default Header;
