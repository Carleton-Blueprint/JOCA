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

type FooterLinkProps = {
  href: string;
  children: React.ReactNode;
};
const FooterLink = ({ href, children }: FooterLinkProps) => (
  <NavigationMenuLink
    asChild
    className={navigationMenuTriggerStyle() + " bg-transparent"}
  >
    <Link className="text-gray-500" href={href}>
      {children}
    </Link>
  </NavigationMenuLink>
);

const Footer = () => {
  return (
    <footer className="flex justify-center items-center bg-gray-200 w-full py-8 px-4 h-fit w-full">
      <NavigationMenu>
        <NavigationMenuList className="flex flex-wrap gap-8">
          <NavigationMenuItem className="flex flex-col items-start justify-start gap-4">
            <h2 className="font-bold h2b-1">JOCA</h2>
            <p>Jamaican Ottawa Community Association</p>
          </NavigationMenuItem>

          <NavigationMenuItem className="flex flex-col gap-2">
            <Label className="font-bold py-2 px-4">Quick Links</Label>
            <FooterLink href="/events"> Events</FooterLink>
            <FooterLink href="/about"> About Us</FooterLink>
            <FooterLink href="/members"> Membership</FooterLink>
          </NavigationMenuItem>

          <NavigationMenuItem className="flex flex-col gap-2">
            <Label className="font-bold py-2 px-4">Contact</Label>
            <FooterLink href="/"> joca@email.com</FooterLink>
            <FooterLink href="/"> (123)-456-7890</FooterLink>
            <FooterLink href="/"> 123 Bank Street, Ottawa</FooterLink>
          </NavigationMenuItem>

          <NavigationMenuItem className="flex flex-col gap-2">
            <Label className="font-bold py-2 px-4">
              Follow on Social Media
            </Label>
            <FooterLink href="/"> Facebook</FooterLink>
            <FooterLink href="/"> Twitter</FooterLink>
            <FooterLink href="/"> Instagram</FooterLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </footer>
  );
};

export default Footer;
