import Link from "next/link";
import Image from "next/image";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import Tabs2 from "./ui/doctabs";

const Header = () => {
  return (
    <header className="mt-2 sm:mt-0 sticky flex flex-col gap-6 sm:flex-row items-center justify-center sm:justify-between p-4 px-8 top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center justify-center sm:justify-between">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between  gap-8">
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
          <Tabs2 />
        </div>
      </div>
      <AnimatedThemeToggler />
    </header>
  );
};

export default Header;
