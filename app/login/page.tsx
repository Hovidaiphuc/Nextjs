"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // States Gộp Vô Chung
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let tid;

    try {
      if (isLogin) {
          tid = toast.loading("Đang Mở Khóa Đăng Nhập...");
          const res = await signIn("credentials", {
            email, password, redirect: false
          });

          if (res?.error) {
            toast.error("Tài khoản hoặc thẻ bài không đúng!", { id: tid });
          } else {
            toast.success("Bảo mật vượt Ải! Xin Chào Boss/Tôn Khách!", { id: tid });
            router.push("/");
            router.refresh();
          }
      } else {
          tid = toast.loading("Hệ thống đang nghiền nát tạo bảo mật...");
          const res = await fetch("/api/auth/register", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ name, email, password })
          });

          if (res.ok) {
             toast.success("Hồ sơ đã tạo lộng lẫy! Đang vào nhà...", { id: tid });
             const loginAfter = await signIn("credentials", { email, password, redirect: false });
             if (!loginAfter?.error) {
                 router.push("/");
                 router.refresh();
             }
          } else {
             const data = await res.json();
             toast.error(data.error || "Có lỗi từ Dữ liệu Thô", { id: tid });
          }
      }
    } catch (error) {
      toast.error("Nhiễu loạn Tín hiệu Mạng CSDL", { id: tid });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex relative overflow-hidden">
        {/* Góc Thiết Kế Background Lộng Lẫy (Glass Cầu kỳ) */}
        <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Nút Quay Lại Sảnh Chính */}
        <Link href="/" className="absolute top-10 left-10 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-xs z-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Biệt thự Trang Chủ
        </Link>
        
        {/* Form Khu Vực Chính Kéo Ra Phân Trang Trục Giữa */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 z-10 w-full relative">
            
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative">
                {/* Thanh Slide Toggle Mượt Cực Kỳ */}
                <div className="flex w-full bg-slate-50 h-16 relative">
                    <div className={`absolute top-0 bottom-0 w-1/2 bg-slate-900 border-rose-500 rounded-3xl z-0 transition-transform duration-500 ease-in-out ${!isLogin ? 'translate-x-full' : 'translate-x-0'}`}></div>
                    
                    <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 relative z-10 text-sm font-black uppercase tracking-widest transition-colors duration-200 ${isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                        MỞ CỔNG KHÁCH CŨ
                    </button>
                    <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 relative z-10 text-sm font-black uppercase tracking-widest transition-colors duration-200 ${!isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                        GHI DANH THÀNH VIÊN
                    </button>
                </div>

                <div className="p-8 pb-12 pt-10">
                    <div className="text-center mb-8">
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight">{isLogin ? "Xin Chào Lần Nữa!" : "Viết Thẻ Tân Khách!"}</h2>
                       <p className="text-slate-400 mt-2 text-sm font-medium">{isLogin ? "Gõ dấu khóa chân ngôn để bước qua sảnh chính." : "Thông tin thẻ tín dụng đều mã hóa an toàn 2 rễ."}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                       {/* Nếu là Đăng Ký Mới -> Ép Gõ Tên Biệt Hiệu */}
                       {!isLogin && (
                          <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-4 duration-300">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Danh Tánh Hoàng Gia (Tên)</label>
                             <input value={name} onChange={r=>setName(r.target.value)} required type="text" className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-800 font-medium" placeholder="Tên Mệnh của Bạn..." />
                          </div>
                       )}

                       <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">EMAIL ĐỊNH TỌA ĐỘ</label>
                          <input value={email} onChange={r=>setEmail(r.target.value)} required type="email" className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-800 font-medium" placeholder="ceo@lux.vn" />
                       </div>

                       <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-end">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CÂU MẬT NGỮ CHÚ CHỖ (PASS)</label>
                             {isLogin && <Link href="#" className="text-[10px] text-rose-500 hover:text-slate-900 font-bold uppercase tracking-tight">Quyên Pass Bấm Đây?</Link>}
                          </div>
                          <input value={password} onChange={r=>setPassword(r.target.value)} required type="password" minLength={6} className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-800 font-bold tracking-widest" placeholder="••••••••" />
                       </div>

                       <button disabled={loading} type="submit" className="mt-8 w-full bg-slate-900 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-rose-500 hover:shadow-xl hover:shadow-rose-500/20 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                          {loading ? (
                             <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
                          ) : (
                             isLogin ? 'ĐÁNH VỠ KHÓA VÀO CỔNG' : 'NIÊM PHONG GHI DANH NGAY'
                          )}
                       </button>

                    </form>
                </div>
            </div>
            
            {/* Lời Căn Dặn Fake Phía Dưới */}
            <p className="mt-8 text-xs font-semibold text-slate-400 max-w-sm text-center">Tổ chức Hệ thống mã hóa RSA-256 bit tại Viện Kiểm Soát Công Nghệ Thông Tin Nội Bộ.</p>
        </div>
    </div>
  );
}
