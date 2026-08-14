import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";
import { materialCategories, type Material } from "@/data/materials";
import { loadAdminMaterials, upsertAdminMaterial } from "@/data/materials-store";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/portal/danh-muc-vat-tu")({
  head: () => ({
    meta: [
      { title: "Danh mục vật tư | Hoàng Vĩnh VKT" },
      { name: "description", content: "Danh mục vật tư trên Portal dành cho Admin và Sale." },
      { property: "og:title", content: "Danh mục vật tư | Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Danh mục vật tư trên Portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalMaterials,
});

type FormState = {
  id: string;
  categoryId: string;
  name: string;
  size: string;
  description: string;
  unit: string;
  warranty: string;
  costPrice: string;
  retailPrice: string;
  stock: string;
  note: string;
};

function newId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function blankForm(): FormState {
  return {
    id: newId(),
    categoryId: materialCategories[0]?.id ?? "tam-pin",
    name: "",
    size: "",
    description: "",
    unit: "cái",
    warranty: "12 tháng",
    costPrice: "",
    retailPrice: "",
    stock: "0",
    note: "",
  };
}

function fromMaterial(item: Material): FormState {
  return {
    id: item.id,
    categoryId: item.categoryId,
    name: item.name,
    size: item.size,
    description: item.description,
    unit: item.unit,
    warranty: item.warranty,
    costPrice: String(item.costPrice),
    retailPrice: String(item.retailPrice),
    stock: String(item.stock),
    note: item.note,
  };
}

function toMaterial(form: FormState): Material | string {
  if (!form.categoryId) return "Chọn danh mục vật tư.";
  if (!form.name.trim()) return "Nhập tên sản phẩm.";
  const costPrice = Number(form.costPrice);
  if (!Number.isFinite(costPrice) || costPrice < 0) return "Giá nhập không hợp lệ.";
  const retailPrice = Number(form.retailPrice);
  if (!Number.isFinite(retailPrice) || retailPrice < 0) return "Giá bán lẻ không hợp lệ.";
  const stock = Number(form.stock);
  if (!Number.isFinite(stock) || stock < 0) return "Tồn kho không hợp lệ.";

  return {
    id: form.id,
    categoryId: form.categoryId,
    name: form.name.trim(),
    size: form.size.trim(),
    description: form.description.trim(),
    unit: form.unit.trim() || "cái",
    warranty: form.warranty.trim(),
    costPrice: Math.round(costPrice),
    retailPrice: Math.round(retailPrice),
    stock: Math.round(stock),
    note: form.note.trim(),
  };
}

function profitOf(item: Material) {
  return item.retailPrice - item.costPrice;
}

const TABLE_COL_COUNT = 12;

function groupByCategory(list: Material[]) {
  const byCat = new Map<string, Material[]>();
  for (const item of list) {
    const next = byCat.get(item.categoryId) ?? [];
    next.push(item);
    byCat.set(item.categoryId, next);
  }

  const known = new Set(materialCategories.map((c) => c.id));
  const groups = materialCategories
    .map((cat) => ({ id: cat.id, name: cat.name, items: byCat.get(cat.id) ?? [] }))
    .filter((g) => g.items.length > 0);

  for (const [id, items] of byCat) {
    if (known.has(id) || !items.length) continue;
    groups.push({ id, name: id, items });
  }
  return groups.map((g, i) => ({ ...g, index: i + 1 }));
}

function ClipText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [open, setOpen] = useState(false);
  const display = text.trim() ? text : "—";
  const empty = !text.trim();
  const canOpen = overflows && !empty;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <Popover open={canOpen ? open : false} onOpenChange={(next) => canOpen && setOpen(next)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          ref={ref}
          className={cn(
            "block w-full min-w-0 truncate text-left text-xs leading-5",
            canOpen ? "cursor-pointer hover:text-brand" : "cursor-default",
            empty && "text-muted-foreground",
            className,
          )}
        >
          {display}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 max-w-[min(20rem,calc(100vw-2rem))] p-3 text-xs leading-relaxed"
      >
        {text}
      </PopoverContent>
    </Popover>
  );
}

function StockQtyInput({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (qty: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const n = Math.round(Number(draft));
    if (!Number.isFinite(n) || n < 0) {
      setDraft(String(value));
      return;
    }
    setDraft(String(n));
    if (n !== value) onCommit(n);
  };

  return (
    <Input
      type="number"
      min={0}
      step={1}
      className="h-6 w-14 px-1.5 text-center font-mono text-xs tabular-nums"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      aria-label="Đang tồn kho"
    />
  );
}

function PortalMaterials() {
  const { user } = useStore();
  const [list, setList] = useState<Material[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState<FormState>(() => blankForm());

  useEffect(() => {
    setList(loadAdminMaterials());
  }, []);

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreate = () => {
    setIsCreate(true);
    setForm(blankForm());
    setOpen(true);
  };

  const openEdit = (item: Material) => {
    setIsCreate(false);
    setForm(fromMaterial(item));
    setOpen(true);
  };

  const handleSave = (event?: FormEvent) => {
    event?.preventDefault();
    const result = toMaterial(form);
    if (typeof result === "string") {
      toast.error(result);
      return;
    }
    setList((prev) => upsertAdminMaterial(prev, result));
    toast.success(isCreate ? "Đã thêm vật tư" : "Đã lưu vật tư", {
      description: result.name,
    });
    setOpen(false);
  };

  if (!user) return <PortalGate />;

  const filtered =
    categoryFilter === "all" ? list : list.filter((item) => item.categoryId === categoryFilter);
  const groups = groupByCategory(filtered);

  const previewCost = Number(form.costPrice);
  const previewRetail = Number(form.retailPrice);
  const previewProfit =
    Number.isFinite(previewCost) && Number.isFinite(previewRetail)
      ? previewRetail - previewCost
      : null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pt-6 lg:px-8">
      <div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-3 pb-4">
        <h1 className="text-2xl font-black sm:text-3xl">Danh mục vật tư</h1>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[220px]" aria-label="Lọc danh mục">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {materialCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate}>
            <Plus /> Thêm vật tư
          </Button>
        </div>
      </div>

      <section className="min-h-0 w-full flex-1 overflow-auto rounded-lg border border-border bg-card">
        <table className="w-full table-fixed caption-bottom border-collapse text-xs">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="border-border hover:bg-muted">
              <TableHead className="h-8 w-10 bg-muted px-2 text-center text-[11px] font-medium text-muted-foreground">
                STT
              </TableHead>
              <TableHead className="h-8 bg-muted px-2 text-[11px] font-medium text-muted-foreground">
                Tên sản phẩm
              </TableHead>
              <TableHead className="h-8 w-[8.5rem] bg-muted px-2 text-[11px] font-medium text-muted-foreground">
                Kích thước
              </TableHead>
              <TableHead className="h-8 w-28 bg-muted px-2 text-[11px] font-medium text-muted-foreground">
                Diễn giải
              </TableHead>
              <TableHead className="h-8 w-10 bg-muted px-2 text-[11px] font-medium text-muted-foreground">
                ĐVT
              </TableHead>
              <TableHead className="h-8 w-16 bg-muted px-2 text-[11px] font-medium text-muted-foreground">
                Bảo hành
              </TableHead>
              <TableHead className="h-8 w-[5.5rem] bg-muted px-2 text-right text-[11px] font-medium text-muted-foreground">
                Giá nhập
              </TableHead>
              <TableHead className="h-8 w-[5.5rem] bg-muted px-2 text-right text-[11px] font-medium text-muted-foreground">
                Giá bán lẻ
              </TableHead>
              <TableHead className="h-8 w-[5.5rem] bg-muted px-2 text-right text-[11px] font-medium text-muted-foreground">
                Lợi nhuận
              </TableHead>
              <TableHead className="h-8 w-16 bg-muted px-2 text-[11px] font-medium text-muted-foreground">
                Tồn kho
              </TableHead>
              <TableHead className="h-8 w-24 bg-muted px-2 text-[11px] font-medium text-muted-foreground">
                Ghi chú
              </TableHead>
              <TableHead className="h-8 w-14 bg-muted px-2 text-right text-[11px] font-medium text-muted-foreground">
                {" "}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={TABLE_COL_COUNT}
                  className="py-8 text-center text-xs text-muted-foreground"
                >
                  Chưa có vật tư trong danh mục này.
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group) => {
                const stockQty = group.items.reduce((sum, item) => sum + item.stock, 0);
                const costValue = group.items.reduce(
                  (sum, item) => sum + item.costPrice * item.stock,
                  0,
                );
                const retailValue = group.items.reduce(
                  (sum, item) => sum + item.retailPrice * item.stock,
                  0,
                );
                const profitValue = retailValue - costValue;

                return (
                  <Fragment key={group.id}>
                    <TableRow className="border-border hover:bg-brand-soft">
                      <TableCell
                        colSpan={6}
                        className="bg-brand-soft px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand"
                      >
                        {group.index}. {group.name}
                      </TableCell>
                      <TableCell className="bg-brand-soft px-2 py-1.5 text-right text-[11px] font-medium tabular-nums text-brand">
                        {formatVnd(costValue)}
                      </TableCell>
                      <TableCell className="bg-brand-soft px-2 py-1.5 text-right text-[11px] font-medium tabular-nums text-brand">
                        {formatVnd(retailValue)}
                      </TableCell>
                      <TableCell className="bg-brand-soft px-2 py-1.5 text-right text-[11px] font-medium tabular-nums text-brand">
                        {formatVnd(profitValue)}
                      </TableCell>
                      <TableCell className="bg-brand-soft px-2 py-1.5 text-[11px] font-medium tabular-nums text-brand">
                        {stockQty}
                      </TableCell>
                      <TableCell className="bg-brand-soft px-2 py-1.5" />
                      <TableCell className="bg-brand-soft px-2 py-1.5" />
                    </TableRow>
                    {group.items.map((item, index) => {
                      const profit = profitOf(item);
                      return (
                        <TableRow key={item.id} className="hover:bg-muted/40">
                          <TableCell className="px-2 py-1 text-center text-xs text-muted-foreground tabular-nums">
                            {index + 1}
                          </TableCell>
                          <TableCell className="max-w-[200px] overflow-hidden px-2 py-1">
                            <ClipText text={item.name} />
                          </TableCell>
                          <TableCell className="max-w-[140px] overflow-hidden px-2 py-1 text-muted-foreground">
                            <ClipText text={item.size} />
                          </TableCell>
                          <TableCell className="w-28 overflow-hidden px-2 py-1 text-muted-foreground">
                            <ClipText text={item.description} />
                          </TableCell>
                          <TableCell className="max-w-[72px] overflow-hidden px-2 py-1">
                            <ClipText text={item.unit} />
                          </TableCell>
                          <TableCell className="max-w-[100px] overflow-hidden px-2 py-1 text-muted-foreground">
                            <ClipText text={item.warranty} />
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2 py-1 text-right tabular-nums">
                            {formatVnd(item.costPrice)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2 py-1 text-right tabular-nums">
                            {formatVnd(item.retailPrice)}
                          </TableCell>
                          <TableCell
                            className={`whitespace-nowrap px-2 py-1 text-right tabular-nums ${
                              profit > 0
                                ? "text-success"
                                : profit < 0
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {formatVnd(profit)}
                          </TableCell>
                          <TableCell className="px-2 py-1">
                            <StockQtyInput
                              value={item.stock}
                              onCommit={(qty) =>
                                setList((prev) =>
                                  upsertAdminMaterial(prev, { ...item, stock: qty }),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="max-w-[140px] overflow-hidden px-2 py-1 text-muted-foreground">
                            <ClipText text={item.note} />
                          </TableCell>
                          <TableCell className="px-2 py-1 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={() => openEdit(item)}
                            >
                              Sửa
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </table>
      </section>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <SheetHeader className="space-y-1 border-b border-border px-6 py-4 pr-12 text-left">
            <SheetTitle>{isCreate ? "Thêm vật tư" : "Sửa vật tư"}</SheetTitle>
            <SheetDescription>
              Lợi nhuận = giá bán lẻ − giá nhập. Chọn danh mục (tấm pin, biến tần, …) trước khi lưu.
            </SheetDescription>
          </SheetHeader>

          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSave}>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Danh mục vật tư</Label>
                  <Select value={form.categoryId} onValueChange={(v) => patch("categoryId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="material-name">Tên sản phẩm</Label>
                  <Input
                    id="material-name"
                    value={form.name}
                    onChange={(e) => patch("name", e.target.value)}
                    placeholder="MCCB Schneider EasyPact CVS 3P 250A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-size">Kích thước</Label>
                  <Input
                    id="material-size"
                    value={form.size}
                    onChange={(e) => patch("size", e.target.value)}
                    placeholder="3P · 250A · 36kA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-unit">Đơn vị tính</Label>
                  <Input
                    id="material-unit"
                    value={form.unit}
                    onChange={(e) => patch("unit", e.target.value)}
                    placeholder="cái, mét, tấm, bộ…"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="material-desc">Diễn giải</Label>
                  <Textarea
                    id="material-desc"
                    rows={3}
                    value={form.description}
                    onChange={(e) => patch("description", e.target.value)}
                    className="min-h-[80px]"
                    placeholder="Công dụng, vị trí dùng…"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-warranty">Bảo hành</Label>
                  <Input
                    id="material-warranty"
                    value={form.warranty}
                    onChange={(e) => patch("warranty", e.target.value)}
                    placeholder="12 tháng"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-stock">Đang tồn kho</Label>
                  <Input
                    id="material-stock"
                    type="number"
                    min={0}
                    step={1}
                    value={form.stock}
                    onChange={(e) => patch("stock", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-cost">Giá nhập</Label>
                  <Input
                    id="material-cost"
                    type="number"
                    min={0}
                    step={1000}
                    value={form.costPrice}
                    onChange={(e) => patch("costPrice", e.target.value)}
                    placeholder="6200000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-retail">Giá bán lẻ</Label>
                  <Input
                    id="material-retail"
                    type="number"
                    min={0}
                    step={1000}
                    value={form.retailPrice}
                    onChange={(e) => patch("retailPrice", e.target.value)}
                    placeholder="7590000"
                  />
                </div>

                <div className="sm:col-span-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Lợi nhuận: </span>
                  <span
                    className={
                      previewProfit == null
                        ? "text-muted-foreground"
                        : previewProfit > 0
                          ? "font-semibold text-success"
                          : previewProfit < 0
                            ? "font-semibold text-destructive"
                            : "font-semibold"
                    }
                  >
                    {previewProfit == null ? "—" : formatVnd(previewProfit)}
                  </span>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="material-note">Ghi chú</Label>
                  <Input
                    id="material-note"
                    value={form.note}
                    onChange={(e) => patch("note", e.target.value)}
                    placeholder="CO/CQ, điều kiện bán…"
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="border-t border-border px-6 py-4 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
