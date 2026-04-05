"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [variantTab, setVariantTab] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [img, setImg] = useState("");
  const [desc, setDesc] = useState("");
  const [brand, setBrand] = useState("");
  const [skinType, setSkinType] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [stock, setStock] = useState("10");

  // Variants
  const [variants, setVariants] = useState<any[]>([]);
  const [newVariant, setNewVariant] = useState({ sku: "", name: "", price: "", stock: "", imageUrl: "" });

  // Gallery
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryImage, setNewGalleryImage] = useState("");

  const fetchProducts = () => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); });
  };

  useEffect(() => {
    if ((session?.user as any)?.role === "ADMIN") fetchProducts();
  }, [session]);

  const openNew = () => {
    setEditingId(null);
    setEditingProduct(null);
    setVariantTab(false);
    setName(""); setPrice(""); setImg(""); setDesc(""); setBrand(""); setSkinType(""); setIngredients(""); setStock("10");
    setVariants([]); setGalleryImages([]);
    setIsFormOpen(true);
  };

  const openEdit = async (p: any) => {
    setEditingId(p.id);
    setVariantTab(false);
    setName(p.name); setPrice(p.price); setImg(p.imageUrl || ""); setDesc(p.description);
    setBrand(p.brand || ""); setSkinType(p.skinType || ""); setIngredients(p.ingredients || ""); setStock(p.stock?.toString() || "0");
    setVariants(p.variants || []);
    setGalleryImages(p.images?.map((i: any) => i.url) || []);
    // Fetch full product with variants
    const full = await fetch(`/api/products/${p.id}`).then(r => r.json());
    setVariants(full.variants || []);
    setGalleryImages(full.images?.map((i: any) => i.url) || []);
    setEditingProduct(full);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading("Đang nấu CSDL...");
    const payload = { name, price: Number(price), description: desc, imageUrl: img, brand, skinType, ingredients, stock: Number(stock) };

    let productId = editingId;
    if (editingId) {
      await fetch(`/api/products/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      productId = data.id;
    }

    // Save variants
    if (productId) {
      for (const v of variants) {
        if (v.id) {
          // update via variant API
        } else {
          await fetch("/api/products/" + productId + "/variants", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sku: v.sku, name: v.name, price: Number(v.price), stock: Number(v.stock), imageUrl: v.imageUrl })
          }).catch(() => {});
        }
      }
    }

    toast.success(editingId ? "Cập nhật thành công!" : "Tạo sản phẩm mới!", { id: t });
    setIsFormOpen(false);
    fetchProducts();
  };

  const addVariant = () => {
    if (!newVariant.sku || !newVariant.name || !newVariant.price) { toast.error("Điền đầy đủ SKU, tên, giá!"); return; }
    setVariants(prev => [...prev, { ...newVariant, id: null }]);
    setNewVariant({ sku: "", name: "", price: "", stock: "", imageUrl: "" });
  };

  const removeVariant = (idx: number) => setVariants(prev => prev.filter((_, i) => i !== idx));

  const addGalleryImage = () => {
    if (newGalleryImage.trim()) {
      setGalleryImages(prev => [...prev, newGalleryImage.trim()]);
      setNewGalleryImage("");
    }
  };

  const removeGalleryImage = (idx: number) => setGalleryImages(prev => prev.filter((_, i) => i !== idx));

  const handleDelete = async (id: string) => {
    if (!confirm("Sẽ xóa Vĩnh Viễn?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    toast.success("Đã xóa!");
    fetchProducts();
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-8 flex flex-col relative">
      <header className="mb-8 flex justify-between items-center z-10">
        <div>
          <h1 className="text-3xl font-black text-white">Quản Trị <span className="text-rose-500">Kho Dược Phẩm</span></h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý sản phẩm + Biến thể + Bộ sưu tập ảnh</p>
        </div>
        <button onClick={openNew} className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-xl active:scale-95">+ Sản Phẩm Mới</button>
      </header>

      <div className="flex-1 overflow-auto z-10">
        <table className="w-full text-left bg-slate-800 rounded-2xl overflow-hidden border-collapse border border-slate-700 shadow-xl">
          <thead className="bg-slate-950/50 border-b border-slate-700 font-bold text-slate-400 uppercase text-xs tracking-widest">
            <tr>
              <th className="p-5">Sản phẩm</th>
              <th className="p-5 text-center">Tồn Kho</th>
              <th className="p-5">Thương Hiệu</th>
              <th className="p-5 text-right">Giá</th>
              <th className="p-5 text-center">Biến thể</th>
              <th className="p-5 text-center">Thao tác</th>
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
                <td className="p-5 text-center">{p.stock === 0 ? <span className="text-rose-500 font-black text-xs bg-rose-500/10 px-2 py-1 rounded">Hết hàng</span> : <span className="text-emerald-400 font-black">{p.stock}</span>}</td>
                <td className="p-5 text-slate-400 font-medium text-xs">{p.brand || "—"}</td>
                <td className="p-5 text-right font-black text-rose-300">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price)}</td>
                <td className="p-5 text-center"><span className="text-xs font-bold text-slate-400 bg-slate-700 px-2 py-1 rounded">{(p.variants || []).length} biến thể</span></td>
                <td className="p-5 text-center space-x-2">
                  <button onClick={() => openEdit(p)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold transition-colors">Hiệu Chỉnh</button>
                  <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 bg-rose-900/50 hover:bg-rose-600 text-rose-200 hover:text-white rounded text-xs font-bold transition-colors">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-white mb-2 border-b border-slate-700 pb-4">{editingId ? "Hiệu Chỉnh Sản Phẩm" : "Sản Phẩm Mới"}</h2>

            {/* TABS */}
            {editingId && (
              <div className="flex gap-2 my-4">
                <button onClick={() => setVariantTab(false)} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider ${!variantTab ? 'bg-slate-900 text-white' : 'bg-slate-700 text-slate-400'}`}>Thông Tin</button>
                <button onClick={() => setVariantTab(true)} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider ${variantTab ? 'bg-slate-900 text-white' : 'bg-slate-700 text-slate-400'}`}>Biến Thể ({variants.length})</button>
              </div>
            )}

            {!variantTab ? (
              <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Tên sản phẩm</label>
                  <input required value={name} onChange={r=>setName(r.target.value)} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Giá (VND)</label>
                  <input required value={price} onChange={r=>setPrice(r.target.value)} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Tồn kho (tổng)</label>
                  <input required value={stock} onChange={r=>setStock(r.target.value)} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Thương Hiệu</label>
                  <input value={brand} onChange={r=>setBrand(r.target.value)} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Loại Da</label>
                  <input value={skinType} onChange={r=>setSkinType(r.target.value)} type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Thành phần</label>
                  <textarea value={ingredients} onChange={r=>setIngredients(r.target.value)} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-amber-200 text-sm font-mono focus:outline-none focus:border-rose-500"></textarea>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Link Ảnh Chính</label>
                  <input value={img} onChange={r=>setImg(r.target.value)} type="url" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-400 text-xs focus:outline-none focus:border-rose-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Mô Tả</label>
                  <textarea value={desc} onChange={r=>setDesc(r.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"></textarea>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Bộ Sưu Tập Ảnh</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {galleryImages.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-600" />
                        <button type="button" onClick={() => removeGalleryImage(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newGalleryImage} onChange={e=>setNewGalleryImage(e.target.value)} type="url" placeholder="URL ảnh..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-rose-500" />
                    <button type="button" onClick={addGalleryImage} className="px-4 bg-slate-700 text-white font-bold text-xs rounded-xl hover:bg-slate-600">+ Ảnh</button>
                  </div>
                </div>
                <div className="col-span-2 flex gap-4 mt-4">
                  <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all">{editingId ? "Lưu Thay Đổi" : "Tạo Sản Phẩm"}</button>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-all">Hủy</button>
                </div>
              </form>
            ) : (
              <div>
                {/* Variant List */}
                {variants.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Danh sách biến thể</h3>
                    <div className="space-y-3">
                      {variants.map((v: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-700/50 rounded-xl p-4">
                          {v.imageUrl && <img src={v.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                          <div className="flex-1">
                            <span className="font-bold text-white text-sm">{v.name}</span>
                            <span className="text-xs text-slate-400 ml-2 font-mono">SKU: {v.sku}</span>
                            <div className="flex gap-4 mt-1">
                              <span className="text-xs text-emerald-400 font-bold">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v.price)}</span>
                              <span className="text-xs text-slate-400">{v.stock} trong kho</span>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeVariant(i)} className="text-rose-400 hover:text-rose-300 text-xs font-bold border border-rose-500/30 px-3 py-1 rounded-lg">Xóa</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Variant Form */}
                <div className="bg-slate-700/30 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4">Thêm Biến Thể Mới</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">SKU</label>
                      <input value={newVariant.sku} onChange={e=>setNewVariant({...newVariant, sku: e.target.value})} type="text" className="w-full bg-slate-700 border border-slate-600 rounded-xl p-2.5 text-white text-sm font-mono focus:outline-none focus:border-rose-500" placeholder="30ML-ROSE" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tên biến thể</label>
                      <input value={newVariant.name} onChange={e=>setNewVariant({...newVariant, name: e.target.value})} type="text" className="w-full bg-slate-700 border border-slate-600 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-rose-500" placeholder="30ml / Đỏ 01" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Giá (VND)</label>
                      <input value={newVariant.price} onChange={e=>setNewVariant({...newVariant, price: e.target.value})} type="number" className="w-full bg-slate-700 border border-slate-600 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-rose-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tồn kho</label>
                      <input value={newVariant.stock} onChange={e=>setNewVariant({...newVariant, stock: e.target.value})} type="number" className="w-full bg-slate-700 border border-slate-600 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-rose-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">URL Ảnh (tùy chọn)</label>
                      <input value={newVariant.imageUrl} onChange={e=>setNewVariant({...newVariant, imageUrl: e.target.value})} type="url" className="w-full bg-slate-700 border border-slate-600 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-rose-500" />
                    </div>
                  </div>
                  <button type="button" onClick={addVariant} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors">+ Thêm Biến Thể</button>
                </div>

                <button onClick={() => setVariantTab(false)} className="mt-4 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg">Lưu Biến Thể & Quay Lại</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}