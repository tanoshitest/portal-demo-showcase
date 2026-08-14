import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calculator, Check, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SolarShell } from "@/components/solar/solar-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSolar } from "@/context/solar-store";
import { useStore } from "@/context/store";
import { formatVnd } from "@/lib/format";
import {
  calculateEVNKwh,
  calculateEVNMoney,
  calculateQuoteTotals,
  calculateROI,
  simulateSolarYield,
} from "@/lib/solar-engine";
import { batteryKwh, buildKitLines, inverterKw, panelWatt } from "@/lib/solar-kit";
import { categoryLabel, scenarioLabel, type Quote, type QuoteScenario } from "@/data/solar";

export const Route = createFileRoute("/portal/solar/bao-gia-moi")({
  head: () => ({
    meta: [
      { title: "Tạo báo giá điện mặt trời | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content: "Nhập tiền điện, mô phỏng công suất và tạo báo giá điện mặt trời trọn gói.",
      },
      { property: "og:title", content: "Tạo báo giá điện mặt trời" },
      { property: "og:description", content: "Trình tạo báo giá nhiều bước với so sánh AUTO / THỦ CÔNG." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QuoteWizard,
});

const steps = ["Thông tin & tiền điện", "Cấu hình hệ thống", "Xem lại & lưu"] as const;
const numberFmt = new Intl.NumberFormat("vi-VN");

function QuoteWizard() {
  const navigate = useNavigate();
  const { products, rules, tariffs, saveQuote } = useSolar();
  const { user } = useStore();
  const [step, setStep] = useState(0);

  // Bước A
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "", email: "", note: "" });
  const [summerBill, setSummerBill] = useState(3200000);
  const [winterBill, setWinterBill] = useState(1800000);
  const [summerFactor, setSummerFactor] = useState(1.2);
  const [winterFactor, setWinterFactor] = useState(0.85);
  const [dayNightRatio, setDayNightRatio] = useState(0.6);

  const panels = products.filter((p) => p.category === "panel");
  const inverters = products.filter((p) => p.category === "inverter");
  const batteries = products.filter((p) => p.category === "battery");

  // Bước B – thủ công
  const [scenario, setScenario] = useState<QuoteScenario>("ongrid");
  const [manualKwp, setManualKwp] = useState<number | null>(null);
  const [panelId, setPanelId] = useState(panels[0]?.id ?? "");
  const [inverterId, setInverterId] = useState(inverters[0]?.id ?? "");
  const [batteryId, setBatteryId] = useState(batteries[0]?.id ?? "");
  const [batteryCount, setBatteryCount] = useState(2);
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const auto = useMemo(() => {
    const summerKwh = calculateEVNKwh(summerBill, tariffs);
    const winterKwh = calculateEVNKwh(winterBill, tariffs);
    const baseKwh = (summerKwh + winterKwh) / 2;
    const yieldResult = simulateSolarYield(baseKwh, summerFactor, winterFactor, dayNightRatio);
    return { summerKwh, winterKwh, baseKwh: Math.round(baseKwh * 10) / 10, yieldResult };
  }, [summerBill, winterBill, summerFactor, winterFactor, dayNightRatio, tariffs]);

  const autoLines = useMemo(
    () =>
      buildKitLines(
        {
          kwp: auto.yieldResult.recommendedKwp,
          scenario: "ongrid",
          panelId: panels[0]?.id ?? "",
          inverterId: inverters[0]?.id ?? "",
          batteryId: batteries[0]?.id ?? "",
          batteryCount: 0,
        },
        products,
        rules,
      ),
    [auto.yieldResult.recommendedKwp, products, rules, panels, inverters, batteries],
  );
  const autoTotals = calculateQuoteTotals(autoLines);

  const kwp = manualKwp ?? auto.yieldResult.recommendedKwp;
  const manualLines = useMemo(
    () =>
      buildKitLines(
        { kwp, scenario, panelId, inverterId, batteryId, batteryCount, overrides },
        products,
        rules,
      ),
    [kwp, scenario, panelId, inverterId, batteryId, batteryCount, overrides, products, rules],
  );
  const manualTotals = calculateQuoteTotals(manualLines);

  const selectedBattery = batteries.find((b) => b.id === batteryId);
  const storageKwh =
    scenario === "hybrid" && selectedBattery ? batteryKwh(selectedBattery) * batteryCount : 0;

  const pvMonthly = Math.round(kwp * 4.2 * 30);
  const roi = useMemo(
    () =>
      calculateROI({
        monthlyKwh: auto.yieldResult.monthlyKwh,
        dayKwh: auto.yieldResult.dayKwh,
        nightKwh: auto.yieldResult.nightKwh,
        monthlyPvKwh: pvMonthly,
        ongridInvestment: scenario === "ongrid" ? manualTotals.total : autoTotals.total,
        hybridInvestment: scenario === "hybrid" ? manualTotals.total : manualTotals.total * 1.6,
        batteryKwh: storageKwh,
        tariffs,
      }),
    [auto.yieldResult, pvMonthly, manualTotals.total, autoTotals.total, scenario, storageKwh, tariffs],
  );
  const activeRoi = scenario === "hybrid" ? roi.hybrid : roi.ongrid;

  const canNext =
    step !== 0 || (customer.name.trim().length > 1 && customer.phone.trim().length >= 8);

  function handleSave() {
    const id = `Q-${Date.now()}`;
    const quote: Quote = {
      id,
      code: `BG-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      createdAt: new Date().toISOString(),
      createdByEmail: user?.email ?? "",
      createdByName: user?.name ?? "",
      customer,
      input: { summerBill, winterBill, summerFactor, winterFactor, dayNightRatio },
      scenario,
      systemKwp: Math.round(kwp * 10) / 10,
      lines: manualLines,
      subtotal: manualTotals.subtotal,
      vatRate: manualTotals.vatRate,
      vatAmount: manualTotals.vatAmount,
      total: manualTotals.total,
      totalCost: manualTotals.totalCost,
      roiYears: activeRoi.roiYears,
      yearlySaving: activeRoi.yearlySaving,
    };
    saveQuote(quote);
    toast.success("Đã lưu báo giá", { description: quote.code });
    navigate({ to: "/portal/solar/bao-gia/$id", params: { id } });
  }

  return (
    <SolarShell
      title="Tạo báo giá điện mặt trời"
      description="3 bước: nhập tiền điện → cấu hình hệ thống (AUTO / THỦ CÔNG) → lưu & xuất PDF."
    >
      <ol className="mb-6 grid gap-2 sm:grid-cols-3">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${
              i === step
                ? "border-brand bg-brand/5 font-semibold text-brand"
                : i < step
                  ? "border-success/40 bg-success/5 text-success"
                  : "border-border bg-card text-muted-foreground"
            }`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
        >
          {step === 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h2 className="text-base font-bold">Thông tin khách hàng</h2>
                <div className="mt-4 grid gap-3">
                  <Field label="Họ tên khách hàng *">
                    <Input
                      value={customer.name}
                      placeholder="VD: Nguyễn Văn An"
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    />
                  </Field>
                  <Field label="Số điện thoại *">
                    <Input
                      value={customer.phone}
                      placeholder="VD: 0903 123 456"
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      value={customer.email}
                      placeholder="email@congty.vn"
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    />
                  </Field>
                  <Field label="Địa chỉ lắp đặt">
                    <Input
                      value={customer.address}
                      placeholder="Số nhà, đường, phường, tỉnh/thành"
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    />
                  </Field>
                  <Field label="Ghi chú">
                    <Textarea
                      rows={3}
                      value={customer.note}
                      placeholder="Loại mái, diện tích, nhu cầu lưu trữ…"
                      onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h2 className="text-base font-bold">Tiền điện hằng tháng</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hệ thống tính ngược số kWh theo 6 bậc thang giá điện EVN.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="Tiền điện mùa hè (VNĐ)">
                    <Input
                      type="number"
                      value={summerBill}
                      onChange={(e) => setSummerBill(Number(e.target.value) || 0)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      ≈ {numberFmt.format(auto.summerKwh)} kWh
                    </p>
                  </Field>
                  <Field label="Tiền điện mùa đông (VNĐ)">
                    <Input
                      type="number"
                      value={winterBill}
                      onChange={(e) => setWinterBill(Number(e.target.value) || 0)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      ≈ {numberFmt.format(auto.winterKwh)} kWh
                    </p>
                  </Field>
                </div>

                <div className="mt-5 space-y-5">
                  <SliderField
                    label="Hệ số mùa hè"
                    value={summerFactor}
                    min={0.8}
                    max={1.6}
                    step={0.05}
                    onChange={setSummerFactor}
                  />
                  <SliderField
                    label="Hệ số mùa đông"
                    value={winterFactor}
                    min={0.5}
                    max={1.2}
                    step={0.05}
                    onChange={setWinterFactor}
                  />
                  <SliderField
                    label="Tỉ lệ điện dùng ban ngày"
                    value={dayNightRatio}
                    min={0.2}
                    max={0.95}
                    step={0.05}
                    onChange={setDayNightRatio}
                    suffix="%"
                    percent
                  />
                </div>

                <div className="mt-5 rounded-lg bg-secondary/70 p-4 text-sm">
                  <p className="flex items-center gap-2 font-semibold text-brand">
                    <Calculator className="h-4 w-4" /> Kết quả tính nhanh
                  </p>
                  <div className="mt-2 grid gap-1 text-muted-foreground">
                    <Row label="Điện tiêu thụ trung bình">
                      {numberFmt.format(auto.yieldResult.monthlyKwh)} kWh/tháng
                    </Row>
                    <Row label="Tiền điện hiện tại (gồm VAT 8%)">
                      {formatVnd(Math.round(calculateEVNMoney(auto.yieldResult.monthlyKwh, tariffs) * 1.08))}
                    </Row>
                    <Row label="Công suất khuyến nghị">
                      <span className="font-bold text-foreground">
                        {auto.yieldResult.recommendedKwp} kWp
                      </span>
                    </Row>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* AUTO */}
              <div className="rounded-xl border border-border bg-secondary/40 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold">
                    <Sparkles className="h-4 w-4 text-brand" /> AUTO – Hệ thống đề xuất
                  </h2>
                  <Badge variant="outline">Chỉ đọc</Badge>
                </div>
                <div className="mt-4 space-y-1 text-sm">
                  <Row label="Điện tiêu thụ">
                    {numberFmt.format(auto.yieldResult.monthlyKwh)} kWh/tháng
                  </Row>
                  <Row label="Dùng ban ngày">{numberFmt.format(auto.yieldResult.dayKwh)} kWh</Row>
                  <Row label="Dùng ban đêm">{numberFmt.format(auto.yieldResult.nightKwh)} kWh</Row>
                  <Row label="Công suất đề xuất">{auto.yieldResult.recommendedKwp} kWp</Row>
                  <Row label="Sản lượng PV dự kiến">
                    {numberFmt.format(auto.yieldResult.monthlyPvKwh)} kWh/tháng
                  </Row>
                  <Row label="Số tấm pin">
                    {panels[0] ? auto.yieldResult.panelCount(panelWatt(panels[0])) : 0} tấm
                  </Row>
                </div>
                <div className="mt-4 rounded-lg border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Giá trọn gói phương án AUTO (hòa lưới)
                  </p>
                  <p className="mt-1 text-xl font-black text-brand">{formatVnd(autoTotals.total)}</p>
                  <p className="text-xs text-muted-foreground">Đã gồm VAT 8%</p>
                </div>
                <table className="mt-4 w-full text-xs">
                  <tbody>
                    {autoLines.map((l) => (
                      <tr key={l.productId} className="border-t border-border/70">
                        <td className="py-2 pr-2">{l.name}</td>
                        <td className="py-2 text-right whitespace-nowrap">
                          {numberFmt.format(l.quantity)} {l.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* THỦ CÔNG */}
              <div className="rounded-xl border-2 border-brand/40 bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold">THỦ CÔNG – Tuỳ chỉnh</h2>
                  <Badge className="bg-brand text-brand-foreground">Cập nhật tức thời</Badge>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="Phương án">
                    <Select value={scenario} onValueChange={(v) => setScenario(v as QuoteScenario)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ongrid">{scenarioLabel.ongrid}</SelectItem>
                        <SelectItem value="hybrid">{scenarioLabel.hybrid}</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Công suất hệ thống (kWp)">
                    <Input
                      type="number"
                      step="0.1"
                      value={kwp}
                      onChange={(e) => {
                        setManualKwp(Number(e.target.value) || 0);
                        setOverrides({});
                      }}
                    />
                  </Field>
                  <Field label="Loại tấm pin">
                    <Select
                      value={panelId}
                      onValueChange={(v) => {
                        setPanelId(v);
                        setOverrides({});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {panels.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({panelWatt(p)}W)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Inverter">
                    <Select
                      value={inverterId}
                      onValueChange={(v) => {
                        setInverterId(v);
                        setOverrides({});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {inverters.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({inverterKw(p)}kW)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  {scenario === "hybrid" && (
                    <>
                      <Field label="Pin lưu trữ">
                        <Select
                          value={batteryId}
                          onValueChange={(v) => {
                            setBatteryId(v);
                            setOverrides({});
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {batteries.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label={`Số module pin (tổng ${storageKwh.toFixed(1)} kWh)`}>
                        <Input
                          type="number"
                          min={1}
                          value={batteryCount}
                          onChange={(e) => {
                            setBatteryCount(Math.max(1, Number(e.target.value) || 1));
                            setOverrides({});
                          }}
                        />
                      </Field>
                    </>
                  )}
                </div>

                <h3 className="mt-5 text-sm font-bold">Bảng vật tư (có thể sửa số lượng)</h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[420px] text-xs">
                    <thead className="text-left text-[11px] uppercase text-muted-foreground">
                      <tr>
                        <th className="py-2">Vật tư</th>
                        <th className="py-2 text-right">SL</th>
                        <th className="py-2 text-right">Đơn giá</th>
                        <th className="py-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualLines.map((l) => (
                        <tr key={l.productId} className="border-t border-border">
                          <td className="py-2 pr-2">
                            <p className="font-medium">{l.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {categoryLabel[l.category]} · {l.sku}
                            </p>
                          </td>
                          <td className="py-2 text-right">
                            <Input
                              type="number"
                              step="0.1"
                              className="h-8 w-20 text-right"
                              value={l.quantity}
                              onChange={(e) =>
                                setOverrides((prev) => ({
                                  ...prev,
                                  [l.productId]: Math.max(0, Number(e.target.value) || 0),
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 text-right whitespace-nowrap">
                            {numberFmt.format(l.unitPriceSnapshot)}
                          </td>
                          <td className="py-2 text-right font-semibold whitespace-nowrap">
                            {numberFmt.format(l.unitPriceSnapshot * l.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <motion.div
                  key={manualTotals.total}
                  initial={{ scale: 0.98, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="mt-5 rounded-lg bg-gradient-brand p-4 text-brand-foreground"
                >
                  <div className="flex items-baseline justify-between text-sm">
                    <span>Tạm tính</span>
                    <span>{formatVnd(manualTotals.subtotal)}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-sm">
                    <span>VAT 8%</span>
                    <span>{formatVnd(manualTotals.vatAmount)}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between border-t border-brand-foreground/30 pt-2">
                    <span className="font-semibold">Tổng cộng</span>
                    <span className="text-xl font-black">{formatVnd(manualTotals.total)}</span>
                  </div>
                </motion.div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <RoiCard
                    title={scenarioLabel.ongrid}
                    active={scenario === "ongrid"}
                    monthlySaving={roi.ongrid.monthlySaving}
                    yearlySaving={roi.ongrid.yearlySaving}
                    roiYears={roi.ongrid.roiYears}
                  />
                  <RoiCard
                    title={scenarioLabel.hybrid}
                    active={scenario === "hybrid"}
                    monthlySaving={roi.hybrid.monthlySaving}
                    yearlySaving={roi.hybrid.yearlySaving}
                    roiYears={roi.hybrid.roiYears}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h2 className="text-base font-bold">Xem lại báo giá</h2>
                <div className="mt-3 grid gap-1 text-sm">
                  <Row label="Khách hàng">{customer.name || "—"}</Row>
                  <Row label="Điện thoại">{customer.phone || "—"}</Row>
                  <Row label="Địa chỉ">{customer.address || "—"}</Row>
                  <Row label="Phương án">{scenarioLabel[scenario]}</Row>
                  <Row label="Công suất">{Math.round(kwp * 10) / 10} kWp</Row>
                  {scenario === "hybrid" && (
                    <Row label="Dung lượng lưu trữ">{storageKwh.toFixed(1)} kWh</Row>
                  )}
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">Hạng mục</th>
                        <th className="px-3 py-2 text-right">SL</th>
                        <th className="px-3 py-2 text-right">Đơn giá</th>
                        <th className="px-3 py-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualLines.map((l) => (
                        <tr key={l.productId} className="border-t border-border">
                          <td className="px-3 py-2">
                            <p className="font-medium">{l.name}</p>
                            <p className="text-xs text-muted-foreground">{l.warrantySnapshot}</p>
                          </td>
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            {numberFmt.format(l.quantity)} {l.unit}
                          </td>
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            {numberFmt.format(l.unitPriceSnapshot)}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                            {numberFmt.format(l.unitPriceSnapshot * l.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Tổng giá trị hợp đồng
                  </p>
                  <p className="mt-1 text-2xl font-black text-brand">{formatVnd(manualTotals.total)}</p>
                  <p className="text-xs text-muted-foreground">Đã gồm VAT 8%</p>
                  <div className="mt-4 space-y-1 text-sm">
                    <Row label="Tiết kiệm mỗi tháng">{formatVnd(activeRoi.monthlySaving)}</Row>
                    <Row label="Tiết kiệm mỗi năm">{formatVnd(activeRoi.yearlySaving)}</Row>
                    <Row label="Thời gian hoàn vốn">{activeRoi.roiYears} năm</Row>
                    <Row label="Lợi ích 25 năm">{formatVnd(activeRoi.savings25Years)}</Row>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={handleSave}>
                  <Save className="h-4 w-4" /> Lưu báo giá & xuất PDF
                </Button>
                <p className="text-xs text-muted-foreground">
                  Khi lưu, giá vốn và đơn giá bán được “đóng băng” theo thời điểm hiện tại.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>
        {step < 2 ? (
          <Button
            disabled={!canNext}
            onClick={() => {
              if (!canNext) return;
              setStep((s) => s + 1);
            }}
          >
            Tiếp tục <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" /> Hoàn tất
          </Button>
        )}
      </div>
      {step === 0 && !canNext && (
        <p className="mt-2 text-right text-xs text-highlight-foreground">
          Vui lòng nhập họ tên và số điện thoại khách hàng.
        </p>
      )}
    </SolarShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  percent,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
  percent?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <span className="font-bold text-brand">
          {percent ? `${Math.round(value * 100)}%` : value.toFixed(2)}
        </span>
      </div>
      <Slider
        className="mt-2"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? value)}
      />
    </div>
  );
}

function RoiCard({
  title,
  active,
  monthlySaving,
  yearlySaving,
  roiYears,
}: {
  title: string;
  active: boolean;
  monthlySaving: number;
  yearlySaving: number;
  roiYears: number;
}) {
  return (
    <div
      className={`rounded-lg border p-4 text-sm ${
        active ? "border-brand bg-brand/5" : "border-border bg-secondary/40"
      }`}
    >
      <p className="font-bold">{title}</p>
      <div className="mt-2 space-y-1 text-xs">
        <Row label="Tiết kiệm/tháng">{formatVnd(monthlySaving)}</Row>
        <Row label="Tiết kiệm/năm">{formatVnd(yearlySaving)}</Row>
        <Row label="Hoàn vốn">{roiYears} năm</Row>
      </div>
    </div>
  );
}
