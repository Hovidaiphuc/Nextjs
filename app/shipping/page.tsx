import Link from "next/link";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Chính Sách Giao Hàng</h1>
        <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 space-y-6 text-slate-600 font-medium leading-relaxed">
          <h2 className="text-xl font-black text-slate-900">Phương thức vận chuyển</h2>
          <div className="space-y-4">
            {[
              { name: "Tiêu chuẩn", time: "3-5 ngày làm việc", fee: "30.000đ", note: "Miễn phí cho đơn từ 500.000đ" },
              { name: "Hỏa tốc", time: "1-2 ngày làm việc", fee: "50.000đ", note: "Áp dụng toàn quốc" }
            ].map(opt => (
              <div key={opt.name} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-slate-800">{opt.name}</span>
                  <span className="font-bold text-rose-500">{opt.fee}</span>
                </div>
                <p className="text-sm text-slate-500">⏱️ {opt.time}</p>
                <p className="text-xs text-emerald-600 font-bold mt-1">{opt.note}</p>
              </div>
            ))}
          </div>
          <h2 className="text-xl font-black text-slate-900">Theo dõi đơn hàng</h2>
          <p>Sau khi đơn hàng được xác nhận, bạn sẽ nhận mã vận đơn qua email/SMS và có thể theo dõi trạng thái tại mục "Đơn hàng của tôi" trên website.</p>
          <h2 className="text-xl font-black text-slate-900">Lưu ý</h2>
          <p>Đơn hàng được xử lý trong giờ hành chính (8:00 - 18:00, thứ 2 - thứ 7). Đơn hàng ngoài giờ sẽ được xử lý vào ngày làm việc tiếp theo.</p>
        </div>
        <Link href="/" className="mt-8 inline-block text-rose-500 font-bold hover:text-slate-900 transition-colors">← Quay lại trang chủ</Link>
      </div>
    </div>
  );
}
