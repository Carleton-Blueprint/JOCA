import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram } from "react-icons/fa";

type FooterLinkProps = {
  href: string;
  children: React.ReactNode;
};

const FooterLink = ({ href, children }: FooterLinkProps) => (
  <Link
    className="dark:text-gray-400 text-gray-700 hover:underline py-1.5 px-4 text-sm"
    href={href}
  >
    {children}
  </Link>
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
        <span className="text-center sm:text-left dark:text-gray-400 text-gray-700 max-w-md">
          JOCA - Jamaican Ottawa Community Association
        </span>
        <div className="flex gap-2">
          <Link href="https://www.facebook.com/jamcottawa">
            <FaFacebook size={25} />
          </Link>
          <Link href="https://www.instagram.com/jamcottawa/">
            <FaInstagram size={25} />
          </Link>
        </div>
      </div>
      <nav className="flex flex-col sm:flex-row gap-6 items-center justify-center">
        <div className="flex flex-col justify-center items-center gap-2">
          <span className="font-bold py-2 px-4 text-center">Quick Links</span>
          <FooterLink href="/events">Events</FooterLink>
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/signup">Register</FooterLink>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="font-bold py-2 px-4">Contact</span>
          <FooterLink href="mailto:jamaicanottawaassnn@yahoo.ca">
            jamaicanottawaassnn@yahoo.ca
          </FooterLink>
          <FooterLink href="tel:6135239085">613-523-9085</FooterLink>
          <FooterLink href="https://www.google.com/maps/place/404+McArthur+Ave.,+Ottawa,+ON+K1K+1G7/@45.4319279,-75.6516939,17z/data=!3m1!4b1!4m5!3m4!1s0x4cce0566f471709b:0xe33cb508ce8ea425!8m2!3d45.4319279!4d-75.6491243?entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoASAFQAw%3D%3D">
            404 McArthur Ave, Ottawa
          </FooterLink>
        </div>
      </nav>
    </footer>
  );
};

export default Footer;
