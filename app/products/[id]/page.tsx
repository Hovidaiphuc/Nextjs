"use client";

import Link from "next/link";
import { useCartStore } from "@/app/store/cartStore";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const cart = useCartStore();
  const { data: session } = useSession();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!session) { toast.error("Vui lòng Đăng Nhập để bình phẩm!"); return; }
      setSubmitting(true);
      const tid = toast.loading("Đang tung tín hiệu Vote...");
      try {
         const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id, rating, comment }) });
         if (res.ok) {
             toast.success("Hệ thống đã lưu truyền thuyết về Bạn!", { id: tid });
             setComment(""); setRating(5);
             const fresher = await fetch(`/api/products/${id}`).then(r => r.json());
             setProduct(fresher);
         } else { const x = await res.json(); toast.error(x.error || "Có biến cố!", { id: tid }); }
      } catch(e) { toast.error("Sập cáp quang!", { id: tid }); }
      setSubmitting(false);
  };

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
         <div aria-label="Đang tải sản phẩm..." role="status" className="w-16 h-16 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
  );

  if (!product) return <div className="p-20 text-center font-bold text-2xl">Mất Tín Hiệu!</div>;

  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc: number, cur: any) => acc + cur.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const outOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32">
      <div className="max-w-[85rem] mx-auto px-6">
          <Link href="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-xs mb-10 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Viện Nghiên Cứu Mỹ Phẩm
          </Link>

          {/* Core Data Khu Vực Chính */}
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row gap-0 mb-16 relative">
              {/* Ảnh Mỹ phẩm */}
              <div className="w-full lg:w-1/2 flex items-center justify-center p-12 lg:p-20 bg-gradient-to-br from-slate-100 to-slate-50 border-r border-slate-100 relative group overflow-hidden h-80 lg:h-auto">
                  {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill className={`object-contain drop-shadow-2xl transition-transform duration-700 relative z-20 ${outOfStock ? 'grayscale opacity-70' : 'group-hover:scale-110'}`} />
                  ) : (
                      <div className="w-64 h-64 bg-white shadow-inner rounded-full flex items-center justify-center">Vô Hình</div>
                  )}
                  {outOfStock && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-8 py-3 bg-slate-900 text-white rounded-2xl text-xl font-black tracking-widest uppercase shadow-2xl rotate-[-15deg] border-4 border-slate-900/10">BÁO ĐỘNG HẾT HÀNG</div>
                  )}
              </div>

              {/* Thông tin Y khoa */}
              <div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                      <span className="px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest">{product.brand || "KHÔNG NHÃN MÁC"}</span>
                      {product.skinType && <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded text-[10px] font-black uppercase tracking-widest border border-blue-100">💻 DÀNH CHO: {product.skinType}</span>}
                      <div className="ml-auto flex items-center gap-1 text-amber-400 text-sm font-bold">★ {avgRating}</div>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-6">{product.name}</h1>
                  <p className="text-lg text-slate-500 leading-relaxed font-medium mb-10">{product.description}</p>

                  <div className="grid grid-cols-2 gap-6 mb-10 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Bảng Thành Phần Sinh Học</span>
                          <p className="text-sm font-mono text-slate-700 bg-white p-3 rounded-xl border border-slate-200">{product.ingredients || "Chưa mổ xẻ phân tích phân tử..."}</p>
                      </div>
                      <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mật Độ Lưu Trữ Kho</span>
                          {outOfStock ? <p className="text-2xl font-black text-rose-500 uppercase">Khô Cạn</p> : <p className="text-2xl font-black text-emerald-500">{product.stock} <span className="text-sm font-medium text-slate-500">lọ</span></p>}
                      </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-slate-100 pt-10 mt-auto">
                      <div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Điều Kiện Chuyển Giao</span>
                         <span className="text-5xl font-black text-slate-900 tracking-tighter">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                         </span>
                      </div>
                  </div>

                  <button 
                     disabled={outOfStock}
                     onClick={() => {
                        cart.addItem({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity: 1 });
                        toast.success("Vật phẩm đã rơi vào Balo Giỏ Hàng!");
                     }}
                     className={`mt-10 group relative w-full h-16 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 ${outOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-200' : 'bg-slate-900 text-white hover:bg-rose-500 shadow-xl hover:shadow-rose-500/30 active:scale-95'}`}
                  >
                     {outOfStock ? (
                         <span>Vật Phẩm Đã Vét Buồng Kho</span>
                     ) : (
                         <>
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                             <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                             <span className="relative z-10">Bỏ Vào Túi Hành Trang</span>
                         </>
                     )}
                  </button>
              </div>
          </div>

          {/* VÙNG ĐÁNH GIÁ REVIEWS */}
          <div className="mt-24">
              <div className="flex items-center justify-between mb-10 pb-4 border-b-2 border-slate-200 block-title relative">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Khu Vực Triều Đình Bình Phẩm</h2>
                  <div className="absolute bottom-[-2px] left-0 w-32 h-1 bg-slate-900"></div>
              </div>

              <div className="flex flex-col lg:flex-row gap-12">
                  <div className="w-full lg:w-1/3 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit sticky top-28">
                      <h3 className="text-xl font-bold text-slate-800 mb-6 font-serif">Đóng dấu Ý Niệm</h3>
                      {session ? (
                          <form onSubmit={submitReview} className="flex flex-col gap-5">
                              <div>
                                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Chấm Mức Độ (Stars)</label>
                                  <div className="flex items-center gap-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                          <button type="button" key={star} onClick={() => setRating(star)} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${rating >= star ? 'bg-amber-100 text-amber-400 scale-110 shadow-sm' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}>★</button>
                                      ))}
                                  </div>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Dâng Tấu Chương</label>
                                  <textarea value={comment} onChange={e=>setComment(e.target.value)} required rows={4} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white resize-none"></textarea>
                              </div>
                              <button disabled={submitting} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-rose-500 transition-all active:scale-95">BAN BỐ ĐÁNH GIÁ</button>
                          </form>
                      ) : (
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                              <p className="text-sm font-medium text-slate-500 mb-4">Hãy nạp thẻ Đăng nhập để bình phẩm.</p>
                              <Link href="/login" className="inline-block px-6 py-3 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-900 uppercase">Cổng Ghi Danh</Link>
                          </div>
                      )}
                  </div>
                  <div className="w-full lg:w-2/3 flex flex-col gap-6">
                      {reviews.length === 0 ? (
                          <div className="w-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
                             <h4 className="font-bold text-lg text-slate-300 uppercase tracking-widest mt-4">Pháp trường Trống Rỗng</h4>
                          </div>
                      ) : (
                          reviews.map((rev: any) => (
                             <div key={rev.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex gap-5 hover:shadow-md transition-shadow">
                                 <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                                     <Image width={48} height={48} src={`https://ui-avatars.com/api/?name=${rev.user.name}&background=random`} alt={`Avatar của ${rev.user.name}`} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                     <div className="flex items-center justify-between mb-1">
                                         <h5 className="font-bold text-slate-900 text-sm tracking-wide">{rev.user.name}</h5>
                                         <span className="text-xs text-slate-400 font-medium">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                                     </div>
                                     <div className="flex items-center gap-1 text-amber-400 text-[10px] mb-3">{Array(rev.rating).fill('★').join('')}{Array(5-rev.rating).fill('☆').join('')}</div>
                                     <p className="text-slate-600 font-medium text-sm leading-relaxed">{rev.comment}</p>
                                 </div>
                             </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
