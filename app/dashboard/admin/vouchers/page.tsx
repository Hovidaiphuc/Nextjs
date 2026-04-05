"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminVouchersPage() {
  const { data: session } = useSession();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [form, setForm] = useState({
    code: "", type: "PERCENT", value: "",
    minOrderAmount: "", maxDiscount: "", usageLimit: "", perUserLimit: "1",
    expiryDate: "", isActive: true
  });

  const fetchVouchers = () => {
    fetch("/api/admin/vouchers").then(r => r.json()).then(d => Array.isArray(d) && setVouchers(d));
  };

  useEffect(() => { if ((session?.user as any)?.role === "ADMIN") fetchVouchers(); }, [session]);

  const openNew = () => {
    setEditingId(null);
    setForm({ code: "", type: "PERCENT", value: "", minOrderAmount: "", maxDiscount: "", usageLimit: "", perUserLimit: "1", expiryDate: "", isActive: true });
    setIsFormOpen(true);
  };

  const openEdit = (v: any) => {
    setEditingId(v.id);
    setForm({
      code: v.code, type: v.type, value: v.value?.toString() || "",
      minOrderAmount: v.minOrderAmount?.toString() || "",
      maxDiscount: v.maxDiscount?.toString() || "",
      usageLimit: v.usageLimit?.toString() || "",
      perUserLimit: (v.perUserLimit || 1).toString(),
      expiryDate: v.expiryDate ? new Date(v.expiryDate).toISOString().split("T")[0] : "",
      isActive: v.isActive
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading("Đang xử lý...");
    const payload = {
      code: form.code.toUpperCase(), type: form.type, value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      perUserLimit: Number(form.perUserLimit) || 1,
      expiryDate: form.expiryDate || null,
      isActive: form.isActive
    };

    let res: Response;
    if (editingId) {
      res = await fetch(`/api/admin/vouchers/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      res = await fetch("/api/admin/vouchers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }

    if (res.ok) { toast.success(editingId ? "Cập nhật thành công!" : "Tạo voucher thành công!", { id: t }); setIsFormOpen(false); fetchVouchers(); }
    else { toast.error("Lỗi hệ thống!", { id: t }); }
  };

  const handleToggle = async (v: any) => {
    await fetch(`/api/admin/vouchers/${v.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !v.isActive }) });
    fetchVouchers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa voucher này?")) return;
    await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
    fetchVouchers();
    toast.success("Đã xóa!");
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Quản Trị <span className="text-pink-400">Voucher</span></h1>
          <p className="text-slate-400 text-sm mt-1">Tạo và quản lý mã khuyến mãi</p>
        </div>
        <button onClick={openNew} className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-xl active:scale-95">+ Tạo Mã Mới</button>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950/50 border-b border-slate-700 font-bold text-slate-400 uppercase text-xs tracking-widest">
            <tr>
              <th className="p-5">Mã Code</th>
              <th className="p-5">Loại</th>
              <th className="p-5">Giá trị</th>
              <th className="p-5">Đơn tối thiểu</th>
              <th className="p-5">Giảm tối đa</th>
              <th className="p-5">Lượt dùng</th>
              <th className="p-5 text-center">Trạng thái</th>
              <th className="p-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {vouchers.map(v => (
              <tr key={v.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="p-5 font-mono font-black text-pink-400 text-lg tracking-widest">{v.code}</td>
                <td className="p-5"><span className={`px-3 py-1 rounded text-[10px] font-black uppercase ${v.type === "PERCENT" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>{v.type === "PERCENT" ? "Phần trăm %" : "Cố định VND"}</span></td>
                <td className="p-5 font-black text-white">{v.type === "PERCENT" ? `${v.value}%` : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v.value)}</td>
                <td className="p-5 text-slate-400">{v.minOrderAmount > 0 ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v.minOrderAmount) : "—"}</td>
                <td className="p-5 text-slate-400">{v.maxDiscount ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v.maxDiscount) : "—"}</td>
                <td className="p-5 text-slate-400">{v._count?.usages || 0} / {v.usageLimit || "∞"}</td>
                <td className="p-5 text-center">
                  <button onClick={() => handleToggle(v)} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${v.isActive ? "bg-pink-500" : "bg-slate-600"}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${v.isActive ? "translate-x-7" : "translate-x-1"}`} />
                  </button>
                </td>
                <td className="p-5 text-center space-x-2">
                  <button onClick={() => openEdit(v)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold">Sửa</button>
                  <button onClick={() => handleDelete(v.id)} className="px-3 py-1.5 bg-rose-900/50 hover:bg-rose-600 text-rose-200 hover:text-white rounded text-xs font-bold">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vouchers.length === 0 && <div className="p-10 text-center text-slate-500 font-bold">Chưa có voucher nào.</div>}
      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
          <form onSubmit={handleSave} className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-lg relative z-10 shadow-2xl flex flex-col gap-5">
            <h2 className="text-2xl font-black text-white border-b border-slate-700 pb-4">{editingId ? "Sửa Voucher" : "Tạo Voucher Mới"}</h2>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Mã Code</label>
              <input required value={form.code} onChange={e=>setForm({...form, code: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-pink-400 font-black text-xl tracking-widest focus:outline-none focus:border-pink-500 uppercase" placeholder="TET2026" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Loại</label>
                <select value={form.type} onChange={e=>setForm({...form, type: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-pink-500">
                  <option value="PERCENT">Phần trăm (%)</option>
                  <option value="FIXED">Cố định (VND)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Giá trị</label>
                <input required value={form.value} onChange={e=>setForm({...form, value: e.target.value})} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-black focus:outline-none focus:border-pink-500" placeholder={form.type === "PERCENT" ? "15" : "50000"} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Đơn hàng tối thiểu (VND)</label>
                <input value={form.minOrderAmount} onChange={e=>setForm({...form, minOrderAmount: e.target.value})} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-pink-500" placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Giảm tối đa (VND, %) </label>
                <input value={form.maxDiscount} onChange={e=>setForm({...form, maxDiscount: e.target.value})} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-pink-500" placeholder="Không giới hạn" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Lượt dùng (tổng)</label>
                <input value={form.usageLimit} onChange={e=>setForm({...form, usageLimit: e.target.value})} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-pink-500" placeholder="∞" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Mỗi người</label>
                <input value={form.perUserLimit} onChange={e=>setForm({...form, perUserLimit: e.target.value})} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-pink-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Ngày hết hạn</label>
                <input value={form.expiryDate} onChange={e=>setForm({...form, expiryDate: e.target.value})} type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-pink-500" />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button type="submit" className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-95">{editingId ? "Lưu" : "Tạo Voucher"}</button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-all">Hủy</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}