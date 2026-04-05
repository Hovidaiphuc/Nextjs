import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  // SSR Lấy số liệu thật từ Cửa hàng
  const topProducts = await prisma.product.findMany({ take: 4, orderBy: { price: "desc" }, include: { category: true } });
  const topDoctors = await prisma.doctor.findMany({ take: 2, orderBy: { rating: "desc" } });

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-rose-200">
      
      {/* 1. HERO SECTION (GLASSMORPHISM & DEEP LUXURY) */}
      <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 pt-20">
         {/* Background Effect */}
         <div className="absolute inset-0 z-0">
             <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-rose-500/20 rounded-full blur-[120px] mix-blend-screen mix-blend-lighten animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-indigo-500/20 rounded-full blur-[100px] mix-blend-screen mix-blend-lighten animate-pulse delay-1000"></div>
         </div>
         
         <div className="relative z-10 max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
             <span className="px-5 py-2 mb-8 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-black tracking-[0.25em] text-white uppercase shadow-2xl">Định chuẩn Sắc Đẹp Hoàng Gia 2026</span>
             <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tighter leading-[1.1] mb-8">
                Tất cả Sắc Đẹp<br/>Đều Là Nghệ Thuật.
             </h1>
             <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl leading-relaxed mb-12 shadow-sm">Khám phá bộ sưu tập Dược Mỹ phẩm độc quyền. Được kê toa và bảo chứng bởi Viện Da liễu hàng đầu khu vực.</p>
             
             <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link href="/products" className="group relative px-10 py-5 bg-white text-slate-900 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                    <span className="relative z-10 flex items-center gap-2">Vào Cửa Hàng <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></span>
                </Link>
                <Link href="/consultation" className="px-10 py-5 bg-transparent border border-white/30 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md">
                    Phòng Khám Da Liễu
                </Link>
             </div>
         </div>
         
         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
         </div>
      </section>

      {/* 2. BESTSELLER SHOWCASE (FEATURED PRODUCTS) */}
      <section className="py-32 px-6 bg-white relative z-20">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                   <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Kệ Hàng Đặc Quyền.</h2>
                   <p className="text-slate-500 font-medium mt-3 text-lg">Những tinh hoa bán chạy nhất phân khúc Luxury.</p>
                </div>
                <Link href="/products" className="text-rose-500 font-bold hover:text-slate-900 transition-colors flex items-center gap-1 group">
                   Xem thêm 100+ mẫu <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {topProducts.map((p) => (
                   <ProductCard key={p.id} product={p} />
                ))}
            </div>
         </div>
      </section>

      {/* 3. DOCTORS / CLINICAL CLINIC INTRO */}
      <section className="py-32 px-6 bg-slate-900 text-white overflow-hidden relative">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
             <div className="flex-1 space-y-8">
                 <span className="text-rose-400 font-bold tracking-widest uppercase text-sm border-l-2 border-rose-400 pl-4">E-Clinical Bác Sĩ Của Riêng Bạn</span>
                 <h2 className="text-4xl md:text-6xl font-black leading-tight">Da đẹp không đến từ phép thuật. Nó đến từ <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">Khoa Học</span>.</h2>
                 <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
                     Bạn loay hoay không biết da mình thuộc loại gì? Mụn chữa mãi không dứt? Hãy dừng ngay việc bôi trét lung tung.
                 </p>
                 <Link href="/consultation" className="inline-flex items-center gap-3 px-8 py-4 bg-rose-500 text-white rounded-full font-bold shadow-[0_10px_30px_rgba(244,63,94,0.3)] hover:bg-white hover:text-slate-900 hover:scale-105 transition-all">
                     Bắt Đầu Chẩn Đoán Cùng Chuyên Gia Bác Sĩ
                 </Link>
             </div>
             <div className="w-full md:w-[45%] grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {topDoctors.map(doc => (
                     <div key={doc.id} className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700/50 flex flex-col items-center text-center shadow-2xl">
                         <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-4 ring-slate-700">
                            <Image width={96} height={96} src={doc.avatarUrl || `https://ui-avatars.com/api/?name=${doc.name}`} alt={doc.name} className="w-full h-full object-cover" />
                         </div>
                         <h4 className="text-lg font-black text-white">{doc.name}</h4>
                         <p className="text-sm text-slate-400 font-medium mb-3">{doc.specialty}</p>
                         <div className="flex items-center gap-1 text-amber-400 text-sm">{Array(Math.round(doc.rating)).fill('★').join('')} {doc.experienceYr > 0 && <span className="text-slate-500 font-semibold ml-1">({doc.experienceYr} năm KN)</span>}</div>
                     </div>
                 ))}
             </div>
         </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-white py-16 px-6 border-t border-slate-100">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="flex items-center gap-2">
                 <span className="text-3xl font-black tracking-tighter text-slate-900">LUX<span className="text-rose-500">.</span></span>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-tight border-l-2 border-slate-200 pl-2">Medical<br/>Aesthetics</span>
             </div>
             <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-slate-500">
                 <Link href="#" className="hover:text-slate-900 transition-colors">Về Công Ty</Link>
                 <Link href="#" className="hover:text-slate-900 transition-colors">Điều Khoản Mua Hàng</Link>
                 <Link href="#" className="hover:text-slate-900 transition-colors">Chính Sách Bảo Mật</Link>
                 <Link href="#" className="hover:text-slate-900 transition-colors">Tuyển Dụng Bác Sĩ</Link>
             </div>
             <div className="text-slate-400 font-medium text-sm">
                © 2026 Lux Derma. Bản quyền độc quyền.
             </div>
         </div>
      </footer>
    </div>
  );
}
