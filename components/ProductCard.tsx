"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    stock?: number;
    brand?: string | null;
    skinType?: string | null;
    variants?: Array<{ price: number }>;
    images?: Array<{ url: string }>;
  };
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const displayPrice = product.price;
  const stock = product.stock ?? 0;
  const imageUrl = product.imageUrl ?? product.images?.[0]?.url ?? null;
  const outOfStock = stock === 0;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) { router.push("/login"); return; }
    setWishlistLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id })
      });
      if (res.ok) toast.success("Đã thêm vào Yêu thích!");
      else toast.error("Lỗi kết nối!");
    } catch { toast.error("Lỗi kết nối!"); }
    setWishlistLoading(false);
  };

  if (compact) {
    return (
      <Link href={`/products/${product.id}`} className="group flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
        {imageUrl && (
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0">
            <Image src={imageUrl} alt={product.name} fill className="object-contain p-1" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="font-bold text-sm text-slate-800 line-clamp-1 block">{product.name}</span>
          <span className="text-xs font-bold text-rose-500 block mt-0.5">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(displayPrice)}
          </span>
        </div>
        <button onClick={handleWishlist} disabled={wishlistLoading}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 hover:border-rose-400 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 000 6.364" />
          </svg>
        </button>
      </Link>
    );
  }

  return (
    <div className="relative group">
      {outOfStock && (
        <div className="absolute top-4 left-4 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">Het Hang</div>
      )}

      <Link href={`/products/${product.id}`} className="flex flex-col bg-white p-4 rounded-[2rem] hover:shadow-2xl transition-all border border-slate-100 hover:border-transparent group/link">
        <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 mb-4 flex items-center justify-center p-4 group-hover:-translate-y-1 transition-all duration-500">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className={`object-contain p-4 drop-shadow-xl transition-transform duration-700 group-hover:scale-110 ${outOfStock ? "grayscale opacity-50" : ""}`}
            />
          ) : (
            <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
          )}
          {/* Wishlist heart */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 border border-slate-200/50 hover:border-rose-300 shadow-md transition-all z-10"
            aria-label="Yêu thích"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 000 6.364" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col flex-1 px-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded w-fit mb-2">
            {product.brand || "Gia Toc Co Ngoai"}
          </span>
          <h3 className={`text-base font-bold line-clamp-2 mb-2 ${outOfStock ? "text-slate-400" : "text-slate-800 group-hover:text-rose-600"} transition-colors`}>
            {product.name}
          </h3>
          <div className="mt-auto pt-3 border-t border-slate-50 flex items-end justify-between">
            <div className={`text-xl font-black ${outOfStock ? "text-slate-400" : "text-slate-900"}`}>
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(displayPrice)}
            </div>
            {stock > 0 && stock <= 5 && (
              <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
                Con {stock}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
