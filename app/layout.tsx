import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });

import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: { default: "LUX Derma - Dược Mỹ Phẩm Cao Cấp", template: "%s | LUX Derma" },
  description: "Dược Mỹ Phẩm Cao Cấp và Phòng Khám Da Liễu Trực Tuyến. Sản phẩm được kê toa bởi bác sĩ hàng đầu.",
  keywords: ["mỹ phẩm", "dược phẩm", "chăm sóc da", "serum", "kem dưỡng", "da liễu"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "LUX Derma"
  }
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
            <div className="flex-1">{children}</div>
            <BottomNav />
         </Providers>
      </body>
    </html>
  );
}
