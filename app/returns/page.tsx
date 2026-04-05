import Link from "next/link";

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Chính Sách Đổi Trả</h1>
        <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 space-y-6 text-slate-600 font-medium leading-relaxed">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h2 className="font-black text-amber-700 mb-2">⏰ Thời hạn đổi trả</h2>
            <p className="text-sm text-amber-600 font-medium">Sản phẩm được đổi trả trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng.</p>
          </div>
          <h2 className="text-xl font-black text-slate-900">Điều kiện đổi trả</h2>
          <ul className="space-y-3">
            {[
              "Sản phẩm còn nguyên vẹn, chưa qua sử dụng, còn tem mác và bao bì gốc",
              "Lỗi từ nhà sản xuất (sai sản phẩm, hư hỏng trong vận chuyển)",
              "Sản phẩm không đúng với mô tả trên website",
              "Cung cấp video/ảnh chụp rõ sản phẩm lỗi khi gửi yêu cầu"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-emerald-500 font-black mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <h2 className="text-xl font-black text-slate-900">Không áp dụng đổi trả</h2>
          <ul className="space-y-2 text-slate-500">
            {["Sản phẩm đã qua sử dụng", "Sản phẩm không còn tem mác, bao bì", "Sản phẩm khuyến mãi, flash sale", "Yêu cầu sau 7 ngày kể từ ngày nhận hàng"].map((item, i) => (
              <li key={i} className="flex items-start gap-3"><span className="text-rose-400 font-black mt-0.5">✕</span><span>{item}</span></li>
            ))}
          </ul>
          <h2 className="text-xl font-black text-slate-900">Quy trình đổi trả</h2>
          <p>Liên hệ hotline <strong>1900-xxxx</strong> hoặc email <strong>hotro@luxderma.com</strong> với mã đơn hàng và hình ảnh sản phẩm. Chúng tôi sẽ hướng dẫn chi tiết trong vòng 24h.</p>
        </div>
        <Link href="/" className="mt-8 inline-block text-rose-500 font-bold hover:text-slate-900 transition-colors">← Quay lại trang chủ</Link>
      </div>
    </div>
  );
}
