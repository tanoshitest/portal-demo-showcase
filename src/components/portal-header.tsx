import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PortalMenuTrigger } from "@/components/portal-sidebar";
import { useStore } from "@/context/store";

export function PortalHeader() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
      <div className="flex min-w-0 items-center gap-2">
        <PortalMenuTrigger />
        <Link
          to="/portal/dashboard"
          search={{}}
          className="hidden min-w-0 items-center gap-2 lg:flex"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-brand text-xs font-black text-brand-foreground">
            HV
          </span>
          <span className="min-w-0 truncate text-sm font-black uppercase leading-tight text-brand-dark">
            Hoàng Vĩnh VKT
          </span>
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <p className="hidden max-w-none truncate text-sm text-muted-foreground lg:block">
          <span className="font-medium text-foreground">{user.name}</span>
          {user.roleLabel ? <span> · {user.roleLabel}</span> : null}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            toast.success("Đã đăng xuất");
            navigate({ to: "/" });
          }}
        >
          <LogOut className="h-4 w-4" /> Đăng xuất
        </Button>
      </div>
    </header>
  );
}
