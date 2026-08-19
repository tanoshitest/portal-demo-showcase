import { useEffect, useMemo, type ReactNode } from "react";
import { computeAutoCalc } from "@/data/auto-calc";
import {
  autoInverterType,
  BATTERY_TYPES,
  CABINET_TYPES,
  inverterLabel,
  inverterOptionsForPhase,
  recommendedInverterOptionsForPhase,
  type EstimateInputs,
} from "@/data/estimate";
import { getCatalogBatteryTypes, type EstimatePanelType } from "@/data/panel-catalog";
import { kwhFromBill, amountExclVat, type EvnBillResult } from "@/data/evn-bill";
import { formatVnd } from "@/lib/format";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

function money(n: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}

function TrioCols() {
  return (
    <colgroup>
      <col className="w-[52%]" />
      <col className="w-[24%]" />
      <col className="w-[24%]" />
    </colgroup>
  );
}

const colLine =
  "[&_th]:border-r [&_td]:border-r [&_th]:border-border [&_td]:border-border [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0";
const tableCls = `w-full table-fixed border-collapse text-[10px] sm:text-[11px] lg:h-full ${colLine}`;
const mobileSliderCls =
  "min-w-0 flex-1 py-2 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 lg:py-0 lg:[&_[role=slider]]:h-4 lg:[&_[role=slider]]:w-4";
const mobileSelectCls = "mt-1 h-10 px-2 text-sm sm:h-8 sm:text-xs lg:mt-0.5 lg:h-7";
const mobileInputCls = "mt-1 h-10 px-2 text-sm sm:h-8 sm:text-xs lg:mt-0.5 lg:h-7";

export function AutoCalcGrid({
  mode = "auto",
  form,
  panelOptions,
  onPanelChange,
  onInverterChange,
  onBatteryChange,
  onPatch,
  onPhaseChange,
}: {
  mode?: "auto" | "manual";
  form: EstimateInputs;
  panelOptions: EstimatePanelType[];
  onPanelChange: (panelName: string) => void;
  onInverterChange: (inverterId: string) => void;
  onBatteryChange: (batteryName: string) => void;
  onPatch: <K extends keyof EstimateInputs>(key: K, value: EstimateInputs[K]) => void;
  onPhaseChange: (phase: EstimateInputs["phase"]) => void;
}) {
  const manual = mode === "manual";
  const summerBill = manual ? form.summerBillManual : form.summerBillAuto;
  const winterBill = manual ? form.winterBillManual : form.winterBillAuto;
  const panelName = manual ? form.panelTypeManual : form.panelTypeAuto;
  const inverterId = manual ? form.inverterTypeManual : form.inverterTypeAuto;
  const batteryName = manual ? form.batteryTypeManual : form.batteryTypeAuto;
  const batteryOptions = useMemo(() => {
    const catalog = getCatalogBatteryTypes({ inStockOnly: true });
    return catalog.length ? catalog : BATTERY_TYPES;
  }, []);
  const summerNet = amountExclVat(summerBill);
  const winterNet = amountExclVat(winterBill);
  const summerEvn = useMemo(() => kwhFromBill(summerNet), [summerNet]);
  const winterEvn = useMemo(() => kwhFromBill(winterNet), [winterNet]);
  const r = useMemo(
    () =>
      computeAutoCalc({
        summerBill: summerNet,
        winterBill: winterNet,
        tariff: 2954,
        pshSummer: 4.6,
        pshWinter: 2.3,
        panelName,
        dayRate: form.dayRate,
        dischargeEff: 80,
        batteryName,
        panelCount: manual ? form.panelCountManual : 0,
        batteryQty: manual ? form.batteryQtyManual : 0,
        summerKwh: summerEvn.totalKwh,
        winterKwh: winterEvn.totalKwh,
      }),
    [form, manual, panelName, batteryName, summerNet, winterNet, summerEvn.totalKwh, winterEvn.totalKwh],
  );
  const inverterOptions = useMemo(
    () => manual
      ? inverterOptionsForPhase(form.phase)
      : recommendedInverterOptionsForPhase(form.phase, r.inverterKw),
    [form.phase, manual, r.inverterKw],
  );

  useEffect(() => {
    if (manual || inverterOptions.some((item) => item.id === form.inverterTypeAuto)) return;
    onInverterChange(autoInverterType(form.phase, r.inverterKw));
  }, [manual, form.inverterTypeAuto, form.phase, inverterOptions, onInverterChange, r.inverterKw]);

  const setCrane = (enabled: 0 | 1) => {
    onPatch("crane", enabled);
    onPatch("craneShifts", enabled ? Math.max(1, form.craneShifts) : 0);
  };

  const setRemote = (enabled: 0 | 1) => {
    onPatch("remote", enabled);
    onPatch("remoteDays", enabled ? Math.max(1, form.remoteDays) : 0);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-x-hidden border-border lg:grid lg:h-full lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)] lg:border-l">
      <div className="min-w-0 border-b border-border lg:col-span-2 lg:row-start-1 lg:border-b-0">
        <div className="grid grid-cols-2 gap-x-2 gap-y-2 p-2 text-[11px] sm:gap-y-1.5 lg:grid-cols-2 lg:p-1.5 2xl:grid-cols-12">
          <div className="contents">
            <div className="col-span-2 min-w-0 sm:col-span-1 2xl:col-span-4">
              <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                Tiền điện hè
              </Label>
              <div className="mt-0.5 flex items-end gap-2">
                <Slider
                  className={mobileSliderCls}
                  min={0}
                  max={100_000_000}
                  step={50_000}
                  value={[summerBill]}
                  onValueChange={([v]) => onPatch(manual ? "summerBillManual" : "summerBillAuto", v ?? 0)}
                />
                <p className="min-w-[5.5rem] text-right text-[11px] font-semibold tabular-nums text-foreground">
                  {money(summerBill)} đ
                </p>
              </div>
            </div>
            <div className="col-span-2 min-w-0 sm:col-span-1 2xl:col-span-4">
              <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                Tiền điện đông
              </Label>
              <div className="mt-0.5 flex items-end gap-2">
                <Slider
                  className={mobileSliderCls}
                  min={0}
                  max={100_000_000}
                  step={50_000}
                  value={[winterBill]}
                  onValueChange={([v]) => onPatch(manual ? "winterBillManual" : "winterBillAuto", v ?? 0)}
                />
                <p className="min-w-[5.5rem] text-right text-[11px] font-semibold tabular-nums text-foreground">
                  {money(winterBill)} đ
                </p>
              </div>
            </div>
          </div>

          <div className="contents">
            <div className="col-span-2 min-w-0 sm:col-span-1 2xl:col-span-4">
              <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                Ngày / đêm
              </Label>
              <div className="mt-0.5 flex items-end gap-2">
                <Slider
                  className={mobileSliderCls}
                  min={0}
                  max={100}
                  step={1}
                  value={[form.dayRate]}
                  onValueChange={([v]) => onPatch("dayRate", v ?? 0)}
                />
                <p className="min-w-[4.75rem] text-right text-[11px] tabular-nums text-muted-foreground">
                  {form.dayRate}% / {Math.max(0, 100 - form.dayRate)}%
                </p>
              </div>
            </div>
            <div className="col-span-2 min-w-0 sm:col-span-1 2xl:col-span-3">
              <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                Pha điện
              </Label>
              <div className="mt-1 flex h-10 items-center gap-3 rounded border border-border bg-card px-3 sm:h-8 lg:mt-0.5 lg:h-7 lg:gap-2 lg:px-2">
                {(["Điện 1 pha", "Điện 3 pha"] as const).map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-1 whitespace-nowrap text-[11px]"
                  >
                    <Checkbox
                      checked={form.phase === option}
                      onCheckedChange={() => onPhaseChange(option)}
                    />
                    {option.replace("Điện ", "")}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="contents">
            <div className="min-w-0 2xl:col-span-3">
              <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                Tủ điện
              </Label>
              <Select
                value={form.cabinetType}
                onValueChange={(v) => onPatch("cabinetType", v)}
              >
                <SelectTrigger className={mobileSelectCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CABINET_TYPES.map((cabinet) => (
                    <SelectItem key={cabinet} value={cabinet}>
                      {cabinet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 2xl:col-span-2">
              <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                Mái nhà
              </Label>
              <Select
                value={form.roof}
                onValueChange={(v) => onPatch("roof", v as EstimateInputs["roof"])}
              >
                <SelectTrigger className={mobileSelectCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Mái tôn", "Mái ngói", "Mái bằng"].map((roof) => (
                    <SelectItem key={roof} value={roof}>
                      {roof}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 2xl:col-span-2 2xl:row-start-3">
              <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                Cẩu pin
              </Label>
              <Select
                value={String(form.crane)}
                onValueChange={(v) => setCrane(Number(v) as 0 | 1)}
              >
                <SelectTrigger className={mobileSelectCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Không</SelectItem>
                  <SelectItem value="1">Có</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 2xl:col-span-2 2xl:row-start-3">
              <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                Số ca cẩu
              </Label>
              <Input
                className={`${mobileInputCls} disabled:bg-secondary/50`}
                type="number"
                min={form.crane ? 1 : 0}
                disabled={!form.crane}
                value={form.crane ? form.craneShifts : 0}
                onChange={(e) => onPatch("craneShifts", Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
            <div className="min-w-0 2xl:col-span-2 2xl:row-start-3">
              <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                CT xa
              </Label>
              <Select
                value={String(form.remote)}
                onValueChange={(v) => setRemote(Number(v) as 0 | 1)}
              >
                <SelectTrigger className={mobileSelectCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Không</SelectItem>
                  <SelectItem value="1">Có</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 2xl:col-span-2 2xl:row-start-3">
              <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                Số ngày CT xa
              </Label>
              <Input
                className={`${mobileInputCls} disabled:bg-secondary/50`}
                type="number"
                min={form.remote ? 1 : 0}
                disabled={!form.remote}
                value={form.remote ? form.remoteDays : 0}
                onChange={(e) => onPatch("remoteDays", Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </div>

          <div className="contents">
            <div className="col-span-2 min-w-0 sm:col-span-1 2xl:col-span-4 2xl:col-start-9 2xl:row-start-2">
              <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                Dây AC
              </Label>
              <Select value={form.acWire} onValueChange={(v) => onPatch("acWire", v)}>
                <SelectTrigger className={mobileSelectCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Dây điện 1 Pha Cadisun 2*4+1*2.5", "Dây điện 3 Pha Cadisun 4*6+1*4"].map(
                    (wire) => (
                      <SelectItem key={wire} value={wire}>
                        {wire}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 grid min-w-0 grid-cols-2 gap-2 sm:col-span-1 2xl:col-span-4 2xl:row-start-3">
              <div className="min-w-0">
                <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                  DC (m)
                </Label>
                <Input
                  className={mobileInputCls}
                  type="number"
                  min={0}
                  value={form.dcWireM}
                  onChange={(e) => onPatch("dcWireM", Number(e.target.value) || 0)}
                />
              </div>
              <div className="min-w-0">
                <Label className="text-[10px] font-medium leading-none text-muted-foreground whitespace-nowrap">
                  Ống D20 (m)
                </Label>
                <Input
                  className={mobileInputCls}
                  type="number"
                  min={0}
                  value={form.pipeM}
                  onChange={(e) => onPatch("pipeM", Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0 border-b border-border lg:col-start-1 lg:row-start-2 lg:min-h-0 lg:border-b-0 lg:border-t">
        <CalcPane title="2. Tính toán tấm pin">
          <table className={tableCls}>
            <TrioCols />
            <thead>
              <YellowHead cols={["Thông số", "Mùa hè", "Mùa đông"]} />
            </thead>
            <tbody>
              <SeasonalBillRow
                label="Tiền điện trước thuế mùa hè"
                value={summerNet}
                season="summer"
              />
              <SeasonalBillRow
                label="Tiền điện trước thuế mùa đông"
                value={winterNet}
                season="winter"
              />
              <PairRowDark label="Nhu cầu điện tiêu thụ/ngày" a={r.summerDaily} b={r.winterDaily} />
              <PairRowDark label="Hiệu suất tấm pin" a={r.pshSummer} b={r.pshWinter} />
              <PairRowDark
                label="Công suất hệ thống cần lắp"
                a={r.summerNeedKwp}
                b={r.winterNeedKwp}
              />
              <tr className="border-t border-border text-[11px] sm:text-xs text-destructive">
                <td className="whitespace-nowrap px-1.5 py-1 sm:px-2.5">Tấm pin đã chọn</td>
                <td colSpan={2} className="px-1.5 py-1 sm:px-2.5">
                  <Select
                    value={panelName}
                    onValueChange={onPanelChange}
                    disabled={panelOptions.length === 0}
                  >
                    <SelectTrigger className="h-7 border-emerald-200 bg-emerald-50 text-xs text-destructive shadow-none [&>span]:text-destructive">
                      <SelectValue
                        className="text-destructive"
                        placeholder="Không có pin còn hàng"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {panelOptions.map((panel) => (
                        <SelectItem key={panel.id} value={panel.name} className="text-destructive">
                          {panel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
              <AreaTr
                label="Công suất 1 tấm pin (kWp)"
                value={r.panelKwp}
                calc
                valueClassName="text-destructive"
                labelClassName="text-destructive"
              />
              <AreaTr
                label="Diện tích 1 tấm (m²)"
                value={r.area1}
                calc
                valueClassName="text-destructive"
                labelClassName="text-destructive"
              />
              {manual ? (
                <tr className="border-t border-border">
                  <td className="px-1.5 py-1 sm:px-2.5">Số tấm pin</td>
                  <td colSpan={2} className="px-1.5 py-1 sm:px-2.5">
                    <Input
                      className="h-7 text-right text-xs"
                      type="number"
                      min={1}
                      value={form.panelCountManual}
                      onChange={(event) =>
                        onPatch("panelCountManual", Math.max(1, Number(event.target.value) || 1))
                      }
                    />
                  </td>
                </tr>
              ) : (
                <AreaTr
                  label="Số tấm pin"
                  value={r.panelCount}
                  calc
                  labelClassName="text-foreground"
                />
              )}
              <AreaTr
                label="Tổng diện tích lắp đặt (m²)"
                value={`${r.totalArea} m2`}
                calc
                strong
                labelClassName="text-foreground"
                valueClassName="text-foreground"
              />
              <PairRowDark
                label="Dự toán số tấm pin cần lắp"
                a={r.summerPanels}
                b={r.winterPanels}
              />
              <tr className="border-t border-border bg-secondary/40">
                <td className="px-1.5 py-1 font-semibold sm:px-2.5">Chốt phương án — Số tấm pin</td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <CalcDark>{r.panelCount}</CalcDark>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-1.5 py-1 sm:px-2.5">Tổng công suất lắp đặt (kWp)</td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <CalcDark>{Math.round(r.totalKwp)}</CalcDark>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-1.5 py-1 sm:px-2.5">Công suất biến tần đề xuất</td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <CalcDark>{Math.round(r.inverterKw)}</CalcDark>
                </td>
              </tr>
              <tr className="border-t border-border text-[11px] text-destructive sm:text-xs">
                <td className="whitespace-nowrap px-1.5 py-1 sm:px-2.5">Biến tần phù hợp</td>
                <td colSpan={2} className="px-1.5 py-1 sm:px-2.5">
                  <Select value={inverterId} onValueChange={onInverterChange}>
                    <SelectTrigger className="h-7 border-emerald-200 bg-emerald-50 text-xs text-destructive shadow-none [&>span]:text-destructive">
                      <SelectValue className="text-destructive">
                        {inverterLabel(inverterId)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {inverterOptions.map((inverter) => (
                        <SelectItem
                          key={inverter.id}
                          value={inverter.id}
                          className="text-destructive"
                        >
                          {inverterLabel(inverter.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            </tbody>
          </table>
        </CalcPane>
      </div>

      <div className="min-w-0 lg:col-start-2 lg:row-start-2 lg:min-h-0 lg:border-l lg:border-t">
        <CalcPane title="4. Pin lưu trữ">
          <table className={tableCls}>
            <TrioCols />
            <thead>
              <YellowHead cols={["Thông số", "Mùa hè", "Mùa đông"]} />
            </thead>
            <tbody>
              <PairRow label="Tỷ lệ dùng ban ngày (%)" a={r.dayRate} b={r.dayRate} />
              <PairRow label="Tỷ lệ dùng ban đêm (%)" a={r.nightRate} b={r.nightRate} />
              <PairRow label="Số điện cần lưu ban đêm (kWh)" a={r.summerNight} b={r.winterNight} />
              <tr className="border-t border-border">
                <td className="px-1.5 py-1 sm:px-2.5">Hiệu suất xả pin (%)</td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <Calc>{r.dischargeEff}</Calc>
                </td>
              </tr>
              <PairRow label="Tổng dung lượng pin cần (kWh)" a={r.summerBatt} b={r.winterBatt} />
              <tr className="border-t border-border bg-secondary/40">
                <td className="px-1.5 py-1 font-semibold sm:px-2.5">
                  Tổng dung tích lựa chọn (kWh)
                </td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <Calc>{r.neededBatt}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border text-[11px] sm:text-xs">
                <td className="px-1.5 py-1 sm:px-2.5">Hãng pin đã chọn</td>
                <td colSpan={2} className="px-1.5 py-1 sm:px-2.5">
                  {manual ? (
                    <Select value={batteryName} onValueChange={onBatteryChange}>
                      <SelectTrigger className="h-7 border-emerald-200 bg-emerald-50 text-xs text-destructive shadow-none">
                        <SelectValue placeholder="Chọn pin lưu trữ" />
                      </SelectTrigger>
                      <SelectContent>
                        {batteryOptions.map((battery) => (
                          <SelectItem key={battery.id} value={battery.name}>
                            {battery.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-900">
                    <div className="space-y-1">
                      {(r.batteryCombo.items.length ? r.batteryCombo.items : [r.battery]).map(
                        (item, index) => (
                          <div key={`${item.name}-${index}`} className="font-semibold leading-snug">
                            <span className="mr-1 tabular-nums">{index + 1}.</span>
                            <span>
                              {item.name} x {(item as { qty?: number }).qty ?? r.batteryQty}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                    </div>
                  )}
                </td>
              </tr>
              <KVRow label="Dung tích pin (kWh/bộ)" value={r.battery.kwh} calc span />
              {manual ? (
                <tr className="border-t border-border">
                  <td className="px-1.5 py-1 sm:px-2.5">Số lượng</td>
                  <td colSpan={2} className="px-1.5 py-1 sm:px-2.5">
                    <Input
                      className="h-7 text-right text-xs"
                      type="number"
                      min={1}
                      value={form.batteryQtyManual}
                      onChange={(event) =>
                        onPatch("batteryQtyManual", Math.max(1, Number(event.target.value) || 1))
                      }
                    />
                  </td>
                </tr>
              ) : (
                <KVRow label="Số lượng" value={r.batteryQty} calc span />
              )}
              <KVRow label="Tổng dung tích (kWh)" value={r.totalBatt} calc strong span />
              <tr className="border-t border-border text-[11px] sm:text-xs">
                <td className="px-1.5 py-1 sm:px-2.5">Tổng giá pin</td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <Calc>{formatVnd(r.lineTotal)}</Calc>
                </td>
              </tr>
            </tbody>
          </table>
        </CalcPane>
      </div>
    </div>
  );
}

export function EstimateCalcTables({
  mode = "auto",
  form,
  onPanelChange,
}: {
  mode?: "auto" | "manual";
  form: EstimateInputs;
  onPanelChange: (panelName: string) => void;
}) {
  const summerEvn = useMemo(
    () => kwhFromBill(amountExclVat(mode === "auto" ? form.summerBillAuto : form.summerBillManual)),
    [form.summerBillAuto, form.summerBillManual, mode],
  );
  const winterEvn = useMemo(
    () => kwhFromBill(amountExclVat(mode === "auto" ? form.winterBillAuto : form.winterBillManual)),
    [form.winterBillAuto, form.winterBillManual, mode],
  );

  return (
    <section className="min-h-0 min-w-0 overflow-x-hidden rounded-none border border-border bg-card">
      <div className="bg-brand-dark px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-foreground sm:px-4 sm:py-2">
        Bảng tính tự động tiền điện
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2">
        <EvnTable title="Tính kWh từ tiền điện mùa hè" result={summerEvn} />
        <EvnTable title="Tính kWh từ tiền điện mùa đông" result={winterEvn} winter />
      </div>
    </section>
  );
}

function EvnTable({
  title,
  result,
  winter,
}: {
  title: string;
  result: EvnBillResult;
  winter?: boolean;
}) {
  return (
    <div
      className={winter ? "min-w-0" : "min-w-0 border-b border-border xl:border-b-0 xl:border-r"}
    >
      <SubHead>{title}</SubHead>
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-[11px] sm:px-3 sm:py-2 sm:text-xs">
        <span className="text-muted-foreground">Tiền điện tháng (VNĐ)</span>
        <span className="font-semibold tabular-nums">{money(result.bill)}</span>
      </div>
      <p className="px-2 pb-1.5 text-[10px] text-muted-foreground sm:px-3 sm:pb-2 sm:text-[11px]">
        Đang lấy dữ liệu từ: Số tiền điện
      </p>
      <p className="border-t border-border px-2 py-1 text-right text-[10px] text-muted-foreground sm:hidden">
        Vuốt ngang để xem đủ cột
      </p>
      <div className="touch-pan-x overflow-x-auto overscroll-x-contain">
        <table
          className={`w-full min-w-[520px] table-fixed border-collapse text-[11px] sm:min-w-0 sm:text-xs ${colLine}`}
        >
          <thead>
            <YellowHead cols={["Bậc", "Điện tiêu thụ", "Giá chưa VAT", "Số kWh", "Tiền (đ)"]} />
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.bac} className="border-t border-border">
                <td className="px-1.5 py-1.5 sm:px-3">Bậc {row.bac}</td>
                <td className="whitespace-nowrap px-1.5 py-1.5 text-center sm:px-3">
                  {row.consumption}
                </td>
                <td className="whitespace-nowrap px-1.5 py-1.5 text-right tabular-nums sm:px-3">
                  {money(row.price)} đ/kWh
                </td>
                <td className="px-1.5 py-1.5 text-right sm:px-3">
                  <Calc>{row.kwh}</Calc>
                </td>
                <td className="px-1.5 py-1.5 text-right sm:px-3">
                  <Calc>{money(row.cost)}</Calc>
                </td>
              </tr>
            ))}
            <tr className="border-t border-border bg-secondary/50">
              <td colSpan={3} className="px-1.5 py-1.5 font-semibold sm:px-3">
                Giá trị tổng
              </td>
              <td className="px-1.5 py-1.5 text-right sm:px-3">
                <Calc>{result.totalKwh}</Calc>
              </td>
              <td className="px-1.5 py-1.5 text-right sm:px-3">
                <Calc>{money(result.totalCost)}</Calc>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalcPane({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex h-full min-h-0 flex-col ${className ?? ""}`}>
      <SubHead>{title}</SubHead>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function SubHead({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 overflow-hidden bg-secondary px-2 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-[11px]">
      {children}
    </div>
  );
}

function YellowHead({ cols }: { cols: Array<string | { label: string; span?: number }> }) {
  return (
    <tr className="bg-amber-100 text-[10px] font-bold uppercase text-amber-950">
      {cols.map((c) => {
        const label = typeof c === "string" ? c : c.label;
        const span = typeof c === "string" ? 1 : (c.span ?? 1);
        return (
          <th
            key={label}
            colSpan={span}
            className="overflow-hidden px-1.5 py-1 text-left leading-tight"
          >
            {label}
          </th>
        );
      })}
    </tr>
  );
}

function Calc({ children }: { children: ReactNode }) {
  return <span className="font-semibold tabular-nums text-destructive">{children}</span>;
}

function CalcDark({ children }: { children: ReactNode }) {
  return <span className="font-semibold tabular-nums text-foreground">{children}</span>;
}

function AreaTr({
  label,
  value,
  calc,
  strong,
  valueClassName,
  labelClassName,
}: {
  label: string;
  value: string | number;
  calc?: boolean;
  strong?: boolean;
  valueClassName?: string;
  labelClassName?: string;
}) {
  return (
    <tr className="border-t border-border text-[11px] sm:text-xs">
      <td
        className={`px-1.5 py-1 leading-tight sm:px-2 ${strong ? "font-semibold" : ""} ${labelClassName ?? ""}`}
      >
        {label}
      </td>
      <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2">
        {calc ? (
          <Calc>{value}</Calc>
        ) : (
          <span className={`tabular-nums ${valueClassName ?? ""}`}>{value}</span>
        )}
      </td>
    </tr>
  );
}

function PairRow({ label, a, b }: { label: string; a: number; b: number }) {
  return (
    <tr className="border-t border-border">
      <td className="px-1.5 py-1 leading-tight sm:px-2.5">{label}</td>
      <td className="px-1.5 py-1 text-right sm:px-2.5">
        <Calc>{a}</Calc>
      </td>
      <td className="px-1.5 py-1 text-right sm:px-2.5">
        <Calc>{b}</Calc>
      </td>
    </tr>
  );
}

function PairRowDark({ label, a, b }: { label: string; a: number; b: number }) {
  return (
    <tr className="border-t border-border">
      <td className="px-1.5 py-1 leading-tight sm:px-2.5">{label}</td>
      <td className="px-1.5 py-1 text-right sm:px-2.5">
        <CalcDark>{a}</CalcDark>
      </td>
      <td className="px-1.5 py-1 text-right sm:px-2.5">
        <CalcDark>{b}</CalcDark>
      </td>
    </tr>
  );
}

function SeasonalBillRow({
  label,
  value,
  season,
}: {
  label: string;
  value: number;
  season: "summer" | "winter";
}) {
  return (
    <tr className="border-t border-border">
      <td className="px-1.5 py-1 leading-tight sm:px-2.5">{label}</td>
      <td className="whitespace-nowrap px-1.5 py-1 text-right sm:px-2.5">
        {season === "summer" ? <CalcDark>{money(value)} đ</CalcDark> : "-"}
      </td>
      <td className="whitespace-nowrap px-1.5 py-1 text-right sm:px-2.5">
        {season === "winter" ? <CalcDark>{money(value)} đ</CalcDark> : "-"}
      </td>
    </tr>
  );
}

function KVRow({
  label,
  value,
  calc,
  strong,
  span,
}: {
  label: string;
  value: string | number;
  calc?: boolean;
  strong?: boolean;
  span?: boolean;
}) {
  return (
    <tr className="border-t border-border">
      <td className={`px-1.5 py-1 sm:px-2.5 ${strong ? "font-semibold" : ""}`}>{label}</td>
      <td colSpan={span ? 2 : 1} className="px-1.5 py-1 text-right sm:px-2.5">
        {calc ? <Calc>{value}</Calc> : <span className="tabular-nums">{value}</span>}
      </td>
    </tr>
  );
}
