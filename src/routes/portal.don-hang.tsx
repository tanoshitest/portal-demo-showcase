import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  loadSiteOrders,
  ORDER_STATUSES,
  PAYMENT_LABEL,
  SHIPPING_LABEL,
  updateSiteOrder,
  type OrderStatus,
  type SiteOrder,
} from "@/data/orders-store";
import { formatVnd } from "@/lib/format";

export const Route = createFileRoute("/portal/don-hang")({
  head: () => ({
    meta: [
      { title: "Quản lý đơn hàng | Hoàng Vĩnh VKT" },
      { name: "description", content: "Đơn hàng khách đặt trên website." },
      { property: "og:title", content: "Quản lý đơn hàng | Hoàng Vĩnh VKT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalOrders,
});

function statusClass(status: OrderStatus) {
  if (status === "Hoàn tất") return "border-success/40 text-success";
  if (status === "Đã hủy") return "border-destructive/40 text-destructive";
  if (status === "Mới") return "border-highlight/50 text-highlight-foreground";
  return "";
}

function PortalOrders() {
  const { user } = useStore();
  const [list, setList] = useState<SiteOrder[]>([]);
  const [open, setOpen] = useState<SiteOrder | null>(null);

  useEffect(() => {
    setList(loadSiteOrders());
  }, []);

  if (!user) return <PortalGate />;

  const setStatus = (order: SiteOrder, status: OrderStatus) => {
    setList((prev) => updateSiteOrder(prev, { ...order, status }));
    setOpen((cur) => (cur?.id === order.id ? { ...order, status } : cur));
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pt-6 lg:px-8">
      <div className="shrink-0 pb-4">
        <h1 className="text-2xl font-black sm:text-3xl">Quản lý đơn hàng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Đơn khách đặt trên website ({list.length}). Demo lưu trên trình duyệt.
        </p>
      </div>

      <section className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card">
        {list.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Chưa có đơn hàng.</p>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-semibold text-brand">{o.code}</TableCell>
                  <TableCell>
                    <span className="block font-medium">{o.name}</span>
                    <span className="text-xs text-muted-foreground">{o.phone}</span>
                  </TableCell>
                  <TableCell className="max-w-[240px] text-muted-foreground">
                    <span className="line-clamp-2">
                      {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatVnd(o.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusClass(o.status)}>
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setOpen(o)}>
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <SheetHeader className="space-y-1 border-b border-border px-6 py-4 pr-12 text-left">
            <SheetTitle>{open?.code}</SheetTitle>
            <SheetDescription>
              {open
                ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
                    new Date(open.createdAt),
                  )
                : ""}
            </SheetDescription>
          </SheetHeader>
          {open ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Khách hàng</p>
                <p className="mt-1 font-medium">{open.name}</p>
                <p className="text-muted-foreground">{open.phone}</p>
                {open.email ? <p className="text-muted-foreground">{open.email}</p> : null}
                <p className="mt-1">{open.address}</p>
                {open.note ? <p className="mt-1 text-muted-foreground">Ghi chú: {open.note}</p> : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Giao hàng / thanh toán</p>
                <p className="mt-1">{SHIPPING_LABEL[open.shipping] ?? open.shipping}</p>
                <p>{PAYMENT_LABEL[open.payment] ?? open.payment}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Sản phẩm</p>
                <ul className="mt-2 space-y-2">
                  {open.items.map((i) => (
                    <li key={i.sku} className="flex justify-between gap-3">
                      <span>
                        <span className="block font-medium">{i.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {i.variantName} × {i.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold">{formatVnd(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between border-t border-border pt-2 font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-brand">{formatVnd(open.total)}</span>
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Trạng thái</p>
                <Select
                  value={open.status}
                  onValueChange={(v) => setStatus(open, v as OrderStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
