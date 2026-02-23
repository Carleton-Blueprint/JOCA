import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ApolloWrapper from "./apollo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jamaican Ottawa Community Association",
  description:
    "A Little Piece of Jamaica in the Nation’s Capital of Canada, Ottawa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <ApolloWrapper>
        <body
          className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden antialiased flex flex-col justify-between min-h-screen`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            {children}

            <Toaster position="top-center" richColors />
            <Footer />
          </ThemeProvider>
        </body>
      </ApolloWrapper>
    </html>
  );
}
