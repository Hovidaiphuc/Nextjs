// Vietnam Administrative Divisions Data
// Source: https://raw.githubusercontent.com/kenz-n/vietnam-provinces/master/data.json

export interface Province {
  name: string;
  code: string;
  districts: District[];
}

export interface District {
  name: string;
  code: string;
  wards: Ward[];
}

export interface Ward {
  name: string;
  code: string;
}

// ── Ho Chi Minh City ─────────────────────────────────────────────────────────
const HCM_DISTRICTS: District[] = [
  {
    name: "Quận 1",
    code: "7601",
    wards: [
      { name: "Phường Bến Nghé", code: "76011" },
      { name: "Phường Bến Thành", code: "76012" },
      { name: "Phường Cầu Kho", code: "76013" },
      { name: "Phường Đa Kao", code: "76014" },
      { name: "Phường Nguyễn Cư Trinh", code: "76015" },
      { name: "Phường Phạm Ngũ Lão", code: "76016" },
      { name: "Phường Tân Định", code: "76017" }
    ]
  },
  {
    name: "Quận 3",
    code: "7603",
    wards: [
      { name: "Phường 1", code: "76031" },
      { name: "Phường 2", code: "76032" },
      { name: "Phường 3", code: "76033" },
      { name: "Phường 4", code: "76034" },
      { name: "Phường 5", code: "76035" }
    ]
  },
  {
    name: "Quận Bình Thạnh",
    code: "7604",
    wards: [
      { name: "Phường 1", code: "76041" },
      { name: "Phường 2", code: "76042" },
      { name: "Phường 3", code: "76043" },
      { name: "Phường 11", code: "760411" },
      { name: "Phường 12", code: "760412" },
      { name: "Phường 13", code: "760413" },
      { name: "Phường 14", code: "760414" },
      { name: "Phường 15", code: "760415" },
      { name: "Phường 21", code: "760421" },
      { name: "Phường 22", code: "760422" },
      { name: "Phường 24", code: "760424" },
      { name: "Phường 27", code: "760427" }
    ]
  },
  {
    name: "Quận Gò Vấp",
    code: "7605",
    wards: [
      { name: "Phường 1", code: "76051" },
      { name: "Phường 3", code: "76053" },
      { name: "Phường 4", code: "76054" },
      { name: "Phường 5", code: "76055" },
      { name: "Phường 6", code: "76056" },
      { name: "Phường 7", code: "76057" },
      { name: "Phường 8", code: "76058" },
      { name: "Phường 9", code: "76059" },
      { name: "Phường 10", code: "760510" },
      { name: "Phường 11", code: "760511" },
      { name: "Phường 12", code: "760512" },
      { name: "Phường 13", code: "760513" },
      { name: "Phường 14", code: "760514" },
      { name: "Phường 15", code: "760515" },
      { name: "Phường 16", code: "760516" },
      { name: "Phường 17", code: "760517" }
    ]
  },
  {
    name: "Quận Tân Bình",
    code: "7615",
    wards: [
      { name: "Phường 1", code: "76151" },
      { name: "Phường 2", code: "76152" },
      { name: "Phường 3", code: "76153" },
      { name: "Phường 4", code: "76154" },
      { name: "Phường 5", code: "76155" },
      { name: "Phường 6", code: "76156" },
      { name: "Phường 7", code: "76157" },
      { name: "Phường 8", code: "76158" },
      { name: "Phường 9", code: "76159" },
      { name: "Phường 10", code: "761510" },
      { name: "Phường 11", code: "761511" },
      { name: "Phường 12", code: "761512" },
      { name: "Phường 13", code: "761513" },
      { name: "Phường 14", code: "761514" },
      { name: "Phường 15", code: "761515" }
    ]
  },
  {
    name: "Quận Phú Nhuận",
    code: "7613",
    wards: [
      { name: "Phường 1", code: "76131" },
      { name: "Phường 2", code: "76132" },
      { name: "Phường 3", code: "76133" },
      { name: "Phường 4", code: "76134" },
      { name: "Phường 5", code: "76135" },
      { name: "Phường 7", code: "76137" },
      { name: "Phường 8", code: "76138" },
      { name: "Phường 9", code: "76139" },
      { name: "Phường 10", code: "761310" },
      { name: "Phường 11", code: "761311" },
      { name: "Phường 12", code: "761312" },
      { name: "Phường 13", code: "761313" },
      { name: "Phường 15", code: "761315" },
      { name: "Phường 17", code: "761317" }
    ]
  },
  {
    name: "Quận 7",
    code: "7607",
    wards: [
      { name: "Phường Bình Thuận", code: "76071" },
      { name: "Phường Phú Mỹ", code: "76072" },
      { name: "Phường Phước Kiển", code: "76073" },
      { name: "Phường Phước Lộc", code: "76074" },
      { name: "Phường Tân Hưng", code: "76075" },
      { name: "Phường Tân Phong", code: "76077" },
      { name: "Phường Tân Quy", code: "76078" }
    ]
  }
];

// ── Ha Noi ──────────────────────────────────────────────────────────────────
const HANOI_DISTRICTS: District[] = [
  {
    name: "Quận Ba Đình",
    code: "0101",
    wards: [
      { name: "Phường Cống Vị", code: "01011" },
      { name: "Phường Điện Biên", code: "01012" },
      { name: "Phường Đội Cấn", code: "01013" },
      { name: "Phường Giảng Võ", code: "01014" },
      { name: "Phường Kim Mã", code: "01015" },
      { name: "Phường Liễu Giai", code: "01016" },
      { name: "Phường Ngọc Hà", code: "01017" },
      { name: "Phường Ngọc Khánh", code: "01018" },
      { name: "Phường Phúc Xá", code: "01019" },
      { name: "Phường Thành Công", code: "010111" },
      { name: "Phường Trúc Bạch", code: "010112" }
    ]
  },
  {
    name: "Quận Cầu Giấy",
    code: "0103",
    wards: [
      { name: "Phường Dịch Vọng", code: "01031" },
      { name: "Phường Dịch Vọng Hậu", code: "01032" },
      { name: "Phường Mai Dịch", code: "01033" },
      { name: "Phường Nghĩa Đô", code: "01034" },
      { name: "Phường Nghĩa Tân", code: "01035" },
      { name: "Phường Quan Hoa", code: "01036" },
      { name: "Phường Trung Hòa", code: "01037" },
      { name: "Phường Yên Hòa", code: "01038" }
    ]
  },
  {
    name: "Quận Hoàn Kiếm",
    code: "0104",
    wards: [
      { name: "Phường Chương Dương", code: "01041" },
      { name: "Phường Cửa Đông", code: "01042" },
      { name: "Phường Hàng Bạc", code: "01045" },
      { name: "Phường Hàng Bông", code: "01048" },
      { name: "Phường Hàng Đào", code: "01049" },
      { name: "Phường Hàng Gai", code: "010410" },
      { name: "Phường Lý Thái Tổ", code: "010411" },
      { name: "Phường Phan Chu Trinh", code: "010412" },
      { name: "Phường Tràng Tiền", code: "010414" }
    ]
  }
];

// ── Da Nang ───────────────────────────────────────────────────────────────────
const DN_DISTRICTS: District[] = [
  {
    name: "Quận Hải Châu",
    code: "4801",
    wards: [
      { name: "Phường Bình Hiên", code: "48011" },
      { name: "Phường Bình Thuận", code: "48012" },
      { name: "Phường Hải Châu 1", code: "48013" },
      { name: "Phường Hải Châu 2", code: "48014" },
      { name: "Phường Hòa Cường Bắc", code: "48015" },
      { name: "Phường Hòa Cường Nam", code: "48016" },
      { name: "Phường Hòa Thuận Đông", code: "48017" },
      { name: "Phường Hòa Thuận Tây", code: "48018" },
      { name: "Phường Nam Dương", code: "48019" },
      { name: "Phường Phước Ninh", code: "480110" },
      { name: "Phường Thạch Thang", code: "480111" },
      { name: "Phường Thanh Bình", code: "480112" },
      { name: "Phường Thuận Phước", code: "480113" }
    ]
  }
];

// ── Binh Duong ───────────────────────────────────────────────────────────────
const BD_DISTRICTS: District[] = [
  {
    name: "Thành phố Thủ Dầu Một",
    code: "7401",
    wards: [
      { name: "Phường Chánh Mỹ", code: "74011" },
      { name: "Phường Chánh Nghĩa", code: "74012" },
      { name: "Phường Định Hòa", code: "74013" },
      { name: "Phường Hòa Phú", code: "74014" },
      { name: "Phường Phú Cường", code: "74015" },
      { name: "Phường Phú Hòa", code: "74016" },
      { name: "Phường Phú Lợi", code: "74017" },
      { name: "Phường Phú Mỹ", code: "74018" },
      { name: "Phường Phú Tân", code: "74019" },
      { name: "Phường Tân An", code: "740111" },
      { name: "Phường Tương Bình Hiệp", code: "740112" }
    ]
  }
];

// ── Dong Nai ────────────────────────────────────────────────────────────────
const DONGNAI_DISTRICTS: District[] = [
  {
    name: "Thành phố Biên Hòa",
    code: "7501",
    wards: [
      { name: "Phường An Bình", code: "75011" },
      { name: "Phường Bửu Hòa", code: "75012" },
      { name: "Phường Bửu Long", code: "75013" },
      { name: "Phường Hiệp Hòa", code: "75014" },
      { name: "Phường Hố Nai", code: "75015" },
      { name: "Phường Hóa An", code: "75016" },
      { name: "Phường Long Bình", code: "75017" },
      { name: "Phường Long Bình Tân", code: "75018" },
      { name: "Phường Tam Hiệp", code: "750110" },
      { name: "Phường Tam Hòa", code: "750111" },
      { name: "Phường Tân Mai", code: "750112" },
      { name: "Phường Tân Phong", code: "750113" },
      { name: "Phường Thanh Bình", code: "750114" },
      { name: "Phường Trảng Dài", code: "750115" },
      { name: "Phường Trung Dũng", code: "750116" }
    ]
  }
];

// ── Export all provinces ────────────────────────────────────────────────────
export const vietnamProvinces: Province[] = [
  { name: "Thành phố Hồ Chí Minh", code: "79", districts: HCM_DISTRICTS },
  { name: "Thành phố Hà Nội", code: "01", districts: HANOI_DISTRICTS },
  { name: "Thành phố Đà Nẵng", code: "48", districts: DN_DISTRICTS },
  { name: "Tỉnh Bình Dương", code: "74", districts: BD_DISTRICTS },
  { name: "Tỉnh Đồng Nai", code: "75", districts: DONGNAI_DISTRICTS }
];

export function getProvinces(): Province[] {
  return vietnamProvinces;
}

export function getDistricts(provinceName: string): District[] {
  const p = vietnamProvinces.find(x => x.name === provinceName);
  return p ? p.districts : [];
}

export function getWards(provinceName: string, districtName: string): Ward[] {
  const p = vietnamProvinces.find(x => x.name === provinceName);
  if (!p) return [];
  const d = p.districts.find(x => x.name === districtName);
  return d ? d.wards : [];
}
