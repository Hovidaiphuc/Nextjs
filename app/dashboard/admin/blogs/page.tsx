"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AdminBlogsDashboard() {
  const { data: session, status } = useSession();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const fetchBlogs = () => {
      fetch("/api/admin/blogs")
         .then(r => r.json())
         .then(data => setBlogs(data));
  };

  useEffect(() => {
     if ((session?.user as any)?.role === "ADMIN") {
        fetchBlogs();
     }
  }, [session]);

  const openNew = () => {
     setEditingId(null);
     setTitle(""); setSlug(""); setCoverImage(""); setContent(""); setTags("");
     setIsFormOpen(true);
  }

  const openEdit = (b: any) => {
     setEditingId(b.id);
     setTitle(b.title); setSlug(b.slug); setCoverImage(b.coverImage || ""); 
     setContent(b.content); setTags(b.tags || "");
     setIsFormOpen(true);
  }

  // Tự động Gen Slug từ Title
  const handleTitleChange = (t: string) => {
      setTitle(t);
      if (!editingId) {
          const generatedSlug = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
          setSlug(generatedSlug);
      }
  };

  const handleSave = async (e: React.FormEvent) => {
     e.preventDefault();
     const t = toast.loading("Đang đẩy Sắc Lệnh lên Báo...");
     const payload = { title, slug, coverImage, content, tags, isPublished: true };

     if (editingId) {
        const res = await fetch(`/api/admin/blogs/${editingId}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
        if (res.ok) { toast.success("Sửa Bài viết thành công!", {id: t}); setIsFormOpen(false); fetchBlogs(); } 
        else { toast.error("Đã Sập Mạng!", {id: t}); }
     } else {
        const res = await fetch(`/api/admin/blogs`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
        if (res.ok) { toast.success("Nổ Thông Cáo Báo Chí!", {id: t}); setIsFormOpen(false); fetchBlogs(); } 
        else { toast.error("Mất Tín Hiệu", {id: t}); }
     }
  };

  const handleDelete = async (id: string) => {
     if (!confirm("Tuyệt Chiêu Xóa Bỏ Bài Báo? Nên cẩn thận SEO url bị lỗi!")) return;
     toast.loading("Đang Đốt Sách...", { id: "delete" });
     const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
     if (res.ok) { toast.success("Đốt sạch sành sanh", { id: "delete" }); fetchBlogs(); } 
     else { toast.error("Có người chữa cháy", { id: "delete" }); }
  };

  if (status === "loading" || (session?.user as any)?.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-8 flex flex-col relative w-full h-full">
       <header className="mb-8 flex justify-between items-center z-10">
            <div>
               <h1 className="text-3xl font-black text-white">Quản Trị <span className="text-amber-500">Tòa Soạn</span></h1>
               <p className="text-slate-400 text-sm mt-1">Cài cắm định hướng Dư Luận, Phát tán kiến thức SEO.</p>
            </div>
            <button onClick={openNew} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-xl active:scale-95 shadow-amber-900/50">
                + Viết Bài Tạp Chí
            </button>
       </header>

       <div className="flex-1 overflow-auto z-10 w-full">
           <table className="w-full text-left bg-slate-800 rounded-2xl overflow-hidden border-collapse border border-slate-700 shadow-xl">
               <thead className="bg-slate-950/50 border-b border-slate-700 font-bold text-slate-400 uppercase text-xs tracking-widest">
                   <tr>
                       <th className="p-5 w-1/2">Tin Tức Khủng</th>
                       <th className="p-5 text-center">Tags</th>
                       <th className="p-5 text-center">Túm Cổ Lọc Mạng</th>
                       <th className="p-5 text-center">Mệnh Lệnh</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50 text-sm w-full">
                   {blogs.map(b => (
                       <tr key={b.id} className="hover:bg-slate-700/30 transition-colors w-full">
                           <td className="p-5 max-w-sm">
                               <div className="flex items-start gap-4">
                                   {b.coverImage ? <Image width={80} height={56} src={b.coverImage} alt={b.title} className="w-20 h-14 rounded-md object-cover border border-slate-600 flex-shrink-0" /> : <div className="w-20 h-14 bg-slate-600 rounded-md flex-shrink-0"></div>}
                                   <div>
                                       <div className="font-bold text-slate-200 line-clamp-2 leading-tight">{b.title}</div>
                                       <div className="text-[10px] uppercase font-bold text-slate-500 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">/{b.slug}</div>
                                   </div>
                               </div>
                           </td>
                           <td className="p-5 text-center text-slate-400 font-bold text-xs">{b.tags || "Vô danh"}</td>
                           <td className="p-5 text-center">
                               <span className="bg-emerald-900/30 text-emerald-400 font-black tracking-widest px-2 py-1 uppercase text-[10px] rounded">Công Khai</span>
                           </td>
                           <td className="p-5 text-center space-x-2">
                               <button onClick={() => openEdit(b)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-white transition-colors">Sửa</button>
                               <button onClick={() => handleDelete(b.id)} className="px-3 py-1.5 bg-rose-900/50 hover:bg-rose-600 rounded text-xs font-bold text-rose-200 hover:text-white transition-colors">Thiêu Đốt</button>
                           </td>
                       </tr>
                   ))}
                   {blogs.length===0 && <tr><td colSpan={4} className="p-10 text-center text-slate-500 font-bold">Chưa có Giấy Báo Cáo.</td></tr>}
               </tbody>
           </table>
       </div>

       {/* Kéo Modal Form Báo Trí */}
       {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
             <form onSubmit={handleSave} className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-4xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-5">
                 <h2 className="text-2xl font-black text-white border-b border-slate-700 pb-4">{editingId ? "Tuyệt Mật Sửa Báo Cáo" : "Khai Sinh Tạp Chí Mới"}</h2>
                 
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Lời Sấm Truyền (Tiêu đề SEO)</label>
                    <input required value={title} onChange={e=>handleTitleChange(e.target.value)} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-bold text-lg focus:outline-none focus:border-amber-500 transition-colors" placeholder="Vd: 3 Bí Quyết Trị Mụn Dứt Điểm Đêm Nay..." />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Giao Thức Địa Chỉ (Slug)</label>
                        <input required value={slug} onChange={r=>setSlug(r.target.value)} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-emerald-400 text-sm focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">URL Ảnh Trưng Bày</label>
                        <input value={coverImage} onChange={r=>setCoverImage(r.target.value)} type="url" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-400 text-sm focus:outline-none focus:border-amber-500" placeholder="https://..." />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Thẻ Tags Thuật Toán (Nhấn Dấu Phẩy)</label>
                    <input value={tags} onChange={r=>setTags(r.target.value)} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-blue-400 text-sm focus:outline-none focus:border-amber-500" placeholder="Skincare, Routine, Trị Mụn..." />
                 </div>

                 <div className="flex-1 min-h-[300px] flex flex-col">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Thiết Lập Nội Dung Bằng Code (Hỗ Trợ HTML Thô)</label>
                    <textarea required value={content} onChange={r=>setContent(r.target.value)} className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl p-5 text-amber-100 text-sm font-mono focus:outline-none focus:border-amber-500 resize-y" placeholder="<h2>Bí mật nằm ở Axit Salicylic...</h2><p>Các chuyên gia chỉ ra...</p>"></textarea>
                 </div>

                 <div className="flex gap-4 mt-4">
                    <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-amber-900/50 transition-all active:scale-95 text-sm">Phóng Vé Đăng Bảng</button>
                    <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-all text-sm">Phong Toả Tạm Thời</button>
                 </div>
             </form>
          </div>
       )}
    </div>
  );
}
