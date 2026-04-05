import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="text-center max-w-md">
        <div className="text-[10rem] font-black text-slate-100 leading-none select-none mb-[-3rem]">404</div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Tín Hiệu Đã Mất!</h1>
          <p className="text-slate-500 font-medium mb-8 text-lg">Trang bạn đang tìm kiếm đã bốc hơi khỏi hệ thống hoặc không tồn tại.</p>
          <div className="flex flex-col gap-3">
            <Link href="/" className="px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-rose-500 transition-all shadow-xl hover:shadow-rose-500/30 active:scale-95">
              Quay Về Trang Chủ
            </Link>
            <Link href="/products" className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-800 font-bold rounded-2xl hover:border-rose-300 hover:text-rose-500 transition-all">
              Khám Phá Cửa Hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
