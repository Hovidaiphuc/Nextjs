"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ((session?.user as any)?.role === "ADMIN") {
      fetch("/api/analytics")
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false); });
    }
  }, [session]);

  if (!data && loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-slate-700 border-t-rose-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!data) return null;

  const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  const maxRevenue = Math.max(...data.chartData.map((d: any) => d.revenue), 1);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Báo Cáo <span className="text-rose-400">Doanh Thu</span></h1>
        <p className="text-slate-400 text-sm mt-1">Phân tích hiệu suất kinh doanh</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Hôm nay", value: data.revenue.today, color: "rose" },
          { label: "Tuần này", value: data.revenue.week, color: "blue" },
          { label: "Tháng này", value: data.revenue.month, color: "emerald" },
          { label: "Tổng cộng", value: data.revenue.total, color: "amber" }
        ].map(card => (
          <div key={card.label} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
            <div className={`text-2xl font-black mt-2 ${card.color === "rose" ? "text-rose-400" : card.color === "blue" ? "text-blue-400" : card.color === "emerald" ? "text-emerald-400" : "text-amber-400"}`}>{fmt(card.value)}</div>
          </div>
        ))}
      </div>

      {/* Order Count Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Đơn hôm nay", value: data.orderCounts.today },
          { label: "Đơn tuần này", value: data.orderCounts.week },
          { label: "Đơn tháng", value: data.orderCounts.month },
          { label: "Tổng đơn", value: data.orderCounts.total }
        ].map(card => (
          <div key={card.label} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
            <div className="text-2xl font-black text-white mt-2">{card.value} <span className="text-sm font-medium text-slate-400">đơn</span></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-xl font-black text-white mb-6">Doanh Thu 30 Ngày</h2>
          <div className="flex items-end gap-1 h-48">
            {data.chartData.map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="w-full bg-rose-500/80 hover:bg-rose-400 transition-colors rounded-t-sm relative group" style={{ height: `${Math.max(2, (d.revenue / maxRevenue) * 100)}%` }}>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">{fmt(d.revenue)}</div>
                </div>
                {i % 5 === 0 && <span className="text-[8px] text-slate-500 mt-1">{d.date.slice(5)}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-xl font-black text-white mb-6">Phân Bổ Trạng Thái Đơn Hàng</h2>
          <div className="flex flex-col gap-4">
            {data.statusCounts.map((sc: any) => {
              const total = data.statusCounts.reduce((s: number, x: any) => s + x._count.status, 0);
              const pct = total > 0 ? (sc._count.status / total) * 100 : 0;
              const colors: Record<string, string> = { PENDING: "bg-amber-500", CONFIRMED: "bg-blue-500", PROCESSING: "bg-indigo-500", SHIPPED: "bg-orange-500", DELIVERED: "bg-emerald-500", CANCELLED: "bg-slate-500", REFUNDED: "bg-red-500" };
              return (
                <div key={sc.status} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 w-28 uppercase">{sc.status}</span>
                  <div className="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[sc.status] || "bg-slate-500"} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="text-sm font-black text-white w-12 text-right">{sc._count.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-xl font-black text-white mb-6">Top Sản Phẩm Bán Chạy</h2>
          <div className="flex flex-col gap-4">
            {data.topProducts.map((tp: any, i: number) => (
              <div key={tp.productId} className="flex items-center gap-4">
                <span className="w-8 h-8 bg-rose-500/20 text-rose-400 font-black text-sm flex items-center justify-center rounded-full">{i + 1}</span>
                {tp.product?.imageUrl && <Image width={40} height={40} src={tp.product.imageUrl} alt="" className="w-10 h-10 rounded-lg object-contain bg-white" />}
                <div className="flex-1">
                  <span className="font-bold text-white text-sm line-clamp-1">{tp.product?.name}</span>
                  <span className="text-xs text-slate-400 block">{tp._count.productId} đơn · {tp._sum.quantity || 0} sản phẩm</span>
                </div>
              </div>
            ))}
            {data.topProducts.length === 0 && <p className="text-slate-400 font-bold text-center py-8">Chưa có dữ liệu</p>}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-xl font-black text-white mb-6">Đơn Hàng Mới Nhất</h2>
          <div className="flex flex-col gap-3">
            {data.recentOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                <div>
                  <span className="font-black text-white text-sm">#{o.id.slice(-6)}</span>
                  <span className="text-xs text-slate-400 ml-2">{o.user?.name || o.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-rose-400">{fmt(o.totalAmount)}</span>
                  <span className={`ml-2 text-[10px] font-black uppercase ${o.status === "DELIVERED" ? "text-emerald-400" : o.status === "PENDING" ? "text-amber-400" : "text-blue-400"}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}