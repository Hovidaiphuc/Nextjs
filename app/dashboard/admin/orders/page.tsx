"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  CONFIRMED: "bg-blue-50 text-blue-600 border-blue-100",
  PROCESSING: "bg-indigo-50 text-indigo-600 border-indigo-100",
  SHIPPED: "bg-orange-50 text-orange-600 border-orange-100",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  REFUNDED: "bg-red-50 text-red-500 border-red-100"
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PROCESSING: "Đang chuẩn bị",
  SHIPPED: "Đang giao", DELIVERED: "Đã giao", CANCELLED: "Đã hủy", REFUNDED: "Hoàn tiền"
};

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchOrders = () => {
    fetch("/api/orders")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setOrders(data); setLoading(false); });
  };

  useEffect(() => { if ((session?.user as any)?.role === "ADMIN") fetchOrders(); }, [session]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelectedOrder(null);
    const res = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    setSelectedOrder(data);
    setDetailLoading(false);
  };

  const updateOrder = async (id: string, payload: any) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      toast.success("Cập nhật thành công!");
      fetchOrders();
      openDetail(id);
    } else toast.error("Lỗi cập nhật!");
  };

  const filtered = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search && !(o.customerName || "").toLowerCase().includes(search.toLowerCase()) && !(o.id || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Quản Lý <span className="text-rose-400">Đơn Hàng</span></h1>
          <p className="text-slate-400 text-sm mt-1">{orders.length} đơn hàng</p>
        </div>
        <div className="flex gap-3">
          <input type="text" placeholder="Tìm theo tên / mã đơn..." value={search} onChange={e=>setSearch(e.target.value)} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-rose-500 placeholder-slate-500" />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none appearance-none">
            <option value="">Tất cả</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950/50 border-b border-slate-700">
            <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              <th className="p-5">Mã Đơn / Khách</th>
              <th className="p-5">Ngày đặt</th>
              <th className="p-5 text-center">Trạng Thái</th>
              <th className="p-5 text-right">Tổng Tiền</th>
              <th className="p-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-slate-700/30 cursor-pointer transition-colors" onClick={() => openDetail(o.id)}>
                <td className="p-5">
                  <div className="font-black text-white">{o.id.slice(-6)}</div>
                  <div className="text-xs text-slate-400 font-medium">{o.customerName}</div>
                </td>
                <td className="p-5 text-xs text-slate-400">{new Date(o.createdAt).toLocaleString("vi-VN")}</td>
                <td className="p-5 text-center">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${STATUS_COLORS[o.status] || "bg-slate-100"}`}>{STATUS_LABELS[o.status] || o.status}</span>
                </td>
                <td className="p-5 text-right font-black text-emerald-400">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(o.totalAmount)}</td>
                <td className="p-5 text-center" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openDetail(o.id)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors">Chi Tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-10 text-center text-slate-500 font-bold">Không có đơn hàng nào.</div>}
      </div>

      {/* ORDER DETAIL DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-xl bg-slate-800 h-full overflow-y-auto border-l border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-black text-white">Chi Tiết Đơn Hàng</h2>
                <p className="text-xs text-slate-400 mt-1">#{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Cập nhật trạng thái</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <button key={k} onClick={() => updateOrder(selectedOrder.id, { status: k })} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedOrder.status === k ? 'border-rose-500 bg-rose-500/20 text-rose-400' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>{v}</button>
                  ))}
                </div>
              </div>

              {/* Tracking Number */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Mã vận đơn</label>
                <div className="flex gap-2">
                  <input id="trackingNum" type="text" defaultValue={selectedOrder.trackingNumber || ""} placeholder="Nhập mã vận đơn..." className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-rose-500" />
                  <button onClick={() => { const val = (document.getElementById("trackingNum") as HTMLInputElement)?.value; updateOrder(selectedOrder.id, { trackingNumber: val }); }} className="px-5 py-3 bg-rose-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-rose-500 transition-colors">Cập nhật</button>
                </div>
              </div>

              {/* Payment confirmation for bank transfer */}
              {selectedOrder.paymentMethod === "BANK_TRANSFER" && selectedOrder.paymentStatus === "UNPAID" && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">⚠️ Chưa xác nhận thanh toán</p>
                  <button onClick={() => updateOrder(selectedOrder.id, { paymentStatus: "PAID" })} className="px-5 py-3 bg-emerald-500 text-white font-bold text-xs uppercase rounded-xl hover:bg-emerald-400 transition-colors">Xác Nhận Thanh Toán</button>
                </div>
              )}

              {/* Customer info */}
              <div className="bg-slate-700/50 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-3 text-sm">Khách hàng</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Tên</span><span className="font-bold text-white">{selectedOrder.customerName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="text-white">{selectedOrder.customerEmail}</span></div>
                  <div className="flex justify-between items-start"><span className="text-slate-400">Địa chỉ</span><span className="text-white text-right text-xs max-w-[200px]">{selectedOrder.address}</span></div>
                  {selectedOrder.user?.phone && <div className="flex justify-between"><span className="text-slate-400">Điện thoại</span><span className="text-white">{selectedOrder.user.phone}</span></div>}
                </div>
              </div>

              {/* Order items */}
              <div>
                <h3 className="font-bold text-white mb-3 text-sm">Sản phẩm ({selectedOrder.items?.length})</h3>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item: any, i: number) => (
                    <div key={i} className="flex gap-3 items-center">
                      {item.product?.imageUrl && <Image width={40} height={40} src={item.product.imageUrl} alt="" className="w-10 h-10 rounded-lg object-contain bg-white shrink-0" />}
                      <div className="flex-1">
                        <span className="font-bold text-white text-sm block line-clamp-1">{item.product?.name || item.variantName}</span>
                        {item.variantName && <span className="text-xs text-slate-400">{item.variantName}</span>}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-slate-400 block">x{item.quantity}</span>
                        <span className="font-black text-rose-400 text-sm">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.priceAt * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status logs */}
              {selectedOrder.orderStatusLogs?.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-3 text-sm">Lịch sử trạng thái</h3>
                  <div className="space-y-2">
                    {(selectedOrder.orderStatusLogs || []).map((log: any, i: number) => (
                      <div key={i} className="flex gap-3 text-xs">
                        <span className="text-slate-500 shrink-0">{new Date(log.createdAt).toLocaleString("vi-VN")}</span>
                        <span className="font-bold text-white shrink-0">{STATUS_LABELS[log.status] || log.status}</span>
                        {log.note && <span className="text-slate-400">{log.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-slate-700/50 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-3 text-sm">Tổng kết</h3>
                <div className="space-y-2 text-sm">
                  {selectedOrder.discountAmount > 0 && <div className="flex justify-between"><span className="text-slate-400">Giảm giá</span><span className="text-pink-400">- {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrder.discountAmount)}</span></div>}
                  {selectedOrder.shippingFee > 0 && <div className="flex justify-between"><span className="text-slate-400">Phí vận chuyển</span><span className="text-white">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrder.shippingFee)}</span></div>}
                  <div className="flex justify-between border-t border-slate-600 pt-2">
                    <span className="font-black text-white">Tổng cộng</span>
                    <span className="font-black text-rose-400 text-lg">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}