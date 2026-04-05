import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Điều Khoản Sử Dụng</h1>
        <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 space-y-6 text-slate-600 font-medium leading-relaxed">
          <p>Bằng việc truy cập và sử dụng website LUX Derma, bạn đồng ý tuân thủ các điều khoản sử dụng sau đây.</p>
          <h2 className="text-xl font-black text-slate-900">1. Giới thiệu</h2>
          <p>LUX Derma là nền tảng thương mại điện tử chuyên cung cấp sản phẩm dược mỹ phẩm. Chúng tôi có quyền thay đổi nội dung website mà không cần thông báo trước.</p>
          <h2 className="text-xl font-black text-slate-900">2. Đặt hàng & Thanh toán</h2>
          <p>Khi đặt hàng, bạn cam kết thông tin cung cấp là chính xác. Chúng tôi chấp nhận thanh toán COD (nhận hàng trả tiền) và chuyển khoản ngân hàng.</p>
          <h2 className="text-xl font-black text-slate-900">3. Giao hàng</h2>
          <p>Thời gian giao hàng dự kiến 3-5 ngày (tiêu chuẩn) hoặc 1-2 ngày (hỏa tốc). Phí ship tiêu chuẩn 30.000đ, hỏa tốc 50.000đ. Miễn phí vận chuyển cho đơn từ 500.000đ.</p>
          <h2 className="text-xl font-black text-slate-900">4. Quyền sở hữu trí tuệ</h2>
          <p>Toàn bộ nội dung trên website (hình ảnh, văn bản, thiết kế) thuộc quyền sở hữu của LUX Derma hoặc các nhà cung cấp hợp pháp. Nghiêm cấm sao chép, phân phối khi chưa được phép.</p>
        </div>
        <Link href="/" className="mt-8 inline-block text-rose-500 font-bold hover:text-slate-900 transition-colors">← Quay lại trang chủ</Link>
      </div>
    </div>
  );
}
