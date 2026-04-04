"use client";

import { useCartStore } from "@/app/store/cartStore";
import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const cart = useCartStore();
  const [success, setSuccess] = useState(false);
  const total = cart.getTotal();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>("");

  // Nền tảng Marketing: VOUCHERS
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  const handleApplyVoucher = async () => {
      if (!voucherCode.trim()) return toast.error("Phải nhập Mã mới có quà!");
      setVoucherLoading(true);
      const tid = toast.loading("Đang soi Mã trên Hệ thống...", { id: "vc" });
      try {
          const res = await fetch("/api/vouchers/verify", { 
             method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: voucherCode }) 
          });
          const data = await res.json();
          if (res.ok) {
              setAppliedVoucher(data.voucher);
              toast.success("Săn Sale Thành công!", { id: tid });
          } else {
              setAppliedVoucher(null);
              toast.error(data.error || "Mã Giả Mạo!", { id: tid });
          }
      } catch (error) { toast.error("Đứt Cáp Trạm Chốt!", { id: tid }); }
      setVoucherLoading(false);
  };

  const removeVoucher = () => {
      setAppliedVoucher(null); setVoucherCode("");
  };

  // Tính Nước Cuối: Hậu Sale
  let finalDiscount = 0;
  if (appliedVoucher) {
      if (appliedVoucher.type === "PERCENT") {
          finalDiscount = total * (appliedVoucher.value / 100);
      } else {
          finalDiscount = appliedVoucher.value;
      }
      if (finalDiscount > total) finalDiscount = total; // Không được giảm âm tiền
  }

  const finalTotal = total - finalDiscount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           customerName,
           customerEmail,
           address,
           totalAmount: finalTotal, // Bứt Lãi Cuối
           items: cart.items
        })
      });

      if (res.ok) {
         const data = await res.json();
         setOrderId(data.order.id);
         setSuccess(true);
         cart.clearCart();
         toast.success("Quyết Toán Lệnh thành công!", { duration: 4000 });
      } else { toast.error("Có Lỗ Hổng Biên Giới."); }
    } catch (e) { toast.error("Trạm Quyết toán Khựng."); }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ký Duyệt Hành Lý Thành Công!</h1>
          <p className="text-slate-500 mt-2 font-medium">Bưu tá nhận lệnh với Chữ Ký Giao Dịch <b className="uppercase bg-emerald-50 px-2 text-emerald-600 rounded">#{orderId.slice(-6)}</b></p>
          <a href="/products" className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-500 transition-all shadow-lg active:scale-95">Trở Lại Đầu Cầu Sắm Hàng</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-6 font-sans">
      <div className="max-w-[70rem] mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Form Nhập Khẩu */}
        <form onSubmit={handleCheckout} className="flex-1 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h2 className="text-3xl font-black text-slate-800 mb-8 border-b-2 border-slate-100 pb-4">Giấy Tờ Quá Cảnh</h2>
          
          <div className="flex flex-col gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Căn Cước Cá Nhân</label>
              <input value={customerName} onChange={e=>setCustomerName(e.target.value)} required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-rose-500 transition-all" placeholder="Nguyễn Văn Đại Gia" />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tín Hiệu Lưu Mạng (Email)</label>
              <input value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} required type="email" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-rose-500 transition-all" placeholder="gioi_sieu_giau@..." />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tọa Độ Đáp Hàng Cuối (Địa Chỉ Nhận)</label>
              <input value={address} onChange={e=>setAddress(e.target.value)} required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-rose-500 transition-all" placeholder="Tòa tháp Tài chính..." />
            </div>
          </div>

          <button type="submit" disabled={cart.items.length === 0 || loading} className="mt-12 w-full bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-rose-500 disabled:opacity-50 disabled:bg-slate-300 shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
            {loading ? "Đang Bắn Xác Minh..." : "Ký Duyệt Nộp Tiền (COD)"}
          </button>
        </form>

        {/* Tóm tắt giỏ hàng & Mã Vouchers */}
        <div className="w-full lg:w-[30%] flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full">
            <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">Túi Y Tế</h3>
            
            {cart.items.length === 0 ? (
              <p className="text-slate-400 text-sm font-bold text-center py-10">Túi Của Bạn Đang Trống Cát.</p>
            ) : (
              <div className="flex flex-col gap-5 overflow-auto flex-1">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    {item.imageUrl && (
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <span className="text-sm font-black text-slate-800 truncate">{item.name}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Mã Lệnh Tích Hợp: {item.quantity} Chai</span>
                      <span className="text-sm font-black text-rose-500">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* INPUT MARKETING VOUCHERS */}
            <div className="mt-8 pt-6 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Thẻ Quyền Lực (Khuyến Mãi)</label>
                {!appliedVoucher ? (
                    <div className="flex gap-2">
                        <input value={voucherCode} onChange={e=>setVoucherCode(e.target.value.toUpperCase())} type="text" className="w-full uppercase font-bold text-pink-500 bg-pink-50 border border-pink-100 px-4 py-3 rounded-xl focus:outline-none" placeholder="MAGIAMGIA..." />
                        <button disabled={voucherLoading} onClick={handleApplyVoucher} type="button" className="bg-pink-500 text-white font-black text-xs px-4 rounded-xl uppercase hover:bg-pink-600 transition-colors">ÁP</button>
                    </div>
                ) : (
                    <div className="bg-pink-50 border border-pink-200 p-4 rounded-xl flex items-center justify-between border-dashed">
                        <div>
                            <span className="text-xs font-bold text-pink-600 uppercase block tracking-widest">ĐÃ KÍCH BƯỚC KHÓA</span>
                            <span className="text-lg font-black text-pink-500">{appliedVoucher.code}</span>
                        </div>
                        <button type="button" onClick={removeVoucher} className="w-8 h-8 flex items-center justify-center bg-rose-100 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-colors">✕</button>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t-2 border-slate-900 bg-slate-50 -mx-8 -mb-8 p-8 rounded-b-[2.5rem]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-500 uppercase tracking-widest">Khối Lượng Thô</span>
                <span className="font-bold text-slate-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-xs text-pink-500 uppercase tracking-widest">Trợ Cấp Marketing</span>
                <span className="font-bold text-pink-500">- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalDiscount)}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="font-black text-sm text-slate-900 uppercase tracking-widest">Tổng Cuối Chốt</span>
                <span className="text-3xl font-black text-slate-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
