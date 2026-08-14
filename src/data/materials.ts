import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import solution1 from "@/assets/solution-1.jpg";
import project1 from "@/assets/project-1.jpg";

export type MaterialCategory = {
  id: string;
  name: string;
};

export const materialCategories: MaterialCategory[] = [
  { id: "tam-pin", name: "Tấm pin" },
  { id: "bien-tan", name: "Biến tần" },
  { id: "dong-cat", name: "Thiết bị đóng cắt" },
  { id: "cap-dien", name: "Cáp điện" },
  { id: "chieu-sang", name: "Chiếu sáng" },
  { id: "phu-kien", name: "Phụ kiện lắp đặt" },
];

export type Material = {
  id: string;
  categoryId: string;
  name: string;
  size: string;
  description: string;
  unit: string;
  warranty: string;
  costPrice: number;
  retailPrice: number;
  stock: number;
  note: string;
  image: string;
};

const CATEGORY_IMAGE: Record<string, string> = {
  "tam-pin": product1,
  "bien-tan": product2,
  "dong-cat": product3,
  "cap-dien": product1,
  "chieu-sang": solution1,
  "phu-kien": project1,
};

export function materialSpecLines(item: Pick<Material, "size" | "description" | "warranty" | "note">) {
  return [
    item.size ? `Kích thước: ${item.size}` : "",
    item.description,
    item.warranty ? `Bảo hành: ${item.warranty}` : "",
    item.note,
  ].filter((s) => s.trim().length > 0);
}

export function materialCategoryName(categoryId: string) {
  return materialCategories.find((c) => c.id === categoryId)?.name ?? categoryId;
}

const materialSeed: Omit<Material, "image">[] = [
  {
    id: "m-pin-1",
    categoryId: "tam-pin",
    name: "Tấm pin Canadian Solar CS6W-430MS",
    size: "1722 × 1134 × 30 mm",
    description: "Pin mono PERC 430W, dùng hệ hòa lưới mái nhà xưởng.",
    unit: "tấm",
    warranty: "12 năm",
    costPrice: 1850000,
    retailPrice: 2350000,
    stock: 48,
    note: "Hiệu suất 22.0%",
  },
  {
    id: "m-pin-2",
    categoryId: "tam-pin",
    name: "Tấm pin JA Solar JAM72S30-550/MR",
    size: "2278 × 1134 × 30 mm",
    description: "Pin mono 550W, khung nhôm anodized, kính 3.2mm.",
    unit: "tấm",
    warranty: "12 năm",
    costPrice: 2280000,
    retailPrice: 2890000,
    stock: 36,
    note: "Bifacial, hệ số nhiệt -0.35%/°C",
  },
  {
    id: "m-pin-3",
    categoryId: "tam-pin",
    name: "Tấm pin Longi Hi-MO 6 LR5-72HTH-575M",
    size: "2278 × 1134 × 35 mm",
    description: "Pin HPBC 575W, tổn hao thấp, phù hợp dự án thương mại.",
    unit: "tấm",
    warranty: "15 năm",
    costPrice: 2450000,
    retailPrice: 3120000,
    stock: 22,
    note: "Hiệu suất 22.3%",
  },
  {
    id: "m-inv-1",
    categoryId: "bien-tan",
    name: "Inverter Growatt MIN 5000TL-X",
    size: "5 kW · 1 pha",
    description: "Inverter hòa lưới bám tải dân dụng, giám sát WiFi.",
    unit: "bộ",
    warranty: "5 năm",
    costPrice: 12800000,
    retailPrice: 15900000,
    stock: 6,
    note: "2 MPPT",
  },
  {
    id: "m-inv-2",
    categoryId: "bien-tan",
    name: "Inverter Huawei SUN2000-10KTL-M1",
    size: "10 kW · 3 pha",
    description: "Inverter hòa lưới nhà xưởng, tối ưu từng string.",
    unit: "bộ",
    warranty: "10 năm",
    costPrice: 28500000,
    retailPrice: 34900000,
    stock: 4,
    note: "Kèm dongle WLAN-FE",
  },
  {
    id: "m-inv-3",
    categoryId: "bien-tan",
    name: "Inverter Sungrow SG5.0RS",
    size: "5 kW · 1 pha",
    description: "Inverter hòa lưới mái nhà, quạt tản nhiệt thông minh.",
    unit: "bộ",
    warranty: "5 năm",
    costPrice: 11900000,
    retailPrice: 14800000,
    stock: 8,
    note: "IP65, 2 MPPT",
  },
  {
    id: "m-dc-1",
    categoryId: "dong-cat",
    name: "MCCB Schneider EasyPact CVS 3P 250A",
    size: "3P · 250A · 36kA",
    description: "MCCB bảo vệ quá tải và ngắn mạch cho tủ MSB nhà xưởng.",
    unit: "cái",
    warranty: "12 tháng",
    costPrice: 6200000,
    retailPrice: 7590000,
    stock: 24,
    note: "Hàng chính hãng, đủ CO/CQ",
  },
  {
    id: "m-dc-2",
    categoryId: "dong-cat",
    name: "Contactor LS MC-40a 3P 40A",
    size: "3P · 40A · 220VAC",
    description: "Contactor đóng cắt động cơ đến 18.5kW.",
    unit: "cái",
    warranty: "12 tháng",
    costPrice: 780000,
    retailPrice: 1090000,
    stock: 42,
    note: "Kèm tiếp điểm phụ 1NO + 1NC",
  },
  {
    id: "m-dc-3",
    categoryId: "dong-cat",
    name: "MCB Panasonic BBD2322HV 2P 32A",
    size: "2P · 32A · 6kA",
    description: "Aptomat dân dụng và tủ phân phối tầng.",
    unit: "cái",
    warranty: "12 tháng",
    costPrice: 95000,
    retailPrice: 145000,
    stock: 180,
    note: "",
  },
  {
    id: "m-cap-1",
    categoryId: "cap-dien",
    name: "Cáp đồng CV 4x25 mm² Cadivi",
    size: "4x25 mm²",
    description: "Cáp điện lực hạ thế, ruột đồng bọc PVC.",
    unit: "mét",
    warranty: "24 tháng",
    costPrice: 185000,
    retailPrice: 245000,
    stock: 860,
    note: "Bán theo cuộn 100m",
  },
  {
    id: "m-cap-2",
    categoryId: "cap-dien",
    name: "Cáp solar PV1-F 1x4 mm²",
    size: "1x4 mm² · 1500V DC",
    description: "Cáp DC chuyên dụng hệ pin mặt trời, chịu UV.",
    unit: "mét",
    warranty: "24 tháng",
    costPrice: 12500,
    retailPrice: 18500,
    stock: 2400,
    note: "Màu đỏ / đen",
  },
  {
    id: "m-cs-1",
    categoryId: "chieu-sang",
    name: "Đèn Highbay LED 150W IP65",
    size: "150W · 5000K · IP65",
    description: "Đèn nhà xưởng trần cao 6–10m.",
    unit: "bộ",
    warranty: "36 tháng",
    costPrice: 1680000,
    retailPrice: 2190000,
    stock: 36,
    note: "19.500 lm",
  },
  {
    id: "m-cs-2",
    categoryId: "chieu-sang",
    name: "Đèn Highbay LED 200W IP65",
    size: "200W · 5000K · IP65",
    description: "Đèn nhà xưởng trần cao trên 10m, driver Meanwell.",
    unit: "bộ",
    warranty: "36 tháng",
    costPrice: 2150000,
    retailPrice: 2890000,
    stock: 18,
    note: "26.000 lm",
  },
  {
    id: "m-pk-1",
    categoryId: "phu-kien",
    name: "Ống luồn PVC D32",
    size: "D32 mm · dài 2.9 m",
    description: "Ống luồn dây điện trong nhà.",
    unit: "cây",
    warranty: "6 tháng",
    costPrice: 18000,
    retailPrice: 28000,
    stock: 320,
    note: "Màu xám",
  },
  {
    id: "m-pk-2",
    categoryId: "phu-kien",
    name: "Rail nhôm lắp pin 4.2m",
    size: "40 × 40 mm · dài 4.2 m",
    description: "Thanh ray nhôm anodized cố định tấm pin mái tôn.",
    unit: "thanh",
    warranty: "10 năm",
    costPrice: 185000,
    retailPrice: 245000,
    stock: 96,
    note: "Kèm clamp giữa / đầu",
  },
];

export const materials: Material[] = materialSeed.map((item) => ({
  ...item,
  image: CATEGORY_IMAGE[item.categoryId] ?? product1,
}));
