"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/app/store/cartStore";
import toast from "react-hot-toast";

const STATUS_STEPS = [
  { key: "PENDING", label: "Đặt hàng thành công", icon: "✅" },
  { key: "CONFIRMED", label: "Xác nhận thanh toán", icon: "💰" },
  { key: "PROCESSING", label: "Đang chuẩn bị", icon: "📦" },
  { key: "SHIPPED", label: "Đang giao hàng", icon: "🚚" },
  { key: "DELIVERED", label: "Đã giao thành công", icon: "🎉" },
];

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const cart = useCartStore();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders?id=${id}`)
      .then(r => r.json())
      .then(d => { setOrder(d); setLoading(false); });
  }, [id]);

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setCancelling(true);
    const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    if (res.ok) {
      toast.success("Đơn hàng đã được hủy!");
      const refreshed = await fetch(`/api/orders?id=${id}`).then(r => r.json());
      setOrder(refreshed);
    } else {
      const err = await res.json();
      toast.error(err.error || "Không thể hủy đơn");
    }
    setCancelling(false);
  };

  const handleReorder = () => {
    if (!order) return;
    for (const item of order.items) {
      cart.addItem({
        id: item.productId,
        name: item.product?.name || item.variantName || "Sản phẩm",
        price: item.priceAt,
        imageUrl: item.product?.imageUrl || item.variant?.imageUrl || null,
        quantity: item.quantity,
        variantId: item.variantId,
        variantName: item.variantName
      });
    }
    toast.success("Đã thêm vào Túi Hành Trang!");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!order || order.error) return (
    <div className="min-h-screen bg-slate-50 pt-28 px-6 flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-black text-slate-800 mb-4">Không tìm thấy đơn hàng</p>
        <Link href="/account" className="text-rose-500 font-bold hover:underline">← Quay lại Tài Khoản</Link>
      </div>
    </div>
  );

  const currentStep = STATUS_STEPS.findIndex(s => s.key === (order.status === "CANCELLED" ? "PENDING" : order.status));

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/account?tab=orders" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-xs mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Quay lại Đơn Hàng
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Đơn Hàng <span className="text-rose-500">#{order.id.slice(-6)}</span></h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Đặt ngày {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
          </div>
          <div className="flex gap-3">
            {["PENDING", "CONFIRMED"].includes(order.status) && (
              <button onClick={handleCancel} disabled={cancelling} className="px-5 py-2.5 border-2 border-rose-200 text-rose-500 font-bold text-xs uppercase tracking-widest rounded-full hover:bg-rose-50 transition-colors">
                {cancelling ? "Đang hủy..." : "Hủy Đơn"}
              </button>
            )}
            <button onClick={handleReorder} className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-rose-500 transition-colors shadow-lg">
              Mua Lại
            </button>
          </div>
        </div>

        {/* ORDER TIMELINE */}
        {order.status !== "CANCELLED" && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
            <h2 className="text-xl font-black text-slate-800 mb-8">Tình Trạng Giao Hàng</h2>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200" style={{ top: "1.25rem" }}>
                <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${Math.min(100, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }}></div>
              </div>

              <div className="flex justify-between relative">
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i < currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 border-4 transition-all ${isDone ? 'bg-rose-500 border-rose-500 text-white' : isCurrent ? 'bg-white border-rose-500 text-rose-500 shadow-lg shadow-rose-200' : 'bg-white border-slate-200 text-slate-400'}`}>
                        {step.icon}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider text-center max-w-[4rem] leading-tight ${isDone || isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.trackingNumber && (
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">Mã vận đơn</span>
                <span className="font-mono font-black text-blue-600 text-lg">{order.trackingNumber}</span>
              </div>
            )}
          </div>
        )}

        {order.status === "CANCELLED" && (
          <div className="bg-rose-50 border-2 border-rose-200 p-8 rounded-[2.5rem] mb-8 text-center">
            <span className="text-5xl block mb-4">🚫</span>
            <h2 className="text-2xl font-black text-rose-600 mb-2">Đơn Hàng Đã Bị Hủy</h2>
            <p className="text-slate-500 font-medium">Nếu cần hỗ trợ, vui lòng liên hệ bộ phận chăm sóc khách hàng.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ORDER ITEMS */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-4">Danh Sách Sản Phẩm</h2>
            <div className="flex flex-col gap-4">
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                    {item.product?.imageUrl ? <Image src={item.product.imageUrl} alt="" fill className="object-contain p-1" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl">📦</div>}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-slate-800 block">{item.product?.name || item.variantName || "Sản phẩm"}</span>
                    {item.variantName && <span className="text-xs text-slate-400 font-medium">{item.variantName}</span>}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-400 font-medium">x{item.quantity}</span>
                      <span className="font-black text-rose-500">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.priceAt * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ORDER DETAILS */}
          <div className="flex flex-col gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-4">Chi Tiết Đơn Hàng</h2>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm font-medium text-slate-400">Người nhận</span><span className="font-bold text-slate-800">{order.customerName}</span></div>
                <div className="flex justify-between"><span className="text-sm font-medium text-slate-400">Email</span><span className="font-medium text-slate-600">{order.customerEmail}</span></div>
                <div className="flex justify-between"><span className="text-sm font-medium text-slate-400">Địa chỉ</span><span className="font-medium text-slate-600 text-right text-sm max-w-xs">{order.address}</span></div>
                {order.shippingMethod && <div className="flex justify-between"><span className="text-sm font-medium text-slate-400">Vận chuyển</span><span className="font-bold text-slate-800">{order.shippingMethod === "EXPRESS" ? "Hỏa Tốc" : "Tiêu Chuẩn"}</span></div>}
                <div className="flex justify-between"><span className="text-sm font-medium text-slate-400">Thanh toán</span><span className="font-bold text-slate-800">{order.paymentMethod === "COD" ? "COD (Nhận hàng trả tiền)" : "Chuyển khoản"}</span></div>
                {order.bankRef && <div className="flex justify-between"><span className="text-sm font-medium text-slate-400">Mã CK</span><span className="font-mono font-bold text-slate-800">{order.bankRef}</span></div>}
                {order.note && <div className="flex justify-between items-start"><span className="text-sm font-medium text-slate-400">Ghi chú</span><span className="text-sm text-slate-600 text-right max-w-xs">{order.note}</span></div>}
              </div>
            </div>

            {/* ORDER TOTAL */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-4">Thanh Toán</h2>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm font-medium text-slate-400">Tạm tính</span><span className="font-bold text-slate-800">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount + (order.discountAmount || 0) - (order.shippingFee || 0))}</span></div>
                {order.shippingFee > 0 && <div className="flex justify-between"><span className="text-sm font-medium text-slate-400">Phí vận chuyển</span><span className="font-bold text-slate-800">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.shippingFee)}</span></div>}
                {order.discountAmount > 0 && <div className="flex justify-between"><span className="text-sm font-medium text-pink-500">Giảm giá</span><span className="font-bold text-pink-500">- {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.discountAmount)}</span></div>}
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <span className="font-black text-slate-900 uppercase tracking-widest">Tổng Cộng</span>
                  <span className="text-2xl font-black text-rose-500">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}</span>
                </div>
                {order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus === "UNPAID" && (
                  <div className="mt-4">
                    <button onClick={() => { fetch(`/api/orders/${id}/payment-confirm`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }).then(r => r.json()).then(d => { toast.success("Đã xác nhận!"); setOrder(d); }); }} className="w-full py-3 bg-emerald-500 text-white font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-colors shadow-lg">
                      Tôi Đã Chuyển Khoản — Xác Nhận
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}