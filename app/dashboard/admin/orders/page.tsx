"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminOrdersDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/orders") // Re-using GET /api/orders. Wait, we need to make sure GET /api/orders returns all for ADMIN!
      .then((res) => res.json())
      .then((data) => {
        // Mặc định API /api/orders trả về toàn bộ nếu là Admin (Chúng ta sẽ check lại api đó sau bước này)
        setOrders(data);
        setLoading(false);
      });
  };

  useEffect(() => {
     if ((session?.user as any)?.role === "ADMIN") {
        fetchOrders();
     }
  }, [session]);

  const updateStatus = async (id: string, newStatus: string) => {
     const t = toast.loading("Đang điều quân đi giao...");
     const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
     });
     if (res.ok) {
        toast.success("Thay đổi Sắc Lệnh Thành Công!", { id: t });
        fetchOrders();
     } else {
        toast.error("Vỡ trận!", { id: t });
     }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-bold">Đang giở Sổ cái Kế toán...</div>;

  return (
    <div>
        <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Trung Tâm Điều Hành (Logistics)</h1>
        <p className="text-slate-500 font-medium mb-10">Mọi đơn hàng từ các miền tự xưng đều đổ về đây.</p>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100/80">
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/4">Phiếu Xuất Kho</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Tổng Tiền Thu</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Niêm Phong</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Ban Sắc Lệnh</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-6">
                                <div className="font-bold text-sm text-slate-900 mb-1">{o.id}</div>
                                <div className="text-[10px] text-slate-400 tracking-wider font-bold uppercase">{new Date(o.createdAt).toLocaleString('vi-VN')}</div>
                            </td>
                            <td className="px-6 py-6 text-right font-black text-emerald-500">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}
                            </td>
                            <td className="px-6 py-6 text-center">
                                <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${o.status === "DELIVERED" ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : (o.status === "PENDING" || o.status === "PROCESSING" ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-blue-50 text-blue-500 border-blue-100')}`}>
                                   {o.status}
                                </span>
                            </td>
                            <td className="px-6 py-6 flex justify-center gap-2">
                               <button onClick={() => updateStatus(o.id, "PROCESSING")} className="px-3 py-1.5 bg-slate-900 text-white rounded text-[10px] uppercase font-bold hover:bg-slate-700">Đóng Gói</button>
                               <button onClick={() => updateStatus(o.id, "SHIPPED")} className="px-3 py-1.5 bg-blue-500 text-white rounded text-[10px] uppercase font-bold hover:bg-blue-600">Đang Giao</button>
                               <button onClick={() => updateStatus(o.id, "DELIVERED")} className="px-3 py-1.5 bg-emerald-500 text-white rounded text-[10px] uppercase font-bold hover:bg-emerald-600">Hoàn Thành</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {orders.length === 0 && <div className="p-10 text-center text-slate-400 font-bold">Chưa nổ đơn nào hôm nay.</div>}
        </div>
    </div>
  );
}
