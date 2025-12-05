import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ApolloWrapper from "./apollo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JOCA",
  description: "Jamaican Ottawa Community Association",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ApolloWrapper>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased dark flex flex-col justify-between min-h-screen`}
        >
          <Header />
          {children}

          <Footer />
        </body>
      </ApolloWrapper>
    </html>
  );
}
