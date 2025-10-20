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

// type FooterLink = {
//   text: string
//   link: string
// }

// type FooterColumnProps = {
//   links: FooterLink[]
//   title: string
// }

// const FooterColumn = ({ links, title }: FooterColumnProps) => (
//   <>
//     <Label className="font-bold py-2 px-4">{title}</Label>

//     <NavigationMenuItem className="flex flex-col gap-4">
//       <h2 className="font-bold h2b-1">JOCA</h2>
//       <li>Jamaican Ottawa Community Association</li>
//       <Label className="font-bold py-2 px-4">Quick Links</Label>

//       {/* <NavigationMenuLink
//               asChild
//               className={navigationMenuTriggerStyle()}
//             >
//               <Link href="/">Home</Link>
//             </NavigationMenuLink> */}
//     </NavigationMenuItem>
//     {links.map((link: FooterLink) => (
//       <FooterColumnLink link={link} />
//     ))}
//   </>
// )

// type FooterColumnLinkProps = {
//   link: FooterLink
// }
// const FooterColumnLink = ({ link }: FooterColumnLinkProps) => (
//   <NavigationMenuItem className="flex flex-col gap-2">
//     <NavigationMenuLink
//       asChild
//       className={navigationMenuTriggerStyle() + " bg-transparent"}
//     >
//       <Link className="text-gray-500" href={link.link}>{link.text}</Link>
//     </NavigationMenuLink>
//   </NavigationMenuItem>
// )

// const quickLinks: FooterLink[] = [{ text: "Events", link: "/events" }, { text: "About Us", link: "/about" }, { text: "Memberships", link: "/members" }]
// const contactLinks: FooterLink[] = [{ text: "joca", link: "/about" }, { text: "About", link: "/about" }, { text: "About", link: "/about" }]
// const socialsLinks: FooterLink[] = [{text: "", link: ""}]

type FooterLinkProps = {
  href: string
  children: React.ReactNode
}
const FooterLink = ({ href, children }: FooterLinkProps) => (
  <NavigationMenuLink
    asChild
    className={navigationMenuTriggerStyle() + " bg-transparent"}
  >
    <Link className="text-gray-500" href={href}>{children}</Link>
  </NavigationMenuLink>
)

const Footer = () => {
  return (
    <footer className="bg-gray-200 w-full py-8 px-4 h-fit">
      {/* <ol className="flex flex-col gap-4">
          <h2 className="font-bold h2b-1">JOCA</h2>
          <li>Jamaican Ottawa Community Association</li>
        </ol>
        <section className="flex justify-between w-full pr-32">
          <ol className="flex flex-col gap-4 text-sm">
            <h2 className="font-bold pb-1">Quick Links</h2>
            <li className="text-gray-500">Events</li>
            <li className="text-gray-500">About Us</li>
            <li className="text-gray-500">Membership</li>
          </ol>
          <ol className="flex flex-col gap-4 text-sm">
            <h2 className="font-bold pb-1">Contact</h2>
            <li className="text-gray-500">joca@email.com</li>
            <li className="text-gray-500">(012)-345-6789</li>
            <li className="text-gray-500">123, Main Street, Ottawa</li>
          </ol>
          <ol className="flex flex-col gap-4 text-sm">
            <h2 className="font-bold pb-1">Follow on Social Media</h2>
            <li className="text-gray-500">Facebook</li>
            <li className="text-gray-500">Twitter</li>
            <li className="text-gray-500">Instagram</li>
          </ol>
        </section> */}

      <NavigationMenu>
        <NavigationMenuList className="flex gap-8">
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
            <Label className="font-bold py-2 px-4">Follow on Social Media</Label>
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
