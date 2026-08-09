import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { projects, solutions } from "@/data/mock";

export const Route = createFileRoute("/cong-trinh/")({
  head: () => ({
    meta: [
      { title: "Công trình tiêu biểu | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content:
          "Các công trình điện, tự động hóa và điện mặt trời do Hoàng Vĩnh VKT triển khai: bài toán, giải pháp, thiết bị và kết quả thực tế.",
      },
      { property: "og:title", content: "Công trình tiêu biểu – Hoàng Vĩnh VKT" },
      {
        property: "og:description",
        content: "Case study thực tế tại nhà máy, tòa nhà và kho lạnh trên toàn quốc.",
      },
    ],
  }),
  component: ProjectListing,
});

function ProjectListing() {
  const [type, setType] = useState("all");
  const types = ["all", ...new Set(projects.map((p) => p.type))];
  const list = projects.filter((p) => type === "all" || p.type === type);

  return (
    <div className="container-page py-6 lg:py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand">
          Trang chủ
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">Công trình</span>
      </nav>
      <h1 className="mt-2 text-2xl font-black sm:text-3xl">Công trình tiêu biểu</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Mỗi công trình được trình bày theo cấu trúc: bài toán của khách hàng → giải pháp → thiết bị
        sử dụng → kết quả đo được.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              type === t ? "border-brand bg-brand-soft text-brand" : "border-border hover:border-brand/50"
            }`}
          >
            {t === "all" ? "Tất cả" : t}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => {
          const solution = solutions.find((s) => s.slug === p.solutionSlug);
          return (
            <Link
              key={p.slug}
              to="/cong-trinh/$slug"
              params={{ slug: p.slug }}
              className="card-hover group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card"
            >
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                width={1400}
                height={900}
                className="h-44 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-4">
                <span className="text-xs font-bold uppercase text-highlight-foreground">
                  {p.type} · {p.year}
                </span>
                <h2 className="mt-1 font-bold leading-snug group-hover:text-brand">{p.name}</h2>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {p.location} · {p.scale}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.problem}</p>
                {solution && (
                  <span className="mt-3 text-xs font-semibold text-brand">
                    Giải pháp: {solution.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
