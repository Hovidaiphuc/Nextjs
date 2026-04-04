"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/app/store/cartStore";
import { useRouter } from "next/navigation";

export default function PatientPortal() {
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const cart = useCartStore();
  const router = useRouter();

  useEffect(() => {
    const userId = (session?.user as any)?.id;
    if (userId) {
       fetch(`/api/consultation?userId=${userId}`)
         .then(r => r.json())
         .then(data => {
            if (Array.isArray(data)) setTickets(data);
         });
    }
  }, [session]);

  if (status === "unauthenticated") {
     router.push('/login');
     return (
       <div className="min-h-screen bg-slate-50 font-sans p-8 pt-24 max-w-5xl mx-auto">
         <div className="p-20 text-center animate-pulse font-bold text-slate-400">Đang chuyển hướng...</div>
       </div>
     );
  }

  const addScriptToCart = (products: any[]) => {
     products.forEach(p => {
        cart.addItem({ id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, quantity: 1 });
     });
     router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8 pt-24 max-w-5xl mx-auto">
        <header className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Hồ Sơ Y Tế <span className="text-blue-600">Cá Nhân</span></h1>
            <p className="text-slate-500 mt-2">Xem lại kết quả chẩn đoán và mua thuốc theo toa của bác sĩ.</p>
        </header>

        <div className="flex flex-col gap-6">
           {tickets.length === 0 ? (
               <div className="text-center p-12 bg-white rounded-3xl border border-slate-200">
                   <p className="text-slate-400">Bạn chưa có phiếu khám nào.</p>
                   <a href="/consultation" className="mt-4 inline-block bg-slate-900 text-white px-6 py-2 rounded-xl">Khám ngay</a>
               </div>
           ) : (
               tickets.map(t => (
                  <div key={t.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                      <div className="p-8 md:w-1/3 bg-slate-100 flex flex-col gap-4 border-r border-slate-200">
                          <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-md w-fit ring-1 ${t.status === 'ANSWERED' ? 'bg-green-100 text-green-700 ring-green-500/20' : 'bg-orange-100 text-orange-700 ring-orange-500/20'}`}>
                             {t.status}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{new Date(t.createdAt).toLocaleDateString('vi-VN')}</span>
                          <div className="flex-1 mt-2">
                              <h3 className="text-sm font-bold text-slate-800 mb-1">Vấn đề của bạn:</h3>
                              <p className="text-slate-600 text-sm italic">"{t.skinIssue}"</p>
                          </div>
                      </div>

                      <div className="p-8 flex-1">
                          {t.status === 'PENDING' ? (
                              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium gap-2">
                                  <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></span>
                                  Bác sĩ đang xem xét bệnh án...
                              </div>
                          ) : t.prescription ? (
                              <div className="flex flex-col h-full gap-5">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">DR</div>
                                      <div>
                                          <p className="font-bold text-slate-800 text-sm">{t.doctor?.name || "Bác sĩ Chuyên Khoa"}</p>
                                          <p className="text-xs text-slate-500">Chẩn đoán và Kê đơn</p>
                                      </div>
                                  </div>
                                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                      <p className="text-slate-800 text-sm font-medium leading-relaxed">{t.prescription.notes}</p>
                                  </div>

                                  {t.prescription.products?.length > 0 && (
                                     <div className="mt-auto border-t border-slate-100 pt-5">
                                         <p className="text-sm font-bold text-slate-700 mb-3">Phác đồ Mỹ Phẩm (E-Prescript):</p>
                                         <div className="flex flex-col gap-2 mb-4">
                                            {t.prescription.products.map((p:any) => (
                                               <div key={p.id} className="flex items-center gap-3 text-sm">
                                                   <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                   <span className="font-bold text-slate-800 flex-1">{p.name}</span>
                                                   <span className="text-slate-500">{p.price.toLocaleString()}đ</span>
                                               </div>
                                            ))}
                                         </div>
                                         <button 
                                            onClick={() => addScriptToCart(t.prescription.products)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm"
                                         >
                                            Chuyển Phác Đồ Vào Giỏ Hàng
                                         </button>
                                     </div>
                                  )}
                              </div>
                          ) : null}
                      </div>
                  </div>
               ))
           )}
        </div>
    </div>
  );
}
