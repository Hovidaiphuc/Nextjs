"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="text-center max-w-md">
        <div className="text-[8rem] font-black text-rose-100 leading-none select-none mb-[-2rem]">!</div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Hệ Thống Gặp Sự Cố!</h1>
          <p className="text-slate-500 font-medium mb-2">Đã có lỗi không mong muốn xảy ra. Đội ngũ kỹ thuật đã được thông báo.</p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs font-mono text-rose-500 bg-rose-50 rounded-xl p-3 mb-4 text-left overflow-auto max-h-32">{error.message}</p>
          )}
          <button onClick={reset} className="px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-rose-500 transition-all shadow-xl active:scale-95">
            Thử Lại
          </button>
        </div>
      </div>
    </div>
  );
}
