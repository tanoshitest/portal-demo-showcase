import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  Phone,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { company } from "@/data/mock";
import { useStore } from "@/context/store";
import { toast } from "sonner";

const navItems = [
  { to: "/san-pham", label: "Sản phẩm" },
  { to: "/giai-phap", label: "Giải pháp" },
  { to: "/cong-trinh", label: "Công trình" },
  { to: "/lien-he", label: "Liên hệ" },
] as const;

export function SiteHeader() {
  const { cartCount, user, login, logout } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginOpen(false);
    const loadingToast = toast.loading("Đang đăng nhập...");

    // Let Radix finish unmounting its portal before authentication swaps the app shell.
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const res = await login(email, password);
    toast.dismiss(loadingToast);
    setIsLoggingIn(false);
    if (res.ok) {
      setOpen(false);
      setPassword("");
      toast.success("Đăng nhập thành công");
      navigate({ to: "/portal/dashboard" });
    } else if (res.message) {
      setLoginOpen(true);
      toast.error(res.message);
    }
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-brand/10 bg-background/95 shadow-[0_8px_30px_-26px_rgba(0,42,120,.55)] backdrop-blur-xl">
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
      <div className="container-page grid min-h-[70px] grid-cols-[32px_minmax(0,1fr)_44px] items-center gap-2 py-2 lg:flex lg:min-h-18 lg:gap-6">
        <button type="button" onClick={() => setOpen(true)} className="grid h-8 w-8 place-items-center text-[#0a2a61] lg:hidden" aria-label="Mở menu">
          <Menu className="h-5 w-5" strokeWidth={1.7} />
        </button>
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-highlight bg-brand-dark text-[10px] font-black italic text-white shadow-sm sm:h-11 sm:w-11 sm:text-[11px]">
            <span className="absolute inset-x-0 bottom-1 h-2 -rotate-12 bg-highlight/90" />
            <span className="relative">HV</span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12px] font-black uppercase leading-tight text-[#0758c9] sm:text-base">
              Hoàng Vĩnh IOT
            </span>
            <span className="block truncate text-[7px] font-semibold text-[#45577a] sm:text-xs">
              Solar · Camera · Điện máy · Vận chuyển
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

        <div className="flex shrink-0 items-center justify-end gap-1">
          <a href={`tel:${company.hotline.replace(/\s/g, "")}`} aria-label="Gọi ngay" className="flex h-11 w-11 flex-col items-center justify-center gap-0 text-[#0758c9] lg:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0758c9] text-white"><Phone className="h-4 w-4 fill-current" /></span>
            <span className="text-[7px] font-bold">Gọi ngay</span>
          </a>
          <Button asChild variant="ghost" size="icon" aria-label="Giỏ hàng" className="relative hidden sm:inline-flex lg:inline-flex">
            <Link to="/gio-hang">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-highlight px-1 text-[11px] font-bold text-highlight-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="hidden lg:inline-flex">
                <User className="h-4 w-4" /> {user ? user.roleLabel : "Đăng nhập"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {user ? (
                <>
                  <DropdownMenuItem onSelect={() => navigate({ to: "/portal/dashboard" })}>
                    <LayoutDashboard className="h-4 w-4" /> Vào Portal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="h-4 w-4" /> Đăng xuất
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onSelect={() => setLoginOpen(true)}>
                  <User className="h-4 w-4" /> Đăng nhập
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden" aria-label="Menu">
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
                {user ? (
                  <>
                    <Link
                      to="/portal/dashboard"
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-3 text-sm font-semibold hover:bg-secondary"
                    >
                      Vào Portal
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-md px-3 py-3 text-left text-sm font-semibold hover:bg-secondary"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setLoginOpen(true);
                    }}
                    className="rounded-md px-3 py-3 text-left text-sm font-semibold hover:bg-secondary"
                  >
                    Đăng nhập Portal
                  </button>
                )}
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

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Đăng nhập Portal</DialogTitle>
            <DialogDescription>Dùng tài khoản Admin hoặc Sale đã được cấp.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="portal-login-email">Email</Label>
              <Input
                id="portal-login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@hoangvinhvkt.vn"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portal-login-password">Mật khẩu</Label>
              <Input
                id="portal-login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
