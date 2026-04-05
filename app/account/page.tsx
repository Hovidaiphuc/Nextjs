"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

type Tab = "profile" | "addresses" | "orders" | "wishlist" | "notifications";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading" || !session) return null;

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-slate-800 mb-8 tracking-tight">Tài Khoản Của Tôi</h1>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
          {(["profile", "addresses", "orders", "wishlist", "notifications"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${tab === t ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
              {t === "profile" && "👤 "}Hồ sơ
              {t === "addresses" && "📍 "}Địa chỉ
              {t === "orders" && "📦 "}Đơn hàng
              {t === "wishlist" && "❤️ "}Yêu thích
              {t === "notifications" && "🔔 "}Thông báo
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {tab === "profile" && <ProfileTab user={user} session={session} />}

        {/* ADDRESSES TAB */}
        {tab === "addresses" && <AddressesTab />}

        {/* ORDERS TAB */}
        {tab === "orders" && <OrdersTab />}

        {/* WISHLIST TAB */}
        {tab === "wishlist" && <WishlistTab />}

        {/* NOTIFICATIONS TAB */}
        {tab === "notifications" && <NotificationsTab />}
      </div>
    </div>
  );
}

// ── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user, session }: { user: any; session: any }) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    toast.success("Hồ sơ đã được cập nhật!");
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-4">Thông Tin Cá Nhân</h2>
      <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-xl">
        <div className="flex items-center gap-4 mb-4">
          <Image width={64} height={64} src={`https://ui-avatars.com/api/?name=${name}&background=random&size=128`} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-slate-200" />
          <div>
            <span className="font-black text-slate-800 text-lg block">{name}</span>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">{user.role}</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Họ và tên</label>
          <input value={name} onChange={e=>setName(e.target.value)} type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-rose-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-rose-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Số điện thoại</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-rose-500" placeholder="0xxx.xxx.xxx" />
        </div>
        <div className="border-t border-slate-100 pt-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Mật khẩu mới (bỏ trống nếu không đổi)</label>
          <input value={newPassword} onChange={e=>setNewPassword(e.target.value)} type="password" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-rose-500" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={saving} className="w-fit bg-slate-900 text-white font-black uppercase tracking-widest py-4 px-10 rounded-xl hover:bg-rose-500 transition-colors shadow-lg active:scale-95 disabled:opacity-50">
          {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
        </button>
      </form>
    </div>
  );
}

// ── Addresses Tab ────────────────────────────────────────────────────────────
function AddressesTab() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", province: "", district: "", ward: "", detail: "", isDefault: false });

  const load = () => {
    fetch("/api/addresses").then(r => r.json()).then(d => Array.isArray(d) ? setAddresses(d) : null);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.phone || !form.province) { toast.error("Vui lòng điền đầy đủ"); return; }
    const payload = isEditing ? { ...form, id: editId } : form;
    const res = await fetch("/api/addresses", { method: isEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { toast.success(isEditing ? "Cập nhật thành công!" : "Thêm địa chỉ mới!"); resetForm(); load(); }
    else toast.error("Lỗi khi lưu!");
  };

  const remove = async (id: string) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast.success("Đã xóa!");
  };

  const edit = (addr: any) => {
    setForm({ name: addr.name, phone: addr.phone, province: addr.province, district: addr.district, ward: addr.ward, detail: addr.detail, isDefault: addr.isDefault });
    setEditId(addr.id); setIsEditing(true); setShowForm(true);
  };

  const resetForm = () => { setShowForm(false); setIsEditing(false); setEditId(null); setForm({ name: "", phone: "", province: "", district: "", ward: "", detail: "", isDefault: false }); };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6 border-b-2 border-slate-100 pb-4">
        <h2 className="text-2xl font-black text-slate-800">Sổ Địa Chỉ Giao Hàng</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-rose-500 transition-colors shadow-lg">+ Thêm Địa Chỉ</button>
      </div>

      {showForm && (
        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 mb-8">
          <h3 className="font-black text-slate-800 mb-4">{isEditing ? "Hiệu Chỉnh" : "Thêm Mới"}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {(["name", "phone", "province", "district", "ward", "detail"] as const).map(f => (
              <div key={f} className={f === "detail" || f === "ward" ? "col-span-2 md:col-span-1" : ""}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{f === "detail" ? "Địa chỉ chi tiết" : f.charAt(0).toUpperCase() + f.slice(1)}</label>
                <input value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} type={f === "phone" ? "tel" : "text"} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-rose-500" />
              </div>
            ))}
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="accent-rose-500" />
              <label htmlFor="isDefault" className="text-xs font-bold text-slate-500">Đặt làm mặc định</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} className="px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rose-500">{isEditing ? "Lưu" : "Thêm"}</button>
            <button onClick={resetForm} className="px-6 py-3 bg-slate-100 font-bold text-xs rounded-xl hover:bg-slate-200">Hủy</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {addresses.length === 0 && <p className="text-center text-slate-400 py-12 font-bold">Chưa có địa chỉ nào.</p>}
        {addresses.map(addr => (
          <div key={addr.id} className={`p-6 rounded-2xl border-2 ${addr.isDefault ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-slate-800">{addr.name}</span>
                  {addr.isDefault && <span className="text-[10px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-full uppercase">Mặc định</span>}
                  <span className="text-slate-400 font-medium">{addr.phone}</span>
                </div>
                <p className="text-sm text-slate-500">{addr.detail}, {addr.ward}, {addr.district}, {addr.province}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(addr)} className="text-xs font-bold text-slate-400 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-full hover:border-slate-300 transition-colors">Sửa</button>
                <button onClick={() => remove(addr.id)} className="text-xs font-bold text-rose-400 hover:text-rose-600 border border-rose-100 px-3 py-1.5 rounded-full hover:border-rose-300 transition-colors">Xóa</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setOrders(d); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-slate-400 animate-pulse">Đang tải đơn hàng...</div>;

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    CONFIRMED: "bg-blue-50 text-blue-600 border-blue-100",
    PROCESSING: "bg-indigo-50 text-indigo-600 border-indigo-100",
    SHIPPED: "bg-orange-50 text-orange-600 border-orange-100",
    DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
    REFUNDED: "bg-red-50 text-red-500 border-red-100"
  };
  const statusLabels: Record<string, string> = {
    PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PROCESSING: "Đang chuẩn bị",
    SHIPPED: "Đang giao", DELIVERED: "Đã giao", CANCELLED: "Đã hủy", REFUNDED: "Hoàn tiền"
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-4">Lịch Sử Đơn Hàng</h2>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 font-bold mb-4">Chưa có đơn hàng nào.</p>
          <Link href="/products" className="inline-block bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-rose-500 transition-colors">Đến Cửa Hàng</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(o => (
            <Link key={o.id} href={`/account/orders/${o.id}`} className="block p-6 rounded-2xl border-2 border-slate-200 hover:border-rose-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-black text-slate-800 text-lg">#{o.id.slice(-6)}</span>
                  <span className="text-xs text-slate-400 font-medium ml-3">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border ${statusColors[o.status] || "bg-slate-100"}`}>{statusLabels[o.status] || o.status}</span>
                  <span className="text-xl font-black text-rose-500">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(o.totalAmount)}</span>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {(o.items || []).slice(0, 5).map((item: any, i: number) => (
                  <div key={i} className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full font-medium shrink-0">{item.quantity}x {item.product?.name || item.variantName || "Sản phẩm"}</div>
                ))}
                {(o.items || []).length > 5 && <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full shrink-0">+{o.items.length - 5} món</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Wishlist Tab ──────────────────────────────────────────────────────────────
function WishlistTab() {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist").then(r => r.json()).then(d => { if (Array.isArray(d)) setWishlists(d); setLoading(false); });
  }, []);

  const remove = async (productId: string) => {
    await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
    setWishlists(prev => prev.filter(w => w.productId !== productId));
    toast.success("Đã xóa khỏi yêu thích!");
  };

  if (loading) return <div className="text-center py-20 font-bold text-slate-400 animate-pulse">Đang tải...</div>;

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-4">Danh Sách Yêu Thích</h2>
      {wishlists.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 font-bold mb-4">Chưa có sản phẩm yêu thích nào.</p>
          <Link href="/products" className="inline-block bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-rose-500 transition-colors">Khám Phá Cửa Hàng</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlists.map(w => (
            <div key={w.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all group">
              {w.product?.imageUrl && (
                <div className="relative h-48 bg-white">
                  <Image src={w.product.imageUrl} alt={w.product.name} fill className="object-contain p-4" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">{w.product?.name}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-black text-rose-500">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(w.product?.variants?.[0]?.price || w.product?.price)}</span>
                  <button onClick={() => remove(w.productId)} className="text-xs font-bold text-rose-400 hover:text-rose-600 transition-colors">Xóa</button>
                </div>
                <Link href={`/products/${w.productId}`} className="mt-3 block w-full text-center bg-slate-900 text-white font-bold text-xs uppercase tracking-widest py-2.5 rounded-xl hover:bg-rose-500 transition-colors">Xem Sản Phẩm</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────────
function NotificationsTab() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications").then(r => r.json()).then(d => { if (Array.isArray(d)) setNotifications(d); setLoading(false); });
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications/read", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (loading) return <div className="text-center py-20 font-bold text-slate-400 animate-pulse">Đang tải...</div>;

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6 border-b-2 border-slate-100 pb-4">
        <h2 className="text-2xl font-black text-slate-800">Thông Báo {unread > 0 && <span className="ml-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-black">{unread} mới</span>}</h2>
        {unread > 0 && <button onClick={markAllRead} className="text-xs font-bold text-rose-500 hover:text-slate-900 transition-colors border border-rose-200 px-4 py-2 rounded-full">Đánh dấu đã đọc</button>}
      </div>
      <div className="flex flex-col gap-3">
        {notifications.length === 0 && <p className="text-center text-slate-400 py-12 font-bold">Không có thông báo nào.</p>}
        {notifications.map(n => (
          <Link key={n.id} href={n.link || "#"} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${n.isRead ? 'border-slate-100 bg-white' : 'border-rose-200 bg-rose-50'}`}>
            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-rose-500'}`}></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-sm ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</span>
                <span className="text-[10px] text-slate-400 font-medium">{new Date(n.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{n.message}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}