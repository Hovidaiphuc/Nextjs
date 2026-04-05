"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/app/store/cartStore";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ProductVariant { id: string; sku: string; name: string; price: number; stock: number; imageUrl: string | null; }
interface ProductImage { id: string; url: string; isPrimary: boolean; }
interface ProductReview { id: string; userId: string; rating: number; comment: string | null; createdAt: string; user: { name: string | null } }
interface RecentlyViewedProduct { id: string; name: string; price: number; imageUrl: string | null; }
interface ProductDetail { id: string; name: string; description: string; price: number; imageUrl: string | null; stock: number; brand: string | null; skinType: string | null; ingredients: string | null; variants: ProductVariant[]; images: ProductImage[]; reviews: ProductReview[]; category?: { name: string; id: string } }

const RECENTLY_VIEWED_KEY = "lux-recently-viewed";
const MAX_RECENT = 8;

function getRecentlyViewed() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
  } catch { return []; }
}

function addToRecentlyViewed(product: any) {
  const existing = getRecentlyViewed().filter((p: any) => p.id !== product.id);
  const updated = [product, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const cart = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data as ProductDetail);
        setLoading(false);
        if (data.variants?.length > 0) setSelectedVariant(data.variants[0] as ProductVariant);
        addToRecentlyViewed(data);
        setRecentlyViewed(getRecentlyViewed().filter((p: RecentlyViewedProduct) => p.id !== id));
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
        setProduct(fresher as ProductDetail);
      } else { const x = await res.json(); toast.error(x.error || "Có biến cố!", { id: tid }); }
    } catch { toast.error("Sập cáp quang!", { id: tid }); }
    setSubmitting(false);
  };

  const handleToggleWishlist = async () => {
    if (!session) { router.push("/login"); return; }
    setWishlistLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id })
      });
      if (res.ok) toast.success("Đã thêm vào Yêu thích!");
    } catch { toast.error("Lỗi kết nối!"); }
    setWishlistLoading(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const price = selectedVariant ? selectedVariant.price : product.price;
    const variantName = selectedVariant ? selectedVariant.name : undefined;
    cart.addItem({
      id: product.id,
      name: product.name,
      price,
      imageUrl: selectedVariant?.imageUrl ?? product.imageUrl,
      quantity,
      stock: selectedVariant?.stock ?? product.stock,
      variantId: selectedVariant?.id,
      variantName
    });
    toast.success(`${quantity}x ${product.name}${variantName ? ` (${variantName})` : ''} đã rơi vào Túi Hành Trang!`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
      <div aria-label="Đang tải sản phẩm..." role="status" className="w-16 h-16 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return <div className="p-20 text-center font-bold text-2xl">Mất Tín Hiệu!</div>;

  const reviews = (product.reviews || []) as ProductReview[];
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1) : "0.0";

  const allImages: string[] = [
    product.imageUrl,
    ...(product.images || []).map((img: ProductImage) => img.url),
    ...(product.variants || []).filter((v: ProductVariant) => v.imageUrl).map((v: ProductVariant) => v.imageUrl as string)
  ].filter(Boolean) as string[];

  const variants: ProductVariant[] = product.variants || [];
  const outOfStock = selectedVariant
    ? selectedVariant.stock === 0
    : product.stock === 0;

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32">
      <div className="max-w-[85rem] mx-auto px-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-xs mb-10 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Viện Nghiên Cứu Mỹ Phẩm
        </Link>

        {/* MAIN AREA */}
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row gap-0 mb-16">
          {/* IMAGE GALLERY */}
          <div className="w-full lg:w-1/2 flex flex-col">
            {/* Main Image */}
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 border-b border-slate-100 h-80 lg:h-[28rem] overflow-hidden group cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
              {allImages[activeImage] ? (
                <Image src={allImages[activeImage]} alt={product.name} fill className={`object-contain p-8 drop-shadow-2xl transition-transform duration-700 ${outOfStock ? 'grayscale opacity-70' : ''}`} />
              ) : (
                <div className="w-64 h-64 bg-white shadow-inner rounded-full flex items-center justify-center mx-auto my-auto">Vô Hình</div>
              )}
              {outOfStock && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-8 py-3 bg-slate-900 text-white rounded-2xl text-xl font-black tracking-widest uppercase shadow-2xl rotate-[-15deg] border-4 border-slate-900/10">BÁO ĐỘNG HẾT HÀNG</div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-white/80 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-slate-700 shadow-lg">Phóng to</span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex gap-3 p-6 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${i === activeImage ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-200 hover:border-slate-400'}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFO */}
          <div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest">{product.brand || "KHÔNG NHÃN MÁC"}</span>
                {product.skinType && <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded text-[10px] font-black uppercase tracking-widest border border-blue-100">💻 DÀNH CHO: {product.skinType}</span>}
              </div>
              <button onClick={handleToggleWishlist} disabled={wishlistLoading} className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-500 transition-all text-slate-400 group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-4">{product.name}</h1>
            <p className="text-lg text-slate-500 leading-relaxed font-medium mb-8">{product.description}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">★ {avgRating}</div>
              <span className="text-xs text-slate-400 font-medium">({reviews.length} đánh giá)</span>
            </div>

            {/* VARIANT SELECTOR */}
            {variants.length > 0 && (
              <div className="mb-8">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Chọn Phiên Bản</label>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v: ProductVariant) => (
                    <button key={v.id} onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                      className={`px-5 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${selectedVariant?.id === v.id ? 'bg-slate-900 text-white border-slate-900' : v.stock === 0 ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'border-slate-200 text-slate-700 hover:border-slate-400'}`}
                      disabled={v.stock === 0}
                    >
                      {v.name}
                      {v.stock === 0 && <span className="block text-[10px] text-slate-400 mt-1">Hết hàng</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* GRID INFO */}
            <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Bảng Thành Phần Sinh Học</span>
                <p className="text-sm font-mono text-slate-700 bg-white p-3 rounded-xl border border-slate-200">{product.ingredients || "Chưa mổ xẻ phân tích phân tử..."}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mật Độ Lưu Trữ Kho</span>
                {outOfStock ? <p className="text-2xl font-black text-rose-500 uppercase">Khô Cạn</p> : <p className="text-2xl font-black text-emerald-500">{selectedVariant ? selectedVariant.stock : product.stock} <span className="text-sm font-medium text-slate-500">lọ</span></p>}
              </div>
            </div>

            {/* PRICE + ADD TO CART */}
            <div className="flex items-end justify-between border-t border-slate-100 pt-8 mb-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Điều Kiện Chuyển Giao</span>
                <span className="text-5xl font-black text-slate-900 tracking-tighter">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayPrice)}
                </span>
              </div>
              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-xl font-bold hover:bg-slate-50 transition-colors text-slate-600">−</button>
                  <span className="px-4 py-3 font-black text-lg min-w-[3rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(outOfStock ? 1 : (selectedVariant?.stock ?? product.stock), quantity + 1))} className="px-4 py-3 text-xl font-bold hover:bg-slate-50 transition-colors text-slate-600">+</button>
                </div>
              </div>
            </div>

            <button
              disabled={outOfStock}
              onClick={handleAddToCart}
              className={`w-full h-16 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 ${outOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-200' : 'bg-slate-900 text-white hover:bg-rose-500 shadow-xl hover:shadow-rose-500/30 active:scale-95'}`}
            >
              {outOfStock ? (
                <span>Vật Phẩm Đã Vét Buồng Kho</span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  <span>Bỏ Vào Túi Hành Trang</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* LIGHTBOX */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-[200] bg-slate-950/95 flex items-center justify-center p-8" onClick={() => setLightboxOpen(false)}>
            <button className="absolute top-6 right-6 text-white text-4xl font-bold hover:text-rose-400 transition-colors" onClick={() => setLightboxOpen(false)}>✕</button>
            <div className="relative w-full max-w-3xl aspect-square" onClick={e => e.stopPropagation()}>
              {allImages[activeImage] && <Image src={allImages[activeImage]} alt="" fill className="object-contain" />}
            </div>
            {allImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                {allImages.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setActiveImage(i); }} className={`w-3 h-3 rounded-full transition-all ${i === activeImage ? 'bg-white scale-125' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* RECENTLY VIEWED */}
        {recentlyViewed.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Vừa Xem Qua</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyViewed.slice(0, 4).map((p: RecentlyViewedProduct) => (
                <Link key={p.id} href={`/products/${p.id}`} className="bg-white p-4 rounded-2xl border border-slate-100 hover:shadow-lg transition-all flex gap-3 items-center">
                  {p.imageUrl && <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0"><Image src={p.imageUrl} alt={p.name} fill className="object-contain p-1" /></div>}
                  <div><span className="font-bold text-sm text-slate-800 line-clamp-1">{p.name}</span><span className="block text-xs font-bold text-rose-500 mt-1">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</span></div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* RELATED PRODUCTS */}
        {product.category && (
          <div className="mb-16">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Sản Phẩm Cùng Viện</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Fetch related via server component would be better, show placeholder */}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        <div className="mt-8">
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
                reviews.map((rev: ProductReview) => (
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