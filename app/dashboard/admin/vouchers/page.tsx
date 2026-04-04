"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminVouchersDashboard() {
  const { data: session, status } = useSession();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [type, setType] = useState("PERCENT"); // PERCENT or FIXED
  const [value, setValue] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchVouchers = () => {
      fetch("/api/admin/vouchers")
         .then(r => r.json())
         .then(data => setVouchers(data));
  };

  useEffect(() => {
     if ((session?.user as any)?.role === "ADMIN") {
        fetchVouchers();
     }
  }, [session]);

  const openNew = () => {
     setEditingId(null);
     setCode(""); setType("PERCENT"); setValue(""); setIsActive(true);
     setIsFormOpen(true);
  }

  const openEdit = (v: any) => {
     setEditingId(v.id);
     setCode(v.code); setType(v.type); setValue(v.value); setIsActive(v.isActive);
     setIsFormOpen(true);
  }

  const handleSave = async (e: React.FormEvent) => {
     e.preventDefault();
     const t = toast.loading("Đang đẩy Hợp Đồng lên CSDL...");
     const payload = { code, type, value: Number(value), isActive };

     if (editingId) {
        const res = await fetch(`/api/admin/vouchers/${editingId}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
        if (res.ok) { toast.success("Hiệu chỉnh Mã Đăng Cấp thành công!", {id: t}); setIsFormOpen(false); fetchVouchers(); } 
        else { toast.error("Đã Sập Mạng!", {id: t}); }
     } else {
        const res = await fetch(`/api/admin/vouchers`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
        if (res.ok) { toast.success("Đúc Ấn Vàng Thành Công!", {id: t}); setIsFormOpen(false); fetchVouchers(); } 
        else { toast.error("Trùng Lặp Tổ Mật Hoặc Lỗi", {id: t}); }
     }
  };

  const handleToggle = async (v: any) => {
      const t = toast.loading("Can thiệp Trạng Thái...");
      const res = await fetch(`/api/admin/vouchers/${v.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ isActive: !v.isActive }) });
      if (res.ok) { toast.success("Xoay Chiều Thành Công", {id: t}); fetchVouchers(); } 
      else { toast.error("Kẹt Cáp", {id: t}); }
  };

  const handleDelete = async (id: string) => {
     if (!confirm("Tuyệt Chiêu Bóp Méo Sự Thật? (Xóa vĩnh viễn Mã)")) return;
     toast.loading("Đang Nghiền Nát...", { id: "delete" });
     const res = await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
     if (res.ok) { toast.success("Nát Bét Thành Công", { id: "delete" }); fetchVouchers(); } 
     else { toast.error("Lõi Sắt Quá Cứng", { id: "delete" }); }
  };

  if (status === "loading" || (session?.user as any)?.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-8 flex flex-col relative w-full h-full">
       <header className="mb-8 flex justify-between items-center z-10">
            <div>
               <h1 className="text-3xl font-black text-white">Quản Trị <span className="text-pink-500">Chiến Dịch Marketing</span></h1>
               <p className="text-slate-400 text-sm mt-1">Đúc rút và Quản lý Các Lệnh Khuyến Mãi (Mã Sale Thần Tốc).</p>
            </div>
            <button onClick={openNew} className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-xl active:scale-95 shadow-pink-900/50">
                + Đúc Mã Mới Giáng Trần
            </button>
       </header>

       <div className="flex-1 overflow-auto z-10 w-full">
           <table className="w-full text-left bg-slate-800 rounded-2xl overflow-hidden border-collapse border border-slate-700 shadow-xl">
               <thead className="bg-slate-950/50 border-b border-slate-700 font-bold text-slate-400 uppercase text-xs tracking-widest text-center">
                   <tr>
                       <th className="p-5 text-left">Chìa Khóa Mã (CODE)</th>
                       <th className="p-5">Cấu Trúc Lõi (Loại)</th>
                       <th className="p-5">Tần Số (Giá Trị)</th>
                       <th className="p-5">Cổng Vận Hành</th>
                       <th className="p-5">Thi hành</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50 text-sm w-full text-center">
                   {vouchers.map(v => (
                       <tr key={v.id} className="hover:bg-slate-700/30 transition-colors w-full">
                           <td className="p-5 text-left font-mono font-black text-pink-400 text-lg tracking-widest">{v.code}</td>
                           <td className="p-5 text-slate-300 font-bold">
                               {v.type === "PERCENT" ? (
                                   <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded text-[10px] uppercase tracking-widest">Trừ Cắt Tỉa Lát (%)</span>
                               ) : (
                                   <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-[10px] uppercase tracking-widest">Ép Giá Cứng (K)</span>
                               )}
                           </td>
                           <td className="p-5 font-black text-white text-lg">
                               {v.type === "PERCENT" ? `${v.value}%` : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.value)}
                           </td>
                           <td className="p-5">
                               <button onClick={() => handleToggle(v)} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${v.isActive ? 'bg-pink-500' : 'bg-slate-600'}`}>
                                   <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${v.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                               </button>
                               <div className="text-[10px] uppercase tracking-widest mt-1 text-slate-400 font-bold">{v.isActive ? 'Mã Mở Cửa' : 'Bị Khóa Mõm'}</div>
                           </td>
                           <td className="p-5 space-x-2">
                               <button onClick={() => openEdit(v)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-white transition-colors">Tái Cấu Trúc</button>
                               <button onClick={() => handleDelete(v.id)} className="px-3 py-1.5 bg-rose-900/50 hover:bg-rose-600 rounded text-xs font-bold text-rose-200 hover:text-white transition-colors">Tiêu Hủy</button>
                           </td>
                       </tr>
                   ))}
                   {vouchers.length===0 && <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-bold">Cục Khuyến Mãi Đang Trống Trơn.</td></tr>}
               </tbody>
           </table>
       </div>

       {/* Kéo Modal Form */}
       {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
             <form onSubmit={handleSave} className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-lg relative z-10 shadow-2xl flex flex-col gap-6">
                 <h2 className="text-2xl font-black text-white border-b border-slate-700 pb-4">{editingId ? "Siêu Chiếu Cáo Kỷ Nguyên Cũ" : "Ban Hành Tinh Thạch Giao Diện"}</h2>
                 
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Đoạn CODE Mộng Tưởng (Khách Sẽ Nhập)</label>
                    <input required value={code} onChange={e=>setCode(e.target.value.toUpperCase())} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-pink-400 font-black text-xl tracking-widest focus:outline-none focus:border-pink-500 transition-colors uppercase" placeholder="TET2026SIEUSALE" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Thể Loại Đạo Luật</label>
                        <select value={type} onChange={r=>setType(r.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-emerald-400 text-sm font-bold focus:outline-none focus:border-pink-500 appearance-none">
                            <option value="PERCENT">Xẻ Phần Trăm %</option>
                            <option value="FIXED">Hất Xuống Tiền VND</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Giá Trị Cụt Hướng</label>
                        <input required value={value} onChange={r=>setValue(r.target.value)} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-300 font-black text-lg focus:outline-none focus:border-pink-500" placeholder="Vd: 50 (là 50%)" />
                    </div>
                 </div>

                 <div className="flex gap-4 mt-6">
                    <button type="submit" className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-pink-900/50 transition-all active:scale-95 text-sm">Ban Tổ Chức Cấp Lệnh</button>
                    <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-all text-sm">Hủy Kế Hoạch</button>
                 </div>
             </form>
          </div>
       )}
    </div>
  );
}
