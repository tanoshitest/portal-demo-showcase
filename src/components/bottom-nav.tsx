import { Link } from "@tanstack/react-router";
import { Home, Package, Lightbulb, Building2, User } from "lucide-react";
import { useStore } from "@/context/store";

export function BottomNav() {
  const { user } = useStore();
  const items = [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/san-pham", label: "Sản phẩm", icon: Package },
    { to: "/giai-phap", label: "Giải pháp", icon: Lightbulb },
    { to: "/cong-trinh", label: "Công trình", icon: Building2 },
    { to: user ? "/portal/tai-khoan" : "/portal", label: "Tài khoản", icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/98 backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              className="flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground"
              activeProps={{ className: "text-brand" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
