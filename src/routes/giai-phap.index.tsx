import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { solutions } from "@/data/mock";

export const Route = createFileRoute("/giai-phap/")({
  head: () => ({
    meta: [
      { title: "Giải pháp kỹ thuật điện & tự động hóa | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content:
          "Giải pháp hệ thống điện nhà xưởng, tự động hóa dây chuyền, điện mặt trời áp mái và giám sát năng lượng cho doanh nghiệp.",
      },
      { property: "og:title", content: "Giải pháp kỹ thuật – Hoàng Vĩnh VKT" },
      {
        property: "og:description",
        content: "Tư vấn theo bài toán của nhà máy: điện, tự động hóa, năng lượng.",
      },
    ],
  }),
  component: SolutionListing,
});

function SolutionListing() {
  const [keyword, setKeyword] = useState("");
  const [group, setGroup] = useState("all");
  const groups = ["all", ...new Set(solutions.map((s) => s.group))];
  const list = solutions.filter(
    (s) =>
      (group === "all" || s.group === group) &&
      s.name.toLowerCase().includes(keyword.toLowerCase()),
  );

  return (
    <div className="container-page py-6 lg:py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand">
          Trang chủ
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">Giải pháp</span>
      </nav>
      <h1 className="mt-2 text-2xl font-black sm:text-3xl">Giải pháp kỹ thuật</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Chúng tôi tư vấn theo bài toán của doanh nghiệp: an toàn điện, năng suất dây chuyền và chi
        phí năng lượng.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm giải pháp…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                group === g ? "border-brand bg-brand-soft text-brand" : "border-border hover:border-brand/50"
              }`}
            >
              {g === "all" ? "Tất cả" : g}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Không có giải pháp phù hợp với từ khóa của bạn.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <article
              key={s.slug}
              className="card-hover flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card"
            >
              <img
                src={s.image}
                alt={s.name}
                loading="lazy"
                width={1400}
                height={900}
                className="h-44 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-4">
                <span className="text-xs font-bold uppercase text-highlight-foreground">
                  {s.group}
                </span>
                <h2 className="mt-1 text-lg font-bold leading-snug">{s.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
                <ul className="mt-3 space-y-1 text-sm">
                  {s.benefits.slice(0, 2).map((b) => (
                    <li key={b.title} className="text-muted-foreground">
                      • {b.title}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-4 w-full">
                  <Link to="/giai-phap/$slug" params={{ slug: s.slug }}>
                    Xem chi tiết <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
