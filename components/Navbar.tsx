"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/app/store/cartStore";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();
  const cart = useCartStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/products", label: "CỬA HÀNG" },
    { href: "/consultation", label: "PHÒNG KHÁM" },
    { href: "/quiz", label: "🤖 BÁC SĨ AI (QUIZ)" },
    { href: "/blogs", label: "📖 TẠP CHÍ" },
  ];

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="font-none flex items-center gap-2 group">
              <span className="text-3xl font-black tracking-tighter text-slate-900 group-hover:text-rose-500 transition-colors">LUX<span className="text-rose-500 group-hover:text-slate-900">.</span></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-tight hidden md:block border-l-2 border-slate-200 pl-2">Medical<br/>Aesthetics</span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8" role="menubar">
             {navLinks.map(link => (
               <Link key={link.href} href={link.href} role="menuitem" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">{link.label}</Link>
             ))}
             <Link href="/#about" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">VỀ CHÚNG TÔI</Link>
          </div>

          {/* Right Area: Cart + Auth */}
          <div className="flex items-center gap-6">
             {/* Cart Button */}
             <Link href="/checkout" aria-label={`Giỏ hàng, ${cart.items.length} sản phẩm`} className="relative group">
                <svg className="w-6 h-6 text-slate-600 group-hover:text-rose-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {cart.items.length > 0 && (
                    <span aria-hidden="true" className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-pulse border-2 border-white shadow-sm">
                        {cart.items.length}
                    </span>
                )}
             </Link>

             {/* Divider */}
             <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

             {/* Auth Area */}
             <div className="relative">
                {status === "loading" ? (
                   <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin"></div>
                ) : status === "authenticated" ? (
                   <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        aria-expanded={dropdownOpen}
                        aria-haspopup="true"
                        aria-label="User menu"
                        className="flex items-center gap-2 focus:outline-none group"
                      >
                          <Image
                            width={40}
                            height={40}
                            src={`https://ui-avatars.com/api/?name=${session.user?.name || 'V'}&background=random`}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:ring-2 ring-rose-500 transition-all"
                            alt="Avatar"
                          />
                          <div className="hidden md:flex flex-col text-left">
                             <span className="text-xs font-bold text-slate-800 line-clamp-1 w-20 leading-tight">{session.user?.name}</span>
                             <span className="text-[10px] font-black text-rose-500 uppercase">{(session.user as any)?.role}</span>
                          </div>
                          <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </button>

                      {dropdownOpen && (
                          <div role="menu" className="absolute top-14 right-0 w-48 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col py-2 animate-in fade-in slide-in-from-top-4">
                              <span className="px-4 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-widest bg-slate-50 mb-1" role="menuitem">Thiết lập</span>
                              {((session.user as any)?.role === "USER") && (
                                 <Link onClick={()=>setDropdownOpen(false)} href="/portal/orders" role="menuitem" className="px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Lịch sử Đơn Hàng</Link>
                              )}
                              {((session.user as any)?.role === "ADMIN") && (
                                 <Link onClick={()=>setDropdownOpen(false)} href="/dashboard/admin/products" role="menuitem" className="px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Hầm Quản Trị</Link>
                              )}
                              {((session.user as any)?.role === "DOCTOR") && (
                                 <Link onClick={()=>setDropdownOpen(false)} href="/dashboard/doctor" role="menuitem" className="px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Khu Vực Bác Sĩ</Link>
                              )}
                              <button
                                onClick={() => { signOut(); setDropdownOpen(false); }}
                                role="menuitem"
                                className="px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 text-left transition-colors border-t border-slate-50"
                              >
                                  Đăng xuất an toàn
                              </button>
                          </div>
                      )}
                   </div>
                ) : (
                   <Link href="/login" className="bg-slate-900 text-white text-xs md:text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-rose-500 transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap">
                       Đăng Nhập
                   </Link>
                )}
             </div>

             {/* Mobile Hamburger */}
             <button
               className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none"
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               aria-expanded={mobileMenuOpen}
               aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
             >
               {mobileMenuOpen ? (
                 <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               ) : (
                 <>
                   <span className="w-6 h-0.5 bg-slate-700 rounded"></span>
                   <span className="w-6 h-0.5 bg-slate-700 rounded"></span>
                   <span className="w-4 h-0.5 bg-slate-700 rounded"></span>
                 </>
               )}
             </button>
          </div>
        </div>

        {/* Mobile Nav Links */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 flex flex-col gap-1" role="menu">
             {navLinks.map(link => (
               <Link
                 key={link.href}
                 href={link.href}
                 role="menuitem"
                 onClick={() => setMobileMenuOpen(false)}
                 className="px-4 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
               >
                 {link.label}
               </Link>
             ))}
             <Link href="/#about" role="menuitem" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">VỀ CHÚNG TÔI</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
