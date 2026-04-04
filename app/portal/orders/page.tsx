"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrdersHistory() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
       router.push('/login');
       return;
    }

    if (status === "authenticated") {
        const userId = (session?.user as any)?.id;
        if (userId) {
            setOrders([]);
            fetch(`/api/orders?userId=${userId}`)
              .then(r => r.json())
              .then(data => {
                 if (Array.isArray(data)) setOrders(data);
              })
              .catch(() => setOrders([]));
        }
    }
  }, [status, session, router]);

  if (status === "loading") return (
    <div className="min-h-screen bg-slate-50 font-sans p-8 pt-24 max-w-5xl mx-auto">
      <div className="p-20 text-center animate-pulse font-bold text-slate-400">Đang giở Sổ cái...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8 pt-24 max-w-5xl mx-auto">
        <header className="mb-10 flex gap-4 border-b border-slate-200 pb-4">
            <Link href="/portal" className="text-xl font-bold text-slate-400 hover:text-slate-900 transition-colors">Hồ Sơ Y Tế</Link>
            <h1 className="text-xl font-extrabold text-blue-600 border-b-2 border-blue-600 pb-4 -mb-[18px]">Đơn Hàng Của Tôi</h1>
        </header>

        <div className="flex flex-col gap-6">
           {orders.length === 0 ? (
               <div className="text-center p-12 bg-white rounded-3xl border border-slate-200">
                   <p className="text-slate-400 font-medium">Bạn chưa mua mặt hàng nào.</p>
                   <Link href="/products" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700">Đến Cửa Hàng</Link>
               </div>
           ) : (
               orders.map(o => (
                  <div key={o.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-6">
                          <div>
                             <span className="font-bold text-slate-800 text-lg">Mã đơn: #{o.id}</span>
                             <span className="text-xs font-semibold text-slate-400 block mt-1">Đặt ngày: {new Date(o.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg ring-1 ${o.status === 'PROCESSING' ? 'bg-amber-50 text-amber-600 ring-amber-500/20' : 'bg-green-50 text-green-600 ring-green-500/20'}`}>
                              {o.status === 'PROCESSING' ? 'ĐANG ĐÓNG GÓI' : 'ĐÃ GIAO'}
                          </span>
                      </div>
                      
                      <div className="border border-slate-100 rounded-xl bg-slate-50 p-4 mb-4">
                         {o.items.map((i:any, idx:number) => (
                             <div key={idx} className="flex justify-between text-sm py-2 border-b border-slate-200 last:border-0 font-medium text-slate-700">
                                 <span>{i.quantity} Cái x <span className="text-slate-500">{i.product.name}</span></span>
                             </div>
                         ))}
                      </div>
                      
                      <div className="text-right">
                          <span className="text-sm font-semibold text-slate-500">Tổng tiền:</span> <span className="text-2xl font-black text-rose-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}</span>
                      </div>
                  </div>
               ))
           )}
        </div>
    </div>
  );
}
