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
  CONTACT_STATUSES,
  loadSiteContacts,
  updateSiteContact,
  type ContactStatus,
  type SiteContact,
} from "@/data/contacts-store";

export const Route = createFileRoute("/portal/lien-he-ql")({
  head: () => ({
    meta: [
      { title: "Quản lý liên hệ | Hoàng Vĩnh VKT" },
      { name: "description", content: "Form liên hệ khách gửi từ website." },
      { property: "og:title", content: "Quản lý liên hệ | Hoàng Vĩnh VKT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalContacts,
});

function statusClass(status: ContactStatus) {
  if (status === "Đã xử lý") return "border-success/40 text-success";
  if (status === "Mới") return "border-highlight/50 text-highlight-foreground";
  return "";
}

function PortalContacts() {
  const { user } = useStore();
  const [list, setList] = useState<SiteContact[]>([]);
  const [open, setOpen] = useState<SiteContact | null>(null);

  useEffect(() => {
    setList(loadSiteContacts());
  }, []);

  if (!user) return <PortalGate />;

  const setStatus = (item: SiteContact, status: ContactStatus) => {
    setList((prev) => updateSiteContact(prev, { ...item, status }));
    setOpen((cur) => (cur?.id === item.id ? { ...item, status } : cur));
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pt-6 lg:px-8">
      <div className="shrink-0 pb-4">
        <h1 className="text-2xl font-black sm:text-3xl">Quản lý liên hệ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Form khách gửi từ trang chủ / liên hệ ({list.length}). Demo lưu trên trình duyệt.
        </p>
      </div>

      <section className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card">
        {list.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Chưa có liên hệ.</p>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Nhu cầu</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="block font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.phone}</span>
                  </TableCell>
                  <TableCell className="max-w-[260px]">
                    <span className="block font-medium">{c.need}</span>
                    {c.content ? (
                      <span className="line-clamp-1 text-xs text-muted-foreground">{c.content}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{c.source}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusClass(c.status)}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setOpen(c)}>
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
            <SheetTitle>{open?.name}</SheetTitle>
            <SheetDescription>
              {open
                ? `${open.source} · ${new Intl.DateTimeFormat("vi-VN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(open.createdAt))}`
                : ""}
            </SheetDescription>
          </SheetHeader>
          {open ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Liên hệ</p>
                <p className="mt-1">{open.phone}</p>
                {open.email ? <p>{open.email}</p> : <p className="text-muted-foreground">Không có email</p>}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Nhu cầu</p>
                <p className="mt-1 font-medium">{open.need}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Nội dung</p>
                <p className="mt-1 whitespace-pre-wrap">{open.content || "—"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Trạng thái</p>
                <Select
                  value={open.status}
                  onValueChange={(v) => setStatus(open, v as ContactStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_STATUSES.map((s) => (
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
