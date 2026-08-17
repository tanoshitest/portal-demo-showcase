export type EquipmentCatalogItem = {
  code: string;
  name: string;
  specification: string;
  unit: string;
  referencePrice: number;
  note: string;
};

export type EquipmentCatalogGroup = {
  id: string;
  tabLabel: string;
  title: string;
  items: EquipmentCatalogItem[];
};

export const equipmentCatalogGroups: EquipmentCatalogGroup[] = [
  {
    id: "pin",
    tabLabel: "Danh mục Pin",
    title: "Danh sách tấm pin",
    items: [
      { code: "PV-TRINA-630", name: "TRINA 630", specification: "630 Wp - 2,84 m2", unit: "tấm", referencePrice: 3_150_000, note: "Bảo hành 12 năm" },
      { code: "PV-LONGI-650", name: "LONGI 650", specification: "650 Wp - 2,84 m2", unit: "tấm", referencePrice: 3_450_000, note: "Bảo hành 15 năm" },
      { code: "PV-AIKO-650", name: "AIKO 650", specification: "650 Wp - 2,84 m2", unit: "tấm", referencePrice: 3_800_000, note: "Bảo hành 15 năm" },
      { code: "PV-VSUN-580", name: "VSUN 580", specification: "580 Wp - 2,70 m2", unit: "tấm", referencePrice: 2_650_000, note: "Bảo hành 12 năm" },
      { code: "PV-JINKO-625", name: "JINKO 625", specification: "625 Wp - 2,75 m2", unit: "tấm", referencePrice: 3_250_000, note: "Bảo hành 12 năm" },
      { code: "PV-TCL-620", name: "TCL 620", specification: "620 Wp - 2,80 m2", unit: "tấm", referencePrice: 2_950_000, note: "Bảo hành 12 năm" },
    ],
  },
  {
    id: "bien-tan",
    tabLabel: "Danh mục biến tần",
    title: "Danh sách biến tần",
    items: [
      { code: "INV-GW-5K", name: "Growatt MIN 5000TL-X", specification: "5 kW - 1 pha - 2 MPPT", unit: "bộ", referencePrice: 15_900_000, note: "Bảo hành 5 năm" },
      { code: "INV-HW-10K", name: "Huawei SUN2000-10KTL-M1", specification: "10 kW - 3 pha - 2 MPPT", unit: "bộ", referencePrice: 34_900_000, note: "Bảo hành 10 năm" },
      { code: "INV-SG-5K", name: "Sungrow SG5.0RS", specification: "5 kW - 1 pha - IP65", unit: "bộ", referencePrice: 14_800_000, note: "Bảo hành 5 năm" },
      { code: "INV-DEYE-8K", name: "DEYE SUN-8K-SG04LP3", specification: "8 kW - Hybrid 3 pha", unit: "bộ", referencePrice: 39_500_000, note: "Bảo hành 5 năm" },
      { code: "INV-SOLIS-12K", name: "Solis S6-EH3P12K-H", specification: "12 kW - Hybrid 3 pha", unit: "bộ", referencePrice: 48_500_000, note: "Bảo hành 5 năm" },
    ],
  },
  {
    id: "pin-luu-tru",
    tabLabel: "Danh mục pin lưu trữ",
    title: "Danh sách pin lưu trữ",
    items: [
      { code: "BAT-EJOR-16", name: "EJOR 16 - BH7", specification: "16 kWh/bộ", unit: "bộ", referencePrice: 36_500_000, note: "Bảo hành 7 năm" },
      { code: "BAT-SOFAR-16", name: "SOFAR 16 - BH10", specification: "16 kWh/bộ", unit: "bộ", referencePrice: 42_000_000, note: "Bảo hành 10 năm" },
      { code: "BAT-PYLON-1065", name: "Pylontech 10.65", specification: "10,65 kWh/bộ", unit: "bộ", referencePrice: 28_000_000, note: "Bảo hành 10 năm" },
      { code: "BAT-DYNESS-1024", name: "Dyness 10.24", specification: "10,24 kWh/bộ", unit: "bộ", referencePrice: 30_500_000, note: "Bảo hành 10 năm" },
      { code: "BAT-DEYE-1536", name: "DEYE 15.36", specification: "15,36 kWh/bộ", unit: "bộ", referencePrice: 39_800_000, note: "Bảo hành 10 năm" },
    ],
  },
  {
    id: "tu-dien",
    tabLabel: "Danh mục tủ điện",
    title: "Danh sách tủ điện",
    items: [
      { code: "CAB-AC-1P", name: "Tủ điện AC 1 pha", specification: "CB AC, SPD, vỏ tủ IP65", unit: "bộ", referencePrice: 6_500_000, note: "Bảo hành 24 tháng" },
      { code: "CAB-AC-3P", name: "Tủ điện AC 3 pha", specification: "CB AC 3 pha, SPD, vỏ tủ IP65", unit: "bộ", referencePrice: 9_500_000, note: "Bảo hành 24 tháng" },
      { code: "CAB-DC", name: "Tủ điện DC", specification: "CB DC, cầu chì, SPD DC", unit: "bộ", referencePrice: 8_000_000, note: "Bảo hành 24 tháng" },
      { code: "CAB-HYBRID", name: "Tủ điện hybrid AC/DC", specification: "Tích hợp bảo vệ AC và DC", unit: "bộ", referencePrice: 12_500_000, note: "Bảo hành 24 tháng" },
    ],
  },
  {
    id: "phu-kien",
    tabLabel: "Danh mục phụ kiện",
    title: "Danh sách phụ kiện",
    items: [
      { code: "ACC-RAIL-42", name: "Rail nhôm lắp pin 4,2 m", specification: "Nhôm 6005-T5 - 40 x 40 mm", unit: "thanh", referencePrice: 245_000, note: "Bảo hành 10 năm" },
      { code: "ACC-CLAMP", name: "Bộ kẹp giữa và kẹp biên", specification: "Nhôm anodized, bulong inox", unit: "bộ", referencePrice: 85_000, note: "Theo cấu hình mái" },
      { code: "ACC-CABLE-AC", name: "Dây điện AC Cadisun", specification: "1 pha hoặc 3 pha", unit: "mét", referencePrice: 62_000, note: "Bảo hành 12 tháng" },
      { code: "ACC-CABLE-DC", name: "Dây DC solar 1x4 mm2", specification: "Chuẩn H1Z2Z2-K - 1.500V DC", unit: "mét", referencePrice: 28_000, note: "Chịu UV ngoài trời" },
      { code: "ACC-PIPE-D20", name: "Ống luồn dây D20", specification: "Ống PVC bảo vệ dây dẫn", unit: "mét", referencePrice: 12_000, note: "Dùng trong và ngoài nhà" },
    ],
  },
  {
    id: "nhan-cong",
    tabLabel: "Danh mục nhân công",
    title: "Danh sách nhân công",
    items: [
      { code: "LAB-PANEL-1P", name: "Thi công hệ điện mặt trời 1 pha", specification: "Lắp khung, pin, đi dây và cấu hình", unit: "tấm", referencePrice: 360_000, note: "Theo khối lượng thực tế" },
      { code: "LAB-PANEL-3P", name: "Thi công hệ điện mặt trời 3 pha", specification: "Lắp khung, pin, đi dây và cấu hình", unit: "tấm", referencePrice: 420_000, note: "Theo khối lượng thực tế" },
      { code: "LAB-CRANE", name: "Cẩu pin lên mái", specification: "Xe cẩu và nhân công vận hành", unit: "ca", referencePrice: 1_500_000, note: "Tính theo số ca" },
      { code: "LAB-REMOTE", name: "Phụ phí công trình xa", specification: "Di chuyển và lưu trú đội thi công", unit: "ngày", referencePrice: 500_000, note: "Tính theo số ngày" },
      { code: "LAB-COMMISSION", name: "Cấu hình và nghiệm thu hệ thống", specification: "Cài đặt, kiểm tra và bàn giao", unit: "gói", referencePrice: 3_500_000, note: "Theo quy mô hệ thống" },
    ],
  },
];
