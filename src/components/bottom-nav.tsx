import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Home, Lightbulb, LoaderCircle, Package, User } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/context/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const publicItems = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/san-pham", label: "Sản phẩm", icon: Package },
  { to: "/giai-phap", label: "Giải pháp", icon: Lightbulb },
  { to: "/cong-trinh", label: "Công trình", icon: Building2 },
] as const;

export function BottomNav() {
  const { user, login } = useStore();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    const result = await login(email, password);
    setIsLoggingIn(false);
    if (!result.ok) {
      toast.error(result.message ?? "Không thể đăng nhập Portal");
      return;
    }
    setLoginOpen(false);
    setPassword("");
    toast.success("Đăng nhập thành công");
    navigate({ to: "/portal/dashboard" });
  };

  const itemClass = "flex w-full flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground";

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/98 backdrop-blur lg:hidden">
        <ul className="grid grid-cols-5">
          {publicItems.map((item) => (
            <li key={item.label}>
              <Link to={item.to} className={itemClass} activeProps={{ className: "text-brand" }} activeOptions={{ exact: item.to === "/" }}>
                <item.icon className="h-5 w-5" />{item.label}
              </Link>
            </li>
          ))}
          <li>
            {user ? (
              <Link to="/portal/tai-khoan" className={itemClass}><User className="h-5 w-5" />Tài khoản</Link>
            ) : (
              <button type="button" className={itemClass} onClick={() => setLoginOpen(true)}><User className="h-5 w-5" />Tài khoản</button>
            )}
          </li>
        </ul>
      </nav>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl">
          <DialogHeader className="text-left">
            <DialogTitle>Đăng nhập Portal</DialogTitle>
            <DialogDescription>Dùng tài khoản Admin hoặc Sale đã được cấp.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2"><Label htmlFor="mobile-portal-email">Email</Label><Input id="mobile-portal-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@hoangvinhvkt.vn" required /></div>
            <div className="space-y-2"><Label htmlFor="mobile-portal-password">Mật khẩu</Label><Input id="mobile-portal-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
            <Button type="submit" className="h-11 w-full" disabled={isLoggingIn}>{isLoggingIn && <LoaderCircle className="h-4 w-4 animate-spin" />}Đăng nhập</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
