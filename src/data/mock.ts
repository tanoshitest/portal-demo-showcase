import hero from "@/assets/hero.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import solution1 from "@/assets/solution-1.jpg";
import solution2 from "@/assets/solution-2.jpg";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";

export const images = { hero, product1, product2, product3, solution1, solution2, project1, project2 };

export const company = {
  name: "Hoàng Vĩnh VKT",
  slogan: "Giải pháp kỹ thuật điện – tự động hóa cho nhà máy & công trình",
  hotline: "1900 6868",
  phone: "0901 234 567",
  email: "info@hoangvinhvkt.vn",
  address: "Lô B12, KCN Tân Bình, Quận Tân Phú, TP. Hồ Chí Minh",
  workingHours: "Thứ 2 – Thứ 7: 08:00 – 17:30",
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  country: string;
  description: string;
  color: string;
};

export const brands: Brand[] = [
  { id: "b1", slug: "schneider", name: "Schneider Electric", country: "Pháp", description: "Thiết bị đóng cắt, tủ điện và giải pháp quản lý năng lượng.", color: "#3DCD58" },
  { id: "b2", slug: "abb", name: "ABB", country: "Thụy Sĩ", description: "Biến tần, khởi động mềm, thiết bị tự động hóa công nghiệp.", color: "#FF000F" },
  { id: "b3", slug: "mitsubishi", name: "Mitsubishi Electric", country: "Nhật Bản", description: "PLC, HMI, servo và hệ thống điều khiển nhà máy.", color: "#E60012" },
  { id: "b4", slug: "siemens", name: "Siemens", country: "Đức", description: "Hệ SIMATIC, thiết bị hạ thế và giải pháp số hóa sản xuất.", color: "#009999" },
  { id: "b5", slug: "panasonic", name: "Panasonic", country: "Nhật Bản", description: "Thiết bị điện dân dụng, cảm biến và chiếu sáng.", color: "#0033A0" },
  { id: "b6", slug: "ls-electric", name: "LS Electric", country: "Hàn Quốc", description: "MCCB, contactor, biến tần cho công nghiệp nhẹ.", color: "#0F5FA6" },
];

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
};

export const categories: Category[] = [
  { id: "c1", slug: "thiet-bi-dong-cat", name: "Thiết bị đóng cắt", description: "MCB, MCCB, ACB, contactor, relay nhiệt cho tủ điện hạ thế.", icon: "Zap" },
  { id: "c2", slug: "bien-tan-khoi-dong-mem", name: "Biến tần & khởi động mềm", description: "Điều khiển tốc độ động cơ, tiết kiệm điện năng.", icon: "Gauge" },
  { id: "c3", slug: "plc-hmi", name: "PLC & HMI", description: "Bộ điều khiển lập trình, màn hình vận hành, module mở rộng.", icon: "Cpu" },
  { id: "c4", slug: "thiet-bi-do-luong", name: "Thiết bị đo lường", description: "Đồng hồ đa năng, cảm biến, thiết bị giám sát điện năng.", icon: "Activity" },
  { id: "c5", slug: "tu-dien-phu-kien", name: "Tủ điện & phụ kiện", description: "Vỏ tủ, thanh cái, máng cáp, đầu cốt và phụ kiện lắp đặt.", icon: "Server" },
  { id: "c6", slug: "chieu-sang-cong-nghiep", name: "Chiếu sáng công nghiệp", description: "Đèn highbay, đèn nhà xưởng, đèn chống cháy nổ.", icon: "Lightbulb" },
];

export type Product = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  brandSlug: string;
  categorySlug: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  warranty: string;
  image: string;
  gallery?: string[];
  highlights: string[];
  description: string;
  specs: { label: string; value: string }[];
  variants: { id: string; name: string; sku: string; price: number }[];
  reviews: { name: string; rating: number; date: string; content: string }[];
};

const genReviews = (a: string, b: string) => [
  { name: "Nguyễn Văn Hải", rating: 5, date: "12/03/2026", content: a },
  { name: "Trần Minh Quân", rating: 4, date: "28/01/2026", content: b },
];

export const products: Product[] = [
  {
    id: "p1", slug: "mccb-3p-250a-schneider", name: "MCCB 3P 250A Schneider EasyPact CVS", sku: "SCH-CVS250-3P",
    brandSlug: "schneider", categorySlug: "thiet-bi-dong-cat", price: 8450000, salePrice: 7590000,
    rating: 4.8, reviewCount: 36, stock: 24, warranty: "12 tháng chính hãng", image: product1,
    highlights: ["Dòng cắt 36kA", "Bảo vệ quá tải & ngắn mạch", "Hàng chính hãng, đầy đủ CO/CQ"],
    description: "MCCB 3 pha 250A dòng EasyPact CVS phù hợp cho tủ phân phối tổng của nhà xưởng, tòa nhà thương mại. Thiết kế compact, dễ lắp đặt trong tủ tiêu chuẩn, hỗ trợ phụ kiện mở rộng như cuộn shunt trip, tiếp điểm phụ.",
    specs: [
      { label: "Số cực", value: "3P" }, { label: "Dòng định mức", value: "250A" },
      { label: "Dòng cắt Icu", value: "36kA @ 380V" }, { label: "Điện áp", value: "690V AC" },
      { label: "Tiêu chuẩn", value: "IEC 60947-2" }, { label: "Xuất xứ", value: "Indonesia" },
    ],
    variants: [
      { id: "v1", name: "160A", sku: "SCH-CVS160-3P", price: 6290000 },
      { id: "v2", name: "250A", sku: "SCH-CVS250-3P", price: 7590000 },
      { id: "v3", name: "400A", sku: "SCH-CVS400-3P", price: 11900000 },
    ],
    reviews: genReviews("Hàng chuẩn, đóng gói kỹ, kỹ thuật tư vấn nhiệt tình.", "Giao nhanh trong 2 ngày, giá tốt hơn thị trường."),
  },
  {
    id: "p2", slug: "bien-tan-abb-acs580-15kw", name: "Biến tần ABB ACS580 15kW 3P 380V", sku: "ABB-ACS580-15",
    brandSlug: "abb", categorySlug: "bien-tan-khoi-dong-mem", price: 24500000, salePrice: 22900000,
    rating: 4.9, reviewCount: 21, stock: 18, warranty: "18 tháng", image: product2,
    highlights: ["Tiết kiệm 20–35% điện năng", "Tích hợp PID, Modbus RTU", "Cài đặt nhanh bằng trợ lý"],
    description: "Biến tần ABB ACS580 dành cho bơm, quạt, máy nén trong nhà máy. Tích hợp sẵn bộ lọc EMC và điện kháng DC, giúp giảm sóng hài và bảo vệ lưới điện.",
    specs: [
      { label: "Công suất", value: "15kW" }, { label: "Điện áp vào", value: "380–480V 3 pha" },
      { label: "Dòng ra", value: "32A" }, { label: "Truyền thông", value: "Modbus RTU tích hợp" },
      { label: "Cấp bảo vệ", value: "IP21" }, { label: "Xuất xứ", value: "Trung Quốc" },
    ],
    variants: [
      { id: "v1", name: "7.5kW", sku: "ABB-ACS580-7K5", price: 15900000 },
      { id: "v2", name: "15kW", sku: "ABB-ACS580-15", price: 22900000 },
      { id: "v3", name: "22kW", sku: "ABB-ACS580-22", price: 31500000 },
    ],
    reviews: genReviews("Lắp cho hệ bơm, chạy êm và giảm điện thấy rõ.", "Có hỗ trợ cài thông số từ xa, rất tiện."),
  },
  {
    id: "p3", slug: "plc-mitsubishi-fx5u-32mt", name: "PLC Mitsubishi FX5U-32MT/ES", sku: "MIT-FX5U-32MT",
    brandSlug: "mitsubishi", categorySlug: "plc-hmi", price: 13500000,
    rating: 4.7, reviewCount: 14, stock: 3, warranty: "12 tháng", image: product3,
    highlights: ["32 I/O, ngõ ra transistor", "Tích hợp Ethernet & RS485", "Lập trình GX Works3"],
    description: "PLC iQ-F FX5U là dòng điều khiển compact mạnh mẽ cho máy đóng gói, dây chuyền lắp ráp. Hỗ trợ điều khiển vị trí 4 trục, tích hợp analog và Ethernet.",
    specs: [
      { label: "Số I/O", value: "16 DI / 16 DO" }, { label: "Kiểu ngõ ra", value: "Transistor" },
      { label: "Nguồn cấp", value: "24VDC" }, { label: "Truyền thông", value: "Ethernet, RS485" },
      { label: "Bộ nhớ", value: "64K steps" }, { label: "Xuất xứ", value: "Nhật Bản" },
    ],
    variants: [
      { id: "v1", name: "FX5U-32MT", sku: "MIT-FX5U-32MT", price: 13500000 },
      { id: "v2", name: "FX5U-64MT", sku: "MIT-FX5U-64MT", price: 19800000 },
    ],
    reviews: genReviews("Hàng nội địa Nhật, tem đầy đủ.", "Kỹ thuật hỗ trợ chương trình mẫu rất nhanh."),
  },
  {
    id: "p4", slug: "contactor-ls-mc-40a", name: "Contactor LS MC-40a 3P 40A 220V", sku: "LS-MC40A",
    brandSlug: "ls-electric", categorySlug: "thiet-bi-dong-cat", price: 1250000, salePrice: 1090000,
    rating: 4.5, reviewCount: 52, stock: 42, warranty: "12 tháng", image: product1,
    highlights: ["Tiếp điểm bạc hợp kim bền", "Tuổi thọ cơ 10 triệu lần", "Kèm 1NO + 1NC"],
    description: "Contactor LS MC-40a dùng đóng cắt động cơ đến 18.5kW, phổ biến trong tủ điều khiển bơm, quạt, băng tải.",
    specs: [
      { label: "Dòng định mức", value: "40A" }, { label: "Cuộn hút", value: "220VAC" },
      { label: "Tiếp điểm phụ", value: "1NO + 1NC" }, { label: "Công suất động cơ", value: "18.5kW" },
      { label: "Tiêu chuẩn", value: "IEC 60947-4-1" }, { label: "Xuất xứ", value: "Hàn Quốc" },
    ],
    variants: [
      { id: "v1", name: "MC-32a", sku: "LS-MC32A", price: 890000 },
      { id: "v2", name: "MC-40a", sku: "LS-MC40A", price: 1090000 },
      { id: "v3", name: "MC-50a", sku: "LS-MC50A", price: 1450000 },
    ],
    reviews: genReviews("Giá hợp lý, dùng ổn định gần 1 năm.", "Đóng cắt êm, không kêu."),
  },
  {
    id: "p5", slug: "dong-ho-da-nang-schneider-pm2130", name: "Đồng hồ đa năng Schneider PM2130", sku: "SCH-PM2130",
    brandSlug: "schneider", categorySlug: "thiet-bi-do-luong", price: 6900000,
    rating: 4.6, reviewCount: 9, stock: 12, warranty: "24 tháng", image: product3,
    highlights: ["Đo đa thông số 3 pha", "Modbus RTU", "Cấp chính xác 0.5S"],
    description: "Đồng hồ đo điện năng đa năng PM2130 hiển thị điện áp, dòng, công suất, hệ số công suất và sóng hài cơ bản, phù hợp hệ thống giám sát năng lượng.",
    specs: [
      { label: "Cấp chính xác", value: "Class 0.5S" }, { label: "Truyền thông", value: "Modbus RTU RS485" },
      { label: "Màn hình", value: "LCD nền sáng" }, { label: "Kích thước", value: "96x96mm" },
      { label: "Nguồn nuôi", value: "100–277VAC" }, { label: "Xuất xứ", value: "Trung Quốc" },
    ],
    variants: [{ id: "v1", name: "PM2130", sku: "SCH-PM2130", price: 6900000 }],
    reviews: genReviews("Kết nối SCADA dễ dàng.", "Hiển thị rõ, lắp vừa lỗ khoét chuẩn."),
  },
  {
    id: "p6", slug: "den-highbay-led-150w", name: "Đèn Highbay LED nhà xưởng 150W IP65", sku: "HV-HB150",
    brandSlug: "panasonic", categorySlug: "chieu-sang-cong-nghiep", price: 2450000, salePrice: 2190000,
    rating: 4.4, reviewCount: 63, stock: 36, warranty: "36 tháng", image: product2,
    highlights: ["Hiệu suất 130lm/W", "Chống bụi nước IP65", "Tản nhiệt nhôm đúc"],
    description: "Đèn LED highbay 150W cho nhà xưởng trần cao 6–10m, ánh sáng trắng trung tính, tiết kiệm đến 60% so với đèn cao áp.",
    specs: [
      { label: "Công suất", value: "150W" }, { label: "Quang thông", value: "19.500 lm" },
      { label: "Nhiệt độ màu", value: "5000K" }, { label: "Góc chiếu", value: "90°/120°" },
      { label: "Cấp bảo vệ", value: "IP65" }, { label: "Tuổi thọ", value: "50.000 giờ" },
    ],
    variants: [
      { id: "v1", name: "100W", sku: "HV-HB100", price: 1690000 },
      { id: "v2", name: "150W", sku: "HV-HB150", price: 2190000 },
      { id: "v3", name: "200W", sku: "HV-HB200", price: 2890000 },
    ],
    reviews: genReviews("Sáng đều, thay 4 bóng cao áp cũ.", "Lắp 60 bộ cho xưởng, chưa lỗi bộ nào."),
  },
  {
    id: "p7", slug: "khoi-dong-mem-abb-psr", name: "Khởi động mềm ABB PSR30-600-70 15kW", sku: "ABB-PSR30",
    brandSlug: "abb", categorySlug: "bien-tan-khoi-dong-mem", price: 9800000,
    rating: 4.6, reviewCount: 11, stock: 15, warranty: "12 tháng", image: product2,
    highlights: ["Giảm dòng khởi động", "Bảo vệ động cơ", "Kích thước nhỏ gọn"],
    description: "Khởi động mềm PSR giúp giảm sốc cơ khí và dòng khởi động cho động cơ bơm, quạt, máy nén khí.",
    specs: [
      { label: "Công suất", value: "15kW" }, { label: "Dòng định mức", value: "30A" },
      { label: "Điện áp", value: "208–600V" }, { label: "Điều khiển", value: "24VAC/DC" },
      { label: "Bypass", value: "Tích hợp" }, { label: "Xuất xứ", value: "Trung Quốc" },
    ],
    variants: [{ id: "v1", name: "15kW", sku: "ABB-PSR30", price: 9800000 }],
    reviews: genReviews("Bơm khởi động êm hẳn.", "Nhỏ gọn, tiết kiệm không gian tủ."),
  },
  {
    id: "p8", slug: "vo-tu-dien-ip54-800x600", name: "Vỏ tủ điện sơn tĩnh điện IP54 800x600x250", sku: "HV-TD8060",
    brandSlug: "siemens", categorySlug: "tu-dien-phu-kien", price: 3200000, salePrice: 2950000,
    rating: 4.3, reviewCount: 27, stock: 8, warranty: "12 tháng", image: product1,
    highlights: ["Tôn 1.2mm sơn tĩnh điện", "Gioăng chống nước", "Kèm tấm montage"],
    description: "Vỏ tủ điện trong nhà, phù hợp tủ điều khiển và tủ phân phối tầng. Có thể gia công theo kích thước yêu cầu.",
    specs: [
      { label: "Kích thước", value: "800 x 600 x 250mm" }, { label: "Độ dày tôn", value: "1.2mm" },
      { label: "Cấp bảo vệ", value: "IP54" }, { label: "Màu sắc", value: "Ghi sáng RAL 7035" },
      { label: "Phụ kiện", value: "Tấm montage, khóa tay nắm" }, { label: "Xuất xứ", value: "Việt Nam" },
    ],
    variants: [
      { id: "v1", name: "600x400x250", sku: "HV-TD6040", price: 1950000 },
      { id: "v2", name: "800x600x250", sku: "HV-TD8060", price: 2950000 },
    ],
    reviews: genReviews("Sơn đẹp, chắc chắn.", "Đặt gia công thêm lỗ khoét rất nhanh."),
  },
];

export type Solution = {
  id: string;
  slug: string;
  name: string;
  group: string;
  short: string;
  image: string;
  benefits: { title: string; desc: string }[];
  audience: string[];
  systems: string[];
  packages: { id: string; name: string; desc: string; price: string; items: string[] }[];
  productSlugs: string[];
  process: { step: string; desc: string }[];
  faq: { q: string; a: string }[];
};

export const SOLUTION_GROUPS = [
  "Điện công nghiệp",
  "Tự động hóa",
  "Năng lượng",
  "Quản lý năng lượng",
] as const;

export const solutions: Solution[] = [
  {
    id: "s1", slug: "he-thong-dien-nha-xuong", name: "Hệ thống điện nhà xưởng", group: "Điện công nghiệp",
    short: "Thiết kế – thi công hệ thống điện tổng thể cho nhà máy, đảm bảo an toàn và tối ưu chi phí vận hành.",
    image: solution1,
    benefits: [
      { title: "An toàn theo tiêu chuẩn", desc: "Thiết kế theo TCVN & IEC, có hồ sơ nghiệm thu đầy đủ." },
      { title: "Giảm sự cố dừng máy", desc: "Chọn thiết bị đúng tải, bảo vệ phân cấp rõ ràng." },
      { title: "Tối ưu chi phí điện", desc: "Bù công suất phản kháng và giám sát tiêu thụ theo khu vực." },
    ],
    audience: ["Nhà máy sản xuất mới xây", "Xưởng cải tạo mở rộng công suất", "Khu chế xuất, khu công nghiệp"],
    systems: ["Trạm biến áp & tủ MSB", "Tủ phân phối DB theo khu vực", "Hệ thống chiếu sáng & ổ cắm công nghiệp", "Hệ tiếp địa và chống sét"],
    packages: [
      { id: "pk1", name: "Gói Cơ bản", desc: "Cho xưởng dưới 1.000m², tải đến 250kVA.", price: "Từ 180.000.000đ", items: ["Tủ MSB 250A", "2 tủ DB khu vực", "Chiếu sáng 40 bộ highbay"] },
      { id: "pk2", name: "Gói Tiêu chuẩn", desc: "Cho nhà máy 1.000–3.000m², tải 400–630kVA.", price: "Từ 480.000.000đ", items: ["Tủ MSB 630A", "4 tủ DB + tủ bù", "Giám sát điện năng cơ bản"] },
      { id: "pk3", name: "Gói Nâng cao", desc: "Nhà máy lớn, yêu cầu giám sát và dự phòng.", price: "Liên hệ báo giá", items: ["MSB 1000A + ATS", "Hệ giám sát năng lượng online", "Bảo trì định kỳ 12 tháng"] },
    ],
    productSlugs: ["mccb-3p-250a-schneider", "contactor-ls-mc-40a", "vo-tu-dien-ip54-800x600", "den-highbay-led-150w"],
    process: [
      { step: "Khảo sát hiện trạng", desc: "Đo tải, đánh giá mặt bằng và nhu cầu mở rộng." },
      { step: "Thiết kế & báo giá", desc: "Bản vẽ nguyên lý, mặt bằng, bảng khối lượng chi tiết." },
      { step: "Thi công lắp đặt", desc: "Đội thi công có chứng chỉ an toàn điện, tiến độ cam kết." },
      { step: "Nghiệm thu & bàn giao", desc: "Đo kiểm, hồ sơ hoàn công, hướng dẫn vận hành." },
      { step: "Bảo trì", desc: "Kiểm tra định kỳ, hỗ trợ kỹ thuật 24/7." },
    ],
    faq: [
      { q: "Thời gian triển khai bao lâu?", a: "Trung bình 3–8 tuần tùy quy mô và tiến độ mặt bằng." },
      { q: "Có hỗ trợ hồ sơ nghiệm thu PCCC không?", a: "Có, chúng tôi cung cấp đầy đủ hồ sơ kỹ thuật phục vụ nghiệm thu." },
    ],
  },
  {
    id: "s2", slug: "tu-dong-hoa-day-chuyen", name: "Tự động hóa dây chuyền sản xuất", group: "Tự động hóa",
    short: "Nâng cấp dây chuyền với PLC, HMI, biến tần và SCADA để tăng năng suất, giảm phụ thuộc thao tác tay.",
    image: project1,
    benefits: [
      { title: "Tăng năng suất 15–30%", desc: "Chuẩn hóa chu trình, giảm thời gian chờ và lỗi thao tác." },
      { title: "Dữ liệu sản xuất realtime", desc: "Theo dõi sản lượng, downtime và cảnh báo tức thời." },
      { title: "Dễ mở rộng", desc: "Kiến trúc module, thêm trạm mới không phải làm lại hệ thống." },
    ],
    audience: ["Nhà máy thực phẩm, bao bì", "Dây chuyền lắp ráp cơ khí", "Doanh nghiệp muốn số hóa sản xuất"],
    systems: ["Trạm điều khiển PLC", "HMI vận hành tại chỗ", "Điều khiển động cơ bằng biến tần", "SCADA giám sát trung tâm"],
    packages: [
      { id: "pk1", name: "Gói Khởi đầu", desc: "1 trạm PLC + HMI cho một công đoạn.", price: "Từ 95.000.000đ", items: ["PLC FX5U", "HMI 7 inch", "Lập trình & chạy thử"] },
      { id: "pk2", name: "Gói Dây chuyền", desc: "Đồng bộ nhiều trạm với biến tần.", price: "Từ 320.000.000đ", items: ["3 trạm PLC", "6 biến tần", "Mạng truyền thông công nghiệp"] },
      { id: "pk3", name: "Gói SCADA", desc: "Giám sát toàn nhà máy và báo cáo.", price: "Liên hệ báo giá", items: ["Server SCADA", "Dashboard sản xuất", "Đào tạo vận hành"] },
    ],
    productSlugs: ["plc-mitsubishi-fx5u-32mt", "bien-tan-abb-acs580-15kw", "khoi-dong-mem-abb-psr"],
    process: [
      { step: "Phân tích quy trình", desc: "Ghi nhận công đoạn, điểm nghẽn và mục tiêu năng suất." },
      { step: "Đề xuất kiến trúc", desc: "Chọn PLC/HMI/biến tần và sơ đồ mạng phù hợp." },
      { step: "Lập trình & FAT", desc: "Chạy thử tại xưởng trước khi lắp đặt." },
      { step: "Lắp đặt & SAT", desc: "Triển khai tại nhà máy, hiệu chỉnh theo thực tế." },
      { step: "Đào tạo & bảo hành", desc: "Chuyển giao tài liệu, đào tạo vận hành viên." },
    ],
    faq: [{ q: "Có nâng cấp trên máy cũ được không?", a: "Được, chúng tôi khảo sát và giữ lại phần cơ khí còn tốt để tiết kiệm chi phí." }],
  },
  {
    id: "s3", slug: "dien-mat-troi-ap-mai", name: "Điện mặt trời áp mái", group: "Năng lượng",
    short: "Giảm chi phí điện cho nhà xưởng bằng hệ thống điện mặt trời áp mái tự dùng, hoàn vốn 4–6 năm.",
    image: solution2,
    benefits: [
      { title: "Giảm 20–40% hóa đơn điện", desc: "Ưu tiên tự dùng vào giờ cao điểm sản xuất." },
      { title: "Tận dụng mái nhà xưởng", desc: "Không tốn thêm diện tích đất, giảm nhiệt mái." },
      { title: "Giám sát sản lượng", desc: "Theo dõi sản lượng và hiệu suất từng inverter." },
    ],
    audience: ["Nhà xưởng mái tôn diện tích lớn", "Kho lạnh, trung tâm logistics", "Doanh nghiệp cần chứng chỉ xanh"],
    systems: ["Hệ tự dùng không lưu trữ", "Hệ hybrid có pin lưu trữ", "Hệ giám sát sản lượng online"],
    packages: [
      { id: "pk1", name: "100 kWp", desc: "Cho xưởng tiêu thụ ~15.000 kWh/tháng.", price: "Từ 950.000.000đ", items: ["Tấm pin 580Wp", "Inverter 3 pha", "Khung giá & thi công"] },
      { id: "pk2", name: "300 kWp", desc: "Cho nhà máy quy mô trung bình.", price: "Từ 2.700.000.000đ", items: ["Inverter chuỗi", "Tủ AC/DC", "Giám sát online"] },
      { id: "pk3", name: "Hybrid + Lưu trữ", desc: "Có dự phòng khi mất điện.", price: "Liên hệ báo giá", items: ["Pin lithium", "Inverter hybrid", "Hệ chuyển nguồn"] },
    ],
    productSlugs: ["mccb-3p-250a-schneider", "dong-ho-da-nang-schneider-pm2130"],
    process: [
      { step: "Khảo sát mái & tải tiêu thụ", desc: "Đánh giá kết cấu mái và biểu đồ phụ tải." },
      { step: "Mô phỏng sản lượng", desc: "Tính sản lượng, dòng tiền và thời gian hoàn vốn." },
      { step: "Thi công lắp đặt", desc: "Đảm bảo chống dột và an toàn lao động trên cao." },
      { step: "Đấu nối & nghiệm thu", desc: "Phối hợp điện lực, kiểm tra hòa lưới." },
      { step: "Vận hành & bảo trì", desc: "Vệ sinh tấm pin và kiểm tra định kỳ." },
    ],
    faq: [{ q: "Mái tôn cũ có lắp được không?", a: "Cần khảo sát kết cấu; nếu cần chúng tôi đề xuất phương án gia cường." }],
  },
  {
    id: "s4", slug: "giam-sat-nang-luong", name: "Giám sát năng lượng nhà máy", group: "Quản lý năng lượng",
    short: "Đo đếm và phân tích tiêu thụ điện theo khu vực, phát hiện lãng phí và lập báo cáo tiết kiệm.",
    image: project2,
    benefits: [
      { title: "Biết điện đi đâu", desc: "Phân bổ chi phí điện theo dây chuyền, ca sản xuất." },
      { title: "Cảnh báo bất thường", desc: "Phát hiện quá tải, lệch pha, hệ số công suất thấp." },
      { title: "Báo cáo ISO 50001", desc: "Dữ liệu phục vụ kiểm toán năng lượng." },
    ],
    audience: ["Nhà máy nhiều dây chuyền", "Tòa nhà thương mại", "Doanh nghiệp làm ISO 50001"],
    systems: ["Đồng hồ đo đa năng", "Bộ thu thập dữ liệu", "Phần mềm dashboard"],
    packages: [
      { id: "pk1", name: "10 điểm đo", desc: "Giám sát các tủ chính.", price: "Từ 120.000.000đ", items: ["10 đồng hồ PM2130", "Gateway", "Dashboard cơ bản"] },
      { id: "pk2", name: "30 điểm đo", desc: "Giám sát chi tiết theo dây chuyền.", price: "Từ 330.000.000đ", items: ["30 điểm đo", "Báo cáo tự động", "Cảnh báo email"] },
    ],
    productSlugs: ["dong-ho-da-nang-schneider-pm2130", "mccb-3p-250a-schneider"],
    process: [
      { step: "Xác định điểm đo", desc: "Chọn vị trí đo theo mục tiêu quản lý." },
      { step: "Lắp đặt thiết bị", desc: "Lắp đồng hồ, biến dòng, đấu nối truyền thông." },
      { step: "Cấu hình phần mềm", desc: "Thiết lập dashboard và báo cáo." },
      { step: "Đào tạo & bàn giao", desc: "Hướng dẫn đọc số liệu và ra quyết định." },
    ],
    faq: [{ q: "Có tích hợp với hệ thống có sẵn không?", a: "Có, hỗ trợ Modbus RTU/TCP và xuất dữ liệu ra Excel." }],
  },
  {
    id: "s5", slug: "tu-dien-msb-ats", name: "Tủ điện MSB & chuyển nguồn ATS", group: "Điện công nghiệp",
    short: "Tủ tổng, tủ phân phối và hệ ATS dự phòng cho nhà máy, tòa nhà – vận hành liên tục khi mất điện lưới.",
    image: hero,
    benefits: [
      { title: "Không gián đoạn sản xuất", desc: "Chuyển nguồn tự động dưới 10 giây khi mất điện." },
      { title: "Bảo vệ phân cấp", desc: "MCCB chọn lọc, hạn chế sự cố lan rộng." },
      { title: "Dễ bảo trì", desc: "Bố trí thiết bị theo tiêu chuẩn, có sơ đồ và nhãn rõ." },
    ],
    audience: ["Nhà máy cần nguồn dự phòng", "Tòa nhà thương mại, bệnh viện", "Kho lạnh vận hành 24/7"],
    systems: ["Tủ MSB", "Tủ ATS 2 nguồn", "Tủ DB khu vực", "Hệ tiếp địa"],
    packages: [
      { id: "pk1", name: "MSB 630A", desc: "Cho tải trung bình, một nguồn lưới.", price: "Từ 210.000.000đ", items: ["Tủ MSB 630A", "2 tủ DB", "Hồ sơ nghiệm thu"] },
      { id: "pk2", name: "MSB + ATS", desc: "Hai nguồn lưới / máy phát.", price: "Từ 420.000.000đ", items: ["Tủ MSB 1000A", "ATS 800A", "Giám sát trạng thái nguồn"] },
      { id: "pk3", name: "Gói tòa nhà", desc: "Nhiều tầng, nhiều khách thuê.", price: "Liên hệ báo giá", items: ["MSB + ATS", "Tủ tầng", "Đo đếm từng khu"] },
    ],
    productSlugs: ["mccb-3p-250a-schneider", "vo-tu-dien-ip54-800x600", "dong-ho-da-nang-schneider-pm2130"],
    process: [
      { step: "Khảo sát phụ tải", desc: "Xác định công suất, nguồn lưới và máy phát." },
      { step: "Thiết kế tủ", desc: "Nguyên lý, mặt dựng, chọn thiết bị." },
      { step: "Gia công & FAT", desc: "Lắp tủ tại xưởng, chạy thử trước khi giao." },
      { step: "Lắp đặt hiện trường", desc: "Kéo cáp, đấu nối, hiệu chỉnh ATS." },
      { step: "Nghiệm thu", desc: "Đo kiểm, bàn giao hồ sơ hoàn công." },
    ],
    faq: [{ q: "Thời gian gia công tủ bao lâu?", a: "Thường 2–4 tuần tùy số ngăn và thiết bị đặt hàng." }],
  },
  {
    id: "s6", slug: "chieu-sang-nha-xuong", name: "Chiếu sáng nhà xưởng", group: "Điện công nghiệp",
    short: "Thiết kế lux theo tiêu chuẩn, đèn highbay LED tiết kiệm điện, ít bảo trì cho nhà máy và kho.",
    image: product3,
    benefits: [
      { title: "Đủ sáng – đúng lux", desc: "Tính toán theo TCVN, tránh chói và vùng tối." },
      { title: "Giảm 40–60% điện chiếu sáng", desc: "Thay đèn HID/metal halide bằng LED." },
      { title: "Tuổi thọ cao", desc: "Giảm số lần thay đèn trên cao, an toàn hơn." },
    ],
    audience: ["Nhà xưởng sản xuất", "Kho logistics cao tầng", "Xưởng cơ khí, may mặc"],
    systems: ["Đèn highbay LED", "Cảm biến hiện diện / ánh sáng", "Tủ chiếu sáng khu vực"],
    packages: [
      { id: "pk1", name: "1.000 m²", desc: "Xưởng nhỏ, trần 8–10m.", price: "Từ 85.000.000đ", items: ["40 bộ highbay 150W", "Tủ chiếu sáng", "Lắp đặt"] },
      { id: "pk2", name: "5.000 m²", desc: "Nhà máy trung bình.", price: "Từ 360.000.000đ", items: ["Highbay + cảm biến", "Phân khu theo ca", "Bảo hành 3 năm"] },
      { id: "pk3", name: "Kho cao tầng", desc: "Trần trên 12m, kệ cao.", price: "Liên hệ báo giá", items: ["Đèn hẹp góc", "Cảm biến lối đi", "Giám sát"] },
    ],
    productSlugs: ["den-highbay-led-150w", "vo-tu-dien-ip54-800x600"],
    process: [
      { step: "Đo lux hiện trạng", desc: "Khảo sát trần, kệ và yêu cầu công việc." },
      { step: "Mô phỏng chiếu sáng", desc: "Bố trí đèn, tính hoàn vốn." },
      { step: "Thi công", desc: "Lắp đặt an toàn trên cao." },
      { step: "Đo nghiệm thu", desc: "Xác nhận lux tại mặt làm việc." },
    ],
    faq: [{ q: "Có giữ lại máng đèn cũ không?", a: "Được nếu kết cấu còn tốt; chúng tôi chỉ thay bộ đèn và chấn lưu." }],
  },
];

export type Project = {
  id: string;
  slug: string;
  name: string;
  type: string;
  location: string;
  year: string;
  scale: string;
  image: string;
  gallery: string[];
  solutionSlug: string;
  problem: string;
  solutionDesc: string;
  result: string[];
  productSlugs: string[];
};

export const projects: Project[] = [
  {
    id: "pr1", slug: "nha-may-thuc-pham-long-an", name: "Nhà máy thực phẩm An Phát – Long An",
    type: "Nhà máy sản xuất", location: "Bến Lức, Long An", year: "2025", scale: "6.000 m² – 800kVA",
    image: project1, gallery: [project1, solution1, project2, product1], solutionSlug: "he-thong-dien-nha-xuong",
    problem: "Nhà máy mở rộng dây chuyền nhưng hệ thống điện cũ quá tải, thường xuyên nhảy aptomat và sụt áp vào giờ cao điểm.",
    solutionDesc: "Thiết kế lại hệ phân phối với tủ MSB 1000A, 6 tủ DB theo khu vực, bổ sung tủ bù công suất và hệ giám sát điện năng cho từng dây chuyền.",
    result: ["Không còn sự cố dừng máy do điện trong 12 tháng", "Hệ số công suất tăng từ 0.78 lên 0.96", "Giảm 11% chi phí điện hàng tháng"],
    productSlugs: ["mccb-3p-250a-schneider", "contactor-ls-mc-40a", "dong-ho-da-nang-schneider-pm2130", "vo-tu-dien-ip54-800x600"],
  },
  {
    id: "pr2", slug: "toa-nha-van-phong-sunrise", name: "Tòa nhà văn phòng Sunrise Tower – TP.HCM",
    type: "Tòa nhà thương mại", location: "Quận 7, TP. Hồ Chí Minh", year: "2025", scale: "18 tầng – 1.250kVA",
    image: project2, gallery: [project2, solution1, project1, product2], solutionSlug: "giam-sat-nang-luong",
    problem: "Ban quản lý không phân bổ được chi phí điện cho từng khách thuê và không phát hiện được thiết bị tiêu thụ bất thường.",
    solutionDesc: "Lắp đặt 42 điểm đo tại tủ tầng và tủ khu vực, kết nối về phần mềm giám sát tập trung với báo cáo tự động theo tháng.",
    result: ["Phân bổ chi phí điện chính xác cho 36 khách thuê", "Phát hiện và xử lý 3 điểm rò rỉ tải ban đêm", "Giảm 8% điện năng khu vực dùng chung"],
    productSlugs: ["dong-ho-da-nang-schneider-pm2130", "vo-tu-dien-ip54-800x600", "mccb-3p-250a-schneider", "den-highbay-led-150w"],
  },
  {
    id: "pr3", slug: "day-chuyen-bao-bi-binh-duong", name: "Dây chuyền bao bì Tân Tiến – Bình Dương",
    type: "Tự động hóa", location: "Thuận An, Bình Dương", year: "2024", scale: "3 trạm PLC – 12 động cơ",
    image: solution1, gallery: [solution1, project1, project2, product3], solutionSlug: "tu-dong-hoa-day-chuyen",
    problem: "Dây chuyền vận hành thủ công, tốc độ không đồng bộ giữa các công đoạn khiến tỉ lệ phế phẩm cao.",
    solutionDesc: "Triển khai 3 trạm PLC Mitsubishi kết nối Ethernet, điều khiển 12 động cơ bằng biến tần ABB và HMI vận hành tại từng công đoạn.",
    result: ["Năng suất tăng 22%", "Tỉ lệ phế phẩm giảm từ 4.1% xuống 1.3%", "Thời gian đổi sản phẩm giảm còn 15 phút"],
    productSlugs: ["plc-mitsubishi-fx5u-32mt", "bien-tan-abb-acs580-15kw", "khoi-dong-mem-abb-psr", "contactor-ls-mc-40a"],
  },
  {
    id: "pr4", slug: "dien-mat-troi-kho-lanh-dong-nai", name: "Điện mặt trời kho lạnh Đại Phong – Đồng Nai",
    type: "Năng lượng", location: "Trảng Bom, Đồng Nai", year: "2024", scale: "320 kWp áp mái",
    image: solution2, gallery: [solution2, project2, hero, product1], solutionSlug: "dien-mat-troi-ap-mai",
    problem: "Kho lạnh vận hành liên tục, chi phí điện chiếm hơn 35% chi phí vận hành hàng tháng.",
    solutionDesc: "Lắp đặt hệ điện mặt trời áp mái 320 kWp tự dùng, kèm hệ giám sát sản lượng và cảnh báo suy giảm hiệu suất.",
    result: ["Sản lượng trung bình 38.000 kWh/tháng", "Giảm 27% hóa đơn điện", "Dự kiến hoàn vốn sau 4,8 năm"],
    productSlugs: ["mccb-3p-250a-schneider", "dong-ho-da-nang-schneider-pm2130", "vo-tu-dien-ip54-800x600", "den-highbay-led-150w"],
  },
  {
    id: "pr5", slug: "nha-may-duoc-pham-binh-duong", name: "Nhà máy dược phẩm Mekophar – Bình Dương",
    type: "Nhà máy sản xuất", location: "Bến Cát, Bình Dương", year: "2025", scale: "9.500 m² – 1.000kVA",
    image: hero, gallery: [hero, project1, solution1, product2], solutionSlug: "tu-dien-msb-ats",
    problem: "Dây chuyền GMP yêu cầu nguồn điện ổn định; mất điện vài giây cũng làm hỏng mẻ sản xuất và phải vệ sinh lại phòng sạch.",
    solutionDesc: "Lắp tủ MSB 1000A, ATS 2 nguồn lưới/máy phát và giám sát trạng thái nguồn realtime cho khu sản xuất, kho lạnh nguyên liệu.",
    result: ["Thời gian chuyển nguồn ATS dưới 8 giây", "Không gián đoạn mẻ sản xuất trong 9 tháng", "Hồ sơ điện đạt yêu cầu audit GMP"],
    productSlugs: ["mccb-3p-250a-schneider", "vo-tu-dien-ip54-800x600", "dong-ho-da-nang-schneider-pm2130", "khoi-dong-mem-abb-psr"],
  },
  {
    id: "pr6", slug: "khach-san-marina-nha-trang", name: "Khách sạn Marina Nha Trang",
    type: "Tòa nhà thương mại", location: "Nha Trang, Khánh Hòa", year: "2024", scale: "22 tầng – 2.000kVA",
    image: product1, gallery: [product1, project2, solution2, hero], solutionSlug: "chieu-sang-nha-xuong",
    problem: "Hệ chiếu sáng và điều hòa chiếm phần lớn hóa đơn điện; ban quản lý không tách được tiêu thụ theo khu vực (phòng, F&B, kỹ thuật).",
    solutionDesc: "Thay đèn LED khu vực công cộng, lắp điểm đo theo tầng và tối ưu lịch vận hành điều hòa theo công suất phòng.",
    result: ["Giảm 18% điện khu vực dùng chung", "Lux sảnh/hành lang đạt tiêu chuẩn khách sạn 4 sao", "Báo cáo điện tự động gửi ban quản lý mỗi tháng"],
    productSlugs: ["den-highbay-led-150w", "dong-ho-da-nang-schneider-pm2130", "mccb-3p-250a-schneider", "vo-tu-dien-ip54-800x600"],
  },
];

export type PortalDoc = {
  id: string;
  brandSlug: string;
  name: string;
  type: "Catalogue" | "Datasheet" | "Hướng dẫn" | "Phần mềm" | "Chứng chỉ";
  version: string;
  size: string;
  updatedAt: string;
  roles: ("admin" | "sale")[];
  fileUrl?: string;
  fileName?: string;
};

export const documents: PortalDoc[] = [
  { id: "d1", brandSlug: "schneider", name: "Catalogue EasyPact CVS 2026", type: "Catalogue", version: "v3.2", size: "12.4 MB", updatedAt: "05/02/2026", roles: ["admin", "sale"] },
  { id: "d2", brandSlug: "schneider", name: "Datasheet PM2130 – Đồng hồ đa năng", type: "Datasheet", version: "v1.8", size: "2.1 MB", updatedAt: "18/01/2026", roles: ["admin", "sale"] },
  { id: "d3", brandSlug: "schneider", name: "Bảng giá đại lý Quý I/2026", type: "Catalogue", version: "v1.0", size: "980 KB", updatedAt: "02/01/2026", roles: ["admin", "sale"] },
  { id: "d4", brandSlug: "abb", name: "Hướng dẫn cài đặt biến tần ACS580", type: "Hướng dẫn", version: "v4.0", size: "8.7 MB", updatedAt: "22/02/2026", roles: ["admin", "sale"] },
  { id: "d5", brandSlug: "abb", name: "Phần mềm Drive Composer Entry", type: "Phần mềm", version: "v2.9", size: "145 MB", updatedAt: "11/12/2025", roles: ["admin", "sale"] },
  { id: "d6", brandSlug: "abb", name: "Catalogue khởi động mềm PSR/PSE", type: "Catalogue", version: "v2.3", size: "6.3 MB", updatedAt: "30/11/2025", roles: ["admin", "sale"] },
  { id: "d7", brandSlug: "mitsubishi", name: "Sổ tay lập trình GX Works3", type: "Hướng dẫn", version: "v5.1", size: "23.6 MB", updatedAt: "14/02/2026", roles: ["admin", "sale"] },
  { id: "d8", brandSlug: "mitsubishi", name: "Datasheet iQ-F FX5U series", type: "Datasheet", version: "v2.0", size: "4.8 MB", updatedAt: "07/01/2026", roles: ["admin", "sale"] },
  { id: "d9", brandSlug: "siemens", name: "Chứng chỉ CO/CQ thiết bị hạ thế 2026", type: "Chứng chỉ", version: "v1.0", size: "1.2 MB", updatedAt: "20/02/2026", roles: ["admin", "sale"] },
  { id: "d10", brandSlug: "siemens", name: "Catalogue SIMATIC S7-1200", type: "Catalogue", version: "v6.4", size: "15.9 MB", updatedAt: "03/02/2026", roles: ["admin", "sale"] },
  { id: "d11", brandSlug: "panasonic", name: "Catalogue chiếu sáng công nghiệp", type: "Catalogue", version: "v1.5", size: "9.2 MB", updatedAt: "25/01/2026", roles: ["admin", "sale"] },
  { id: "d12", brandSlug: "ls-electric", name: "Datasheet contactor MC series", type: "Datasheet", version: "v3.0", size: "3.4 MB", updatedAt: "09/02/2026", roles: ["admin", "sale"] },
  { id: "d13", brandSlug: "ls-electric", name: "Hướng dẫn bảo trì MCCB LS", type: "Hướng dẫn", version: "v1.2", size: "2.8 MB", updatedAt: "16/12/2025", roles: ["admin", "sale"] },
];

export type PortalUser = {
  email: string;
  password: string;
  name: string;
  role: "admin" | "sale";
  roleLabel: string;
  company: string;
  phone: string;
  brandSlugs: string[] | "all";
};

export const portalUsers: PortalUser[] = [
  {
    email: "admin@hoangvinhvkt.vn", password: "123456", name: "Lê Hoàng Vĩnh", role: "admin",
    roleLabel: "Admin", company: "Hoàng Vĩnh VKT", phone: "0901 234 567",
    brandSlugs: "all",
  },
  {
    email: "sale@hoangvinhvkt.vn", password: "123456", name: "Nguyễn Thị Mai Anh", role: "sale",
    roleLabel: "Sale", company: "Hoàng Vĩnh VKT – Phòng Kinh doanh", phone: "0908 111 222",
    brandSlugs: "all",
  },
];

export const usps = [
  { title: "15+ năm kinh nghiệm", desc: "Hơn 500 công trình điện – tự động hóa đã bàn giao." },
  { title: "Hàng chính hãng", desc: "Đại lý ủy quyền của các hãng lớn, đầy đủ CO/CQ." },
  { title: "Kỹ sư tư vấn tại chỗ", desc: "Đội ngũ khảo sát và hỗ trợ kỹ thuật trên toàn quốc." },
  { title: "Bảo hành – bảo trì", desc: "Cam kết phản hồi trong 4 giờ, có mặt trong 24 giờ." },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getSolution = (slug: string) => solutions.find((s) => s.slug === slug);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
