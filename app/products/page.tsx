import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string, sort?: string, skin?: string, brand?: string, page?: string }>
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  const sort = sp.sort || "desc";
  const skin = sp.skin || "";
  const brand = sp.brand || "";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const limit = 12;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        name: { contains: q },
        skinType: skin ? { contains: skin } : undefined,
        brand: brand ? { contains: brand } : undefined
      },
      orderBy: { price: sort === "asc" ? "asc" : "desc" },
      skip,
      take: limit,
      include: { category: true, images: { orderBy: { isPrimary: "desc" } }, variants: { orderBy: { price: "asc" } } }
    }),
    prisma.product.count({
      where: {
        name: { contains: q },
        skinType: skin ? { contains: skin } : undefined,
        brand: brand ? { contains: brand } : undefined
      }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32">
      <div className="max-w-[90rem] mx-auto px-6 flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 lg:sticky lg:top-28">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Lưới Y Khoa
            </h2>

            <form action="/products" method="GET" className="flex flex-col gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Đích Danh Tên</label>
                <input type="text" name="q" defaultValue={q} placeholder="VD: Retinol..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:border-rose-500" />
              </div>

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

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Gia Tộc (Thương Hiệu)</label>
                <input type="text" name="brand" defaultValue={brand} placeholder="VD: Obagi, Paula..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:border-rose-500" />
              </div>

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
                <Link href="/products" className="block text-center mt-3 text-xs font-bold text-slate-400 hover:text-slate-900 tracking-widest uppercase transition-colors">
                  Tẩy Mờ Toàn Bộ
                </Link>
              </div>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-10 bg-white p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Trung Tâm Viện Mỹ Phẩm.</h1>
              <p className="text-slate-500 font-medium">Radar quét được <span className="font-bold text-rose-500">{total}</span> Dược liệu trùng khớp.</p>
            </div>
            {(q || skin || brand) && (
              <div className="hidden md:flex items-center gap-2 flex-wrap">
                {q && <span className="text-xs font-bold bg-rose-100 text-rose-600 px-3 py-1 rounded-full">"{q}"</span>}
                {skin && <span className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">{skin}</span>}
                {brand && <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full">{brand}</span>}
              </div>
            )}
          </div>

          {products.length === 0 ? (
            <div className="w-full py-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white text-center">
              <span className="text-6xl mb-4 grayscale opacity-20">🧫</span>
              <h3 className="text-xl font-bold">Lưới Radar Không Quét Thấy Kết Quả!</h3>
              <p className="text-sm mt-2 max-w-sm">Hãy thử giảm yêu cầu loại da hoặc xóa tên Thương Hiệu đi nhé.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {page > 1 && (
                    <a href={`/products?page=${page - 1}&sort=${sort}&q=${q}&skin=${skin}&brand=${brand}`} className="px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">← Trước</a>
                  )}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <a key={p} href={`/products?page=${p}&sort=${sort}&q=${q}&skin=${skin}&brand=${brand}`} className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-colors ${p === page ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{p}</a>
                    );
                  })}
                  {page < totalPages && (
                    <a href={`/products?page=${page + 1}&sort=${sort}&q=${q}&skin=${skin}&brand=${brand}`} className="px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Sau →</a>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}