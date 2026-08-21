import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Users, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductCard } from "@/components/product-card";
import { ConsultForm } from "@/components/consult-form";
import { images, type Solution } from "@/data/mock";
import { loadAdminProducts } from "@/data/products-store";
import { loadAdminProjects } from "@/data/projects-store";
import { getAdminSolution } from "@/data/solutions-store";

export const Route = createFileRoute("/giai-phap/$slug")({
  head: ({ params }) => {
    const s = typeof window === "undefined" ? undefined : getAdminSolution(params.slug);
    if (!s) {
      return {
        meta: [
          { title: "Giải pháp | Hoàng Vĩnh VKT" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return {
      meta: [
        { title: `${s.name} | Giải pháp Hoàng Vĩnh VKT` },
        { name: "description", content: s.short.slice(0, 155) },
        { property: "og:title", content: s.name },
        { property: "og:description", content: s.short.slice(0, 155) },
      ],
    };
  },
  component: SolutionDetailPage,
});

function SolutionDetailPage() {
  const { slug } = useParams({ from: "/giai-phap/$slug" });
  const [solution, setSolution] = useState<Solution | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSolution(getAdminSolution(slug) ?? null);
    setReady(true);
  }, [slug]);

  if (!ready) return <div className="container-page min-h-[40vh] py-10" />;

  if (!solution) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-xl font-black">Không tìm thấy giải pháp</h1>
        <p className="mt-2 text-sm text-muted-foreground">Giải pháp có thể đã bị xóa hoặc chưa được lưu.</p>
        <Button asChild className="mt-6">
          <Link to="/giai-phap">Về danh sách giải pháp</Link>
        </Button>
      </div>
    );
  }

  return <SolutionDetail solution={solution} />;
}

function SolutionDetail({ solution }: { solution: Solution }) {
  const solutionProducts = loadAdminProducts().filter((p) => solution.productSlugs.includes(p.slug));
  const relatedProjects = loadAdminProjects().filter((p) => p.solutionSlug === solution.slug);

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-dark text-brand-foreground">
        <img
          src={solution.image}
          alt={solution.name}
          width={1400}
          height={900}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />
        <div className="container-page relative py-7 sm:py-10 lg:py-20">
          <nav className="text-xs opacity-80">
            <Link to="/" className="hover:underline">
              Trang chủ
            </Link>
            <span className="mx-1">/</span>
            <Link to="/giai-phap" className="hover:underline">
              Giải pháp
            </Link>
          </nav>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-highlight">
            {solution.group}
          </p>
          <h1 className="mt-2 max-w-3xl text-[23px] font-black leading-tight sm:text-5xl">
            {solution.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm opacity-90 sm:text-base">{solution.short}</p>
          <Button asChild size="lg" className="mt-6 bg-highlight text-highlight-foreground hover:bg-highlight/90">
            <a href="#tu-van">Đăng ký tư vấn</a>
          </Button>
        </div>
      </section>

      <section className="container-page section-space">
        <h2 className="text-[13px] font-black uppercase text-[#071c4c] sm:text-2xl">Lợi ích nổi bật</h2>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-4">
          {solution.benefits.map((b) => (
            <div key={b.title} className="rounded-[10px] border border-brand/10 bg-card p-3 text-center shadow-card sm:rounded-2xl sm:p-5">
              <CheckCircle2 className="mx-auto h-5 w-5 text-[#0758c9] sm:h-6 sm:w-6" />
              <h3 className="mt-2 text-[9px] font-bold sm:mt-3 sm:text-base">{b.title}</h3>
              <p className="mt-1 hidden text-sm text-muted-foreground sm:block">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 hidden gap-6 sm:grid sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 font-bold">
              <Users className="h-5 w-5 text-brand" /> Đối tượng phù hợp
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {solution.audience.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 font-bold">
              <Layers className="h-5 w-5 text-brand" /> Các loại hệ thống
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {solution.systems.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page pb-8 sm:pb-12">
        <div className="flex items-center justify-between"><h2 className="text-[13px] font-black text-[#071c4c] sm:text-2xl">Các loại hệ thống</h2><span className="text-[9px] font-bold text-[#0758c9]">Xem tất cả ›</span></div>
        <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-4">
          {solution.systems.slice(0,3).map((system,index)=><article key={system} className="w-[165px] shrink-0 overflow-hidden rounded-xl border border-brand/10 bg-white shadow-card sm:w-auto"><img src={[images.solution2,images.project1,images.project2][index]} alt={system} className="h-24 w-full object-cover sm:h-40"/><div className="p-3"><h3 className="text-[10px] font-bold text-[#071c4c] sm:text-sm">{system}</h3><p className="mt-1 text-[7px] leading-relaxed text-muted-foreground sm:text-xs">Giải pháp phù hợp nhu cầu thực tế, vận hành ổn định và bảo hành dài hạn.</p><span className="mt-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#0758c9] text-[9px] text-[#0758c9]">›</span></div></article>)}
        </div>
      </section>

      <section className="bg-secondary/60 section-space">
        <div className="container-page">
          <div className="flex items-center justify-between"><h2 className="text-[13px] font-black text-[#071c4c] sm:text-2xl">Gói giải pháp phổ biến</h2><span className="text-[9px] font-bold text-[#0758c9]">Xem tất cả ›</span></div>
          <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-2 sm:mt-5 sm:grid sm:gap-4 lg:grid-cols-3">
            {solution.packages.map((pk) => (
              <div key={pk.id} className="card-hover flex w-[175px] shrink-0 flex-col rounded-xl border border-brand/10 bg-card p-3 shadow-card sm:w-auto sm:rounded-2xl sm:p-5">
                <h3 className="text-[12px] font-bold sm:text-lg">{pk.name}</h3>
                <p className="mt-1 text-[8px] text-muted-foreground sm:text-sm">{pk.desc}</p>
                <p className="mt-3 text-[14px] font-black text-[#e60000] sm:text-xl">{pk.price}</p>
                <ul className="mt-3 flex-1 space-y-1.5 text-[8px] text-muted-foreground sm:text-sm">
                  {pk.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> {i}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-3 h-7 text-[8px] sm:mt-4 sm:h-9 sm:text-sm">
                  <a href="#tu-van">Yêu cầu báo giá</a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <h2 className="text-2xl font-black">Thiết bị cấu thành</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {solutionProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="container-page pb-12">
        <h2 className="text-[13px] font-black text-[#071c4c] sm:text-2xl">Quy trình triển khai</h2>
        <ol className="mt-4 flex items-start sm:mt-5 sm:grid sm:grid-cols-5 sm:gap-4">
          {solution.process.map((p, i) => (
            <li key={p.step} className="relative min-w-0 flex-1 px-0.5 text-center sm:rounded-xl sm:border sm:border-border sm:bg-card sm:p-4">
              <div className="flex items-center">
                <span className="h-px flex-1 bg-transparent" />
                <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#b8cce8] bg-white text-[10px] font-black text-[#0758c9] shadow-[0_2px_8px_rgba(7,88,201,.12)] sm:bg-gradient-brand sm:text-sm sm:text-brand-foreground">
                  {i + 1}
                </span>
                <span className={`relative h-px flex-1 sm:hidden ${i < solution.process.length - 1 ? "bg-[#b8cce8]" : "bg-transparent"}`}>
                  {i < solution.process.length - 1 && (
                    <ArrowRight className="absolute right-[-4px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-[#0758c9]" />
                  )}
                </span>
              </div>
              <h3 className="mx-auto mt-2 min-h-[30px] max-w-[72px] text-[7px] font-bold leading-[1.35] text-[#172d52] sm:mt-3 sm:max-w-none sm:text-sm">{p.step}</h3>
              <p className="mt-1 hidden text-xs text-muted-foreground sm:block">{p.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {relatedProjects.length > 0 && (
        <section className="container-page pb-12">
          <h2 className="text-2xl font-black">Công trình liên quan</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProjects.map((p) => (
              <Link
                key={p.slug}
                to="/cong-trinh/$slug"
                params={{ slug: p.slug }}
                className="card-hover overflow-hidden rounded-xl border border-border bg-card shadow-card"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={1400}
                  height={900}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold leading-snug">{p.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.location} · {p.scale}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {solution.faq.length > 0 && (
        <section className="container-page pb-12">
          <h2 className="text-2xl font-black">Câu hỏi thường gặp</h2>
          <Accordion type="single" collapsible className="mt-4 max-w-3xl">
            {solution.faq.map((f, i) => (
              <AccordionItem key={f.q} value={`f${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      <section id="tu-van" className="container-page pb-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:p-10">
          <h2 className="text-2xl font-black">Đăng ký tư vấn: {solution.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Kỹ sư phụ trách sẽ liên hệ, khảo sát và gửi báo giá chi tiết.
          </p>
          <div className="mt-6">
            <ConsultForm source={`Giải pháp: ${solution.name}`} defaultSolution={solution.name} />
          </div>
        </div>
      </section>
    </div>
  );
}
