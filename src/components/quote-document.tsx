import { Plus, ShieldCheck, Star, Trash2 } from "lucide-react";
import { company, images } from "@/data/mock";
import {
  materialCategories,
  type Material,
} from "@/data/materials";
import {
  emptyQuoteLine,
  quoteLineFromMaterial,
  quoteLineTotal,
  quoteTotal,
  type QuoteLineItem,
} from "@/data/solar-quotes";
import { formatVnd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type QuoteDocForm = {
  customer: string;
  address: string;
  phone: string;
  systemTitle: string;
  lines: QuoteLineItem[];
};

export function blankQuoteDoc(): QuoteDocForm {
  return {
    customer: "",
    address: "",
    phone: "",
    systemTitle: "Hệ thống điện năng lượng mặt trời hòa lưới",
    lines: [emptyQuoteLine()],
  };
}

function todayLabel() {
  return new Intl.DateTimeFormat("vi-VN").format(new Date());
}

export function QuoteDocument({
  form,
  onChange,
  materials,
}: {
  form: QuoteDocForm;
  onChange: (next: QuoteDocForm) => void;
  materials: Material[];
}) {
  const patch = <K extends keyof QuoteDocForm>(key: K, value: QuoteDocForm[K]) => {
    onChange({ ...form, [key]: value });
  };

  const updateLine = (id: string, next: QuoteLineItem) => {
    patch(
      "lines",
      form.lines.map((line) => (line.id === id ? next : line)),
    );
  };

  const pickMaterial = (line: QuoteLineItem, materialId: string) => {
    const item = materials.find((m) => m.id === materialId);
    if (!item) return;
    updateLine(line.id, { ...quoteLineFromMaterial(item, line.qty || 1), id: line.id });
  };

  const total = quoteTotal(form.lines.filter((l) => l.materialId));

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <header className="grid shrink-0 gap-4 border-b border-border bg-brand-dark p-5 text-brand-foreground sm:grid-cols-[1fr_220px] sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand text-sm font-black">
              HV
            </span>
            <div>
              <p className="text-lg font-black uppercase tracking-wide">Hoàng Vĩnh VKT</p>
              <p className="text-[11px] uppercase tracking-wider text-brand-foreground/70">
                {company.name} – Giải pháp điện năng lượng mặt trời
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-brand-foreground/75">
            MST: 0314 882 196 · Hotline: {company.hotline} · {company.phone}
          </p>
        </div>
        <img
          src={images.hero}
          alt="Hệ thống điện mặt trời"
          className="hidden h-24 w-full rounded-lg object-cover sm:block"
        />
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 lg:p-7">
        <div className="text-center">
          <h2 className="text-xl font-black uppercase tracking-wide text-brand sm:text-2xl">
            Báo giá lắp đặt trọn gói
          </h2>
          <Input
            value={form.systemTitle}
            onChange={(e) => patch("systemTitle", e.target.value)}
            className="mx-auto mt-2 h-8 max-w-xl border-0 bg-transparent text-center text-sm font-semibold text-brand-dark shadow-none focus-visible:ring-0"
            placeholder="Tên hệ thống, VD: Hybrid Sofar 3 pha 8kW"
          />
        </div>

        <section className="grid gap-3 rounded-lg border border-border bg-secondary/40 p-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-brand">
              Thông tin khách hàng
            </p>
            <div className="mt-2 space-y-2">
              <div className="space-y-1">
                <Label htmlFor="quote-customer" className="text-xs text-muted-foreground">
                  Kính gửi
                </Label>
                <Input
                  id="quote-customer"
                  value={form.customer}
                  onChange={(e) => patch("customer", e.target.value)}
                  placeholder="Quý khách hàng"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quote-address" className="text-xs text-muted-foreground">
                  Địa chỉ
                </Label>
                <Input
                  id="quote-address"
                  value={form.address}
                  onChange={(e) => patch("address", e.target.value)}
                  placeholder="Địa chỉ lắp đặt"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quote-phone" className="text-xs text-muted-foreground">
                  Hotline
                </Label>
                <Input
                  id="quote-phone"
                  value={form.phone}
                  onChange={(e) => patch("phone", e.target.value)}
                  placeholder="Số điện thoại"
                />
              </div>
            </div>
          </div>
          <p className="self-start text-right text-xs text-muted-foreground sm:pt-6">
            Ngày báo giá: <b className="text-foreground">{todayLabel()}</b>
          </p>
        </section>

        <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-border">
          <table className="w-full min-w-[860px] border-collapse text-xs">
            <thead>
              <tr className="bg-brand-dark text-[11px] font-bold uppercase tracking-wide text-brand-foreground">
                <th className="px-2 py-2 text-center">STT</th>
                <th className="px-2 py-2 text-left">Sản phẩm – Thông số kỹ thuật</th>
                <th className="px-2 py-2 text-center">Hình ảnh</th>
                <th className="px-2 py-2 text-center">ĐVT</th>
                <th className="w-20 px-2 py-2 text-center">SL</th>
                <th className="px-2 py-2 text-right">Đơn giá</th>
                <th className="px-2 py-2 text-right">Thành tiền</th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {form.lines.map((line, index) => (
                <tr key={line.id} className="border-t border-border align-top">
                  <td className="px-2 py-2 text-center tabular-nums text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="min-w-[280px] px-2 py-2">
                    <Select
                      value={line.materialId || undefined}
                      onValueChange={(id) => pickMaterial(line, id)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Chọn sản phẩm" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {materialCategories.map((cat) => (
                          <SelectGroup key={cat.id}>
                            <SelectLabel>{cat.name}</SelectLabel>
                            {materials
                              .filter((m) => m.categoryId === cat.id)
                              .map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    {line.specs.length > 0 ? (
                      <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[11px] leading-snug text-muted-foreground">
                        {line.specs.map((spec) => (
                          <li key={spec}>{spec}</li>
                        ))}
                      </ul>
                    ) : null}
                  </td>
                  <td className="px-2 py-2">
                    {line.image ? (
                      <img
                        src={line.image}
                        alt={line.name}
                        className="mx-auto h-16 w-16 rounded-md border border-border object-cover"
                      />
                    ) : (
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md border border-dashed text-[10px] text-muted-foreground">
                        Ảnh
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center">{line.unit || "—"}</td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      className="h-8 w-16 px-1.5 text-center text-xs tabular-nums"
                      value={line.qty}
                      onChange={(e) =>
                        updateLine(line.id, { ...line, qty: Number(e.target.value) || 0 })
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">
                    {line.unitPrice ? formatVnd(line.unitPrice) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right font-semibold tabular-nums">
                    {line.materialId ? formatVnd(quoteLineTotal(line)) : "—"}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      aria-label="Xóa hạng mục"
                      onClick={() =>
                        patch(
                          "lines",
                          form.lines.length > 1
                            ? form.lines.filter((l) => l.id !== line.id)
                            : [emptyQuoteLine()],
                        )
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => patch("lines", [...form.lines, emptyQuoteLine()])}
        >
          <Plus className="h-4 w-4" /> Thêm hạng mục
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-brand px-4 py-3 text-sm font-black uppercase tracking-wide text-brand-foreground">
          <span>Tổng cộng chi phí</span>
          <span className="text-base tabular-nums">{formatVnd(total)}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand">
              <ShieldCheck className="h-4 w-4" /> Cam kết chất lượng
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>100% hàng chính hãng, đủ CO/CQ</li>
              <li>Bảo hành dài hạn theo từng thiết bị</li>
              <li>Thi công đội ngũ kỹ thuật chuyên nghiệp</li>
              <li>Hỗ trợ kỹ thuật 24/7</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand">
              <Star className="h-4 w-4" /> Lợi ích khi dùng điện mặt trời
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>Tiết kiệm 40–70% tiền điện mỗi tháng</li>
              <li>Thân thiện môi trường, năng lượng xanh</li>
              <li>Tăng giá trị công trình / bất động sản</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4 border-t border-border pt-4 text-[11px] text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">Lưu ý</p>
            <p>Giá chưa gồm VAT. Không gồm cải tạo kết cấu và phát sinh hiện trường.</p>
            <p>Báo giá có hiệu lực 5 ngày kể từ ngày phát hành.</p>
          </div>
          <div className="text-right">
            <p>Ngày báo giá: {todayLabel()}</p>
            <p className="mt-3 font-bold uppercase text-foreground">Giám đốc</p>
            <p className="mt-6 font-semibold text-brand">Lê Hoàng Vĩnh</p>
          </div>
        </div>
      </div>
    </article>
  );
}
