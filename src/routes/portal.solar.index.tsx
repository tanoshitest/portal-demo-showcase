import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileText, Plus, Sun, TrendingUp, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SolarShell } from "@/components/solar/solar-shell";
import { useSolar } from "@/context/solar-store";
import { formatVnd } from "@/lib/format";
import { scenarioLabel } from "@/data/solar";

export const Route = createFileRoute("/portal/solar/")({
  head: () => ({
    meta: [
      { title: "Báo giá điện mặt trời – Tổng quan | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content: "Công cụ tính toán, mô phỏng và báo giá hệ thống điện mặt trời EPC.",
      },
      { property: "og:title", content: "Báo giá điện mặt trời | Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Mô phỏng sản lượng, ROI và xuất báo giá trọn gói." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SolarHome,
});

function SolarHome() {
  const { quotes, products, removeQuote } = useSolar();
  const totalValue = quotes.reduce((s, q) => s + q.total, 0);

  return (
    <SolarShell
      title="Báo giá & Mô phỏng điện mặt trời"
      description="Tính ngược tiền điện EVN, mô phỏng công suất, so sánh hoàn vốn và xuất báo giá trọn gói."
      actions={
        <Button asChild size="sm">
          <Link to="/portal/solar/bao-gia-moi">
            <Plus className="h-4 w-4" /> Tạo báo giá
          </Link>
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: FileText, label: "Báo giá đã lưu", value: String(quotes.length) },
          { icon: TrendingUp, label: "Tổng giá trị báo giá", value: formatVnd(totalValue) },
          { icon: Sun, label: "Vật tư trong danh mục", value: String(products.length) },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22, delay: i * 0.06 }}
            className="rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <s.icon className="h-5 w-5 text-brand" />
            <p className="mt-3 text-lg font-black">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-bold">Danh sách báo giá</h2>
      {quotes.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Chưa có báo giá nào. Bắt đầu bằng cách nhập tiền điện hằng tháng của khách hàng.
          </p>
          <Button asChild className="mt-4">
            <Link to="/portal/solar/bao-gia-moi">
              <Plus className="h-4 w-4" /> Tạo báo giá đầu tiên
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-sm">
              <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Mã báo giá</th>
                  <th className="px-4 py-3 text-left">Khách hàng</th>
                  <th className="px-4 py-3 text-left">Phương án</th>
                  <th className="px-4 py-3 text-right">Công suất</th>
                  <th className="px-4 py-3 text-right">Tổng tiền (gồm VAT)</th>
                  <th className="px-4 py-3 text-right">Hoàn vốn</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-4 py-3 font-semibold text-brand">{q.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{q.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{q.customer.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{scenarioLabel[q.scenario]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">{q.systemKwp} kWp</td>
                    <td className="px-4 py-3 text-right font-bold">{formatVnd(q.total)}</td>
                    <td className="px-4 py-3 text-right">{q.roiYears} năm</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/portal/solar/bao-gia/$id" params={{ id: q.id }}>
                            <Printer className="h-4 w-4" /> Xuất PDF
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="Xoá báo giá"
                          onClick={() => removeQuote(q.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SolarShell>
  );
}
