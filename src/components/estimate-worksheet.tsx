import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AC_WIRES,
  BATTERY_TYPES,
  INVERTER_KW_OPTIONS,
  PRICE_PACKAGES,
  ROOF_TYPES,
  autoInverterKw,
  autoPanelCount,
  extrasTotal,
  loadEstimateInputs,
  packagePrice,
  saveEstimateInputs,
  scenarioFrom,
  type EstimateInputs,
} from "@/data/estimate";
import { getAvailablePanelTypes } from "@/data/panel-catalog";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  applyCustomerToEstimate,
  EstimateCustomerSelect,
} from "@/components/estimate-customer-select";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

function NumInput({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  return (
    <Input
      type="number"
      min={0}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={cn(
        "h-7 border-emerald-200 bg-emerald-50 px-2 text-xs tabular-nums shadow-none",
        className,
      )}
    />
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-7 border-emerald-200 bg-emerald-50 px-2 text-xs shadow-none"
    />
  );
}

export function EstimateWorksheet() {
  const [form, setForm] = useState<EstimateInputs>(() => loadEstimateInputs());

  useEffect(() => {
    saveEstimateInputs(form);
  }, [form]);

  const patch = <K extends keyof EstimateInputs>(key: K, value: EstimateInputs[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const auto = useMemo(() => scenarioFrom(form, "auto"), [form]);
  const manual = useMemo(() => scenarioFrom(form, "manual"), [form]);
  const extras = extrasTotal(form);
  const nightRate = Math.max(0, 100 - form.dayRate);

  const groups = useMemo(() => {
    const map = new Map<string, typeof PRICE_PACKAGES>();
    for (const pkg of PRICE_PACKAGES) {
      const list = map.get(pkg.category) ?? [];
      list.push(pkg);
      map.set(pkg.category, list);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full table-fixed border-collapse text-xs">
          <colgroup>
            <col className="w-[42%]" />
            <col className="w-[29%]" />
            <col className="w-[29%]" />
          </colgroup>
          <thead>
            <tr className="bg-brand-dark text-[11px] font-bold uppercase tracking-wide text-brand-foreground">
              <th className="px-3 py-2 text-left">Thông tin khách hàng</th>
              <th className="px-3 py-2 text-left">Auto</th>
              <th className="px-3 py-2 text-left">Thủ công</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Chọn khách hàng" auto={form.customer || "Quý Khách Hàng"}>
              <EstimateCustomerSelect
                customerId={form.customerId}
                triggerClassName="h-7 border-emerald-200 bg-emerald-50 px-2 text-xs shadow-none"
                onSelect={(customer) => setForm((prev) => ({ ...prev, ...applyCustomerToEstimate(customer) }))}
              />
            </Row>
            <Row label="Tên khách hàng" auto={form.customer || "Quý Khách Hàng"}>
              <TextInput
                value={form.customer}
                onChange={(v) => patch("customer", v)}
                placeholder="Quý Khách Hàng"
              />
            </Row>
            <Row label="Số điện thoại" auto="—">
              <TextInput
                value={form.phone}
                onChange={(v) => patch("phone", v)}
                placeholder="Số điện thoại"
              />
            </Row>
            <Row label="Địa chỉ" auto="—">
              <TextInput
                value={form.address}
                onChange={(v) => patch("address", v)}
                placeholder="Địa chỉ lắp đặt"
              />
            </Row>
            <Row label="Tiền điện mùa hè" auto={money(form.summerBillAuto)}>
              <NumInput
                value={form.summerBillManual}
                onChange={(n) => patch("summerBillManual", n)}
              />
            </Row>
            <Row label="Tiền điện mùa đông" auto={money(form.winterBillAuto)}>
              <NumInput
                value={form.winterBillManual}
                onChange={(n) => patch("winterBillManual", n)}
              />
            </Row>
            <Row label="Tỉ lệ dùng ban ngày (%)" auto={String(form.dayRate)}>
              <NumInput value={form.dayRate} onChange={(n) => patch("dayRate", Math.min(100, n))} />
            </Row>
            <Row label="Tỉ lệ dùng ban đêm (%)" auto={String(nightRate)}>
              <span className="text-muted-foreground">{nightRate}</span>
            </Row>
            <Row label="Sử dụng điện 1 pha hay 3 pha" auto={form.phase}>
              <Select
                value={form.phase}
                onValueChange={(v) => patch("phase", v as EstimateInputs["phase"])}
              >
                <SelectTrigger className="h-7 border-emerald-200 bg-emerald-50 text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Điện 1 pha">Điện 1 pha</SelectItem>
                  <SelectItem value="Điện 3 pha">Điện 3 pha</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </tbody>
        </table>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full table-fixed border-collapse text-xs">
          <colgroup>
            <col className="w-[42%]" />
            <col className="w-[29%]" />
            <col className="w-[29%]" />
          </colgroup>
          <thead>
            <tr className="bg-brand-dark text-[11px] font-bold uppercase tracking-wide text-brand-foreground">
              <th className="px-3 py-2 text-left">Khảo sát thực tế</th>
              <th className="px-3 py-2 text-left">Cơ cấu</th>
              <th className="px-3 py-2 text-left">Giá thành</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Chi phí cẩu pin" auto={form.crane ? "Có" : "Không"}>
              <div className="flex items-center gap-2">
                <Select value={String(form.crane)} onValueChange={(v) => patch("crane", Number(v))}>
                  <SelectTrigger className="h-7 border-emerald-200 bg-emerald-50 text-xs shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Không</SelectItem>
                    <SelectItem value="1">Có</SelectItem>
                  </SelectContent>
                </Select>
                <NumInput
                  value={form.cranePrice}
                  onChange={(n) => patch("cranePrice", n)}
                  className="flex-1"
                />
              </div>
            </Row>
            <Row label="Mái nhà" auto={form.roof}>
              <Select
                value={form.roof}
                onValueChange={(v) => patch("roof", v as EstimateInputs["roof"])}
              >
                <SelectTrigger className="h-7 border-emerald-200 bg-emerald-50 text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOF_TYPES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Công trình xa" auto={form.remote ? "Có" : "Không"}>
              <div className="flex items-center gap-2">
                <Select
                  value={String(form.remote)}
                  onValueChange={(v) => patch("remote", Number(v))}
                >
                  <SelectTrigger className="h-7 border-emerald-200 bg-emerald-50 text-xs shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Không</SelectItem>
                    <SelectItem value="1">Có</SelectItem>
                  </SelectContent>
                </Select>
                <NumInput
                  value={form.remotePrice}
                  onChange={(n) => patch("remotePrice", n)}
                  className="flex-1"
                />
              </div>
            </Row>
            <tr className="border-t border-border bg-secondary/60">
              <td className="px-3 py-1.5 font-semibold uppercase tracking-wide text-muted-foreground">
                Lựa chọn dây
              </td>
              <td className="px-3 py-1.5 font-semibold uppercase tracking-wide text-muted-foreground">
                Loại dây
              </td>
              <td className="px-3 py-1.5 font-semibold uppercase tracking-wide text-muted-foreground">
                Số lượng (m)
              </td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-3 py-1.5">Dây điện AC</td>
              <td className="px-2 py-1">
                <Select value={form.acWire} onValueChange={(v) => patch("acWire", v)}>
                  <SelectTrigger className="h-7 border-emerald-200 bg-emerald-50 text-xs shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AC_WIRES.map((w) => (
                      <SelectItem key={w} value={w}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-2 py-1">
                <NumInput value={form.acWireM} onChange={(n) => patch("acWireM", n)} />
              </td>
            </tr>
            <Row label="Tổng dây điện DC" auto="Nhập số lượng →">
              <NumInput value={form.dcWireM} onChange={(n) => patch("dcWireM", n)} />
            </Row>
            <Row label="Ống nhựa D20 (luồn và tiếp địa)" auto="Nhập số lượng →">
              <NumInput value={form.pipeM} onChange={(n) => patch("pipeM", n)} />
            </Row>
          </tbody>
        </table>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full table-fixed border-collapse text-xs">
          <colgroup>
            <col className="w-[42%]" />
            <col className="w-[29%]" />
            <col className="w-[29%]" />
          </colgroup>
          <thead>
            <tr className="bg-brand-dark text-[11px] font-bold uppercase tracking-wide text-brand-foreground">
              <th className="px-3 py-2 text-left">Tính toán hệ thống điện mặt trời</th>
              <th className="px-3 py-2 text-left">Tự động</th>
              <th className="px-3 py-2 text-left">Thủ công</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Chọn loại pin" auto={auto.panelType}>
              <Select
                value={form.panelTypeManual}
                onValueChange={(v) => patch("panelTypeManual", v)}
              >
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
            </Row>
            <Row label="Số tấm pin" auto={String(auto.panelCount)}>
              <NumInput
                value={form.panelCountManual}
                onChange={(n) => patch("panelCountManual", n)}
              />
            </Row>
            <Row label="Công suất (kW)" auto={String(auto.capacityKw)}>
              <span className="font-semibold tabular-nums">{manual.capacityKw}</span>
            </Row>
            <Row label="Diện tích (m²)" auto={String(auto.areaM2)}>
              <span className="tabular-nums">{manual.areaM2}</span>
            </Row>
            <Row label="Biến tần (kW)" auto={String(auto.inverterKw)}>
              <Select
                value={String(form.inverterKwManual)}
                onValueChange={(v) => patch("inverterKwManual", Number(v))}
              >
                <SelectTrigger className="h-7 border-emerald-200 bg-emerald-50 text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVERTER_KW_OPTIONS.map((kw) => (
                    <SelectItem key={kw} value={String(kw)}>
                      {kw}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
          </tbody>
        </table>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full table-fixed border-collapse text-xs">
          <colgroup>
            <col className="w-[42%]" />
            <col className="w-[29%]" />
            <col className="w-[29%]" />
          </colgroup>
          <thead>
            <tr className="bg-brand-dark text-[11px] font-bold uppercase tracking-wide text-brand-foreground">
              <th className="px-3 py-2 text-left">Pin lưu trữ</th>
              <th className="px-3 py-2 text-left">Tự động</th>
              <th className="px-3 py-2 text-left">Thủ công</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Loại pin" auto={auto.batteryName}>
              <Select
                value={form.batteryTypeManual}
                onValueChange={(v) => patch("batteryTypeManual", v)}
              >
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
            </Row>
            <Row label="Số lượng" auto={String(auto.batteryQty)}>
              <NumInput
                value={form.batteryQtyManual}
                onChange={(n) => patch("batteryQtyManual", n)}
              />
            </Row>
            <Row label="Tổng dung lượng (kWh)" auto={String(auto.storageKwh)}>
              <span className="font-semibold tabular-nums">{manual.storageKwh}</span>
            </Row>
          </tbody>
        </table>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-brand-dark px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-brand-foreground">
          Bảng giá dự kiến
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-xs">
            <thead>
              <tr className="bg-secondary text-[11px] font-bold uppercase tracking-wide">
                <th className="px-3 py-2 text-left">Cấu hình hệ thống</th>
                <th className="px-3 py-2 text-right">Auto</th>
                <th className="bg-amber-50 px-3 py-2 text-right">Hiện / Thủ công</th>
              </tr>
            </thead>
            <tbody>
              <PriceRow label="Số tấm pin" auto={auto.panelCount} manual={manual.panelCount} />
              <PriceRow
                label="Công suất"
                auto={`${auto.capacityKw} kW`}
                manual={`${manual.capacityKw} kW`}
              />
              <PriceRow label="Lưu trữ" auto={auto.storageKwh} manual={manual.storageKwh} />
              <PriceRow label="Pin" auto={auto.batteryName} manual={manual.batteryName} />
              <PriceRow
                label="Tiền điện dự kiến mùa hè"
                auto={formatVnd(auto.summerBill)}
                manual={formatVnd(manual.summerBill)}
              />
              <PriceRow
                label="Tiền điện dự kiến mùa đông"
                auto={formatVnd(auto.winterBill)}
                manual={formatVnd(manual.winterBill)}
              />
              <PriceRow
                label="Chi phí khảo sát (cẩu, xa, dây, ống)"
                auto={formatVnd(extras)}
                manual={formatVnd(extras)}
              />

              {groups.map(([category, pkgs]) => (
                <PackageGroup
                  key={category}
                  category={category}
                  pkgs={pkgs}
                  autoCount={auto.panelCount}
                  manualCount={manual.panelCount}
                />
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-3 py-2 text-[11px] text-muted-foreground">
          Auto dùng {autoPanelCount(form.summerBillAuto)} tấm {auto.panelType} · biến tần{" "}
          {autoInverterKw(auto.capacityKw)} kW. Cột thủ công (ô xanh) là thông số đang chọn. Giá
          demo theo bảng dự toán.
        </p>
      </section>
    </div>
  );
}

function Row({ label, auto, children }: { label: string; auto: string; children: ReactNode }) {
  return (
    <tr className="border-t border-border">
      <td className="px-3 py-1.5">{label}</td>
      <td className="px-3 py-1.5 tabular-nums text-muted-foreground">{auto}</td>
      <td className="px-2 py-1">{children}</td>
    </tr>
  );
}

function PriceRow({
  label,
  auto,
  manual,
}: {
  label: string;
  auto: string | number;
  manual: string | number;
}) {
  return (
    <tr className="border-t border-border">
      <td className="px-3 py-1.5">{label}</td>
      <td className="px-3 py-1.5 text-right tabular-nums">{auto}</td>
      <td className="bg-amber-50/80 px-3 py-1.5 text-right tabular-nums">{manual}</td>
    </tr>
  );
}

function PackageGroup({
  category,
  pkgs,
  autoCount,
  manualCount,
}: {
  category: string;
  pkgs: typeof PRICE_PACKAGES;
  autoCount: number;
  manualCount: number;
}) {
  return (
    <>
      <tr className="border-t border-border">
        <td
          colSpan={3}
          className="bg-destructive/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-destructive-foreground"
        >
          {category}
        </td>
      </tr>
      {pkgs.map((pkg) => {
        const a = packagePrice(pkg, autoCount);
        const m = packagePrice(pkg, manualCount);
        return (
          <Fragment key={pkg.name}>
            <tr className="border-t border-border">
              <td className="bg-brand-dark px-3 py-1.5 font-semibold text-brand-foreground">
                {pkg.name}
              </td>
              <td className="px-3 py-1.5 text-right font-semibold tabular-nums">
                {formatVnd(a.total)}
              </td>
              <td className="bg-amber-50/80 px-3 py-1.5 text-right font-semibold tabular-nums">
                {formatVnd(m.total)}
              </td>
            </tr>
            {pkg.hybrid ? (
              <>
                <PriceRow
                  label="Lợi nhuận có pin"
                  auto={formatVnd(a.profitWith)}
                  manual={formatVnd(m.profitWith)}
                />
                <PriceRow
                  label="Lợi nhuận không pin"
                  auto={formatVnd(a.profitWithout)}
                  manual={formatVnd(m.profitWithout)}
                />
              </>
            ) : (
              <PriceRow
                label="Lợi nhuận"
                auto={formatVnd(a.profitWith)}
                manual={formatVnd(m.profitWith)}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
}
