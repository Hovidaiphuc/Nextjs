import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; sort?: string; min?: string; max?: string; stock?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const q = sp.q || "";
  const sort = sp.sort || "desc";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const limit = 12;
  const skip = (page - 1) * limit;
  const stockOnly = sp.stock === "1";

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return (
    <div className="min-h-screen bg-slate-50 pt-28 px-6 flex items-center justify-center">
      <div className="text-center"><p className="text-2xl font-black text-slate-800 mb-4">Danh mục không tồn tại</p><Link href="/products" className="text-rose-500 font-bold hover:underline">← Quay lại Cửa Hàng</Link></div>
    </div>
  );

  const where = {
    categoryId: category.id,
    name: q ? { contains: q } : undefined,
    ...(stockOnly ? { stock: { gt: 0 } } : {})
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { price: sort === "asc" ? "asc" : "desc" },
      skip,
      take: limit,
      include: { category: true }
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32">
      {/* Category Banner */}
      <div className="bg-white border-b border-slate-100 py-16 px-6 mb-8">
        <div className="max-w-[90rem] mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/products" className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest">Cửa Hàng</Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">{category.name}</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">{category.name}</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">{total} sản phẩm</p>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-6 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 lg:sticky lg:top-28">
            <h2 className="text-lg font-black text-slate-900 mb-6">Bộ Lọc</h2>
            <form method="GET" action={`/category/${slug}`} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Tìm kiếm</label>
                <input type="text" name="q" defaultValue={q} placeholder="Tên sản phẩm..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Sắp xếp</label>
                <select name="sort" defaultValue={sort} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:border-rose-500 appearance-none">
                  <option value="desc">Giá: Cao → Thấp</option>
                  <option value="asc">Giá: Thấp → Cao</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="stock" value="1" defaultChecked={stockOnly} className="w-5 h-5 accent-rose-500 rounded" />
                <span className="text-sm font-bold text-slate-600">Chỉ hiển thị còn hàng</span>
              </label>
              <button type="submit" className="py-3 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-rose-500 transition-colors">Áp Dụng</button>
              <Link href={`/category/${slug}`} className="text-center text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Xóa Bộ Lọc</Link>
            </form>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
              <span className="text-6xl mb-4 grayscale opacity-20">🧫</span>
              <h3 className="text-xl font-bold text-slate-400">Không tìm thấy sản phẩm nào!</h3>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(p => (
                  <Link key={p.id} href={`/products/${p.id}`} className="group flex flex-col bg-white p-4 rounded-[2rem] hover:shadow-2xl transition-all border border-slate-100 hover:border-transparent">
                    {p.stock === 0 && <div className="absolute top-4 left-4 z-10 bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full">HẾT HÀNG</div>}
                    <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 mb-4 flex items-center justify-center p-4 group-hover:-translate-y-1 transition-transform">
                      {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className={`object-contain p-4 drop-shadow-xl transition-transform duration-500 ${p.stock === 0 ? 'grayscale opacity-50' : 'group-hover:scale-110'}`} /> : <div className="w-16 h-16 bg-slate-200 rounded-full"></div>}
                    </div>
                    <div className="flex flex-col flex-1 px-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded w-fit mb-2">{p.brand || "Gia Tộc Cổ Ngoại"}</span>
                      <h3 className={`text-sm font-bold line-clamp-2 mb-2 ${p.stock === 0 ? 'text-slate-400' : 'text-slate-800'}`}>{p.name}</h3>
                      <div className="mt-auto pt-3 border-t border-slate-50 flex items-end justify-between">
                        <span className={`text-lg font-black ${p.stock === 0 ? 'text-slate-400' : 'text-slate-900'}`}>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price)}</span>
                        {p.stock > 0 && p.stock <= 5 && <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-full">Còn {p.stock}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {page > 1 && <a href={`/category/${slug}?page=${page - 1}&sort=${sort}&q=${q}&stock=${stockOnly ? "1" : ""}`} className="px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">← Trước</a>}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <a key={p} href={`/category/${slug}?page=${p}&sort=${sort}&q=${q}&stock=${stockOnly ? "1" : ""}`} className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-colors ${p === page ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</a>
                  ))}
                  {page < totalPages && <a href={`/category/${slug}?page=${page + 1}&sort=${sort}&q=${q}&stock=${stockOnly ? "1" : ""}`} className="px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Sau →</a>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}