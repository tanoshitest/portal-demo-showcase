import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, Ruler, CalendarDays, TrendingUp } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ConsultForm } from "@/components/consult-form";
import { Button } from "@/components/ui/button";
import { getProject, products, solutions, type Project } from "@/data/mock";

export const Route = createFileRoute("/cong-trinh/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Không tìm thấy công trình | Hoàng Vĩnh VKT" },
          { name: "robots", content: "noindex" },
        ],
      };
    const p = loaderData.project;
    return {
      meta: [
        { title: `${p.name} | Công trình Hoàng Vĩnh VKT` },
        { name: "description", content: p.problem.slice(0, 155) },
        { property: "og:title", content: p.name },
        { property: "og:description", content: p.problem.slice(0, 155) },
      ],
    };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project } = Route.useLoaderData() as { project: Project };
  const solution = solutions.find((s) => s.slug === project.solutionSlug);
  const usedProducts = products.filter((p) => project.productSlugs.includes(p.slug));

  return (
    <div className="container-page py-6 lg:py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand">
          Trang chủ
        </Link>
        <span className="mx-1">/</span>
        <Link to="/cong-trinh" className="hover:text-brand">
          Công trình
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">{project.name}</span>
      </nav>

      <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{project.name}</h1>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" /> {project.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Ruler className="h-4 w-4" /> {project.scale}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" /> Hoàn thành {project.year}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {project.gallery.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${project.name} – hình ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            width={1400}
            height={900}
            className={`w-full rounded-xl border border-border object-cover ${i === 0 ? "h-64 sm:col-span-3 sm:h-80" : "h-40"}`}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-bold text-brand">Bài toán</h2>
          <p className="mt-2 text-sm text-muted-foreground">{project.problem}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-bold text-brand">Giải pháp triển khai</h2>
          <p className="mt-2 text-sm text-muted-foreground">{project.solutionDesc}</p>
          {solution && (
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link to="/giai-phap/$slug" params={{ slug: solution.slug }}>
                Xem giải pháp {solution.name}
              </Link>
            </Button>
          )}
        </div>
        <div className="rounded-xl border border-success/30 bg-success/10 p-5">
          <h2 className="flex items-center gap-2 font-bold text-success">
            <TrendingUp className="h-5 w-5" /> Kết quả
          </h2>
          <ul className="mt-2 space-y-2 text-sm">
            {project.result.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-black sm:text-2xl">Thiết bị sử dụng</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {usedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-card lg:p-10">
        <h2 className="text-2xl font-black">Bạn có nhu cầu tương tự?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gửi thông tin để kỹ sư khảo sát hiện trạng và đề xuất phương án cho công trình của bạn.
        </p>
        <div className="mt-6">
          <ConsultForm
            source={`Công trình: ${project.name}`}
            defaultSolution={solution?.name}
          />
        </div>
      </section>
    </div>
  );
}
