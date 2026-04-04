import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string, sort?: string, skin?: string, brand?: string }> 
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  const sort = sp.sort || "desc";
  const skin = sp.skin || "";
  const brand = sp.brand || "";

  // Prisma Filter Động Y Khoa
  const products = await prisma.product.findMany({
    where: {
      name: { contains: q },
      skinType: skin ? { contains: skin } : undefined,
      brand: brand ? { contains: brand } : undefined
    },
    orderBy: {
      price: sort === "asc" ? "asc" : "desc"
    },
    include: { category: true }
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32">
       <div className="max-w-[90rem] mx-auto px-6 flex flex-col lg:flex-row gap-8">
           
           {/* Sidebar: Trạm Kiểm Soát Dược Phẩm */}
           <aside className="w-full lg:w-72 flex-shrink-0">
               <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 lg:sticky lg:top-28">
                   <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                       <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                       Lưới Y Khoa
                   </h2>
                   
                   <form action="/products" method="GET" className="flex flex-col gap-6">
                       {/* Name Search */}
                       <div>
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Đích Danh Tên</label>
                           <input type="text" name="q" defaultValue={q} placeholder="VD: Retinol..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:border-rose-500" />
                       </div>

                       {/* Skin Type Filter */}
                       <div>
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Sinh Trắc Da</label>
                           <select name="skin" defaultValue={skin} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-rose-500 appearance-none">
                               <option value="">-- Mọi Môi Trường Da --</option>
                               <option value="Da Mụn">Da Mụn / Viêm</option>
                               <option value="Da Nhạy Cảm">Da Mỏng Nhạy Cảm</option>
                               <option value="Da Dầu">Da Dầu Bóng</option>
                               <option value="Da Khô">Da Khô Bong Tróc</option>
                           </select>
                       </div>

                       {/* Thương Hiệu */}
                       <div>
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Gia Tộc (Thương Hiệu)</label>
                           <input type="text" name="brand" defaultValue={brand} placeholder="VD: Obagi, Paula..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:border-rose-500" />
                       </div>

                       {/* Sort */}
                       <div>
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Quy Luật Chuyển Đổi</label>
                           <select name="sort" defaultValue={sort} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-rose-500 appearance-none">
                              <option value="desc">Giá Rớt Dần Xuống</option>
                              <option value="asc">Giá Leo Từ Đáy Kéo Lên</option>
                           </select>
                       </div>

                       <div className="pt-4 border-t border-slate-100">
                           <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-rose-500 hover:shadow-lg shadow-md active:scale-95 transition-all">
                               Kích Hoạt Radar
                           </button>
                           {/* Nút reset */}
                           <Link href="/products" className="block text-center mt-3 text-xs font-bold text-slate-400 hover:text-slate-900 tracking-widest uppercase transition-colors">
                               Tẩy Mờ Toàn Bộ
                           </Link>
                       </div>
                   </form>
               </div>
           </aside>

           {/* Main View */}
           <div className="flex-1">
               {/* Header Khám phá */}
               <div className="mb-10 bg-white p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Trung Tâm Viện Mỹ Phẩm.</h1>
                   <p className="text-slate-500 font-medium">Radar quét được <span className="font-bold text-rose-500">{products.length}</span> Dược liệu trùng khớp với ADN mà bạn yêu cầu.</p>
               </div>

               {/* Sản phẩm Trình bày */}
               {products.length === 0 ? (
                   <div className="w-full py-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white text-center">
                      <span className="text-6xl mb-4 grayscale opacity-20">🧫</span>
                      <h3 className="text-xl font-bold">Lưới Radar Không Quét Thấy Kết Quả!</h3>
                      <p className="text-sm mt-2 max-w-sm">Hãy thử giảm yêu cầu loại da hoặc xóa tên Thương Hiệu đi nhé.</p>
                   </div>
               ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {products.map((p) => (
                         <Link href={`/products/${p.id}`} key={p.id} className="group flex flex-col bg-white p-4 rounded-[2rem] hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-transparent relative">
                             {/* Tag Trạng Thái Kho */}
                             {p.stock === 0 && (
                                <div className="absolute top-6 left-6 z-10 bg-slate-900 text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-lg">CHÁY KHO</div>
                             )}
                             
                             <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 mb-5 flex items-center justify-center p-6 group-hover:-translate-y-1 transition-transform duration-500">
                                 {p.imageUrl ? (
                                     <Image src={p.imageUrl} alt={p.name} fill className={`object-contain p-4 drop-shadow-xl transition-all duration-700 ${p.stock===0 ? 'grayscale opacity-50' : 'group-hover:scale-110'}`} />
                                 ) : (
                                     <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
                                 )}
                             </div>
                             
                             <div className="flex flex-col flex-1 px-2">
                                <div className="flex items-center justify-between mb-2">
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">{p.brand || "Gia Tộc Cổ Ngoại"}</span>
                                </div>
                                <h3 className={`text-base font-bold line-clamp-2 mb-2 transition-colors ${p.stock===0 ? 'text-slate-400' : 'text-slate-800 group-hover:text-rose-600'}`}>{p.name}</h3>
                                
                                <div className="mt-auto pt-4 border-t border-slate-50 flex items-end justify-between">
                                   <div className={`text-xl font-black ${p.stock===0 ? 'text-slate-400' : 'text-slate-900'}`}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</div>
                                </div>
                             </div>
                         </Link>
                      ))}
                   </div>
               )}
           </div>
       </div>
    </div>
  );
}
