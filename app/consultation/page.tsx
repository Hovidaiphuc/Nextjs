"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ConsultationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skinIssue, setSkinIssue] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Vui lòng đăng nhập trước!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinIssue }),
      });
      if (res.ok) {
        setSuccess(true);
        setSkinIssue("");
        toast.success("Phiếu khám đã được gửi thành công!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Có lỗi xảy ra!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Sập cáp quang!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      <main className="max-w-4xl mx-auto px-6 py-24 flex flex-col md:flex-row gap-16 items-center">
        
        {/* Left Side: Copy & Info */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold max-w-fit shadow-sm border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Tư Vấn Trực Tuyến 24/7
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Nhận Phác Đồ Từ <span className="text-blue-600">Bác Sĩ Da Liễu</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Không cần chờ đợi tại phòng khám. Mô tả tình trạng da hiện tại của bạn, đội ngũ chuyên gia của chúng tôi sẽ phân tích và đưa ra giải pháp chăm sóc phù hợp nhất trong 24 giờ.
          </p>
          
          <div className="flex items-center gap-6 mt-4">
             <div className="flex -space-x-4">
                <Image width={48} height={48} className="rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80" alt="Doctor 1" />
                <Image width={48} height={48} className="rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=80" alt="Doctor 2" />
                <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">+15</div>
             </div>
             <p className="text-sm font-medium text-slate-600">Hội đồng y khoa giàu kinh nghiệm.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full pointer-events-none"></div>
            
            {success ? (
              <div className="h-64 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in duration-500">
                 <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-slate-800">Gửi Yêu Cầu Thành Công!</h3>
                   <p className="text-slate-500 text-sm mt-2">Bác sĩ sẽ phản hồi và gửi phác đồ qua email của bạn trong thời gian sớm nhất.</p>
                 </div>
                 <button onClick={() => setSuccess(false)} className="mt-4 text-blue-600 font-medium hover:underline">Gửi câu hỏi khác</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Phiếu Khám Y Khoa</h2>
                  <p className="text-sm text-slate-500 mt-1">Thông tin được bảo mật hoàn toàn.</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Mô tả tình trạng da</label>
                  <textarea 
                    required
                    value={skinIssue}
                    onChange={e => setSkinIssue(e.target.value)}
                    placeholder="Ví dụ: Vùng má nổi nhiều mụn viêm sưng đỏ, da đổ dầu nhiều vào buổi sáng..."
                    className="w-full min-h-[140px] px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-2 opacity-50 cursor-not-allowed">
                  <label className="text-sm font-semibold text-slate-700">Tải ảnh lên (Optional)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl px-4 py-6 flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-not-allowed">
                     <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                     <span className="text-xs font-medium">Tính năng đang cập nhật</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-70 flex items-center justify-center"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : "Gửi Phiếu Khám Đích Danh"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
