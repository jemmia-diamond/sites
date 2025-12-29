import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/ui/lenis-provider";
import { WebGLBackground } from "@/components/ui/WebGLBackground";
import { MenuProvider } from "@/components/context/MenuContext";
import { Navigation } from "@/components/ui/Navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jemmia Recap 2025",
  description: "Dấu ấn vươn tầm quốc tế & Bản sắc Việt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased text-foreground`}
      >
        <WebGLBackground />
        <MenuProvider>
          <Navigation />
          <LenisProvider>{children}</LenisProvider>
        </MenuProvider>
      </body>
    </html>
  );
}
