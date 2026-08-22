import { accessoryCatalogItems } from "./accessory-catalog";
import { inverterCatalogItems } from "./inverter-catalog";

export type EquipmentCatalogItem = {
  id?: string;
  code: string;
  image?: string;
  name: string;
  specification: string;
  unit: string;
  referencePrice: number | null;
  note: string;
  capacityKwp?: number;
  lengthMm?: number;
  widthMm?: number;
  areaM2?: number;
  batteryGroup?: string;
  capacityKwh?: number;
  warrantyYears?: number;
  stockQuantity?: number;
  inverterGroup?: string;
  catalogStt?: string | number | null;
  capacityKw?: number;
  profit?: number | null;
  customerPrice?: number | null;
  accessoryGroup?: string;
  quantity?: number;
  phase?: "1 pha" | "3 pha";
};

export function cabinetPhaseOf(item: EquipmentCatalogItem): "1 pha" | "3 pha" | "" {
  if (item.phase === "1 pha" || item.phase === "3 pha") return item.phase;
  const text = `${item.code} ${item.name} ${item.specification}`;
  if (/(?:3\s*pha|\b3p\b)/i.test(text)) return "3 pha";
  if (/(?:1\s*pha|\b1p\b)/i.test(text)) return "1 pha";
  return "";
}

export function cabinetCapacityKwOf(item: EquipmentCatalogItem): number | undefined {
  if (item.capacityKw != null) return item.capacityKw;
  const match = `${item.name}\n${item.specification}`.match(/(\d+(?:[.,]\d+)?)\s*k\s*w/i);
  if (!match) return undefined;
  return Number(match[1].replace(",", "."));
}

function catalogItemKey(item: EquipmentCatalogItem) {
  return (item.id ?? item.code).toLowerCase();
}

export function mergeSeedCabinets(groups: EquipmentCatalogGroup[]): EquipmentCatalogGroup[] {
  const seed = equipmentCatalogGroups.find((group) => group.id === "tu-dien");
  if (!seed) return groups;
  return groups.map((group) => {
    if (group.id !== "tu-dien") return group;
    const existing = new Set(group.items.map(catalogItemKey));
    const extras = seed.items.filter((item) => !existing.has(catalogItemKey(item)));
    return extras.length ? { ...group, items: [...group.items, ...extras] } : group;
  });
}

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
    title: "Bảng giá tấm pin NLMT",
    items: [
      { code: "ASTRO 620", name: "ASTRO 620", specification: "Tấm pin năng lượng mặt trời 620W", unit: "Tấm", referencePrice: 0, note: "Bảo hành 15 năm vật lý.\nBảo hành 25 năm hiệu suất >80%", capacityKwp: 0.62, lengthMm: 2382, widthMm: 1134, areaM2: 2.8 },
      { code: "ASTRO 630", name: "ASTRO 630", specification: "Tấm pin năng lượng mặt trời 630W", unit: "Tấm", referencePrice: null, note: "Bảo hành 15 năm vật lý.\nBảo hành 25 năm hiệu suất >80%", capacityKwp: 0.63, lengthMm: 2382, widthMm: 1134, areaM2: 2.8 },
      { code: "VSUN 595", name: "VSUN 595", specification: "Tấm pin năng lượng mặt trời 595W", unit: "Tấm", referencePrice: null, note: "Bảo hành 15 năm vật lý.\nBảo hành 25 năm hiệu suất >80%", capacityKwp: 0.595, lengthMm: 2278, widthMm: 1134, areaM2: 2.7 },
      { code: "AIKO 670", name: "AIKO 670", specification: "Tấm pin năng lượng mặt trời 670W", unit: "Tấm", referencePrice: null, note: "Bảo hành 15 năm vật lý.\nBảo hành 25 năm hiệu suất >80%", capacityKwp: 0.67, lengthMm: 2382, widthMm: 1134, areaM2: 2.8 },
      { code: "LONGI 620", name: "LONGI 620", specification: "Tấm pin năng lượng mặt trời 620W", unit: "Tấm", referencePrice: 2_232_000, note: "Bảo hành 15 năm vật lý.\nBảo hành 25 năm hiệu suất >80%", capacityKwp: 0.62, lengthMm: 2382, widthMm: 1134, areaM2: 2.8 },
      { code: "TRINA 630", name: "TRINA 630", specification: "Tấm pin năng lượng mặt trời 630W", unit: "Tấm", referencePrice: 2_268_000, note: "Bảo hành 15 năm vật lý.\nBảo hành 25 năm hiệu suất >80%", capacityKwp: 0.63, lengthMm: 2382, widthMm: 1134, areaM2: 2.8 },
      { code: "LONGI 650", name: "LONGI 650", specification: "Tấm pin năng lượng mặt trời 650W", unit: "Tấm", referencePrice: null, note: "Bảo hành 15 năm vật lý.\nBảo hành 25 năm hiệu suất >80%", capacityKwp: 0.65, lengthMm: 2382, widthMm: 1134, areaM2: 2.8 },
      { code: "AIKO 650", name: "AIKO 650", specification: "Tấm pin năng lượng mặt trời 650W", unit: "Tấm", referencePrice: null, note: "Bảo hành 15 năm vật lý.\nBảo hành 25 năm hiệu suất >80%", capacityKwp: 0.65, lengthMm: 2382, widthMm: 1134, areaM2: 2.8 },
      { code: "VSUN 580", name: "VSUN 580", specification: "Tấm pin năng lượng mặt trời 580W", unit: "Tấm", referencePrice: 1_860_000, note: "Bảo hành 15 năm vật lý.\nBảo hành 25 năm hiệu suất >80%", capacityKwp: 0.58, lengthMm: 2382, widthMm: 1134, areaM2: 2.8 },
      { code: "JINKO 625", name: "JINKO 625", specification: "Tấm pin năng lượng mặt trời 625W", unit: "Tấm", referencePrice: 2_175_000, note: "Bảo hành 15 năm vật lý.\nBảo hành 25 năm hiệu suất >80%", capacityKwp: 0.625 },
      { code: "TCL 620", name: "TCL 620", specification: "Tấm pin năng lượng mặt trời 620W", unit: "Tấm", referencePrice: 2_180_000, note: "Bảo hành 15 năm vật lý.\nBảo hành 25 năm hiệu suất >80%", capacityKwp: 0.62 },
    ],
  },
  {
    id: "bien-tan",
    tabLabel: "Danh mục biến tần",
    title: "Bảng giá biến tần",
    items: inverterCatalogItems,
  },
  {
    id: "pin-luu-tru",
    tabLabel: "Danh mục pin lưu trữ",
    title: "Bảng giá pin lưu trữ",
    items: [
      {
        code: "LV 10.24 KW - BH5",
        name: "PIN LƯU TRỮ LV TOPSUN LV512200 - 10.24 kWh",
        specification: "Dung lượng: 51.2V - 200Ah ≈ 10.24 kWh\nKích thước: 620 x 145 x 816 mm | Trọng lượng: ~87.5 kg\nCó màn hình hiển thị thông tin\nBảo hành: 5 năm",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN LV TOP SUN",
        capacityKwh: 10.24,
        warrantyYears: 5,
        stockQuantity: 0,
      },
      {
        code: "LV 15.36 KW - BH5",
        name: "PIN LƯU TRỮ LV TOPSUN 15.36 kWh",
        specification: "Dung lượng: 51.2V - 300Ah ≈ 15.36 kWh\nKích thước: 910 x 570 x 270 mm | Trọng lượng: ~140 kg\nCó màn hình hiển thị thông tin\nBảo hành: 5 năm",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN LV TOP SUN",
        capacityKwh: 15.36,
        warrantyYears: 5,
        stockQuantity: 0,
      },
      {
        code: "CFE 15.36 - BH10",
        name: "PIN LƯU TRỮ CFE-WL-15",
        specification: "Dung lượng: ~15,36 kWh (51.2V - 300Ah)\nCông suất xả: Tối đa ~10 kW\nCông nghệ: LiFePO4\nTuổi thọ: ~6.000 chu kỳ @80% DoD\nKích thước: 564 x 157 x 974 mm\nNhiệt độ làm việc: Sạc 0~45°C | Xả -10~55°C\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN CFE",
        capacityKwh: 15.36,
        warrantyYears: 10,
        stockQuantity: 0,
      },
      {
        code: "CFE 16 - BH10",
        name: "PIN LƯU TRỮ CFE-WL-16",
        specification: "Dung lượng: 16.07 kWh (51.2V - 314Ah)\nCông suất xả: Tối đa ~10 kW\nCông nghệ: LiFePO4\nTuổi thọ: 8.000 chu kỳ @80% DoD\nKích thước: 564 x 157 x 974 mm\nNhiệt độ làm việc: Sạc 0~45°C | Xả -10~55°C\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: 42_000_000,
        note: "",
        batteryGroup: "PIN CFE",
        capacityKwh: 16,
        warrantyYears: 10,
        stockQuantity: 1,
      },
      {
        code: "SVE 15.6 - BH5",
        name: "PIN LƯU TRỮ SVE 15.6 LITE",
        specification: "Dung lượng: 15,6 kWh (51.2V - 305Ah)\nDòng sạc/xả: Tối đa 200A\nCông nghệ: LiFePO4\nTuổi thọ: ~8.000 chu kỳ @80% DoD\nKích thước: 865 x 500 x 255 mm\nTrọng lượng: ~124 kg\nBảo hành: 5 năm chính hãng",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN SVE",
        capacityKwh: 15.6,
        warrantyYears: 5,
        stockQuantity: 0,
      },
      {
        code: "LS 7.68 - BH5",
        name: "PIN LƯU TRỮ LS LiFePO4 - 7,68 kWh",
        specification: "Điện áp: 51.2 V | Dung lượng: 150 Ah\nDòng sạc: 45 A (Max 100 A) | Dòng xả: 200 A\nTrang bị BMS thông minh, có màn hình hiển thị thông số\nChứng chỉ: ISO9001 • UL • CE • UN38.3\nBảo hành: 5 năm",
        unit: "bộ",
        referencePrice: 17_000_000,
        note: "",
        batteryGroup: "PIN LS BẢO HÀNH 5 NĂM",
        capacityKwh: 7.68,
        warrantyYears: 5,
        stockQuantity: 0,
      },
      {
        code: "LS 15.36 - BH5",
        name: "PIN LƯU TRỮ LS LiFePO4 - 15,36 kWh",
        specification: "Điện áp: 51.2 V | Dung lượng: 300 Ah\nDòng sạc: 45 A (Max 100 A) | Dòng xả: 200 A\nTrang bị BMS thông minh, có màn hình hiển thị thông số\nChứng chỉ: ISO9001 • UL • CE • UN38.3\nBảo hành: 5 năm",
        unit: "bộ",
        referencePrice: 31_000_000,
        note: "",
        batteryGroup: "PIN LS BẢO HÀNH 5 NĂM",
        capacityKwh: 15.36,
        warrantyYears: 5,
        stockQuantity: 0,
      },
      {
        code: "LS 20.48 - BH5",
        name: "PIN LƯU TRỮ LS LiFePO4 - 20,48 kWh",
        specification: "Điện áp: 51.2 V | Dung lượng: 400 Ah\nDòng sạc: 45 A (Max 100 A) | Dòng xả: 200 A\nTrang bị BMS thông minh, có màn hình hiển thị thông số\nChứng chỉ: ISO9001 • UL • CE • UN38.3\nBảo hành: 5 năm",
        unit: "bộ",
        referencePrice: 37_000_000,
        note: "",
        batteryGroup: "PIN LS BẢO HÀNH 5 NĂM",
        capacityKwh: 20.48,
        warrantyYears: 5,
        stockQuantity: 0,
      },
      {
        code: "VALLEY 10.24 BH10",
        name: "PIN LƯU TRỮ VALLEY 10.24 kWh",
        specification: "Điện áp: 51.2 V | Dung lượng: 150 Ah\nDòng sạc: 200 A (Max 200 A) | Dòng xả: 200 A\nTrang bị BMS thông minh, có màn hình hiển thị thông số\nChứng chỉ: ISO9001 • UL • CE • UN38.3\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN VALLEY - BẢO HÀNH 10 NĂM",
        capacityKwh: 10.24,
        warrantyYears: 10,
        stockQuantity: 0,
      },
      {
        code: "VALLEY 14.3 BH10",
        name: "PIN LƯU TRỮ VALLEY 14,3 kWh",
        specification: "Điện áp: 51.2 V | Dung lượng: 280 Ah\nDòng sạc: 200 A (Max 200 A) | Dòng xả: 200 A\nTrang bị BMS thông minh, có màn hình hiển thị thông số\nChứng chỉ: ISO9001 • UL • CE • UN38.3\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN VALLEY - BẢO HÀNH 10 NĂM",
        capacityKwh: 14.3,
        warrantyYears: 10,
        stockQuantity: 0,
      },
      {
        code: "VALLEY 16 BH10",
        name: "PIN LƯU TRỮ VALLEY 16,076 kWh",
        specification: "Điện áp: 51.2 V | Dung lượng: 150 Ah\nDòng sạc: 200 A (Max 200 A) | Dòng xả: 250 A\nTrang bị BMS thông minh, có màn hình hiển thị thông số\nChứng chỉ: ISO9001 • UL • CE • UN38.3\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: 41_300_000,
        note: "",
        batteryGroup: "PIN VALLEY - BẢO HÀNH 10 NĂM",
        capacityKwh: 16.076,
        warrantyYears: 10,
        stockQuantity: 1,
      },
      {
        code: "BETTENERGY 5 - BH10",
        name: "PIN LƯU TRỮ BETTENERGY 5 KW",
        specification: "Model: ELESHELL-5K\nDung lượng: 5 kWh (DOD 90%)\nĐiện áp: 51.2V\nDòng sạc/xả liên tục: 100A\nCấp bảo vệ: IP20 | Trọng lượng: ~50 kg\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN LV Bettenergy",
        capacityKwh: 5,
        warrantyYears: 10,
        stockQuantity: 0,
      },
      {
        code: "BETTENERGY 10.2 - BH10",
        name: "PIN LƯU TRỮ BETTENERGY 10.2 KW",
        specification: "Model: ELESHELL-10.2K\nDung lượng: 5 kWh (DOD 90%)\nĐiện áp: 51.2V\nDòng sạc/xả liên tục: 100A\nCấp bảo vệ: IP20 | Trọng lượng: ~50 kg\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN LV Bettenergy",
        capacityKwh: 10.2,
        warrantyYears: 10,
        stockQuantity: 0,
      },
      {
        code: "BETTENERGY 14.3 - BH10",
        name: "PIN LƯU TRỮ BETTENERGY 14.3 KW",
        specification: "Model: ELESHELL-14.3K\nDung lượng: 5 kWh (DOD 90%)\nĐiện áp: 51.2V\nDòng sạc/xả liên tục: 100A\nCấp bảo vệ: IP20 | Trọng lượng: ~50 kg\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN LV Bettenergy",
        capacityKwh: 14.3,
        warrantyYears: 10,
        stockQuantity: 0,
      },
      {
        code: "BETTENERGY 16 - BH10",
        name: "PIN LƯU TRỮ BETTENERGY 16 KW",
        specification: "Model: ELESHELL-16K\nDung lượng: 5 kWh (DOD 90%)\nĐiện áp: 51.2V\nDòng sạc/xả liên tục: 100A\nCấp bảo vệ: IP20 | Trọng lượng: ~50 kg\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN LV Bettenergy",
        capacityKwh: 16,
        warrantyYears: 10,
        stockQuantity: 0,
      },
      {
        code: "EJOR 14.3 - BH5",
        name: "Pin lưu trữ năng lượng EJOR 14.3 KWh",
        specification: "Loại Pin: Lithium LiFePO4.\nTổng dung lượng: 14.33 kWh (51.2V - 280Ah).\nĐiện áp danh định: 51.2V (hoạt động 44V - 58.4V).\nTuổi thọ: > 6000 chu kỳ.\nTrọng lượng: 125kg - 128kg\nBảo hành: 7 năm",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN EJOR",
        capacityKwh: 14.3,
        warrantyYears: 7,
        stockQuantity: 0,
      },
      {
        code: "EJOR 16 - BH7",
        name: "Pin lưu trữ năng lượng EJOR 16KWh",
        specification: "Loại Pin: Lithium LiFePO4.\nTổng dung lượng: 16 kWh (51.2V - 314Ah).\nTuổi thọ: > 6000 chu kỳ.\nBảo hành: 7 năm",
        unit: "bộ",
        referencePrice: 36_500_000,
        note: "",
        batteryGroup: "PIN EJOR",
        capacityKwh: 16,
        warrantyYears: 7,
        stockQuantity: 1,
      },
      {
        code: "EJOR 16 - BH5",
        name: "Pin lưu trữ năng lượng EJOR 16KWh",
        specification: "Loại Pin: Lithium LiFePO4.\nTổng dung lượng: 16 kWh (51.2V - 314Ah).\nTuổi thọ: > 6000 chu kỳ.\nBảo hành: 5 năm",
        unit: "bộ",
        referencePrice: null,
        note: "",
        batteryGroup: "PIN EJOR",
        capacityKwh: 16,
        warrantyYears: 5,
        stockQuantity: 0,
      },
      {
        code: "HEROEE-16",
        name: "Pin lưu trữ Hithium HeroEE 16Kwh",
        specification: "Điện áp định mức: 51.2V\nDung lượng định mức: 314Ah/16kWh\nĐiện áp bảo vệ sạc: 43.2 - 58.4V\nĐiện áp bảo vệ phóng điện: 43.2 - 58.4V\nDòng sạc tối đa: 100A\nDòng xả tối đa: 200A\nChu kỳ pin: 11000 chu kỳ @25°C, 100% DOD, 0.5P @70% SOH\nTrọng lượng: 110kg\nKích thước: 540.6 x 240 x 781.2 mm\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: 40_300_000,
        note: "",
        batteryGroup: "PIN HEROEE",
        capacityKwh: 16,
        warrantyYears: 10,
        stockQuantity: 1,
      },
      {
        code: "PULONTECH 16 - BH10",
        name: "Pin lưu trữ năng lượng PULONTECH FIDUS BATTERY PLUS 16KWh",
        specification: "Tổng dung lượng: 16 kWh (51.2V - 314Ah).\nSố lần sạc xả: 8000\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: 44_000_000,
        note: "",
        batteryGroup: "PIN PULONTECH",
        capacityKwh: 16,
        warrantyYears: 10,
        stockQuantity: 1,
      },
      {
        code: "SUNBOX 20 - BH10",
        name: "Pin lưu trữ năng lượng SUNBOX 20,48KW",
        specification: "Tổng dung lượng: 20,48 kWh\nSố lần sạc xả: 6000\nTrọng lượng: 162kg\nKích thước: 1130 x 742 x 200 mm\nBảo hành: Cell Pin 10 năm, BMS 5 năm",
        unit: "bộ",
        referencePrice: 46_000_000,
        note: "",
        batteryGroup: "PIN SUNBOX",
        capacityKwh: 20.48,
        warrantyYears: 10,
        stockQuantity: 1,
      },
      {
        code: "XINPZ 20KW - BH5",
        name: "Pin lưu trữ năng lượng XINPZ 20 KW",
        specification: "Tổng dung lượng: 20 kW\nSố lần sạc xả: 6000\nTrọng lượng: 135kg\nBảo hành: 5 năm",
        unit: "bộ",
        referencePrice: 43_500_000,
        note: "",
        batteryGroup: "PIN XINPZ",
        capacityKwh: 20,
        warrantyYears: 5,
        stockQuantity: 1,
      },
      {
        code: "SVE 14.3 LITE",
        name: "Pin lưu trữ năng lượng SVE 14,3 KW",
        specification: "Tổng dung lượng: 14,3 kW\nSố lần sạc xả: 8000\nTrọng lượng: 124kg\nCó bánh xe\nBảo hành: 5 năm",
        unit: "bộ",
        referencePrice: 34_000_000,
        note: "",
        batteryGroup: "PIN SVE",
        capacityKwh: 14.3,
        warrantyYears: 5,
        stockQuantity: 1,
      },
      {
        code: "SVE 16.6 PRO IP65",
        name: "Pin lưu trữ năng lượng SVE 16,6 PRO",
        specification: "Tổng dung lượng: 16,6 kW\nSố lần sạc xả: 8000\nTrọng lượng: 124kg\nCó bánh xe, IP65\nBảo hành: 5 năm",
        unit: "bộ",
        referencePrice: 38_000_000,
        note: "",
        batteryGroup: "PIN SVE",
        capacityKwh: 16.6,
        warrantyYears: 5,
        stockQuantity: 1,
      },
      {
        code: "SOFAR 16 - BH10",
        name: "PIN LƯU TRỮ ÁP THẤP SOFAR 16 KW",
        specification: "Điện áp danh định: 51.2 V\nDung lượng: ~314 Ah ≈ 16 kWh\nDòng sạc liên tục: 150A\nDòng xả liên tục: 150A\nBảo hành: 10 năm",
        unit: "bộ",
        referencePrice: 37_300_000,
        note: "",
        batteryGroup: "PIN SOFAR",
        capacityKwh: 16,
        warrantyYears: 10,
        stockQuantity: 1,
      },
    ],
  },
  {
    id: "tu-dien",
    tabLabel: "Danh mục tủ điện",
    title: "Danh sách tủ điện",
    items: [
      {
        id: "tu-dien-1p-tu-dong",
        code: "TU-DIEN-1P-TU-DONG",
        name: "Tủ điện 1P tự động",
        specification:
          "Tủ điện năng lượng mặt trời 15 Kw 1P\n- Tủ điện chịu tải 15Kw - 1 Pha - 2 MPPT\n- Tự động khôi phục điện khi gặp sự cố\n- Có đèn báo pha - Hệ thống tiếp địa\n- Bảo hành 05 năm",
        unit: "Tủ",
        referencePrice: 4_300_000,
        note: "",
        phase: "1 pha",
        capacityKw: 15,
      },
      {
        id: "tu-dien-3p-thu-cong",
        code: "TU-DIEN-3P-THU-CONG",
        name: "Tủ điện 3P thủ công",
        specification:
          "Tủ điện năng lượng mặt trời 20 Kw 3P\n- Tủ điện chịu tải 12Kw - 3 Pha - 2 MPPT\n- Tự động khôi phục điện khi gặp sự cố\n- Có đèn báo pha - Hệ thống tiếp địa\n- Bảo hành 05 năm",
        unit: "Tủ",
        referencePrice: 5_500_000,
        note: "",
        phase: "3 pha",
        capacityKw: 20,
      },
      {
        id: "tu-dien-1p-8kw",
        code: "TU-DIEN-1P-8KW",
        name: "Tủ điện 1P 8 kW",
        specification:
          "Tủ điện năng lượng mặt trời 8 Kw 1P\n- Tủ điện chịu tải 8Kw - 1 Pha - 2 MPPT\n- Có đèn báo pha - Hệ thống tiếp địa\n- Bảo hành 05 năm",
        unit: "Tủ",
        referencePrice: 3_200_000,
        note: "",
        phase: "1 pha",
        capacityKw: 8,
      },
      {
        id: "tu-dien-1p-10kw-ats",
        code: "TU-DIEN-1P-10KW-ATS",
        name: "Tủ điện 1P 10 kW ATS",
        specification:
          "Tủ điện năng lượng mặt trời 10 Kw 1P\n- Tủ điện chịu tải 10Kw - 1 Pha - 2 MPPT\n- Chuyển nguồn ATS tự động\n- Có đèn báo pha - Hệ thống tiếp địa\n- Bảo hành 05 năm",
        unit: "Tủ",
        referencePrice: 3_800_000,
        note: "",
        phase: "1 pha",
        capacityKw: 10,
      },
      {
        id: "tu-dien-3p-30kw",
        code: "TU-DIEN-3P-30KW",
        name: "Tủ điện 3P 30 kW",
        specification:
          "Tủ điện năng lượng mặt trời 30 Kw 3P\n- Tủ điện chịu tải 30Kw - 3 Pha - 2 MPPT\n- Có đèn báo pha - Hệ thống tiếp địa\n- Bảo hành 05 năm",
        unit: "Tủ",
        referencePrice: 6_800_000,
        note: "",
        phase: "3 pha",
        capacityKw: 30,
      },
      {
        id: "tu-dien-3p-50kw-ats",
        code: "TU-DIEN-3P-50KW-ATS",
        name: "Tủ điện 3P 50 kW ATS",
        specification:
          "Tủ điện năng lượng mặt trời 50 Kw 3P\n- Tủ điện chịu tải 50Kw - 3 Pha - 4 MPPT\n- Chuyển nguồn ATS tự động\n- Có đèn báo pha - Hệ thống tiếp địa\n- Bảo hành 05 năm",
        unit: "Tủ",
        referencePrice: 8_900_000,
        note: "",
        phase: "3 pha",
        capacityKw: 50,
      },
    ],
  },
  {
    id: "phu-kien",
    tabLabel: "Danh mục phụ kiện",
    title: "Danh sách phụ kiện",
    items: accessoryCatalogItems,
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
