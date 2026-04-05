"use client";

import React, { useState } from "react";
import { vietnamProvinces, type Province, type District, type Ward } from "@/lib/vietnam-provinces";

export interface AddressData {
  name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault?: boolean;
}

interface AddressFormProps {
  value?: Partial<AddressData>;
  onChange?: (addr: AddressData) => void;
  compact?: boolean;
  showName?: boolean;
  showPhone?: boolean;
}

export default function AddressForm({
  value,
  onChange,
  compact = false,
  showName = true,
  showPhone = true,
}: AddressFormProps) {
  const [name, setName] = useState(value?.name ?? "");
  const [phone, setPhone] = useState(value?.phone ?? "");
  const [province, setProvince] = useState(value?.province ?? "");
  const [district, setDistrict] = useState(value?.district ?? "");
  const [ward, setWard] = useState(value?.ward ?? "");
  const [detail, setDetail] = useState(value?.detail ?? "");

  const districts: District[] = vietnamProvinces.find((p: Province) => p.name === province)?.districts ?? [];
  const selectedDistrict = districts.find((d: District) => d.name === district);
  const wards: Ward[] = selectedDistrict?.wards ?? [];

  const emit = (patch: Partial<AddressData>) => {
    onChange?.({ name, phone, province, district, ward, detail, ...patch });
  };

  return (
    <div className="flex flex-col gap-4">
      {showName && (
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Họ và tên người nhận</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); emit({ name: e.target.value }); }}
            type="text"
            placeholder="Nguyễn Văn A"
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold focus:bg-white focus:outline-none focus:border-rose-500 transition-all"
          />
        </div>
      )}

      {showPhone && (
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => { setPhone(e.target.value); emit({ phone: e.target.value }); }}
            type="tel"
            placeholder="0xxx.xxx.xxx"
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold focus:bg-white focus:outline-none focus:border-rose-500 transition-all"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Province */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tỉnh / Thành phố</label>
          <select
            value={province}
            onChange={(e) => { setProvince(e.target.value); setDistrict(""); setWard(""); emit({ province: e.target.value, district: "", ward: "" }); }}
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold focus:outline-none focus:border-rose-500 appearance-none cursor-pointer"
          >
            <option value="">— Chọn Tỉnh/Thành —</option>
            {vietnamProvinces.map((p: Province) => (
              <option key={p.code} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Quận / Huyện</label>
          <select
            value={district}
            onChange={(e) => { setDistrict(e.target.value); setWard(""); emit({ district: e.target.value, ward: "" }); }}
            disabled={!province}
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold focus:outline-none focus:border-rose-500 appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="">— Chọn Quận/Huyện —</option>
            {districts.map((d: District) => (
              <option key={d.code} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ward */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Phường / Xã</label>
        <select
          value={ward}
          onChange={(e) => { setWard(e.target.value); emit({ ward: e.target.value }); }}
          disabled={!district}
          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold focus:outline-none focus:border-rose-500 appearance-none cursor-pointer disabled:opacity-50"
        >
          <option value="">— Chọn Phường/Xã —</option>
          {wards.map((w: Ward) => (
            <option key={w.code} value={w.name}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Detail */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Địa chỉ chi tiết (số nhà, đường, tầng)</label>
        <input
          value={detail}
          onChange={(e) => { setDetail(e.target.value); emit({ detail: e.target.value }); }}
          type="text"
          placeholder="123 Nguyễn Trãi, Tầng 5, Chung cư ABC"
          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold focus:bg-white focus:outline-none focus:border-rose-500 transition-all"
        />
      </div>

      {/* Full address preview */}
      {province && district && ward && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Địa chỉ đầy đủ:</span>
          <span className="text-sm font-bold text-emerald-700">
            {detail ? `${detail}, ` : ""}{ward}, {district}, {province}
          </span>
        </div>
      )}
    </div>
  );
}
