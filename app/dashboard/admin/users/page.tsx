"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AdminUsersDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     if ((session?.user as any)?.role === "ADMIN") {
        fetch("/api/users")
          .then((res) => res.json())
          .then((data) => {
             setUsers(data);
             setLoading(false);
          });
     }
  }, [session]);

  if (loading) return <div className="p-20 text-center animate-pulse font-bold">Đang lục cuốn tự điển Khách Hàng...</div>;

  return (
    <div>
        <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Hồ Sơ Mật (CRM)</h1>
        <p className="text-slate-500 font-medium mb-10">Danh sách các Tín đồ đã ghi danh thề trung thành với Hệ sinh thái.</p>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100/80">
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Tín Đồ</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/3">Hộp Thư Định Vị</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Binh Chủng</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-6">
                                <div className="flex items-center gap-3">
                                   <img src={u.image || `https://ui-avatars.com/api/?name=${u.name}&background=random`} className="w-10 h-10 rounded-full border border-slate-200" alt="Ava" />
                                   <div className="font-bold text-sm text-slate-900">{u.name}</div>
                                </div>
                            </td>
                            <td className="px-6 py-6 text-slate-500 font-medium text-sm">
                                {u.email}
                            </td>
                            <td className="px-6 py-6 text-center">
                                <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${u.role === "ADMIN" ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                   {u.role}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}
