import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, CheckCircle2, Gift, Headphones, Phone, Search, ShieldCheck, ShoppingCart, Star, SunMedium, Truck, Wifi, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsultForm } from "@/components/consult-form";
import { ProductCard } from "@/components/product-card";
import { brands, images, products as seedProducts, projects, type Product, type Solution } from "@/data/mock";
import { loadAdminProducts, isUsableProductImage } from "@/data/products-store";
import { loadAdminSolutions } from "@/data/solutions-store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Hoàng Vĩnh IOT - Giải pháp năng lượng và an ninh toàn diện" },
    { name: "description", content: "Điện mặt trời, camera, Wi-Fi, điện máy và vận chuyển trọn gói cho gia đình, doanh nghiệp." },
  ] }),
  component: Home,
});

const needs = [
  { label: "Giảm tiền điện", sub: "Lắp điện mặt trời", icon: SunMedium, to: "/giai-phap/dien-mat-troi-ap-mai" },
  { label: "Lắp đặt camera", sub: "An ninh", icon: Camera, to: "/san-pham" },
  { label: "Xem hàng có sẵn", sub: "Đặt hàng", icon: Search, to: "/san-pham" },
  { label: "Gửi hàng quốc tế", sub: "Nhanh chóng", icon: Truck, to: "/lien-he" },
  { label: "Lắp Wi-Fi", sub: "Mạng mạnh - ổn định", icon: Wifi, to: "/giai-phap" },
  { label: "Tư vấn giải pháp", sub: "Miễn phí", icon: Wrench, to: "/lien-he" },
] as const;

function SectionTitle({ children, to }: { children: string; to?: "/san-pham" | "/giai-phap" | "/cong-trinh" }) {
  return <div className="flex items-center justify-between"><h2 className="text-[13px] font-black uppercase text-[#071c4c] sm:text-lg">{children}</h2>{to && <Link to={to} className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0758c9] sm:text-xs">Xem tất cả <ArrowRight className="h-3 w-3" /></Link>}</div>;
}

function Home() {
  const [products, setProducts] = useState<Product[]>(seedProducts.slice(0, 4));
  const [featuredSolutions, setFeaturedSolutions] = useState<Solution[]>(() =>
    loadAdminSolutions().filter((item) => item.slug).slice(0, 3),
  );
  useEffect(() => {
    setProducts(loadAdminProducts().slice(0, 4));
    setFeaturedSolutions(loadAdminSolutions().filter((item) => item.slug).slice(0, 3));
  }, []);
  return <div className="bg-white">
    <section className="relative isolate min-h-[270px] overflow-hidden bg-[#062a68] text-white sm:min-h-[430px]">
      <img src={images.hero} alt="Giải pháp năng lượng và an ninh" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#062a68]/95 via-[#073e84]/75 to-transparent" />
      <div className="mx-auto flex min-h-[270px] max-w-[1180px] flex-col justify-center px-[18px] py-6 sm:min-h-[430px] sm:px-6 lg:px-8">
        <p className="text-[10px] font-bold text-[#ff9b22] sm:text-sm">Uy tín · Chính hãng · Bảo hành tận nơi</p>
        <h1 className="mt-2 max-w-[290px] text-[25px] font-black uppercase leading-[1.1] sm:max-w-xl sm:text-5xl">Giải pháp năng lượng<br />&amp; an ninh toàn diện</h1>
        <p className="mt-2 max-w-[280px] text-[11px] italic text-[#ffc16b] sm:max-w-lg sm:text-base">Cho gia đình &amp; doanh nghiệp</p>
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[8px] font-semibold sm:text-xs">
          {["Uy tín", "Chất lượng", "Bảo hành tận nơi"].map(x => <li key={x} className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{x}</li>)}
        </ul>
        <div className="mt-4 flex gap-2">
          <Button asChild size="sm" className="h-8 rounded-md bg-[#0758c9] px-3 text-[9px] text-white sm:h-10 sm:text-xs"><Link to="/lien-he"><Phone className="h-3 w-3" />Tư vấn miễn phí</Link></Button>
          <Button asChild size="sm" className="h-8 rounded-md bg-white/95 px-3 text-[9px] text-[#0758c9] hover:bg-white sm:h-10 sm:text-xs"><Link to="/giai-phap"><Search className="h-3 w-3" />Khảo sát tận nơi</Link></Button>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1180px] px-[18px] py-5 sm:px-6 sm:py-10 lg:px-8">
      <SectionTitle>Tôi cần...</SectionTitle>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
        {needs.map(item => <Link key={item.label} to={item.to} className="flex min-h-[66px] flex-col items-center justify-center rounded-[9px] border border-[#e5e9f0] bg-white px-1 text-center shadow-[0_2px_8px_rgba(16,52,100,.06)] sm:min-h-24"><item.icon className="h-5 w-5 text-[#0758c9]" strokeWidth={1.7} /><strong className="mt-1 text-[8px] leading-tight text-[#102650] sm:text-[11px]">{item.label}</strong><span className="mt-0.5 text-[6px] text-[#687794] sm:text-[9px]">{item.sub}</span></Link>)}
      </div>
    </section>

    <section className="mx-auto max-w-[1180px] px-[18px] pb-6 sm:px-6 sm:pb-12 lg:px-8">
      <SectionTitle to="/giai-phap">Giải pháp nổi bật</SectionTitle>
      <div className={`mt-3 grid gap-2 sm:gap-4 ${featuredSolutions.length === 1 ? "grid-cols-1" : featuredSolutions.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {featuredSolutions.map((solution) => (
          <Link
            key={solution.id}
            to="/giai-phap/$slug"
            params={{ slug: solution.slug }}
            className="relative isolate flex min-h-[145px] overflow-hidden rounded-[9px] p-2 text-white shadow-card sm:min-h-[300px] sm:p-5"
          >
            {isUsableProductImage(solution.image) ? (
              <img src={solution.image} alt={solution.name} className="absolute inset-0 -z-20 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 -z-20 bg-[#062a68]" />
            )}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#041c49]/95 via-[#062a68]/25 to-transparent" />
            <div className="mt-auto">
              {solution.group ? <p className="text-[8px] font-bold uppercase text-[#ff9b22] sm:text-[11px]">{solution.group}</p> : null}
              <p className="text-[9px] font-black uppercase sm:text-lg">{solution.name}</p>
              <p className="mt-1 line-clamp-2 text-[7px] text-white/80 sm:text-xs">{solution.short || solution.benefits[0]?.title}</p>
              <span className="mt-2 inline-flex rounded bg-[#ff7a00] px-2 py-1 text-[7px] font-bold sm:text-[10px]">Xem ngay</span>
            </div>
          </Link>
        ))}
      </div>
    </section>

    <section className="mx-auto max-w-[1180px] px-[18px] pb-6 sm:px-6 sm:pb-12 lg:px-8">
      <SectionTitle to="/san-pham">Sản phẩm bán chạy</SectionTitle>
      <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-4">
        {products.slice(0,4).map(product => <div key={product.id} className="w-[132px] shrink-0 sm:w-auto"><ProductCard product={product} /></div>)}
      </div>
    </section>

    <section className="mx-auto max-w-[1180px] px-[18px] pb-6 sm:px-6 sm:pb-12 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-[11px] bg-[#0758c9] p-4 text-white sm:p-8"><img src={images.solution2} alt="Điện mặt trời trả góp" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-55" /><div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0758c9] via-[#0758c9]/85 to-transparent" /><p className="text-[9px] font-bold uppercase">Điện mặt trời</p><h2 className="mt-1 text-[18px] font-black uppercase sm:text-3xl">Trả góp 0%</h2><p className="mt-1 max-w-[210px] text-[8px] sm:text-xs">Trả trước chỉ từ 10 - 15 triệu<br />Giảm tiền điện - Hoàn vốn nhanh</p><Button asChild size="sm" className="mt-3 h-7 bg-[#ff7a00] px-3 text-[8px]"><Link to="/lien-he">Tư vấn ngay</Link></Button></div>
    </section>

    <section className="mx-auto max-w-[1180px] px-[18px] pb-6 sm:px-6 sm:pb-12 lg:px-8">
      <SectionTitle>Vì sao chọn Hoàng Vĩnh IOT?</SectionTitle>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">{[
        [Headphones,"Tư vấn tận tâm","Khảo sát miễn phí"],[ShieldCheck,"Sản phẩm chính hãng","Bảo hành tận nơi"],[Zap,"Thi công chuyên nghiệp","Đúng tiến độ"],[Phone,"Hỗ trợ nhanh chóng","24/7"],
      ].map(([Icon,title,sub]) => { const C=Icon as typeof Zap; return <div key={title as string}><C className="mx-auto h-5 w-5 text-[#0758c9]" /><strong className="mt-2 block text-[7px] leading-tight sm:text-[11px]">{title as string}</strong><span className="mt-1 block text-[6px] text-muted-foreground sm:text-[9px]">{sub as string}</span></div>})}</div>
    </section>

    <section className="mx-auto max-w-[1180px] px-[18px] pb-6 sm:px-6 sm:pb-12 lg:px-8">
      <SectionTitle to="/cong-trinh">Công trình tiêu biểu</SectionTitle>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-4">{projects.slice(0,3).map(project => <Link key={project.slug} to="/cong-trinh/$slug" params={{slug:project.slug}} className="overflow-hidden rounded-[9px] border border-[#e5e9f0] bg-white shadow-card"><img src={project.image} alt={project.name} className="h-[76px] w-full object-cover sm:h-44" /><div className="p-2"><h3 className="line-clamp-2 text-[8px] font-bold leading-tight sm:text-sm">{project.name}</h3><p className="mt-1 line-clamp-1 text-[6px] text-muted-foreground sm:text-[10px]">{project.location}</p><span className="mt-2 inline-flex text-[7px] font-bold text-[#0758c9] sm:text-[10px]">Xem chi tiết</span></div></Link>)}</div>
    </section>

    <section className="bg-[#f4f8ff] py-6 sm:py-12"><div className="mx-auto max-w-[1180px] px-[18px] sm:px-6 lg:px-8"><SectionTitle>Ưu đãi đáng diễn ra</SectionTitle><div className="mt-3 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-gradient-to-r from-[#ff6a00] to-[#ff9b22] p-4 text-white sm:col-span-2"><Gift className="h-5 w-5" /><h3 className="mt-2 text-lg font-black">Giảm đến 15%</h3><p className="text-[9px] sm:text-xs">Khi lắp điện mặt trời trong tháng này</p></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-1"><div className="rounded-xl bg-[#eaf3ff] p-3"><strong className="text-[9px] sm:text-xs">Tặng thẻ nhớ 128GB</strong><p className="mt-1 text-[7px] text-muted-foreground">Khi lắp camera trọn bộ</p></div><div className="rounded-xl bg-[#eef8f0] p-3"><strong className="text-[9px] sm:text-xs">Miễn phí công lắp đặt</strong><p className="mt-1 text-[7px] text-muted-foreground">Khi mua trọn bộ Wi-Fi</p></div></div></div></div></section>

    <section className="mx-auto max-w-[1180px] px-[18px] py-6 sm:px-6 sm:py-12 lg:px-8"><SectionTitle>Khách hàng nói gì về chúng tôi</SectionTitle><div className="hide-scrollbar mt-3 flex gap-3 overflow-x-auto sm:grid sm:grid-cols-3">{["Đội ngũ tư vấn nhiệt tình, thi công nhanh gọn.","Hệ điện mặt trời hoạt động ổn định, tiền điện giảm rõ rệt.","Camera sắc nét, kỹ thuật hỗ trợ rất nhanh."].map((quote,index)=><article key={quote} className="w-[280px] shrink-0 rounded-xl border border-[#e5e9f0] bg-white p-4 shadow-card sm:w-auto"><div className="flex text-[#ffad00]">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-3 w-3 fill-current" />)}</div><p className="mt-2 text-[9px] leading-relaxed sm:text-xs">“{quote}”</p><p className="mt-3 text-[8px] font-bold text-[#071c4c]">{["Anh Minh - Hà Tĩnh","Chị Lan - Nghệ An","Anh Hùng - Đà Nẵng"][index]}</p></article>)}</div></section>

    <section className="bg-[#063b86] py-6 text-white sm:py-12"><div className="mx-auto grid max-w-[1180px] gap-5 px-[18px] sm:px-6 lg:grid-cols-2 lg:px-8"><div><h2 className="text-lg font-black uppercase sm:text-3xl">Cần tư vấn giải pháp phù hợp?</h2><p className="mt-2 text-[9px] text-white/80 sm:text-sm">Đội ngũ Hoàng Vĩnh IOT luôn sẵn sàng hỗ trợ bạn.</p><div className="mt-3 flex gap-2"><a href="tel:19006868" className="rounded bg-white/10 px-3 py-2 text-[9px] font-bold"><Phone className="mr-1 inline h-3 w-3" />1900 6868</a><a href="https://zalo.me" className="rounded bg-[#0879e8] px-3 py-2 text-[9px] font-bold">Chat Zalo</a></div></div><div className="rounded-xl bg-white p-4 text-foreground"><h3 className="text-sm font-black text-[#071c4c]">Nhận tư vấn miễn phí</h3><div className="mt-3"><ConsultForm source="Trang chủ" compact /></div></div></div></section>

    <section className="mx-auto max-w-[1180px] px-[18px] py-6 sm:px-6 lg:px-8"><p className="text-center text-[9px] font-bold uppercase text-muted-foreground">Đối tác - Thương hiệu</p><div className="mt-4 grid grid-cols-6 gap-2">{brands.slice(0,6).map(brand=><div key={brand.slug} className="truncate text-center text-[8px] font-black text-[#284873] sm:text-xs">{brand.name}</div>)}</div></section>
  </div>;
}
