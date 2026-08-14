import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminOnly, SolarShell } from "@/components/solar/solar-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSolar } from "@/context/solar-store";
import { formatVnd } from "@/lib/format";
import { categoryLabel, type SolarCategory } from "@/data/solar";

export const Route = createFileRoute("/portal/solar/cau-hinh")({
  head: () => ({
    meta: [
      { title: "Cấu hình vật tư & giá vốn | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content: "Quản lý danh mục vật tư điện mặt trời, bậc thang giá điện EVN và quy tắc lợi nhuận.",
      },
      { property: "og:title", content: "Cấu hình vật tư & giá vốn" },
      { property: "og:description", content: "Bảng dữ liệu chỉnh sửa nhanh giá vốn và lợi nhuận." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SolarConfigPage,
});

const cellInput = "h-9 w-full min-w-[110px] text-right";

function SolarConfigPage() {
  return (
    <SolarShell
      title="Cấu hình vật tư, giá điện & lợi nhuận"
      description="Chỉnh sửa trực tiếp trên bảng — thay đổi được áp dụng ngay cho mọi báo giá mới."
    >
      <AdminOnly>
        <ConfigTabs />
      </AdminOnly>
    </SolarShell>
  );
}

function ConfigTabs() {
  const { resetConfig } = useSolar();
  return (
    <Tabs defaultValue="products">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="products">Vật tư – Sản phẩm</TabsTrigger>
          <TabsTrigger value="tariffs">Bậc giá điện EVN</TabsTrigger>
          <TabsTrigger value="rules">Quy tắc lợi nhuận</TabsTrigger>
        </TabsList>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetConfig();
            toast.success("Đã phục hồi cấu hình mặc định");
          }}
        >
          <RotateCcw className="h-4 w-4" /> Phục hồi mặc định
        </Button>
      </div>

      <TabsContent value="products" className="mt-4">
        <ProductGrid />
      </TabsContent>
      <TabsContent value="tariffs" className="mt-4">
        <TariffGrid />
      </TabsContent>
      <TabsContent value="rules" className="mt-4">
        <RuleGrid />
      </TabsContent>
    </Tabs>
  );
}

function GridShell({ children, minWidth = 980 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  );
}

function ProductGrid() {
  const { products, updateProduct, addProduct, removeProduct } = useSolar();
  const [filter, setFilter] = useState<"all" | SolarCategory>("all");
  const list = products.filter((p) => filter === "all" || p.category === filter);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {(Object.keys(categoryLabel) as SolarCategory[]).map((c) => (
              <SelectItem key={c} value={c}>
                {categoryLabel[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={() => {
            const id = `p-new-${Date.now()}`;
            addProduct({
              id,
              sku: "SKU-MOI",
              name: "Vật tư mới",
              category: filter === "all" ? "accessory" : filter,
              unit: "bộ",
              costPrice: 0,
              specs: {},
              warrantyInfo: "Bảo hành 12 tháng.",
              image:
                "https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=800&q=70",
            });
            toast.success("Đã thêm dòng vật tư mới");
          }}
        >
          <Plus className="h-4 w-4" /> Thêm vật tư
        </Button>
        <span className="text-xs text-muted-foreground">{list.length} dòng</span>
      </div>

      <GridShell>
        <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-3 text-left">Mã (SKU)</th>
            <th className="px-3 py-3 text-left">Tên vật tư</th>
            <th className="px-3 py-3 text-left">Danh mục</th>
            <th className="px-3 py-3 text-left">Đơn vị</th>
            <th className="px-3 py-3 text-right">Giá vốn (VNĐ)</th>
            <th className="px-3 py-3 text-left">Bảo hành</th>
            <th className="px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id} className="border-t border-border align-middle hover:bg-secondary/40">
              <td className="px-3 py-2">
                <Input
                  className="h-9 w-[130px]"
                  value={p.sku}
                  onChange={(e) => updateProduct(p.id, { sku: e.target.value })}
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  className="h-9 min-w-[240px]"
                  value={p.name}
                  onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                />
              </td>
              <td className="px-3 py-2">
                <Select
                  value={p.category}
                  onValueChange={(v) => updateProduct(p.id, { category: v as SolarCategory })}
                >
                  <SelectTrigger className="h-9 w-[170px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(categoryLabel) as SolarCategory[]).map((c) => (
                      <SelectItem key={c} value={c}>
                        {categoryLabel[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-3 py-2">
                <Input
                  className="h-9 w-[90px]"
                  value={p.unit}
                  onChange={(e) => updateProduct(p.id, { unit: e.target.value })}
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  type="number"
                  className={cellInput}
                  value={p.costPrice}
                  onChange={(e) => updateProduct(p.id, { costPrice: Number(e.target.value) || 0 })}
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {formatVnd(p.costPrice)}
                </p>
              </td>
              <td className="px-3 py-2">
                <Input
                  className="h-9 min-w-[220px]"
                  value={p.warrantyInfo}
                  onChange={(e) => updateProduct(p.id, { warrantyInfo: e.target.value })}
                />
              </td>
              <td className="px-3 py-2 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Xoá vật tư"
                  onClick={() => removeProduct(p.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </GridShell>
    </div>
  );
}

function TariffGrid() {
  const { tariffs, updateTariff } = useSolar();
  return (
    <GridShell minWidth={640}>
      <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
        <tr>
          <th className="px-3 py-3 text-left">Bậc</th>
          <th className="px-3 py-3 text-left">Diễn giải</th>
          <th className="px-3 py-3 text-right">Số kWh trong bậc</th>
          <th className="px-3 py-3 text-right">Đơn giá (VNĐ/kWh)</th>
        </tr>
      </thead>
      <tbody>
        {tariffs.map((t) => (
          <tr key={t.tier} className="border-t border-border hover:bg-secondary/40">
            <td className="px-3 py-2">
              <Badge variant="outline">Bậc {t.tier}</Badge>
            </td>
            <td className="px-3 py-2">
              <Input
                className="h-9 min-w-[220px]"
                value={t.label}
                onChange={(e) => updateTariff(t.tier, { label: e.target.value })}
              />
            </td>
            <td className="px-3 py-2">
              {t.limitKwh === null ? (
                <span className="block text-right text-sm text-muted-foreground">Không giới hạn</span>
              ) : (
                <Input
                  type="number"
                  className={cellInput}
                  value={t.limitKwh}
                  onChange={(e) => updateTariff(t.tier, { limitKwh: Number(e.target.value) || 0 })}
                />
              )}
            </td>
            <td className="px-3 py-2">
              <Input
                type="number"
                className={cellInput}
                value={t.pricePerKwh}
                onChange={(e) => updateTariff(t.tier, { pricePerKwh: Number(e.target.value) || 0 })}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </GridShell>
  );
}

function RuleGrid() {
  const { rules, updateRule, addRule, removeRule } = useSolar();
  return (
    <div className="space-y-3">
      <Button
        size="sm"
        onClick={() => {
          addRule({
            id: `r-new-${Date.now()}`,
            category: "accessory",
            minQty: 1,
            maxQty: null,
            profitAmount: 0,
          });
          toast.success("Đã thêm quy tắc lợi nhuận");
        }}
      >
        <Plus className="h-4 w-4" /> Thêm quy tắc
      </Button>
      <GridShell minWidth={760}>
        <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-3 text-left">Danh mục</th>
            <th className="px-3 py-3 text-right">SL từ</th>
            <th className="px-3 py-3 text-right">SL đến</th>
            <th className="px-3 py-3 text-right">Lợi nhuận / đơn vị</th>
            <th className="px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} className="border-t border-border hover:bg-secondary/40">
              <td className="px-3 py-2">
                <Select
                  value={r.category}
                  onValueChange={(v) => updateRule(r.id, { category: v as SolarCategory })}
                >
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(categoryLabel) as SolarCategory[]).map((c) => (
                      <SelectItem key={c} value={c}>
                        {categoryLabel[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-3 py-2">
                <Input
                  type="number"
                  className={cellInput}
                  value={r.minQty}
                  onChange={(e) => updateRule(r.id, { minQty: Number(e.target.value) || 1 })}
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  type="number"
                  placeholder="Không giới hạn"
                  className={cellInput}
                  value={r.maxQty ?? ""}
                  onChange={(e) =>
                    updateRule(r.id, {
                      maxQty: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  type="number"
                  className={cellInput}
                  value={r.profitAmount}
                  onChange={(e) => updateRule(r.id, { profitAmount: Number(e.target.value) || 0 })}
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {formatVnd(r.profitAmount)}
                </p>
              </td>
              <td className="px-3 py-2 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Xoá quy tắc"
                  onClick={() => removeRule(r.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </GridShell>
    </div>
  );
}
