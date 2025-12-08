"use client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

type FooterLinkProps = {
  href: string;
  children: React.ReactNode;
};
const FooterLink = ({ href, children }: FooterLinkProps) => (
  <NavigationMenuLink
    asChild
    className={navigationMenuTriggerStyle() + " bg-transparent"}
  >
    <Link className="dark:text-gray-400 text-gray-700" href={href}>
      {children}
    </Link>
  </NavigationMenuLink>
);

const Footer = () => {
  return (
    <footer className="flex flex-col sm:flex-row justify-center items-center sm:justify-between gap-6 bg-gray-200 dark:bg-gray-800 w-full p-4">
      <div className="flex flex-col gap-4 items-center sm:items-start">
        <Image
          src="/logo.png"
          alt="JOCA Logo"
          width={80}
          height={60}
          className="w-20 h-15"
        />
        <span className="text-center dark:text-gray-400 text-gray-700 max-w-md">
          JOCA - Jamaican Ottawa Community Association
        </span>
        <div className="flex gap-2">
          <Link href="#">
            <FaFacebook size={25} />
          </Link>
          <Link href="#">
            <FaXTwitter size={25} />
          </Link>
          <Link href="#">
            <FaInstagram size={25} />
          </Link>
        </div>
      </div>
      <NavigationMenu>
        <NavigationMenuList className="flex flex-col sm:flex-row gap-6 items-center justify-center">
          <NavigationMenuItem className="flex flex-col justify-center items-center  gap-2">
            <Label className="font-bold py-2 px-4">Quick Links</Label>
            <FooterLink href="/events"> Events</FooterLink>
            <FooterLink href="/about"> About Us</FooterLink>
            <FooterLink href="/signup">Register</FooterLink>
          </NavigationMenuItem>

          <NavigationMenuItem className="flex flex-col items-center gap-2 ">
            <Label className="font-bold py-2 px-4">Contact</Label>
            <FooterLink href="/"> joca@email.com</FooterLink>
            <FooterLink href="/"> (123)-456-7890</FooterLink>
            <FooterLink href="/"> 123 Bank Street, Ottawa</FooterLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </footer>
  );
};

export default Footer;
