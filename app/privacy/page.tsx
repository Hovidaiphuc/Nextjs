import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Chính Sách Bảo Mật</h1>
        <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 space-y-6 text-slate-600 font-medium leading-relaxed">
          <p>LUX Derma cam kết bảo vệ thông tin cá nhân của khách hàng theo quy định pháp luật hiện hành về bảo vệ dữ liệu cá nhân.</p>
          <h2 className="text-xl font-black text-slate-900">1. Thông tin thu thập</h2>
          <p>Chúng tôi thu thập thông tin cá nhân bao gồm: họ tên, email, số điện thoại, địa chỉ giao hàng khi bạn đăng ký tài khoản hoặc đặt hàng trên hệ thống.</p>
          <h2 className="text-xl font-black text-slate-900">2. Mục đích sử dụng</h2>
          <p>Thông tin được sử dụng để: xử lý đơn hàng, giao hàng, hỗ trợ khách hàng, gửi thông báo về đơn hàng và chương trình khuyến mãi.</p>
          <h2 className="text-xl font-black text-slate-900">3. Bảo mật</h2>
          <p>Toàn bộ dữ liệu được mã hóa khi truyền tải (SSL/TLS). Mật khẩu được băm bằng bcrypt. Chúng tôi không chia sẻ thông tin cá nhân cho bên thứ ba không liên quan.</p>
        </div>
        <Link href="/" className="mt-8 inline-block text-rose-500 font-bold hover:text-slate-900 transition-colors">← Quay lại trang chủ</Link>
      </div>
    </div>
  );
}
