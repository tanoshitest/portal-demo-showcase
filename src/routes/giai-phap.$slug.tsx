import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Users, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductCard } from "@/components/product-card";
import { ConsultForm } from "@/components/consult-form";
import { getSolution, products, projects, type Solution } from "@/data/mock";

export const Route = createFileRoute("/giai-phap/$slug")({
  loader: ({ params }) => {
    const solution = getSolution(params.slug);
    if (!solution) throw notFound();
    return { solution };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Không tìm thấy giải pháp | Hoàng Vĩnh VKT" },
          { name: "robots", content: "noindex" },
        ],
      };
    const s = loaderData.solution;
    return {
      meta: [
        { title: `${s.name} | Giải pháp Hoàng Vĩnh VKT` },
        { name: "description", content: s.short.slice(0, 155) },
        { property: "og:title", content: s.name },
        { property: "og:description", content: s.short.slice(0, 155) },
      ],
    };
  },
  component: SolutionDetail,
});

function SolutionDetail() {
  const { solution } = Route.useLoaderData() as { solution: Solution };
  const solutionProducts = products.filter((p) => solution.productSlugs.includes(p.slug));
  const relatedProjects = projects.filter((p) => p.solutionSlug === solution.slug);

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
        <div className="container-page relative py-12 lg:py-20">
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
          <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
            {solution.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm opacity-90 sm:text-base">{solution.short}</p>
          <Button asChild size="lg" className="mt-6 bg-highlight text-highlight-foreground hover:bg-highlight/90">
            <a href="#tu-van">Đăng ký tư vấn</a>
          </Button>
        </div>
      </section>

      <section className="container-page py-12">
        <h2 className="text-2xl font-black">Lợi ích</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {solution.benefits.map((b) => (
            <div key={b.title} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <CheckCircle2 className="h-6 w-6 text-success" />
              <h3 className="mt-3 font-bold">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
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

      <section className="bg-secondary/60 py-12">
        <div className="container-page">
          <h2 className="text-2xl font-black">Gói giải pháp</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {solution.packages.map((pk) => (
              <div key={pk.id} className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="text-lg font-bold">{pk.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pk.desc}</p>
                <p className="mt-3 text-xl font-black text-brand">{pk.price}</p>
                <ul className="mt-3 flex-1 space-y-1.5 text-sm text-muted-foreground">
                  {pk.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> {i}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-4">
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
        <h2 className="text-2xl font-black">Quy trình triển khai</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {solution.process.map((p, i) => (
            <li key={p.step} className="rounded-xl border border-border bg-card p-4">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-brand-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-bold">{p.step}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
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
