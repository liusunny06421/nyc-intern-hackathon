import type { Metadata } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DormDesign — See it. Style it. Live it.",
  description:
    "Enter your dorm room number and instantly explore a navigable 3D rendering of your actual room. Pull in inspiration, see furniture that physically fits, and shop real products from IKEA and Target.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans selection:bg-blue/20 selection:text-navy">
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
