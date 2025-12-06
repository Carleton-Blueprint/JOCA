import Link from "next/link";
import Image from "next/image";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

const Header = () => {
  return (
    <header className="sticky flex flex-col gap-6  sm:flex-row  items-center justify-center sm:justify-between p-4 px-8 top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex  h-24 items-center justify-center sm:justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-8">
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
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Signup
            </Link>
          </nav>
        </div>
      </div>
      <AnimatedThemeToggler />
    </header>
  );
};

export default Header;
