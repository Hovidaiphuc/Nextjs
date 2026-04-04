"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Ticket = {
  id: string;
  skinIssue: string;
  status: string;
  user: { name: string; email: string };
  createdAt: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
};

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Prescript State
  const [notes, setNotes] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // AUTH GUARD: Redirect if not a DOCTOR
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && (session?.user as any)?.role !== "DOCTOR") {
      toast.error("Bạn không có quyền truy cập khu vực Bác sĩ!");
      router.push("/");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== "authenticated" || (session?.user as any)?.role !== "DOCTOR") return;

    fetch('/api/consultation')
      .then(r => r.json())
      .then(data => {
         if (Array.isArray(data)) {
           setTickets(data);
         }
      });

    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
         setProducts(data);
         setLoading(false);
      });
  }, [session, status]);

  const handlePrescribe = async () => {
    if (!selectedTicket) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/consultation/prescribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          notes,
          productIds: selectedProductIds
        })
      });
      if (res.ok) {
        toast.success("Đã gửi Phác Đồ Lên Hệ Thống!");
        setSelectedTicket(null);
        setNotes("");
        setSelectedProductIds([]);
      } else {
        const err = await res.json();
        toast.error(err.error || "Có biến cố!");
      }
    } catch(e) {
      console.error(e);
      toast.error("Sập cáp quang!");
    }
    setSubmitting(false);
  };

  const toggleProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar Y Khoa */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col gap-8 shadow-xl relative z-10">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">LUX<span className="text-blue-500">CLINIC</span></h2>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-1 block">Doctor Portal</span>
        </div>
        <nav className="flex flex-col gap-2">
           <a href="#" className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-3 rounded-xl font-bold flex items-center gap-3">
             <span>📥</span>  Ca Khám Chờ Xử Lý
           </a>
           <a href="#" className="px-4 py-3 text-slate-400 font-semibold hover:bg-slate-800 rounded-xl transition-colors">
             <span>📂</span> Lịch Sử Kê Toa
           </a>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border uppercase border-slate-700 flex items-center justify-center font-bold">DR</div>
            <div className="flex flex-col text-sm">
                <span className="font-bold text-slate-200">Trần Vân Anh</span>
                <span className="text-slate-500 text-xs">Da liễu Da thẩm mỹ</span>
            </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 flex flex-col h-screen overflow-hidden">
        <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Trung Tâm Phác Đồ</h1>
        </header>

        <div className="flex flex-1 gap-8 overflow-hidden">
           {/* Cột danh sách hàng chờ */}
           <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                     Hàng chờ ưu tiên ({tickets.length})
                  </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                 {tickets.map(t => (
                    <button 
                       key={t.id} 
                       onClick={() => setSelectedTicket(t)}
                       className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTicket?.id === t.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500/50' : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50 shadow-sm'}`}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-800 text-sm truncate pr-2">{t.user.name}</span>
                          <span className="text-[10px] uppercase font-black tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full ring-1 ring-rose-200">{t.status}</span>
                       </div>
                       <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{t.skinIssue}</p>
                    </button>
                 ))}
              </div>
           </div>

           {/* Cột Chi tiết & Kê toa */}
           <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto relative">
              {!selectedTicket ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
                     <svg className="w-16 h-16 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     <p className="font-medium">Chưa chọn ca bệnh nào.</p>
                 </div>
              ) : (
                 <div className="p-8 flex flex-col gap-8">
                     
                     <section>
                         <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Lược sử Bệnh Lý</h2>
                         <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                             <p className="text-slate-700 text-[15px] leading-relaxed font-medium">"{selectedTicket.skinIssue}"</p>
                         </div>
                     </section>

                     <section>
                         <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Phác Đồ & Lời Khuyên (E-Prescript)</h2>
                         <textarea 
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Nhập chẩn đoán y khoa, nguyên nhân sinh bệnh và cách sử dụng các sản phẩm bên dưới..."
                            className="w-full min-h-[120px] p-4 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm resize-none"
                         />
                     </section>

                     <section>
                         <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Gắn Thuốc / Mỹ Phẩm (Store Link)</h2>
                         {loading ? <p>Đang tải Kho thuốc...</p> : (
                            <div className="grid grid-cols-2 gap-3">
                                {products.map(p => (
                                   <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedProductIds.includes(p.id) ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                                      <input 
                                         type="checkbox" 
                                         className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                         checked={selectedProductIds.includes(p.id)}
                                         onChange={() => toggleProduct(p.id)}
                                      />
                                      <div className="flex flex-col">
                                         <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                                         <span className="text-rose-500 text-xs font-semibold">{p.price.toLocaleString()}đ</span>
                                      </div>
                                   </label>
                                ))}
                            </div>
                         )}
                     </section>

                     <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                         <button 
                             onClick={handlePrescribe}
                             disabled={submitting || !notes || selectedProductIds.length === 0}
                             className="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                         >
                             {submitting ? "Đang phát hành..." : "Hoàn Tất Phác Đồ Điện Tử"}
                         </button>
                     </div>
                 </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
