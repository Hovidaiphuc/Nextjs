import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function BlogArchivePage() {
  const blogs = await prisma.blogArticle.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } }
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-32 pb-32">
       <div className="max-w-[80rem] mx-auto px-6">
           {/* Tiêu đề Khổng Lồ */}
           <div className="text-center mb-20 relative">
               <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-6 relative z-10">Tri Thức <span className="text-amber-500">Dược Mĩ.</span></h1>
               <p className="text-xl md:text-2xl text-slate-500 font-serif max-w-3xl mx-auto italic relative z-10">"Hiểu làn da trước khi chạm vào nó. Thư viện lưu trữ các công trình nghiên cứu và lời khuyên chuẩn Y khoa."</p>
               {/* Decors */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-100 rounded-full blur-[100px] -z-0"></div>
           </div>

           {/* Lưới Thư Viện Tạp Chí */}
           {blogs.length === 0 ? (
               <div className="text-center py-32 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white text-slate-400">
                   <h3 className="text-2xl font-black uppercase tracking-widest">Tuyệt Lĩnh Kiến Thức Đang Trống</h3>
                   <p className="mt-2 font-medium">Báo cáo sẽ sớm được Tòa Soạn công bố...</p>
               </div>
           ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   {blogs.map((b, idx) => (
                       <Link href={`/blogs/${b.slug}`} key={b.id} className="group flex flex-col bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 border border-slate-100 hover:-translate-y-2">
                           <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-slate-100 mb-6">
                               {b.coverImage ? (
                                   <Image src={b.coverImage} alt={b.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                               ) : (
                                   <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 uppercase tracking-widest text-xs">Vô Bìa</div>
                               )}
                               <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full z-10">Báo Cáo Mới</div>
                           </div>
                           
                           <div className="flex-1 flex flex-col">
                               <div className="flex items-center gap-3 mb-4">
                                   <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">{b.tags || "Phác Đồ Mật"}</span>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(b.createdAt).toLocaleDateString('vi-VN')}</span>
                               </div>
                               
                               <h2 className="text-2xl font-bold text-slate-800 leading-snug mb-4 group-hover:text-amber-600 transition-colors line-clamp-3">{b.title}</h2>
                               
                               <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
                                   <div className="flex items-center gap-2">
                                       <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                           <Image width={32} height={32} src={`https://ui-avatars.com/api/?name=${b.author?.name || 'Admin'}&background=random`} alt={`Avatar của ${b.author?.name || 'Admin'}`} className="w-full h-full object-cover" />
                                       </div>
                                       <span className="text-xs font-bold text-slate-500">{b.author?.name || "Biên Tập Viên"}</span>
                                   </div>
                                   <div className="text-slate-300 group-hover:text-amber-500 transition-colors">
                                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8H5M17 12H5M17 16H5M21 12h-2" /></svg>
                                   </div>
                               </div>
                           </div>
                       </Link>
                   ))}
               </div>
           )}
       </div>
    </div>
  );
}
