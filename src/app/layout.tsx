import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { APP_FULL_NAME } from "@/config/version";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_FULL_NAME,
  description: "Track your working hours and overtime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
