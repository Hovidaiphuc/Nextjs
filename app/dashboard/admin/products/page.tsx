"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // States Modal
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [img, setImg] = useState("");
  const [desc, setDesc] = useState("");
  const [brand, setBrand] = useState("");
  const [skinType, setSkinType] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [stock, setStock] = useState("10");

  const fetchProducts = () => {
      fetch("/api/products")
         .then(r => r.json())
         .then(data => setProducts(data));
  };

  useEffect(() => {
     if ((session?.user as any)?.role === "ADMIN") {
        fetchProducts();
     }
  }, [session]);

  const openNew = () => {
     setEditingId(null);
     setName(""); setPrice(""); setImg(""); setDesc(""); setBrand(""); setSkinType(""); setIngredients(""); setStock("10");
     setIsFormOpen(true);
  }

  const openEdit = (p: any) => {
     setEditingId(p.id);
     setName(p.name); setPrice(p.price); setImg(p.imageUrl || ""); setDesc(p.description); 
     setBrand(p.brand || ""); setSkinType(p.skinType || ""); setIngredients(p.ingredients || ""); setStock(p.stock?.toString() || "0");
     setIsFormOpen(true);
  }

  const handleSave = async (e: React.FormEvent) => {
     e.preventDefault();
     const t = toast.loading("Đang nấu CSDL...");
     const payload = { 
        name, price: Number(price), description: desc, imageUrl: img,
        brand, skinType, ingredients, stock: Number(stock)
     };

     if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
        if (res.ok) { toast.success("Sửa Lệnh Bài thành công!", {id: t}); setIsFormOpen(false); fetchProducts(); } else { toast.error("Đã Sập!", {id: t}); }
     } else {
        const res = await fetch(`/api/products`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
        if (res.ok) { toast.success("Sinh Hành Công!", {id: t}); setIsFormOpen(false); fetchProducts(); } else { toast.error("Lỗi sinh tồn", {id: t}); }
     }
  };

  const handleDelete = async (id: string) => {
     if (!confirm("Sẽ xóa Vĩnh Viễn?")) return;
     toast.loading("Đang Xóa...", { id: "delete" });
     const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
     if (res.ok) { toast.success("Bốc hơi thành công", { id: "delete" }); fetchProducts(); } else { toast.error("Không bốc hơi được", { id: "delete" }); }
  };

  if (status === "loading" || (session?.user as any)?.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-8 flex flex-col relative">
       <header className="mb-8 flex justify-between items-center z-10">
            <div>
               <h1 className="text-3xl font-black text-white">Quản Trị <span className="text-rose-500">Kho Dược Phẩm</span></h1>
               <p className="text-slate-400 text-sm mt-1">Cập nhật đặc tính Y Khoa và Số lượng Tồn.</p>
            </div>
            <button onClick={openNew} className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-xl active:scale-95 shadow-rose-900/50">
                + Bổ Sung Y Cụ Mới
            </button>
       </header>

       <div className="flex-1 overflow-auto z-10">
           <table className="w-full text-left bg-slate-800 rounded-2xl overflow-hidden border-collapse border border-slate-700 shadow-xl">
               <thead className="bg-slate-950/50 border-b border-slate-700 font-bold text-slate-400 uppercase text-xs tracking-widest">
                   <tr>
                       <th className="p-5">Danh Tính</th>
                       <th className="p-5 text-center">Tồn Kho</th>
                       <th className="p-5">Thương Hiệu & Loại Da</th>
                       <th className="p-5 text-right">Mệnh Giá</th>
                       <th className="p-5 text-center">Nút Lệnh</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50 text-sm">
                   {products.map(p => (
                       <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                           <td className="p-5">
                               <div className="flex items-center gap-3">
                                   {p.imageUrl ? <Image width={40} height={40} src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-md object-cover border border-slate-600" /> : <div className="w-10 h-10 bg-slate-600 rounded-md"></div>}
                                   <div className="font-bold text-slate-200">{p.name}</div>
                               </div>
                           </td>
                           <td className="p-5 text-center">
                               {p.stock === 0 ? <span className="text-rose-500 font-black uppercase text-xs tracking-wider bg-rose-500/10 px-2 py-1 rounded">Cháy Kho</span> : <span className="text-emerald-400 font-black">{p.stock}</span>}
                           </td>
                           <td className="p-5 text-slate-400 font-medium text-xs">
                               <span className="bg-slate-900 px-2 py-1 inline-block mr-2 rounded text-slate-300">{p.brand || "Vô danh"}</span>
                               <span className="bg-blue-900/30 text-blue-400 px-2 py-1 inline-block rounded">{p.skinType || "Mọi Dòng Da"}</span>
                           </td>
                           <td className="p-5 text-right font-black text-rose-300">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</td>
                           <td className="p-5 text-center space-x-2">
                               <button onClick={() => openEdit(p)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-white transition-colors">Hiệu Chỉnh</button>
                               <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 bg-rose-900/50 hover:bg-rose-600 rounded text-xs font-bold text-rose-200 hover:text-white transition-colors">Tiêu Hủy</button>
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
       </div>

       {/* Kéo modal Form Y Khoa */}
       {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
             <form onSubmit={handleSave} className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
                 <h2 className="text-2xl font-black text-white mb-6 border-b border-slate-700 pb-4">{editingId ? "Giải Cứu Dữ Liệu Dược" : "Khai Báo Dược Phẩm Mới"}</h2>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Tên Bí Danh</label>
                        <input required value={name} onChange={r=>setName(r.target.value)} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500" placeholder="Serum Trị Nám..." />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Bảng Giá Đọ Trần (VND)</label>
                        <input required value={price} onChange={r=>setPrice(r.target.value)} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Số lượng Tồn (Stock)</label>
                        <input required value={stock} onChange={r=>setStock(r.target.value)} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none text-emerald-400 font-bold" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Thương Hiệu</label>
                        <input required value={brand} onChange={r=>setBrand(r.target.value)} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none" placeholder="Laroche Posay" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Loại Da Phù Hợp</label>
                        <input required value={skinType} onChange={r=>setSkinType(r.target.value)} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none" placeholder="Da Mụn, Da Nhạy Cảm..." />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Bảng Thành Phần (Mũi Nhọn Y Khoa)</label>
                        <textarea required value={ingredients} onChange={r=>setIngredients(r.target.value)} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-amber-200 text-sm font-mono focus:outline-none focus:border-amber-500" placeholder="Water, BHA, Niacinamide..."></textarea>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Link Ảnh Biểu Trưng</label>
                        <input value={img} onChange={r=>setImg(r.target.value)} type="url" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-400 focus:outline-none text-xs" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Mô Tả Truyền Thông</label>
                        <textarea value={desc} onChange={r=>setDesc(r.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none"></textarea>
                    </div>
                 </div>

                 <div className="mt-8 flex gap-4">
                    <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-rose-900/50 transition-all">Lưu Y Lệnh Độc Tôn</button>
                    <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-all">Đóng Tẩu Cửa</button>
                 </div>
             </form>
          </div>
       )}
    </div>
  );
}
