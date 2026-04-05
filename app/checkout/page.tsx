"use client";

import { useCartStore } from "@/app/store/cartStore";
import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AddressForm, { type AddressData } from "@/components/AddressForm";

const SHIPPING_STANDARD = 30000;
const SHIPPING_EXPRESS = 50000;
const FREE_SHIPPING_THRESHOLD = 500000;

const BANK_INFO = {
  name: "LUX DERMA JSC",
  bank: "Vietcombank (VCB)",
  account: "1234567890",
  branch: "TP.HCM"
};

export default function CheckoutPage() {
  const cart = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();

  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState(session?.user?.email || "");

  // Address
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Address form fields
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrProvince, setAddrProvince] = useState("");
  const [addrDistrict, setAddrDistrict] = useState("");
  const [addrWard, setAddrWard] = useState("");
  const [addrDetail, setAddrDetail] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addressFormData, setAddressFormData] = useState<Partial<AddressData>>({});

  // Shipping
  const [shippingMethod, setShippingMethod] = useState<"STANDARD" | "EXPRESS" | "FREE">("STANDARD");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK_TRANSFER">("COD");
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankRef, setBankRef] = useState("");

  // Voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [note, setNote] = useState("");

  const total = cart.getTotal();

  // Load saved addresses
  useEffect(() => {
    if (session) {
      fetch("/api/addresses")
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAddresses(data);
            const def = data.find((a: any) => a.isDefault);
            if (def) setSelectedAddressId(def.id);
          }
        });
    }
  }, [session]);

  const subtotal = total;

  // Shipping fee
  const shippingFee = shippingMethod === "EXPRESS" ? SHIPPING_EXPRESS
    : shippingMethod === "FREE" || subtotal >= FREE_SHIPPING_THRESHOLD ? 0
    : SHIPPING_STANDARD;

  const effectiveShippingFee = subtotal >= FREE_SHIPPING_THRESHOLD && shippingMethod !== "EXPRESS" ? 0 : shippingFee;

  // Discount
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === "PERCENT") {
      discountAmount = subtotal * (appliedVoucher.value / 100);
      if (appliedVoucher.maxDiscount) discountAmount = Math.min(discountAmount, appliedVoucher.maxDiscount);
    } else {
      discountAmount = appliedVoucher.value;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }
  discountAmount = Math.round(discountAmount);

  const finalTotal = Math.max(0, subtotal + effectiveShippingFee - discountAmount);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return toast.error("Phải nhập Mã mới có quà!");
    setVoucherLoading(true);
    const tid = toast.loading("Đang soi Mã trên Hệ thống...", { id: "vc" });
    try {
      const res = await fetch("/api/orders/apply-voucher", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode, subtotal })
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedVoucher(data.voucher);
        toast.success(`Tiết kiệm được ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(data.discount)}!`, { id: tid });
      } else {
        toast.error(data.error || "Mã Giả Mạo!", { id: tid });
      }
    } catch (e) { toast.error("Đứt Cáp Trạm Chốt!", { id: tid }); }
    setVoucherLoading(false);
  };

  const saveAddress = async () => {
    if (!addrName || !addrPhone || !addrProvince || !addrDistrict || !addrWard || !addrDetail) {
      toast.error("Vui lòng điền đầy đủ thông tin"); return;
    }
    const payload = { name: addrName, phone: addrPhone, province: addrProvince, district: addrDistrict, ward: addrWard, detail: addrDetail, isDefault: addrIsDefault };
    const url = isEditingAddress ? "/api/addresses" : "/api/addresses";
    const method = isEditingAddress ? "PUT" : "POST";
    if (isEditingAddress) (payload as any).id = editingAddressId;

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        toast.success(isEditingAddress ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ mới!");
        const refreshed = await fetch("/api/addresses").then(r => r.json());
        if (Array.isArray(refreshed)) {
          setAddresses(refreshed);
          if (!isEditingAddress) setSelectedAddressId(refreshed[0]?.id);
        }
        resetAddressForm();
      } else {
        toast.error("Lỗi khi lưu địa chỉ");
      }
    } catch { toast.error("Lỗi kết nối!"); }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedAddressId === id) setSelectedAddressId(null);
  };

  const editAddress = (addr: any) => {
    setIsEditingAddress(true);
    setEditingAddressId(addr.id);
    setAddrName(addr.name); setAddrPhone(addr.phone);
    setAddrProvince(addr.province); setAddrDistrict(addr.district);
    setAddrWard(addr.ward); setAddrDetail(addr.detail);
    setAddrIsDefault(addr.isDefault);
    setAddressFormData({ name: addr.name, phone: addr.phone, province: addr.province, district: addr.district, ward: addr.ward, detail: addr.detail });
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setShowAddressForm(false); setIsEditingAddress(false); setEditingAddressId(null);
    setAddrName(""); setAddrPhone(""); setAddrProvince(""); setAddrDistrict("");
    setAddrWard(""); setAddrDetail(""); setAddrIsDefault(false);
    setAddressFormData({});
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) return;

    if (paymentMethod === "BANK_TRANSFER") {
      setShowBankModal(true);
      return;
    }

    await processOrder();
  };

  const processOrder = async (ref?: string) => {
    setLoading(true);
    setShowBankModal(false);

    const addressObj = addresses.find(a => a.id === selectedAddressId);
    const addressStr = addressObj
      ? `${addressObj.detail}, ${addressObj.ward}, ${addressObj.district}, ${addressObj.province}`
      : `${addrDetail}, ${addrWard}, ${addrDistrict}, ${addrProvince}`;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName || session?.user?.name || "Khách",
          customerEmail: customerEmail || session?.user?.email || "",
          address: addressStr,
          addressId: selectedAddressId || undefined,
          shippingMethod,
          paymentMethod,
          voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
          note,
          bankRef: ref,
          items: cart.items.map(i => ({
            id: i.id, name: i.name, price: i.price,
            imageUrl: i.imageUrl, quantity: i.quantity,
            variantId: i.variantId, variantName: i.variantName
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOrderId(data.order.id);
        setSuccess(true);
        cart.clearCart();
        toast.success("Quyết Toán Lệnh thành công!", { duration: 4000 });
      } else {
        const err = await res.json();
        toast.error(err.error || "Có Lỗ Hổng Biên Giới.");
      }
    } catch (e) { toast.error("Trạm Quyết toán Khựng."); }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center flex flex-col items-center max-w-md">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ký Duyệt Hành Lý Thành Công!</h1>
          <p className="text-slate-500 mt-2 font-medium">Bưu tá nhận lệnh với Chữ Ký Giao Dịch <b className="uppercase bg-emerald-50 px-2 text-emerald-600 rounded">#{orderId.slice(-6)}</b></p>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl w-full text-left">
            <p className="text-sm text-slate-500 font-medium mb-2">Theo dõi đơn hàng:</p>
            <Link href={`/account/orders/${orderId}`} className="text-rose-500 font-bold text-sm hover:underline">Xem chi tiết & Timeline →</Link>
          </div>
          <Link href="/products" className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-500 transition-all shadow-lg active:scale-95">Trở Lại Đầu Cầu Sắm Hàng</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-6 font-sans">
      <div className="max-w-[75rem] mx-auto flex flex-col lg:flex-row gap-12">

        {/* LEFT: FORM */}
        <form onSubmit={handleCheckout} className="flex-1 flex flex-col gap-8">

          {/* 1. CUSTOMER INFO */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">1</span>
              Giấy Tờ Quá Cảnh
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Căn Cước Cá Nhân</label>
                <input value={customerName} onChange={e=>setCustomerName(e.target.value)} required type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-rose-500 transition-all" placeholder="Nguyễn Văn Đại Gia" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                <input value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} required type="email" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-rose-500 transition-all" placeholder="email@..." />
              </div>
            </div>
          </div>

          {/* 2. SHIPPING ADDRESS */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6 border-b-2 border-slate-100 pb-4">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">2</span>
                Tọa Độ Giao Hàng
              </h2>
              <button type="button" onClick={() => { resetAddressForm(); setShowAddressForm(true); }} className="text-xs font-bold text-rose-500 hover:text-slate-900 transition-colors border border-rose-200 hover:border-slate-300 px-4 py-2 rounded-full">+ Thêm Địa Chỉ Mới</button>
            </div>

            {/* Saved addresses */}
            {addresses.length > 0 && !showAddressForm && (
              <div className="flex flex-col gap-3 mb-6">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1 accent-rose-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">{addr.name}</span>
                        {addr.isDefault && <span className="text-[10px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Mặc định</span>}
                        <span className="text-slate-400 font-medium text-sm">{addr.phone}</span>
                      </div>
                      <p className="text-sm text-slate-500">{addr.detail}, {addr.ward}, {addr.district}, {addr.province}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => editAddress(addr)} className="text-xs text-slate-400 hover:text-slate-900 font-bold px-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 transition-colors">Sửa</button>
                      <button type="button" onClick={() => deleteAddress(addr.id)} className="text-xs text-rose-400 hover:text-rose-600 font-bold px-3 py-1 rounded-full border border-rose-100 hover:border-rose-300 transition-colors">Xóa</button>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Address Form — Province/District/Ward dropdowns */}
            {showAddressForm && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-widest">{isEditingAddress ? "Hiệu Chỉnh Địa Chỉ" : "Thêm Địa Chỉ Mới"}</h3>
                <AddressForm
                  value={addressFormData}
                  onChange={(addr) => {
                    setAddressFormData(addr);
                    setAddrName(addr.name);
                    setAddrPhone(addr.phone);
                    setAddrProvince(addr.province);
                    setAddrDistrict(addr.district);
                    setAddrWard(addr.ward);
                    setAddrDetail(addr.detail);
                  }}
                  compact
                />
                <div className="mt-4 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addrIsDefault} onChange={e => setAddrIsDefault(e.target.checked)} className="accent-rose-500" />
                    <span className="text-xs font-bold text-slate-500">Đặt làm địa chỉ mặc định</span>
                  </label>
                </div>
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={saveAddress} className="px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rose-500 transition-colors">{isEditingAddress ? "Lưu Thay Đổi" : "Thêm Địa Chỉ"}</button>
                  <button type="button" onClick={resetAddressForm} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors">Hủy</button>
                </div>
              </div>
            )}

            {/* Quick address fallback for guests */}
            {!session && !showAddressForm && (
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tọa Độ Chi Tiết (Fallback)</label>
                <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-rose-500" placeholder="123 Đường ABC, Phường X, Quận Y, TP.HCM" />
              </div>
            )}
          </div>

          {/* 3. SHIPPING METHOD */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">3</span>
              Phương Thức Vận Chuyển
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { id: "STANDARD", label: "Tiêu Chuẩn", desc: "3-5 ngày", fee: subtotal >= FREE_SHIPPING_THRESHOLD ? "MIỄN PHÍ" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(SHIPPING_STANDARD) },
                { id: "EXPRESS", label: "Hỏa Tốc", desc: "1-2 ngày", fee: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(SHIPPING_EXPRESS) },
              ].map(opt => (
                <label key={opt.id} className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${shippingMethod === opt.id ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" name="shipping" value={opt.id} checked={shippingMethod === opt.id} onChange={() => setShippingMethod(opt.id as any)} className="accent-rose-500 w-4 h-4" />
                    <div>
                      <span className="font-bold text-slate-800 block">{opt.label}</span>
                      <span className="text-xs text-slate-400 font-medium">{opt.desc}</span>
                    </div>
                  </div>
                  <span className="font-black text-rose-500">{opt.fee}</span>
                </label>
              ))}
            </div>
            {subtotal >= FREE_SHIPPING_THRESHOLD && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <span className="text-emerald-600 font-bold text-sm">🎉 Đơn hàng trên 500.000đ — Miễn phí vận chuyển!</span>
              </div>
            )}
          </div>

          {/* 4. PAYMENT METHOD */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">4</span>
              Hình Thức Thanh Toán
            </h2>
            <div className="flex flex-col gap-3">
              <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "COD" ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="accent-rose-500 w-4 h-4" />
                <div>
                  <span className="font-bold text-slate-800 block">💵 Thanh toán khi nhận hàng (COD)</span>
                  <span className="text-xs text-slate-400 font-medium">Trả tiền mặt cho người giao hàng</span>
                </div>
              </label>
              <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "BANK_TRANSFER" ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="payment" value="BANK_TRANSFER" checked={paymentMethod === "BANK_TRANSFER"} onChange={() => setPaymentMethod("BANK_TRANSFER")} className="accent-rose-500 w-4 h-4" />
                <div>
                  <span className="font-bold text-slate-800 block">🏦 Chuyển khoản ngân hàng</span>
                  <span className="text-xs text-slate-400 font-medium">Chuyển khoản trước qua VietComBank</span>
                </div>
              </label>
            </div>
          </div>

          {/* NOTE */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Ghi chú đơn hàng (tùy chọn)</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-rose-500 resize-none" placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..." />
          </div>

          <button type="submit" disabled={cart.items.length === 0 || loading || (!selectedAddressId && !session && !showAddressForm)} className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-rose-500 disabled:opacity-50 disabled:bg-slate-300 shadow-xl shadow-slate-900/20 active:scale-95 transition-all text-base">
            {loading ? "Đang Bắn Xác Minh..." : paymentMethod === "BANK_TRANSFER" ? "Xem Thông Tin Chuyển Khoản →" : "Ký Duyệt Nộp Tiền (COD)"}
          </button>
        </form>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="w-full lg:w-[35%] flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">Túi Y Tế</h3>

            {cart.items.length === 0 ? (
              <p className="text-slate-400 text-sm font-bold text-center py-10">Túi Của Bạn Đang Trống Cát.</p>
            ) : (
              <div className="flex flex-col gap-5 overflow-auto flex-1 max-h-80">
                {cart.items.map(item => (
                  <div key={item.id + (item.variantId || "")} className="flex gap-4 items-center">
                    {item.imageUrl && (
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <span className="text-sm font-black text-slate-800 truncate">{item.name}</span>
                      {item.variantName && <span className="text-[10px] text-slate-400 font-medium">{item.variantName}</span>}
                      <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Mã Lệnh: {item.quantity} Chai</span>
                      <span className="text-sm font-black text-rose-500">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Voucher */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Thẻ Quyền Lực (Khuyến Mãi)</label>
              {!appliedVoucher ? (
                <div className="flex gap-2">
                  <input value={voucherCode} onChange={e=>setVoucherCode(e.target.value.toUpperCase())} type="text" className="w-full uppercase font-bold text-pink-500 bg-pink-50 border border-pink-100 px-4 py-3 rounded-xl focus:outline-none" placeholder="MAGIAMGIA..." />
                  <button disabled={voucherLoading} onClick={handleApplyVoucher} type="button" className="bg-pink-500 text-white font-black text-xs px-4 rounded-xl uppercase hover:bg-pink-600 transition-colors disabled:opacity-50">ÁP</button>
                </div>
              ) : (
                <div className="bg-pink-50 border border-pink-200 p-4 rounded-xl flex items-center justify-between border-dashed">
                  <div>
                    <span className="text-xs font-bold text-pink-600 uppercase block tracking-widest">ĐÃ KÍCH HOẠT</span>
                    <span className="text-lg font-black text-pink-500">{appliedVoucher.code}</span>
                  </div>
                  <button type="button" onClick={() => { setAppliedVoucher(null); setVoucherCode(""); }} className="w-8 h-8 flex items-center justify-center bg-rose-100 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-colors">✕</button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t-2 border-slate-900 bg-slate-50 -mx-8 -mb-8 p-8 rounded-b-[2.5rem]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-500 uppercase tracking-widest">Khối Lượng Thô</span>
                <span className="font-bold text-slate-600">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-500 uppercase tracking-widest">Vận chuyển</span>
                <span className={`font-bold ${effectiveShippingFee === 0 ? "text-emerald-500" : "text-slate-600"}`}>
                  {effectiveShippingFee === 0 ? "MIỄN PHÍ" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(effectiveShippingFee)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-pink-500 uppercase tracking-widest">Trợ Cấp Marketing</span>
                  <span className="font-bold text-pink-500">- {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discountAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="font-black text-sm text-slate-900 uppercase tracking-widest">Tổng Cuối Chốt</span>
                <span className="text-3xl font-black text-slate-900">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BANK TRANSFER MODAL */}
      {showBankModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowBankModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full relative z-10 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-800 mb-2">Chuyển Khoản Ngân Hàng</h2>
            <p className="text-sm text-slate-500 mb-6">Vui lòng chuyển đúng số tiền và nhập mã giao dịch bên dưới.</p>

            <div className="bg-slate-50 rounded-2xl p-6 mb-6 space-y-3">
              <div className="flex justify-between"><span className="text-xs font-bold text-slate-400 uppercase">Ngân hàng</span><span className="font-black text-slate-800">{BANK_INFO.bank}</span></div>
              <div className="flex justify-between"><span className="text-xs font-bold text-slate-400 uppercase">Tài khoản</span><span className="font-mono font-black text-slate-800">{BANK_INFO.account}</span></div>
              <div className="flex justify-between"><span className="text-xs font-bold text-slate-400 uppercase">Tên TK</span><span className="font-bold text-slate-800">{BANK_INFO.name}</span></div>
              <div className="flex justify-between"><span className="text-xs font-bold text-slate-400 uppercase">Chi nhánh</span><span className="font-medium text-slate-600">{BANK_INFO.branch}</span></div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Số tiền</span>
                <span className="text-xl font-black text-rose-500">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(finalTotal)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Nội dung chuyển khoản (copy)</label>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center font-mono font-black text-rose-500 text-lg tracking-widest">
                LUXDERMA {customerName || "KHACH"}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Mã giao dịch (nếu có)</label>
              <input value={bankRef} onChange={e=>setBankRef(e.target.value)} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-rose-500" placeholder="VD: VCB123456789" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => processOrder(bankRef)} disabled={loading} className="flex-1 bg-rose-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-rose-600 transition-colors active:scale-95 disabled:opacity-50">
                {loading ? "Đang xử lý..." : "Xác Nhận Đã Chuyển Khoản"}
              </button>
              <button onClick={() => setShowBankModal(false)} className="px-6 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}