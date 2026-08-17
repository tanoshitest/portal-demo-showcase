import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Edit3, ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";
import { loadSolarQuotes, saveSolarQuotes, type SolarQuote } from "@/data/solar-quotes";
import { formatVnd } from "@/lib/format";

export const Route = createFileRoute("/portal/quan-ly-bao-gia")({
  head: () => ({
    meta: [
      { title: "Quản lý báo giá | Hoàng Vĩnh VKT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QuoteManagementPage,
});

function QuoteManagementPage() {
  const { user } = useStore();
  const [quotes, setQuotes] = useState<SolarQuote[]>([]);

  useEffect(() => {
    setQuotes(loadSolarQuotes());
  }, []);

  const deleteQuote = (id: string) => {
    const target = quotes.find((q) => q.id === id);
    if (!target) return;
    if (!window.confirm(`Xóa báo giá ${target.code}?`)) return;
    const next = quotes.filter((q) => q.id !== id);
    setQuotes(next);
    saveSolarQuotes(next);
    toast.success(`Đã xóa ${target.code}`);
  };

  if (!user) return <PortalGate />;
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-background px-4 py-4 lg:px-6">
      <div className="shrink-0 border-b border-border pb-4">
        <h1 className="text-2xl font-black">Quản lý báo giá</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Các báo giá được tạo từ Dự toán hoặc màn Báo giá sẽ xuất hiện ở đây.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto pt-4">
        {quotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Chưa có báo giá nào.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Hệ thống</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-semibold text-brand">{q.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{q.customer}</div>
                      <div className="text-xs text-muted-foreground">{q.phone || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[320px] truncate">{q.systemTitle || "—"}</div>
                    </TableCell>
                    <TableCell>
                      {q.status === "draft" ? (
                        <Badge variant="secondary">Nháp</Badge>
                      ) : (
                        <Badge>Đã phát hành</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatVnd(q.total)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/portal/dashboard" search={{ tab: "bao-gia", edit: q.id }}>
                            <Edit3 className="h-4 w-4" />
                            Sửa
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/portal/quan-ly-bao-gia/$id" params={{ id: q.id }}>
                            <ExternalLink className="h-4 w-4" />
                            Mở
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteQuote(q.id)}
                          aria-label={`Xóa ${q.code}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <Outlet />
    </div>
  );
}
