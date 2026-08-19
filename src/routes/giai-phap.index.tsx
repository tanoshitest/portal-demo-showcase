import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, CheckCircle2, Lightbulb, Search, Send, SunMedium, Wifi } from "lucide-react";
import solarImage from "@/assets/solution-2.jpg";
import cameraImage from "@/assets/solution-camera-v2.webp";
import wifiImage from "@/assets/solution-wifi-v2.webp";
import applianceImage from "@/assets/solution-appliance-v2.webp";

export const Route = createFileRoute("/giai-phap/")({
  head: () => ({
    meta: [
      { title: "Giải pháp điện mặt trời, camera, Wi-Fi và điện máy | Hoàng Vĩnh IOT" },
      { name: "description", content: "Giải pháp trọn gói điện mặt trời, camera an ninh, Wi-Fi và thiết bị điện máy cho gia đình, doanh nghiệp." },
    ],
  }),
  component: SolutionListing,
});

const categories = [
  { label: "Điện mặt trời", icon: SunMedium, active: true },
  { label: "Camera an ninh", icon: Camera },
  { label: "Wi-Fi & mạng", icon: Wifi },
  { label: "Điện - Điện máy", icon: Lightbulb },
  { label: "Vận chuyển quốc tế", icon: Send },
];

const solutionCards = [
  { eyebrow: "Điện mặt trời", title: "Giải pháp điện mặt trời\ncho gia đình", points: ["Tiết kiệm chi phí tiền điện mỗi tháng", "Hệ thống bền bỉ, tuổi thọ cao", "Tư vấn - Lắp đặt trọn gói"], image: solarImage, to: "/giai-phap/dien-mat-troi-ap-mai", card: "from-[#eaf3ff] via-[#f7faff] to-white", badge: "bg-[#d9ebff] text-[#0758c9]", accent: "text-[#0758c9]", dot: "bg-[#0758c9]" },
  { eyebrow: "Camera an ninh", title: "Giải pháp camera an ninh\ntoàn diện", points: ["Giám sát mọi lúc, mọi nơi", "Hình ảnh sắc nét, cảnh báo thông minh", "Lắp đặt chuyên nghiệp, bảo hành dài hạn"], image: cameraImage, to: "/san-pham", card: "from-[#fff3e9] via-[#fffaf6] to-white", badge: "bg-[#ffe5d1] text-[#ed6a12]", accent: "text-[#ed6a12]", dot: "bg-[#ed6a12]" },
  { eyebrow: "Wi-Fi & mạng", title: "Giải pháp Wi-Fi mạnh mẽ\ncho mọi không gian", points: ["Phủ sóng rộng, tốc độ ổn định", "Thiết bị chính hãng, cấu hình tối ưu", "Hỗ trợ kỹ thuật nhanh chóng"], image: wifiImage, to: "/lien-he", card: "from-[#edf8ef] via-[#f8fcf8] to-white", badge: "bg-[#dff3e3] text-[#279447]", accent: "text-[#279447]", dot: "bg-[#279447]" },
  { eyebrow: "Điện - Điện máy", title: "Giải pháp thiết bị điện\nthông minh", points: ["Sản phẩm chính hãng, tiết kiệm điện", "Thiết kế hiện đại, an toàn khi sử dụng", "Bảo hành chính hãng, hậu mãi tốt"], image: applianceImage, to: "/san-pham", card: "from-[#f3efff] via-[#fbfaff] to-white", badge: "bg-[#e9e0ff] text-[#7040c7]", accent: "text-[#7040c7]", dot: "bg-[#7040c7]" },
] as const;

function SolutionListing() {
  return (
    <div className="bg-white pb-5 lg:pb-16">
      <div className="mx-auto w-full max-w-[1180px] px-[18px] pt-5 sm:px-6 lg:px-8 lg:pt-10">
        <header>
          <h1 className="text-[20px] font-black uppercase leading-none tracking-[-0.02em] text-[#071c4c] sm:text-3xl">Giải pháp</h1>
          <p className="mt-2 text-[12px] font-medium text-[#53617e] sm:text-sm">Giải pháp tối ưu cho mọi nhu cầu</p>
        </header>

        <label className="mt-[17px] flex h-[43px] items-center gap-3 rounded-[8px] border border-[#dfe5ef] bg-white px-3.5 shadow-[0_2px_8px_rgba(18,54,105,.05)]">
          <Search className="h-4 w-4 shrink-0 text-[#57709b]" strokeWidth={1.8} />
          <input type="search" placeholder="Tìm giải pháp phù hợp..." className="min-w-0 flex-1 bg-transparent text-[12px] text-[#071c4c] outline-none placeholder:text-[#8190a9]" />
        </label>

        <nav className="hide-scrollbar mt-[17px] flex justify-between gap-1 overflow-x-auto pb-1" aria-label="Danh mục giải pháp">
          {categories.map((item) => (
            <button key={item.label} type="button" className={`flex h-[76px] w-[64px] shrink-0 flex-col items-center justify-center gap-2 rounded-[9px] border bg-white px-1 min-[390px]:w-[68px] sm:h-24 sm:w-28 ${item.active ? "border-[#0b61df] shadow-[0_2px_7px_rgba(11,97,223,.12)]" : "border-[#e5e9f0]"}`}>
              <item.icon className={`h-[25px] w-[25px] ${item.active ? "text-[#ff7a00]" : "text-[#163a72]"}`} strokeWidth={1.6} />
              <span className="text-center text-[9px] font-bold leading-[1.18] text-[#102650] sm:text-[11px]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-[21px] flex items-center justify-between">
          <h2 className="text-[13px] font-black uppercase text-[#071c4c] sm:text-base">Giải pháp nổi bật</h2>
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#0758c9] sm:text-xs">Xem tất cả <ArrowRight className="h-3 w-3" /></span>
        </div>

        <div className="mt-[11px] grid gap-[10px] lg:grid-cols-2 lg:gap-5">
          {solutionCards.map((solution) => (
            <article key={solution.eyebrow} className={`relative isolate min-h-[174px] overflow-hidden rounded-[10px] border border-white bg-gradient-to-r ${solution.card} shadow-[0_3px_12px_rgba(16,52,100,.10)] sm:min-h-[220px] sm:rounded-2xl`}>
              <img src={solution.image} alt="" className="absolute inset-y-0 right-0 -z-10 h-full w-[60%] object-cover object-center" />
              <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${solution.card} opacity-95 [mask-image:linear-gradient(to_right,black_48%,transparent_86%)]`} />
              <div className="flex min-h-[174px] w-[64%] flex-col px-[14px] py-[13px] sm:min-h-[220px] sm:px-6 sm:py-5">
                <span className={`w-fit rounded px-2 py-1 text-[8px] font-black uppercase tracking-wide sm:text-[10px] ${solution.badge}`}>{solution.eyebrow}</span>
                <h3 className="mt-2 whitespace-pre-line text-[15px] font-black leading-[1.15] tracking-[-0.02em] text-[#071c4c] sm:text-xl">{solution.title}</h3>
                <ul className="mt-2 space-y-[4px]">
                  {solution.points.map((point) => <li key={point} className="flex items-start gap-1.5 text-[8px] font-medium leading-[1.25] text-[#273b60] sm:text-[11px]"><CheckCircle2 className={`mt-px h-[10px] w-[10px] shrink-0 sm:h-3 sm:w-3 ${solution.accent}`} strokeWidth={3} /><span>{point}</span></li>)}
                </ul>
                <Link to={solution.to} className={`mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold shadow-sm sm:px-3 sm:py-1.5 sm:text-[11px] ${solution.accent}`}>
                  <span className={`grid h-4 w-4 place-items-center rounded-full text-white ${solution.dot}`}><ArrowRight className="h-2.5 w-2.5" /></span>Xem chi tiết
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
