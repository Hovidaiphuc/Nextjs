"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/app/store/cartStore";
import toast from "react-hot-toast";

const QUESTIONS = [
  {
     id: "skinType",
     question: "Nền tảng sinh lý da của Sếp là gì?",
     desc: "Hãy sờ vào mặt ngay lúc này, vùng chữ T (trán, mũi) đang ra sao?",
     options: [
        { label: "Bóng Dầu Mỡ", value: "OILY", icon: "💦" },
        { label: "Khô Nứt Nẻ", value: "DRY", icon: "🏜️" },
        { label: "Hỗn Hợp Bức Bối", value: "COMBINATION", icon: "🌋" },
        { label: "Nhạy Cảm", value: "SENSITIVE", icon: "🌡️" }
     ]
  },
  {
     id: "skinIssue",
     question: "Vấn đề cốt lõi trên bề mặt (Biến chứng)?",
     desc: "Cái gì làm Sếp khó chịu nhất khi nhìn vào gương?",
     options: [
        { label: "Mụn Viêm Nặng", value: "ACNE", icon: "🔴" },
        { label: "Lão Hóa / Chảy Xệ", value: "AGING", icon: "👵" },
        { label: "Thâm Nám Xỉn Màu", value: "PIGMENTATION", icon: "🌑" },
        { label: "Không Lỗi Chỉ Cần Duy Trì", value: "NORMAL", icon: "✨" }
     ]
  }
];

export default function SkincareQuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [routine, setRoutine] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const cart = useCartStore();

  useEffect(() => {
     fetch("/api/products").then(r => r.json()).then(data => setAllProducts(data));
  }, []);

  const handleSelect = (qId: string, val: string) => {
     setAnswers(prev => ({ ...prev, [qId]: val }));
     if (step < QUESTIONS.length - 1) {
         setTimeout(() => setStep(step + 1), 300);
     } else {
         generateRoutine({ ...answers, [qId]: val });
     }
  };

  const generateRoutine = (finalAnswers: Record<string, string>) => {
      setAnalyzing(true);
      const skinType = finalAnswers.skinType;
      
      setTimeout(() => {
          // Thuật toán bốc thuốc Độc quyền: Móc Random Sản phẩm trùng SkinType
          // Hoặc rớt lại 3 món Hot nhất nếu Data Sếp quá Hẻo.
          let matched = allProducts.filter(p => !p.skinType || p.skinType === 'ALL' || p.skinType === skinType);
          
          if (matched.length < 3) matched = allProducts.slice(0, 3); // Cứ vớt 3 món cho đẹp Routine
          else matched = matched.slice(0, 3);

          setRoutine(matched);
          setAnalyzing(false);
          setStep(99); // Sang View Kết quả
      }, 2500);
  };

  const addEntireRoutineToCart = () => {
      if (routine.length === 0) return;
      routine.forEach(p => cart.addItem({ id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, quantity: 1 }));
      toast.success("BỐC TRỌN BỘ Y KHOA VÀO GIỎ!", { duration: 4000, style: { background: '#10b981', color: 'white', fontWeight: 'bold' } });
  };

  // MÀN HÌNH CHỜ QUÉT KẾT QUẢ AI
  if (analyzing) {
     return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-40 h-40 mb-8 border-4 border-amber-500/20 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-5xl animate-pulse">🤖</div>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Đang Tổng Hợp Mẫu Dữ Liệu</h2>
            <p className="text-amber-500 font-mono text-sm tracking-widest animate-pulse">&gt; Phân rã Thuật toán Skin: {answers.skinType} | &gt; Check Lõi Mụn: {answers.skinIssue}</p>
        </div>
     );
  }

  // MÀN HÌNH KẾT QUẢ (PHÁT TOA THUỐC ĐIỆN TỬ)
  if (step === 99) {
     return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-32">
            <div className="max-w-4xl mx-auto px-6">
                
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-100 rounded-full blur-[80px]"></div>
                    <span className="relative z-10 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-100 px-3 py-1.5 rounded-full mb-4 inline-block shadow-sm">Báo Cáo Bệnh Lý Chuẩn Y Khoa</span>
                    <h1 className="relative z-10 text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-tight mt-4">Sau Đáy Lớp Biểu Bì Tối Tăm,<br/>Đây Là <span className="text-rose-500">Phác Đồ Độc Bản</span></h1>
                </div>

                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 mb-10">
                    <h3 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-6 mb-8 flex items-center gap-3">
                        Lộ Trình Đả Thông Huyệt Đạo (Routine)
                    </h3>

                    {routine.length === 0 ? (
                        <div className="text-center py-10 font-bold text-slate-400">Kho dược liệu hiện đã cháy nguồn, chưa thể xếp thành Lộ Trình Phù hợp...</div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {routine.map((p, i) => (
                                <div key={p.id} className="group flex flex-col md:flex-row gap-6 items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                                    <div className="relative w-32 h-32 bg-white rounded-2xl overflow-hidden shrink-0 shadow-sm">
                                        <div className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full z-10">{i + 1}</div>
                                        {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{i===0?'Sáng & Tối':i===1?'Treatment Chuyên Sâu':'Khóa Màng Bảo Vệ'}</div>
                                        <h4 className="text-xl font-bold text-slate-800 line-clamp-2">{p.name}</h4>
                                        <p className="text-rose-500 font-black text-lg mt-2">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {routine.length > 0 && (
                    <div className="flex flex-col items-center gap-6">
                        <button onClick={addEntireRoutineToCart} className="bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black uppercase tracking-widest text-sm px-10 py-5 rounded-2xl shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all w-full md:w-auto">
                            🔥 BÊ NGUYÊN LỘ TRÌNH VÀO GIỎ NGAY
                        </button>
                        <Link href="/checkout" className="text-sm font-bold text-slate-400 hover:text-slate-800 underline transition-colors">Vào Đập Tiền Thanh Toán (Kế Toán)</Link>
                    </div>
                )}
            </div>
        </div>
     )
  }

  // MÀN HÌNH TRA KHẢO (QUIZ UI)
  const currentQ = QUESTIONS[step];
  
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
        {/* Progress Bar Siêu Xịn */}
        <div className="h-2 w-full bg-slate-800">
            <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${((step)/QUESTIONS.length)*100}%` }}></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]"></div>
            
            <div className="max-w-3xl w-full relative z-10 text-center animate-in fade-in slide-in-from-bottom-10 duration-700" key={step}>
                <span className="text-amber-500 font-black uppercase tracking-widest text-xs mb-4 block">Điều Tra Y Khoa {step + 1} / {QUESTIONS.length}</span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">{currentQ.question}</h1>
                <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto mb-16">{currentQ.desc}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                    {currentQ.options.map(opt => (
                        <button 
                            key={opt.value} 
                            onClick={() => handleSelect(currentQ.id, opt.value)}
                            className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-amber-500 p-8 rounded-3xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20 group flex flex-col items-center text-center gap-4"
                        >
                            <span className="text-5xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                            <span className="text-lg font-bold text-slate-200">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="absolute bottom-10 left-0 w-full text-center">
                <Link href="/" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Bỏ Chạy (Hủy Đăng Ký)</Link>
            </div>
        </div>
    </div>
  );
}
