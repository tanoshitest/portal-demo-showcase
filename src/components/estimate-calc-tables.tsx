import { useMemo, type ReactNode } from "react";
import { computeAutoCalc } from "@/data/auto-calc";
import { kwhFromBill, amountExclVat, type EvnBillResult } from "@/data/evn-bill";
import { formatVnd } from "@/lib/format";
import type { EstimateInputs } from "@/data/estimate";

function money(n: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}

function TrioCols() {
  return (
    <colgroup>
      <col className="w-[36%]" />
      <col className="w-[32%]" />
      <col className="w-[32%]" />
    </colgroup>
  );
}

function FillRow() {
  return (
    <tr className="hidden h-full lg:table-row">
      <td className="p-0" />
      <td className="p-0" />
      <td className="p-0" />
    </tr>
  );
}

const colLine =
  "[&_th]:border-r [&_td]:border-r [&_th]:border-border [&_td]:border-border [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0";

const gridLine =
  "[&>div]:border-r [&>div]:border-border [&>div:last-child]:border-r-0";

const tableCls = `w-full table-fixed border-collapse text-[11px] sm:text-xs lg:h-full ${colLine}`;
const trio = "grid grid-cols-[minmax(0,36%)_minmax(0,32%)_minmax(0,32%)]";
const duo = "grid grid-cols-[minmax(0,36%)_minmax(0,64%)]";

export function AutoCalcGrid({ form }: { form: EstimateInputs }) {
  const summerNet = amountExclVat(form.summerBillAuto);
  const winterNet = amountExclVat(form.winterBillAuto);
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
        panelName: form.panelTypeAuto,
        dayRate: form.dayRate,
        dischargeEff: 80,
        batteryName: form.batteryTypeAuto,
        panelCount: 0,
        batteryQty: 0,
        summerKwh: summerEvn.totalKwh,
        winterKwh: winterEvn.totalKwh,
      }),
    [form, summerNet, winterNet, summerEvn.totalKwh, winterEvn.totalKwh],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-x-hidden border-border lg:grid lg:h-full lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)] lg:border-l">
      <div className="min-w-0 border-b border-border lg:col-start-1 lg:row-start-1 lg:border-b-0">
        <SubHead>1. Thông tin tiền điện</SubHead>
        <div
          className={`${trio} ${gridLine} bg-amber-100 text-[10px] font-bold uppercase text-amber-950`}
        >
          <div className="overflow-hidden px-1.5 py-1 leading-tight sm:py-1.5">Thông tin</div>
          <div className="overflow-hidden px-1.5 py-1 leading-tight sm:py-1.5">Số tiền (chưa thuế)</div>
          <div className="overflow-hidden px-1.5 py-1 leading-tight sm:py-1.5">Số kWh phải mua</div>
        </div>
        <BillBand season="mùa hè" amount={summerNet} kwh={summerEvn.totalKwh} />
        <BillBand season="mùa đông" amount={winterNet} kwh={winterEvn.totalKwh} />
      </div>

      <div className="min-w-0 border-b border-border lg:col-start-1 lg:row-start-2 lg:min-h-0 lg:border-b-0 lg:border-t">
        <CalcPane title="2. Tính toán tấm pin">
          <table className={tableCls}>
            <TrioCols />
            <thead>
              <YellowHead cols={["Thông số", "Mùa hè", "Mùa đông"]} />
            </thead>
            <tbody>
              <PairRow label="Nhu cầu điện tiêu thụ/ngày (kWh)" a={r.summerDaily} b={r.winterDaily} />
              <PairRow label="Hiệu suất tấm pin (giờ nắng đỉnh)" a={r.pshSummer} b={r.pshWinter} />
              <PairRow label="Công suất hệ thống cần lắp (kWp)" a={r.summerNeedKwp} b={r.winterNeedKwp} />
              <tr className="border-t border-border">
                <td className="px-1.5 py-1 sm:px-2.5">Công suất 1 tấm pin (kWp)</td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <Calc>{r.panelKwp}</Calc>
                </td>
              </tr>
              <PairRow label="Dự toán số tấm pin cần lắp" a={r.summerPanels} b={r.winterPanels} />
              <tr className="border-t border-border bg-secondary/40">
                <td className="px-1.5 py-1 font-semibold sm:px-2.5">Chốt phương án — Số tấm pin</td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <Calc>{r.panelCount}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-1.5 py-1 sm:px-2.5">Tổng công suất lắp đặt (kWp)</td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <Calc>{r.totalKwp}</Calc>
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-1.5 py-1 sm:px-2.5">Công suất biến tần đề xuất (kW)</td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <Calc>{r.inverterKw}</Calc>
                </td>
              </tr>
              <FillRow />
            </tbody>
          </table>
        </CalcPane>
      </div>

      <div className="min-w-0 border-b border-border max-lg:border-t-2 lg:col-start-2 lg:row-start-1 lg:border-b-0 lg:border-l">
        <SubHead>3. Diện tích lắp đặt</SubHead>
        <div
          className={`${duo} ${gridLine} bg-amber-100 text-[10px] font-bold uppercase text-amber-950`}
        >
          <div className="overflow-hidden px-1.5 py-1 leading-tight sm:py-1.5">Dữ liệu tấm pin</div>
          <div className="overflow-hidden px-1.5 py-1 leading-tight sm:py-1.5">Giá trị</div>
        </div>
        <AreaBand label="Tấm pin đã chọn" value={r.panel.name} />
        <AreaBand label="Diện tích 1 tấm (m²)" value={r.area1} calc />
        <AreaBand label="Số tấm pin" value={r.panelCount} calc />
        <AreaBand label="Tổng diện tích lắp đặt (m²)" value={r.totalArea} calc strong />
      </div>

      <div className="min-w-0 lg:col-start-2 lg:row-start-2 lg:min-h-0 lg:border-l lg:border-t">
        <CalcPane title="4. Pin lưu trữ">
          <table className={tableCls}>
            <TrioCols />
            <thead>
              <YellowHead cols={["Thông số", "Mùa hè", "Mùa đông"]} />
            </thead>
            <tbody>
              <PairRow label="Tỉ lệ dùng ban ngày (%)" a={r.dayRate} b={r.dayRate} />
              <PairRow label="Tỉ lệ dùng ban đêm (%)" a={r.nightRate} b={r.nightRate} />
              <PairRow label="Số điện cần lưu ban đêm (kWh)" a={r.summerNight} b={r.winterNight} />
              <tr className="border-t border-border">
                <td className="px-1.5 py-1 sm:px-2.5">Hiệu suất xả pin (%)</td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <Calc>{r.dischargeEff}</Calc>
                </td>
              </tr>
              <PairRow label="Tổng dung lượng pin cần (kWh)" a={r.summerBatt} b={r.winterBatt} />
              <tr className="border-t border-border bg-secondary/40">
                <td className="px-1.5 py-1 font-semibold sm:px-2.5">Tổng dung tích lựa chọn (kWh)</td>
                <td colSpan={2} className="px-1.5 py-1 text-right sm:px-2.5">
                  <Calc>{r.neededBatt}</Calc>
                </td>
              </tr>
              <KVRow label="Hãng pin" value={r.battery.name} span />
              <KVRow label="Dung tích pin (kWh/bộ)" value={r.battery.kwh} calc span />
              <KVRow label="Số lượng" value={r.batteryQty} calc span />
              <KVRow label="Tổng dung tích (kWh)" value={r.totalBatt} calc strong span />
              <KVRow label="Giá tiền" value={formatVnd(r.unitPrice)} calc span />
              <KVRow label="Thành tiền" value={formatVnd(r.lineTotal)} calc strong span />
              <FillRow />
            </tbody>
          </table>
        </CalcPane>
      </div>
    </div>
  );
}

export function EstimateCalcTables({ form }: { form: EstimateInputs }) {
  const summerEvn = useMemo(
    () => kwhFromBill(amountExclVat(form.summerBillAuto)),
    [form.summerBillAuto],
  );
  const winterEvn = useMemo(
    () => kwhFromBill(amountExclVat(form.winterBillAuto)),
    [form.winterBillAuto],
  );

  return (
    <section className="min-h-0 min-w-0 overflow-x-hidden rounded-none border border-border bg-card">
      <div className="bg-brand-dark px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-foreground sm:px-4 sm:py-2">
        Bảng tính tự động tiền điện
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
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
    <div className={winter ? "" : "border-b border-border lg:border-b-0 lg:border-r"}>
      <SubHead>{title}</SubHead>
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-[11px] sm:px-3 sm:py-2 sm:text-xs">
        <span className="text-muted-foreground">Tiền điện tháng (VNĐ)</span>
        <span className="font-semibold tabular-nums">{money(result.bill)}</span>
      </div>
      <p className="px-2 pb-1.5 text-[10px] text-muted-foreground sm:px-3 sm:pb-2 sm:text-[11px]">
        Đang lấy dữ liệu từ: Số tiền điện
      </p>
      <table className={`w-full table-fixed border-collapse text-[11px] sm:text-xs ${colLine}`}>
        <thead>
          <YellowHead cols={["Bậc", "Giá (đ/kWh)", "Giới hạn", "Số kWh", "Tiền (đ)"]} />
        </thead>
        <tbody>
          {result.rows.map((row) => (
            <tr key={row.bac} className="border-t border-border">
              <td className="px-1.5 py-1 sm:px-3 sm:py-1.5">Bậc {row.bac}</td>
              <td className="px-1.5 py-1 text-right tabular-nums sm:px-3 sm:py-1.5">{money(row.price)}</td>
              <td className="px-1.5 py-1 text-right tabular-nums sm:px-3 sm:py-1.5">{row.limit}</td>
              <td className="px-1.5 py-1 text-right sm:px-3 sm:py-1.5">
                <Calc>{row.kwh}</Calc>
              </td>
              <td className="px-1.5 py-1 text-right sm:px-3 sm:py-1.5">
                <Calc>{money(row.cost)}</Calc>
              </td>
            </tr>
          ))}
          <tr className="border-t border-border bg-secondary/50">
            <td colSpan={3} className="px-1.5 py-1 font-semibold sm:px-3 sm:py-1.5">
              Giá trị tổng
            </td>
            <td className="px-1.5 py-1 text-right sm:px-3 sm:py-1.5">
              <Calc>{result.totalKwh}</Calc>
            </td>
            <td className="px-1.5 py-1 text-right sm:px-3 sm:py-1.5">
              <Calc>{money(result.totalCost)}</Calc>
            </td>
          </tr>
        </tbody>
      </table>
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
    <div className="shrink-0 overflow-hidden bg-secondary px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide sm:text-[11px]">
      {children}
    </div>
  );
}

function YellowHead({
  cols,
}: {
  cols: Array<string | { label: string; span?: number }>;
}) {
  return (
    <tr className="bg-amber-100 text-[10px] font-bold uppercase text-amber-950">
      {cols.map((c) => {
        const label = typeof c === "string" ? c : c.label;
        const span = typeof c === "string" ? 1 : (c.span ?? 1);
        return (
          <th key={label} colSpan={span} className="overflow-hidden px-1.5 py-1.5 text-left leading-tight">
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

function BillBand({
  season,
  amount,
  kwh,
}: {
  season: string;
  amount: number;
  kwh: number;
}) {
  return (
    <div className={`${trio} ${gridLine} border-t border-border text-[11px] sm:text-xs`}>
      <div className="flex items-center px-1.5 py-1 leading-tight sm:px-2">
        Tiền điện hàng tháng
        <br />
        {season}
      </div>
      <div className="flex items-center justify-end px-1.5 tabular-nums sm:px-2">{money(amount)}</div>
      <div className="flex items-center justify-end px-1.5 sm:px-2">
        <Calc>{kwh}</Calc>
      </div>
    </div>
  );
}

function AreaBand({
  label,
  value,
  calc,
  strong,
}: {
  label: string;
  value: string | number;
  calc?: boolean;
  strong?: boolean;
}) {
  return (
    <div className={`${duo} ${gridLine} border-t border-border text-[11px] sm:text-xs`}>
      <div className={`flex items-center px-1.5 py-1 sm:px-2 ${strong ? "font-semibold" : ""}`}>{label}</div>
      <div className="flex items-center justify-end px-1.5 sm:px-2">
        {calc ? <Calc>{value}</Calc> : <span className="tabular-nums">{value}</span>}
      </div>
    </div>
  );
}

function PairRow({ label, a, b }: { label: string; a: number; b: number }) {
  return (
    <tr className="border-t border-border">
      <td className="px-1.5 py-1 sm:px-2.5">{label}</td>
      <td className="px-1.5 py-1 text-right sm:px-2.5">
        <Calc>{a}</Calc>
      </td>
      <td className="px-1.5 py-1 text-right sm:px-2.5">
        <Calc>{b}</Calc>
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
