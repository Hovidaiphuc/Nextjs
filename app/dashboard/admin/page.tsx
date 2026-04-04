"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
     if ((session?.user as any)?.role !== "ADMIN" && status !== "loading") {
        router.push("/login");
     } else if ((session?.user as any)?.role === "ADMIN") {
        fetch("/api/orders")
           .then(r => r.json())
           .then(data => {
              if (Array.isArray(data)) setOrders(data);
           });
     }
  }, [session, status]);

  if (status === "loading" || (session?.user as any)?.role !== "ADMIN") return null;

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-8 flex flex-col">
       <header className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
          <div>
             <h1 className="text-3xl font-black text-white">Quản Trị <span className="text-rose-500">Doanh Thu</span></h1>
             <p className="text-slate-400 text-sm mt-1">Boss Center v3.0 - Hệ thống Enterprise ERP</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-800 rounded-xl p-4 min-w-[200px] text-right">
                 <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest block">Tổng Thu Nhập</span>
                 <span className="text-2xl font-black text-rose-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}</span>
             </div>
             <div className="bg-slate-800 rounded-xl p-4 min-w-[150px] text-right">
                 <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest block">Tổng Số Đơn</span>
                 <span className="text-2xl font-black text-emerald-400">{orders.length} Đơn</span>
             </div>
          </div>
       </header>

       {/* Thanh Điều hướng Chức Năng Của Admin */}
       <div className="flex flex-wrap gap-4 mb-8">
           <Link href="/dashboard/admin/products" className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-6 shadow-xl shadow-rose-500/20 hover:scale-105 transition-transform flex flex-col items-center text-center">
               <svg className="w-10 h-10 text-white mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
               <span className="text-xl font-black text-white">Kho Y Tế</span>
               <span className="text-rose-200 text-xs mt-1 font-medium">Chi tiết Tồn kho & Mỹ phẩm</span>
           </Link>
           <Link href="/dashboard/admin/orders" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform flex flex-col items-center text-center">
               <svg className="w-10 h-10 text-white mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
               <span className="text-xl font-black text-white">Đơn Hàng Giao</span>
               <span className="text-blue-200 text-xs mt-1 font-medium">Kiểm soát hành trình Shippper</span>
           </Link>
           <Link href="/dashboard/admin/users" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform flex flex-col items-center text-center">
               <svg className="w-10 h-10 text-white mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               <span className="text-xl font-black text-white">Hồ Sơ Mật (CRM)</span>
               <span className="text-emerald-200 text-xs mt-1 font-medium">Phân tích hành vi Người Dùng</span>
           </Link>
           <Link href="/dashboard/admin/blogs" className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 shadow-xl shadow-amber-500/20 hover:scale-105 transition-transform flex flex-col items-center text-center">
               <svg className="w-10 h-10 text-white mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
               <span className="text-xl font-black text-white">Tòa Soạn</span>
               <span className="text-amber-200 text-xs mt-1 font-medium">Báo Liễu/Blog</span>
           </Link>
           <Link href="/dashboard/admin/vouchers" className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-6 shadow-xl shadow-pink-500/20 hover:scale-105 transition-transform flex flex-col items-center text-center">
               <svg className="w-10 h-10 text-white mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span className="text-xl font-black text-white">Marketing</span>
               <span className="text-pink-200 text-xs mt-1 font-medium">Vouchers & Sự Kiện</span>
           </Link>
       </div>

       {/* Biểu đồ giả lập nhanh */}
       <div className="flex-1 bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 flex items-center justify-center opacity-10">
               <div className="w-96 h-96 border-8 border-rose-500 rounded-full animate-ping"></div>
           </div>
           <div className="text-center relative z-10">
               <p className="text-2xl font-black text-white tracking-widest uppercase mb-2">Trung Tâm Viễn Thông ERP</p>
               <p className="text-slate-400 font-medium text-sm">Hệ thống đang thu nhận dữ liệu Radar toàn cầu.</p>
           </div>
       </div>
    </div>
  );
}
