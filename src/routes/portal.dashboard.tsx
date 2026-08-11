import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Building2, ShieldCheck, LogOut, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/context/store";
import { brands, documents } from "@/data/mock";

export const Route = createFileRoute("/portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Portal – Tổng quan tài liệu | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content: "Tổng quan các hãng và tài liệu kỹ thuật bạn được cấp quyền truy cập.",
      },
      { property: "og:title", content: "Portal – Tổng quan | Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Khu vực tài liệu hãng dành cho tài khoản được cấp quyền." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalDashboard,
});

function PortalDashboard() {
  const { user, logout } = useStore();

  if (!user) return <PortalGate />;

  const allowedBrands = brands.filter(
    (b) => user.brandSlugs === "all" || user.brandSlugs.includes(b.slug),
  );
  const allowedDocs = documents.filter(
    (d) =>
      d.roles.includes(user.role) &&
      (user.brandSlugs === "all" || user.brandSlugs.includes(d.brandSlug)),
  );

  return (
    <div className="container-page py-6 lg:py-10">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-sm font-black text-brand-foreground">
            {user.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black sm:text-2xl">Xin chào, {user.name}</h1>
            <p className="truncate text-sm text-muted-foreground">
              {user.roleLabel} · {user.company}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/portal/solar">Báo giá điện mặt trời</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/portal/tai-khoan">Tài khoản</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" /> Đăng xuất
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Building2, label: "Hãng được cấp quyền", value: allowedBrands.length },
          { icon: FileText, label: "Tài liệu truy cập được", value: allowedDocs.length },
          { icon: ShieldCheck, label: "Vai trò", value: user.roleLabel },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <s.icon className="h-5 w-5 text-brand" />
            <p className="mt-3 text-xl font-black">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-bold">Danh sách hãng</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allowedBrands.map((b) => {
          const count = allowedDocs.filter((d) => d.brandSlug === b.slug).length;
          return (
            <Link
              key={b.slug}
              to="/portal/hang/$slug"
              params={{ slug: b.slug }}
              className="card-hover rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{b.name}</h3>
                <Badge variant="outline">{count} tài liệu</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{b.country}</p>
              <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
            </Link>
          );
        })}
      </div>

      <h2 className="mt-8 text-lg font-bold">Tài liệu cập nhật mới nhất</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {allowedDocs.slice(0, 6).map((d, i) => (
          <div
            key={d.id}
            className={`flex flex-wrap items-center gap-3 px-4 py-3 text-sm ${i % 2 ? "bg-secondary/40" : ""}`}
          >
            <FileText className="h-4 w-4 shrink-0 text-brand" />
            <span className="min-w-0 flex-1 font-medium">{d.name}</span>
            <span className="text-xs text-muted-foreground">
              {d.type} · {d.version} · {d.updatedAt}
            </span>
            <Link
              to="/portal/hang/$slug"
              params={{ slug: d.brandSlug }}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Xem
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortalGate() {
  return (
    <div className="container-page py-16 text-center">
      <LockKeyhole className="mx-auto h-12 w-12 text-muted-foreground" />
      <h1 className="mt-4 text-xl font-bold">Bạn cần đăng nhập để xem tài liệu Portal</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Khu vực này chỉ dành cho tài khoản đại lý, kỹ thuật viên hoặc quản trị được cấp quyền.
      </p>
      <Button asChild className="mt-6">
        <Link to="/portal">Đăng nhập Portal</Link>
      </Button>
    </div>
  );
}
