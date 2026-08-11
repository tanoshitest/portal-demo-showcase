import { Link } from "@tanstack/react-router";
import { LockKeyhole, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/context/store";

const tabs = [
  { to: "/portal/solar", label: "Tổng quan", exact: true },
  { to: "/portal/solar/bao-gia-moi", label: "Tạo báo giá" },
  { to: "/portal/solar/cau-hinh", label: "Cấu hình & Giá vốn", adminOnly: true },
] as const;

export const springIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 260, damping: 24 },
};

export function SolarShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { user } = useStore();

  if (!user) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <LockKeyhole className="mx-auto h-8 w-8 text-brand" />
          <h1 className="mt-4 text-xl font-black">Khu vực nội bộ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vui lòng đăng nhập Portal để sử dụng công cụ báo giá điện mặt trời.
          </p>
          <Button asChild className="mt-6">
            <Link to="/portal">Đăng nhập Portal</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="container-page py-6 lg:py-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand text-brand-foreground">
            <Sun className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-black leading-tight sm:text-2xl">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-brand/40 text-brand">
            {user.roleLabel}
          </Badge>
          {actions}
        </div>
      </div>

      <nav className="mt-5 flex flex-wrap gap-1 rounded-xl border border-border bg-secondary/60 p-1">
        {tabs
          .filter((t) => !("adminOnly" in t && t.adminOnly) || isAdmin)
          .map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: "exact" in t ? t.exact : false }}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand"
              activeProps={{ className: "bg-card text-brand shadow-card" }}
            >
              {t.label}
            </Link>
          ))}
      </nav>

      <motion.div {...springIn} className="mt-6">
        {children}
      </motion.div>
    </div>
  );
}

export function AdminOnly({ children }: { children: ReactNode }) {
  const { user } = useStore();
  if (user && user.role !== "admin") {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <LockKeyhole className="mx-auto h-6 w-6 text-highlight" />
        <p className="mt-3 text-sm font-semibold">Chỉ tài khoản Quản trị (Admin) mới xem được mục này.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Bạn vẫn có thể tạo báo giá cho khách hàng ở tab “Tạo báo giá”.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
