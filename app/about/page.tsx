import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Về Chúng Tôi</h1>
        <div className="prose prose-slate max-w-none">
          <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 space-y-6 text-slate-600 font-medium leading-relaxed">
            <p>LUX Derma là hệ thống <strong className="text-slate-900">Dược Mỹ Phẩm Cao Cấp</strong> được thành lập với sứ mệnh mang đến các sản phẩm chăm sóc da được kê toa bởi bác sĩ da liễu hàng đầu.</p>
            <p>Hệ thống kết hợp công nghệ <strong className="text-slate-900">AI Skin Diagnosis</strong> và đội ngũ chuyên gia y khoa để tư vấn phác đồ dưỡng da cá nhân hóa cho từng khách hàng.</p>
            <p>Cam kết 100% sản phẩm chính hãng, nguồn gốc rõ ràng từ các thương hiệu dược mỹ phẩm uy tín trên toàn thế giới.</p>
          </div>
        </div>
        <Link href="/" className="mt-8 inline-block text-rose-500 font-bold hover:text-slate-900 transition-colors">← Quay lại trang chủ</Link>
      </div>
    </div>
  );
}
