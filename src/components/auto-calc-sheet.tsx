import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  computeAutoCalc,
  defaultAutoCalcInputs,
  loadAutoCalcInputs,
  saveAutoCalcInputs,
  type AutoCalcInputs,
} from "@/data/auto-calc";
import { BATTERY_TYPES } from "@/data/estimate";
import { getAvailablePanelTypes } from "@/data/panel-catalog";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function money(n: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}

function NumInput({
  value,
  onChange,
  step = 1,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  className?: string;
}) {
  return (
    <Input
      type="number"
      min={0}
      step={step}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={cn(
        "h-7 border-emerald-200 bg-emerald-50 px-2 text-xs tabular-nums shadow-none",
        className,
      )}
    />
  );
}

function Calc({ children }: { children: ReactNode }) {
  return <span className="font-semibold tabular-nums text-destructive">{children}</span>;
}

export function AutoCalcSheet() {
  const [form, setForm] = useState<AutoCalcInputs>(() => loadAutoCalcInputs());

  useEffect(() => {
    saveAutoCalcInputs(form);
  }, [form]);

  const patch = <K extends keyof AutoCalcInputs>(key: K, value: AutoCalcInputs[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const r = useMemo(() => computeAutoCalc(form), [form]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border bg-background pb-4">
        <h1 className="text-2xl font-black sm:text-3xl">Công cụ tính toán</h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand">
          Bảng tính AUTO
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Bảng tính AUTO — nhập ô xanh, số đỏ là kết quả. Giá điện {money(form.tariff)} đ/kWh
            (chưa thuế).
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setForm(defaultAutoCalcInputs())}
          >
            Đặt lại mặc định
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-6">
        <Sheet title="1. Thông tin tiền điện">
          <table className="w-full table-fixed border-collapse text-xs">
            <colgroup>
              <col className="w-[44%]" />
              <col className="w-[28%]" />
              <col className="w-[28%]" />
            </colgroup>
            <thead>
              <YellowHead cols={["Thông tin", "Số tiền điện (chưa thuế)", "Số kW phải mua"]} />
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Tiền điện hàng tháng mùa hè (VNĐ)</td>
                <td className="px-2 py-1">
                  <NumInput value={form.summerBill} onChange={(n) => patch("summerBill", n)} />
                </td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.summerKwh}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Tiền điện hàng tháng mùa đông (VNĐ)</td>
                <td className="px-2 py-1">
                  <NumInput value={form.winterBill} onChange={(n) => patch("winterBill", n)} />
                </td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.winterKwh}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Đơn giá điện (đ/kWh)</td>
                <td className="px-2 py-1">
                  <NumInput value={form.tariff} onChange={(n) => patch("tariff", n)} />
                </td>
                <td className="px-3 py-1.5 text-right text-muted-foreground">
                  kWh = tiền / đơn giá
                </td>
              </tr>
            </tbody>
          </table>
        </Sheet>

        <Sheet title="2. Tính toán tấm pin">
          <table className="w-full table-fixed border-collapse text-xs">
            <colgroup>
              <col className="w-[44%]" />
              <col className="w-[28%]" />
              <col className="w-[28%]" />
            </colgroup>
            <thead>
              <YellowHead cols={["Thông số", "Mùa hè", "Mùa đông"]} />
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Nhu cầu điện tiêu thụ/ngày (kWh/ngày)</td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.summerDaily}</Calc>
                </td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.winterDaily}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Hiệu suất tấm pin tạo ra (giờ nắng đỉnh)</td>
                <td className="px-2 py-1">
                  <NumInput
                    step={0.1}
                    value={form.pshSummer}
                    onChange={(n) => patch("pshSummer", n)}
                  />
                </td>
                <td className="px-2 py-1">
                  <NumInput
                    step={0.1}
                    value={form.pshWinter}
                    onChange={(n) => patch("pshWinter", n)}
                  />
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Công suất hệ thống cần lắp (kWp)</td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.summerNeedKwp}</Calc>
                </td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.winterNeedKwp}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Công suất 1 tấm pin (kWp)</td>
                <td colSpan={2} className="px-3 py-1.5 text-right">
                  <Calc>{r.panelKwp}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Dự toán số lượng tấm pin cần lắp</td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.summerPanels}</Calc>
                </td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.winterPanels}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border bg-secondary/40">
                <td className="px-3 py-1.5 font-semibold">Chốt phương án — Số tấm pin</td>
                <td colSpan={2} className="px-2 py-1">
                  <div className="flex items-center gap-2">
                    <NumInput
                      value={form.panelCount || r.suggestedPanels}
                      onChange={(n) => patch("panelCount", n)}
                      className="max-w-[8rem]"
                    />
                    <span className="text-[11px] text-muted-foreground">
                      Đề xuất {r.suggestedPanels} tấm (lấy mùa lớn hơn)
                    </span>
                  </div>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Tổng công suất lắp đặt (kWp)</td>
                <td colSpan={2} className="px-3 py-1.5 text-right">
                  <Calc>{r.totalKwp}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Công suất biến tần đề xuất (kW)</td>
                <td colSpan={2} className="px-3 py-1.5 text-right">
                  <Calc>{r.inverterKw}</Calc>
                </td>
              </tr>
            </tbody>
          </table>
        </Sheet>

        <Sheet title="3. Diện tích lắp đặt">
          <table className="w-full table-fixed border-collapse text-xs">
            <colgroup>
              <col className="w-[44%]" />
              <col className="w-[56%]" />
            </colgroup>
            <thead>
              <YellowHead cols={["Dữ liệu tấm pin", "Giá trị"]} />
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Tấm pin đã chọn</td>
                <td className="px-2 py-1">
                  <Select value={form.panelName} onValueChange={(v) => patch("panelName", v)}>
                    <SelectTrigger className="h-7 border-emerald-200 bg-emerald-50 text-xs shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePanelTypes().map((p) => (
                        <SelectItem key={p.id} value={p.name}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Diện tích 1 tấm (m²)</td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.area1}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Số tấm pin</td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.panelCount}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5 font-semibold">Tổng diện tích lắp đặt (m²)</td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.totalArea}</Calc>
                </td>
              </tr>
            </tbody>
          </table>
        </Sheet>

        <Sheet title="4. Pin lưu trữ">
          <table className="w-full table-fixed border-collapse text-xs">
            <colgroup>
              <col className="w-[44%]" />
              <col className="w-[28%]" />
              <col className="w-[28%]" />
            </colgroup>
            <thead>
              <YellowHead cols={["Thông số", "Mùa hè", "Mùa đông"]} />
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Tỉ lệ dùng ban ngày (%)</td>
                <td colSpan={2} className="px-2 py-1">
                  <NumInput
                    value={form.dayRate}
                    onChange={(n) => patch("dayRate", Math.min(100, n))}
                    className="max-w-[8rem]"
                  />
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Tỉ lệ dùng ban đêm (%)</td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.nightRate}</Calc>
                </td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.nightRate}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Số điện cần lưu ban đêm (kWh)</td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.summerNight}</Calc>
                </td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.winterNight}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Hiệu suất xả pin (%)</td>
                <td colSpan={2} className="px-2 py-1">
                  <NumInput
                    value={form.dischargeEff}
                    onChange={(n) => patch("dischargeEff", n)}
                    className="max-w-[8rem]"
                  />
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Tổng dung lượng pin cần (kWh)</td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.summerBatt}</Calc>
                </td>
                <td className="px-3 py-1.5 text-right">
                  <Calc>{r.winterBatt}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border bg-secondary/40">
                <td className="px-3 py-1.5 font-semibold">Tổng dung tích lựa chọn (kWh)</td>
                <td colSpan={2} className="px-3 py-1.5 text-right">
                  <Calc>{r.neededBatt}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Hãng pin</td>
                <td colSpan={2} className="px-2 py-1">
                  <Select value={form.batteryName} onValueChange={(v) => patch("batteryName", v)}>
                    <SelectTrigger className="h-7 border-emerald-200 bg-emerald-50 text-xs shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BATTERY_TYPES.map((b) => (
                        <SelectItem key={b.id} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Dung tích pin (kWh/bộ)</td>
                <td colSpan={2} className="px-3 py-1.5 text-right">
                  <Calc>{r.battery.kwh}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Số lượng</td>
                <td colSpan={2} className="px-2 py-1">
                  <div className="flex items-center gap-2">
                    <NumInput
                      value={form.batteryQty || r.suggestedQty}
                      onChange={(n) => patch("batteryQty", n)}
                      className="max-w-[8rem]"
                    />
                    <span className="text-[11px] text-muted-foreground">
                      Đề xuất {r.suggestedQty}
                    </span>
                  </div>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5 font-semibold">Tổng dung tích (kWh)</td>
                <td colSpan={2} className="px-3 py-1.5 text-right">
                  <Calc>{r.totalBatt}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Giá tiền</td>
                <td colSpan={2} className="px-3 py-1.5 text-right">
                  <Calc>{formatVnd(r.unitPrice)}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-1.5 font-semibold">Thành tiền</td>
                <td colSpan={2} className="px-3 py-1.5 text-right">
                  <Calc>{formatVnd(r.lineTotal)}</Calc>
                </td>
              </tr>
            </tbody>
          </table>
        </Sheet>
      </div>
    </div>
  );
}

function Sheet({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="bg-brand-dark px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-brand-foreground">
        {title}
      </div>
      {children}
    </section>
  );
}

function YellowHead({ cols }: { cols: string[] }) {
  return (
    <tr className="bg-amber-100 text-[11px] font-bold uppercase tracking-wide text-amber-950">
      {cols.map((c) => (
        <th key={c} className="px-3 py-1.5 text-left">
          {c}
        </th>
      ))}
    </tr>
  );
}
