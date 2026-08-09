import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingCart, User, Phone, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { company } from "@/data/mock";
import { useStore } from "@/context/store";

const navItems = [
  { to: "/san-pham", label: "Sản phẩm" },
  { to: "/giai-phap", label: "Giải pháp" },
  { to: "/cong-trinh", label: "Công trình" },
  { to: "/lien-he", label: "Liên hệ" },
] as const;

export function SiteHeader() {
  const { cartCount, user } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="hidden bg-brand-dark text-brand-foreground lg:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <span>{company.slogan}</span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Hotline: {company.hotline}
            </span>
            <span>{company.workingHours}</span>
          </span>
        </div>
      </div>
      <div className="container-page grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 lg:flex lg:gap-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-brand text-sm font-black text-brand-foreground">
            HV
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black uppercase leading-tight text-brand-dark sm:text-base">
              Hoàng Vĩnh VKT
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Thiết bị · Giải pháp · Công trình
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary hover:text-brand"
              activeProps={{ className: "bg-secondary text-brand" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden max-w-xs flex-1 lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tìm thiết bị, giải pháp…" className="pl-9" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
            <Link to="/portal">
              <LockKeyhole className="h-4 w-4" /> Portal
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Giỏ hàng" className="relative">
            <Link to="/gio-hang">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-highlight px-1 text-[11px] font-bold text-highlight-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden lg:inline-flex">
            <Link to={user ? "/portal/tai-khoan" : "/portal"}>
              <User className="h-4 w-4" /> {user ? "Tài khoản" : "Đăng nhập"}
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetTitle className="text-left text-base">Danh mục</SheetTitle>
              <div className="mt-2 flex flex-col gap-1 px-4 pb-6">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-sm font-semibold hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/portal"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-semibold hover:bg-secondary"
                >
                  Portal tài liệu
                </Link>
                <Button asChild className="mt-3">
                  <a href={`tel:${company.hotline.replace(/\s/g, "")}`}>
                    <Phone className="h-4 w-4" /> Gọi {company.hotline}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
