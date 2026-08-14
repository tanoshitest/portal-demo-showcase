import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type PortalPath =
  | "/portal/tai-khoan"
  | "/portal/tai-lieu"
  | "/portal/dashboard"
  | "/portal/san-pham"
  | "/portal/cong-cu"
  | "/portal/cong-trinh-ql"
  | "/portal/giai-phap-ql"
  | "/portal/don-hang"
  | "/portal/lien-he-ql"
  | "/portal/nguoi-dung"
  | "/portal/danh-muc-vat-tu";

type MenuItem = {
  id: string;
  label: string;
  to: PortalPath;
  matchPrefix?: string;
};

type MenuGroup = {
  id: string;
  label: string;
  items: MenuItem[];
};

export const portalMenuGroups: MenuGroup[] = [
  {
    id: "website",
    label: "Quản lý Website",
    items: [
      { id: "account", label: "Thông tin của tôi", to: "/portal/tai-khoan" },
      { id: "products", label: "Quản lý sản phẩm", to: "/portal/san-pham" },
      { id: "projects", label: "Quản lý công trình", to: "/portal/cong-trinh-ql" },
      { id: "solutions", label: "Quản lý giải pháp", to: "/portal/giai-phap-ql" },
      { id: "orders", label: "Quản lý đơn hàng", to: "/portal/don-hang" },
      { id: "contacts", label: "Quản lý liên hệ", to: "/portal/lien-he-ql" },
      { id: "users", label: "Quản lý người dùng", to: "/portal/nguoi-dung" },
    ],
  },
  {
    id: "ops",
    label: "Quản lý vận hành",
    items: [
      { id: "docs", label: "Tài liệu hãng", to: "/portal/tai-lieu", matchPrefix: "/portal/hang/" },
      { id: "materials", label: "Danh mục vật tư", to: "/portal/danh-muc-vat-tu" },
      { id: "quotes", label: "Dự toán - Báo giá", to: "/portal/dashboard" },
      { id: "tools", label: "Công cụ tính toán", to: "/portal/cong-cu" },
    ],
  },
];

function itemActive(pathname: string, item: MenuItem) {
  if (pathname === item.to) return true;
  if (item.matchPrefix && pathname.startsWith(item.matchPrefix)) return true;
  return false;
}

function groupHasActive(pathname: string, group: MenuGroup) {
  return group.items.some((item) => itemActive(pathname, item));
}

function NavItem({
  item,
  active,
  onNavigate,
}: {
  item: MenuItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const className = cn(
    "block rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-secondary hover:text-brand",
    active && "bg-secondary text-brand",
  );

  if (item.to === "/portal/dashboard") {
    return (
      <Link to="/portal/dashboard" search={{}} onClick={onNavigate} className={className}>
        {item.label}
      </Link>
    );
  }

  return (
    <Link to={item.to} onClick={onNavigate} className={className}>
      {item.label}
    </Link>
  );
}

function NavGroup({
  group,
  pathname,
  onNavigate,
}: {
  group: MenuGroup;
  pathname: string;
  onNavigate?: () => void;
}) {
  const hasActive = groupHasActive(pathname, group);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive, pathname]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-1">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground",
            hasActive && "text-brand",
          )}
        >
          {group.label}
          <ChevronDown
            className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-200", !open && "-rotate-90")}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-2 space-y-1 border-l border-border pl-2">
          {group.items.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={itemActive(pathname, item)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function PortalNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-3 p-3" aria-label="Menu Portal">
      {portalMenuGroups.map((group) => (
        <NavGroup key={group.id} group={group} pathname={pathname} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

export function PortalSidebar() {
  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <PortalNav />
      </div>
    </aside>
  );
}

export function PortalMenuTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label="Menu Portal">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex h-full w-[min(100%,16rem)] flex-col p-0">
        <SheetTitle className="sr-only">Menu Portal</SheetTitle>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PortalNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
