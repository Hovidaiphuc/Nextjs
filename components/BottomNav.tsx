"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Only show on mobile, never on dashboard/login/register routes
  if (!mounted) return null;
  if (typeof window !== "undefined" && window.innerWidth >= 768) return null;
  if (!pathname) return null;
  if (pathname.startsWith("/dashboard")) return null;
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) return null;

  const navItems = [
    {
      href: "/",
      label: "Trang chủ",
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? "text-rose-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: "/products",
      label: "Cửa hàng",
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? "text-rose-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      href: "/account?tab=wishlist",
      label: "Yêu thích",
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? "text-rose-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 000 6.364" />
        </svg>
      )
    },
    {
      href: "/account",
      label: "Tài khoản",
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? "text-rose-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href.includes("account") && pathname.startsWith("/account"));
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-0.5 py-1 px-3">
              {item.icon(isActive)}
              <span className={`text-[10px] font-bold tracking-wider ${isActive ? "text-rose-500" : "text-slate-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
