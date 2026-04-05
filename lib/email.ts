/**
 * Email notification service (Console-only initially)
 * In production, replace with nodemailer, SendGrid, Resend, etc.
 */

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    product?: { name: string } | null;
    variantName?: string | null;
    quantity: number;
    priceAt: number;
  }>;
}

export async function sendOrderConfirmation(order: Order): Promise<void> {
  const itemsList = order.items
    .map(item => `  - ${item.product?.name || item.variantName || "Sản phẩm"} x${item.quantity} @ ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.priceAt)}`)
    .join("\n");

  const total = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount);

  const email = `
═══════════════════════════════════════════════
  📦 LUX DERMA — XÁC NHẬN ĐƠN HÀNG #${order.id.slice(-6).toUpperCase()}
═══════════════════════════════════════════════

Kính gửi ${order.customerName},

Cảm ơn bạn đã đặt hàng tại LUX Derma! Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.

📋 CHI TIẾT ĐƠN HÀNG:
${itemsList}

💰 TỔNG CỘNG: ${total}
📍 Mã đơn: #${order.id}

⏱️ TRẠNG THÁI ĐƠN HÀNG:
  1. ✅ Đặt hàng thành công
  2. ⏳ Xác nhận thanh toán
  3. 📦 Đang chuẩn bị
  4. 🚚 Đang giao hàng
  5. 🎉 Đã giao

📞 HỖ TRỢ: hotline@luxderma.com | 1900-xxxx

═══════════════════════════════════════════════
  LUX DERMA — Medical Aesthetics Excellence
═══════════════════════════════════════════════
`;

  console.log(email);
}

export async function sendOrderStatusUpdate(
  orderId: string,
  customerEmail: string,
  customerName: string,
  status: string,
  message: string
): Promise<void> {
  const statusEmoji: Record<string, string> = {
    CONFIRMED: "✅",
    PROCESSING: "📦",
    SHIPPED: "🚚",
    DELIVERED: "🎉",
    CANCELLED: "🚫"
  };

  const email = `
═══════════════════════════════════════════════
  📬 LUX DERMA — CẬP NHẬT ĐƠN HÀNG #${orderId.slice(-6).toUpperCase()}
═══════════════════════════════════════════════

Kính gửi ${customerName},

${statusEmoji[status] || "📬"} ${message}

📍 Theo dõi: https://luxderma.com/account/orders/${orderId}

═══════════════════════════════════════════════
  LUX DERMA — Medical Aesthetics Excellence
═══════════════════════════════════════════════
`;

  console.log(email);
}

export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  console.log(`
═══════════════════════════════════════════════
  🎉 LUX DERMA — CHÀO MỪNG ${name.toUpperCase()}
═══════════════════════════════════════════════

Chào ${name}!

Chào mừng bạn đến với LUX Derma — hệ thống Dược Mỹ phẩm Cao cấp.

Bạn đã là thành viên của LUX Derma với:
  ✅ Tiếp cận sản phẩm dược phẩm cao cấp
  ✅ Hệ thống tư vấn da liễu AI
  ✅ Phòng khám bác sĩ chuyên nghiệp
  ✅ Chương trình khách hàng thân thiết

Khám phá ngay: https://luxderma.com/products

═══════════════════════════════════════════════
`);
}
