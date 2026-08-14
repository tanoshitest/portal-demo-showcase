import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Zap,
  Gauge,
  Cpu,
  Activity,
  Server,
  Lightbulb,
  ShieldCheck,
  Phone,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { ConsultForm } from "@/components/consult-form";
import { brands, categories, images, products, projects, solutions, usps } from "@/data/mock";

const icons: Record<string, typeof Zap> = { Zap, Gauge, Cpu, Activity, Server, Lightbulb };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hoàng Vĩnh VKT – Thiết bị điện & giải pháp tự động hóa" },
      {
        name: "description",
        content:
          "Hoàng Vĩnh VKT cung cấp thiết bị điện chính hãng, giải pháp tự động hóa, điện mặt trời và thi công công trình cho nhà máy, tòa nhà tại Việt Nam.",
      },
      { property: "og:title", content: "Hoàng Vĩnh VKT – Thiết bị điện & giải pháp tự động hóa" },
      {
        property: "og:description",
        content: "Thiết bị chính hãng, giải pháp kỹ thuật và hơn 500 công trình đã bàn giao.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-dark text-brand-foreground">
        <img
          src={images.hero}
          alt="Kỹ sư Hoàng Vĩnh VKT kiểm tra tủ điện điều khiển trong nhà máy"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="container-page relative py-14 lg:py-24">
          <Badge className="bg-highlight text-highlight-foreground hover:bg-highlight">
            15+ năm kinh nghiệm · 500+ công trình
          </Badge>
          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Thiết bị điện chính hãng &amp; giải pháp kỹ thuật cho nhà máy, công trình
          </h1>
          <p className="mt-4 max-w-2xl text-sm opacity-90 sm:text-base">
            Từ thiết bị đóng cắt, biến tần, PLC đến hệ thống điện nhà xưởng, tự động hóa dây chuyền
            và điện mặt trời áp mái – tất cả trong một đối tác kỹ thuật.
          </p>
          <div className="mt-6 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm MCCB, biến tần, PLC…"
                className="h-12 border-0 bg-background pl-9 text-foreground"
              />
            </div>
            <Button asChild size="lg" className="h-12 bg-highlight text-highlight-foreground hover:bg-highlight/90">
              <Link to="/san-pham">Tìm kiếm</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/giai-phap">
                Xem giải pháp <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-brand-foreground/40 bg-transparent text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground"
            >
              <Link to="/lien-he">
                <Phone className="h-4 w-4" /> Đăng ký tư vấn
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-12">
        <SectionHead title="Danh mục thiết bị" desc="Chọn nhóm thiết bị bạn đang cần" to="/san-pham" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const Icon = icons[c.icon] ?? Zap;
            return (
              <Link
                key={c.slug}
                to="/san-pham"
                search={{ danh_muc: c.slug, q: "" }}
                className="card-hover flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-card"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold leading-snug sm:text-sm">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Solutions */}
      <section className="bg-secondary/60 py-12">
        <div className="container-page">
          <SectionHead
            title="Giải pháp nổi bật"
            desc="Chúng tôi tư vấn theo bài toán của bạn, không chỉ theo tên thiết bị"
            to="/giai-phap"
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.slice(0, 4).map((s) => (
              <Link
                key={s.slug}
                to="/giai-phap/$slug"
                params={{ slug: s.slug }}
                className="card-hover group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card"
              >
                <img
                  src={s.image}
                  alt={s.name}
                  loading="lazy"
                  width={1400}
                  height={900}
                  className="h-36 w-full object-cover"
                />
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-xs font-semibold uppercase text-highlight-foreground">
                    {s.group}
                  </span>
                  <h3 className="mt-1 line-clamp-2 font-bold leading-snug group-hover:text-brand">{s.name}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{s.short}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-brand">
                    Xem chi tiết <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="container-page py-12">
        <SectionHead title="Sản phẩm bán chạy" desc="Thiết bị được khách hàng công nghiệp đặt nhiều nhất" to="/san-pham" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="bg-brand-dark py-12 text-brand-foreground">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">Công trình tiêu biểu</h2>
              <p className="mt-1 text-sm opacity-80">Bài toán – Giải pháp – Thiết bị – Kết quả</p>
            </div>
            <Button asChild variant="secondary">
              <Link to="/cong-trinh">Xem tất cả</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {projects.slice(0, 4).map((p) => (
              <Link
                key={p.slug}
                to="/cong-trinh/$slug"
                params={{ slug: p.slug }}
                className="card-hover group overflow-hidden rounded-xl bg-brand-foreground/5 ring-1 ring-brand-foreground/10"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={1400}
                  height={900}
                  className="h-36 w-full object-cover"
                />
                <div className="p-4">
                  <span className="text-xs opacity-70">
                    {p.type} · {p.year}
                  </span>
                  <h3 className="mt-1 line-clamp-2 font-bold leading-snug">{p.name}</h3>
                  <p className="mt-1 text-xs opacity-75">{p.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* USP */}
      <section className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {usps.map((u) => (
            <div key={u.title} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <ShieldCheck className="h-6 w-6 text-brand" />
              <h3 className="mt-3 font-bold">{u.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Consult */}
      <section className="container-page pb-12">
        <div className="grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-card lg:grid-cols-2 lg:p-10">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Cần khảo sát &amp; báo giá?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Để lại thông tin, kỹ sư của Hoàng Vĩnh VKT sẽ liên hệ trong 4 giờ làm việc để tư vấn
              phương án phù hợp với hiện trạng và ngân sách của bạn.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {["Khảo sát miễn phí tại TP.HCM và các tỉnh lân cận", "Báo giá chi tiết theo khối lượng", "Hỗ trợ hồ sơ kỹ thuật nghiệm thu"].map(
                (t) => (
                  <li key={t} className="flex gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-success" /> {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <ConsultForm source="Trang chủ" compact />
        </div>
      </section>

      {/* Brands */}
      <section className="container-page pb-12">
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Đối tác &amp; thương hiệu phân phối
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((b) => (
            <div
              key={b.slug}
              className="flex h-16 items-center justify-center rounded-lg border border-border bg-card px-3 text-center text-sm font-bold text-brand-dark"
            >
              {b.name}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHead({ title, desc, to }: { title: string; desc: string; to: "/san-pham" | "/giai-phap" }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <Button asChild variant="outline">
        <Link to={to}>Xem tất cả</Link>
      </Button>
    </div>
  );
}
