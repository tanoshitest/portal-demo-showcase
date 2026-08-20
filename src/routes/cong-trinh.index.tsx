import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Camera, ChevronDown, Cpu, MapPin, SlidersHorizontal, SunMedium, Wifi, Zap } from "lucide-react";
import { projects, solutions, images } from "@/data/mock";

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
    <div className="min-w-0 overflow-x-hidden pb-12">
      <MobileProjects type={type} setType={setType} types={types} list={list} />
      <section className="relative hidden overflow-hidden bg-brand-dark text-white md:block">
        <img src={images.project1} alt="Công trình thực tế" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05285f] via-[#063b86]/80 to-transparent" />
        <div className="container-page relative py-7 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-highlight">Dự án đã bàn giao</p>
          <h1 className="mt-2 text-[23px] font-black uppercase sm:text-5xl">Công trình thực tế</h1>
          <p className="mt-2 max-w-lg text-sm text-white/80">Những dự án Hoàng Vĩnh IOT đã khảo sát, thi công và đồng hành vận hành.</p>
        </div>
      </section>
      <div className="container-page hidden pt-6 md:block lg:pt-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand">
          Trang chủ
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">Công trình</span>
      </nav>
      <h2 className="mt-2 text-2xl font-black sm:text-3xl">Công trình tiêu biểu</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Mỗi công trình được trình bày theo cấu trúc: bài toán của khách hàng → giải pháp → thiết bị
        sử dụng → kết quả đo được.
      </p>

      <div className="hide-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1 sm:mt-6 sm:flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`shrink-0 rounded-lg border px-3 py-2 text-[9px] font-medium transition-colors sm:rounded-full sm:py-1.5 sm:text-sm ${
              type === t ? "border-brand bg-brand-soft text-brand" : "border-border hover:border-brand/50"
            }`}
          >
            {t === "all" ? "Tất cả" : t}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2.5 lg:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => {
          const solution = solutions.find((s) => s.slug === p.solutionSlug);
          return (
            <Link
              key={p.slug}
              to="/cong-trinh/$slug"
              params={{ slug: p.slug }}
              className="card-hover group flex min-h-[125px] flex-row overflow-hidden rounded-[10px] border border-brand/10 bg-card shadow-card xl:flex-col"
            >
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                width={1400}
                height={900}
                className="h-auto w-[42%] object-cover xl:h-48 xl:w-full"
              />
              <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
                <span className="text-xs font-bold uppercase text-highlight-foreground">
                  {p.type} · {p.year}
                </span>
                <h2 className="mt-1 line-clamp-2 text-[11px] font-bold leading-snug group-hover:text-brand sm:text-base">{p.name}</h2>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {p.location} · {p.scale}
                </p>
                <p className="mt-2 hidden line-clamp-2 text-sm text-muted-foreground sm:block">{p.problem}</p>
                {solution && (
                  <span className="mt-3 text-xs font-semibold text-brand">
                    Giải pháp: {solution.name}
                  </span>
                )}
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand">
                  Xem chi tiết <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      </div>
    </div>
  );
}

const projectIcons = [Cpu, SunMedium, Camera, Wifi, Zap];

function MobileProjects({ type, setType, types, list }: {
  type: string;
  setType: (value: string) => void;
  types: string[];
  list: typeof projects;
}) {
  return (
    <div className="min-w-0 overflow-x-hidden bg-[#f8fafc] pb-5 md:hidden">
      <section className="relative overflow-hidden bg-[#063b86] px-4 py-5 text-white">
        <img src={images.project1} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#063b86] via-[#0758c9]/90 to-transparent" />
        <div className="relative max-w-[62%]"><h1 className="text-[17px] font-black uppercase">Công trình thực tế</h1><p className="mt-1 text-[8px] leading-relaxed text-white/90">Những dự án mà Hoàng Vĩnh IOT đã thi công và bàn giao</p></div>
      </section>

      <div className="relative z-10 -mt-1 bg-white px-3 pt-2">
        <div className="hide-scrollbar flex overflow-x-auto rounded-xl border bg-white px-1 shadow-sm">
          {types.slice(0, 5).map((item, index) => { const Icon=projectIcons[index]??Cpu; const active=type===item; return <button key={item} onClick={()=>setType(item)} className={`flex w-[68px] shrink-0 flex-col items-center border-b-2 py-2 ${active?"border-[#0758c9] text-[#0758c9]":"border-transparent text-[#53647f]"}`}><Icon className="h-4 w-4"/><span className="mt-1 line-clamp-2 text-[7px] font-semibold leading-tight">{item==="all"?"Tất cả":item}</span></button>; })}
        </div>
      </div>

      <div className="px-3 pt-3">
        <div className="flex gap-2"><button className="flex h-9 flex-1 items-center justify-between rounded-lg border bg-white px-3 text-[9px]"><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/>Tất cả khu vực</span><ChevronDown className="h-3 w-3"/></button><button className="flex h-9 flex-1 items-center justify-between rounded-lg border bg-white px-3 text-[9px]"><span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5"/>Mới nhất</span><ChevronDown className="h-3 w-3"/></button><button className="grid h-9 w-9 place-items-center rounded-lg border bg-white"><SlidersHorizontal className="h-3.5 w-3.5"/></button></div>

        <div className="mt-3 space-y-2">
          {list.map((project, index) => <Link key={project.slug} to="/cong-trinh/$slug" params={{slug:project.slug}} className="flex min-h-[112px] overflow-hidden rounded-[9px] border border-[#e1e7ef] bg-white shadow-[0_2px_8px_rgba(16,52,100,.05)]"><div className="relative w-[39%] shrink-0"><img src={project.image} alt={project.name} className="h-full w-full object-cover"/><span className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[6px] font-bold text-white ${index%3===0?"bg-[#18a85b]":index%3===1?"bg-[#0758c9]":"bg-[#8b3fd6]"}`}>{project.type}</span></div><div className="flex min-w-0 flex-1 flex-col p-2"><h2 className="line-clamp-2 text-[10px] font-black leading-snug text-[#071c4c]">{project.name}</h2><div className="mt-1 space-y-0.5 text-[7px] text-[#53647f]"><p className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5"/>{project.location}</p><p className="flex items-center gap-1"><Zap className="h-2.5 w-2.5"/>{project.scale}</p><p className="flex items-center gap-1"><CalendarDays className="h-2.5 w-2.5"/>Hoàn thành: {project.year}</p></div><span className="ml-auto mt-auto rounded border border-[#0758c9] px-2 py-1 text-[7px] font-bold text-[#0758c9]">Xem chi tiết ›</span></div></Link>)}
        </div>
        <button className="mt-3 h-9 w-full rounded border bg-white text-[8px] font-bold text-[#0758c9]">Xem thêm công trình <ChevronDown className="ml-1 inline h-3 w-3" /></button>
      </div>
    </div>
  );
}
