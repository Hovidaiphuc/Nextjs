import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function BlogReadingRoom({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const blog = await prisma.blogArticle.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
      include: { author: { select: { name: true, role: true } } }
  }).catch(() => null);

  if (!blog) return notFound();

  return (
    <div className="min-h-screen bg-white font-sans pt-32 pb-32">
       <div className="max-w-3xl mx-auto px-6 relative">
           
           <Link href="/blogs" className="inline-flex flex-col mb-12 group cursor-pointer">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-500 transition-colors">Quay Về</span>
               <span className="text-sm font-bold text-slate-800">Thư Viện Tạp Chí</span>
           </Link>

           <header className="mb-14">
               <div className="flex items-center gap-3 mb-6">
                   <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">{blog.tags || "Phác Đồ Mật"}</span>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">📡 Đã quét {blog.viewCount} lần</span>
               </div>
               
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">{blog.title}</h1>
               
               <div className="flex items-center gap-4 py-6 border-y border-slate-100">
                   <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                       <Image width={48} height={48} src={`https://ui-avatars.com/api/?name=${blog.author?.name || 'Vô Danh'}&background=random`} alt={`Avatar của ${blog.author?.name || 'Vô Danh'}`} className="w-full h-full object-cover" />
                   </div>
                   <div>
                       <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                           {blog.author?.name || "Biên Tập Viên Ẩn Danh"}
                           <span className="bg-rose-500 text-white text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded font-black">{blog.author?.role === 'ADMIN' ? 'Bác Sĩ' : 'Nghiên Cứu Sinh'}</span>
                       </div>
                       <div className="text-xs text-slate-400 font-medium">Báo cáo Mật Lúc {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</div>
                   </div>
               </div>
           </header>

           {blog.coverImage && (
               <figure className="mb-14 relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden bg-slate-100 shadow-2xl">
                   <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" />
               </figure>
           )}

           <article 
               className="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-amber-500 prose-a:font-bold prose-img:rounded-3xl prose-img:shadow-xl prose-p:leading-relaxed prose-p:text-slate-600 font-serif"
               dangerouslySetInnerHTML={{ __html: blog.content }} 
           />

           <div className="mt-20 pt-10 border-t-4 border-slate-900 flex justify-between items-center hidden md:flex">
               <h4 className="font-black text-2xl uppercase tracking-tighter">Luận Án Kết Thúc.</h4>
               <Link href="/products" className="bg-slate-900 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full transition-all">Mua Dược Phẩm Ngay</Link>
           </div>
       </div>
    </div>
  );
}
