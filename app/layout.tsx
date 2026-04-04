import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });

import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Lux Derma - Luxury Skincare & Clinical",
  description: "Dược Mỹ Phẩm Cao Cấp và Phòng Khám Trực Tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
         <Toaster position="bottom-right" reverseOrder={false} />
         <Providers>
            <Navbar />
            <div className="flex-1 mt-20 md:mt-0">{children}</div>
         </Providers>
      </body>
    </html>
  );
}
