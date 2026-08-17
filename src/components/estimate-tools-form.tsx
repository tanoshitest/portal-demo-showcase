import { useEffect, useMemo, useState } from "react";
import { FileText, ImageOff } from "lucide-react";
import {
  AC_WIRES,
  autoAcWire,
  autoCabinetType,
  loadEstimateInputs,
  saveEstimateInputs,
  type EstimateInputs,
} from "@/data/estimate";
import { buildEstimateQuote } from "@/data/estimate-quote";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutoCalcGrid, EstimateCalcTables } from "@/components/estimate-calc-tables";
import { loadSolarQuotes, makeEstimateQuote, saveSolarQuotes } from "@/data/solar-quotes";

export function EstimateToolsForm() {
  const [form, setForm] = useState<EstimateInputs>(() => loadEstimateInputs());

  useEffect(() => {
    saveEstimateInputs(form);
  }, [form]);

  const patch = <K extends keyof EstimateInputs>(key: K, value: EstimateInputs[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setPhase = (phase: EstimateInputs["phase"]) => {
    setForm((prev) => ({
      ...prev,
      phase,
      acWire: autoAcWire(phase),
      cabinetType: autoCabinetType(phase),
    }));
  };

  const save = () => {
    saveEstimateInputs(form);
    const total = buildEstimateQuote(form).total;
    const quote = makeEstimateQuote({
      customer: form.customer,
      phone: form.phone,
      address: form.address,
      systemTitle: `${form.phase} · ${form.panelTypeManual} · ${form.roof}`,
      summary: `Dự toán ${form.phase.toLowerCase()} · ${form.panelCountManual} tấm pin · ${form.inverterKwManual}kW`,
      total,
    });
    const next = [quote, ...loadSolarQuotes()];
    saveSolarQuotes(next);
    toast.success("Đã lưu dự toán và tạo báo giá mới", {
      description: quote.code,
    });
  };

  return (
    <Tabs defaultValue="du-toan" className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border sm:h-9 sm:gap-3">
        <TabsList className="h-11 min-w-0 flex-1 justify-start rounded-none bg-transparent p-0 sm:h-9 sm:flex-none">
          <TabsTrigger
            value="du-toan"
            className="h-11 rounded-none border-b-2 border-transparent px-2.5 text-[13px] shadow-none data-[state=active]:border-brand-dark data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:h-9 sm:px-4 sm:text-sm"
          >
            Dự toán
          </TabsTrigger>
          <TabsTrigger
            value="bang-tinh-tien-dien"
            className="h-11 rounded-none border-b-2 border-transparent px-2.5 text-[13px] shadow-none data-[state=active]:border-brand-dark data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:h-9 sm:px-4 sm:text-sm"
          >
            Bảng tính tiền điện
          </TabsTrigger>
        </TabsList>
        <Button
          type="button"
          size="sm"
          className="h-9 shrink-0 touch-manipulation rounded-none px-4 sm:h-7 sm:px-3"
          onClick={save}
        >
          Lưu
        </Button>
      </div>

      <TabsContent
        value="du-toan"
        className="mt-0 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <section className="grid min-h-0 min-w-0 grid-cols-1 gap-3 xl:h-full xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.68fr)] xl:items-stretch">
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-none border border-border bg-card xl:h-full">
            <div className="shrink-0 bg-brand-dark px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-foreground sm:px-4 sm:py-1.5">
              Bảng tính AUTO
            </div>
            <AutoCalcGrid
              form={form}
              onPanelChange={(panelName) => patch("panelTypeAuto", panelName)}
              onBatteryChange={(batteryName) => patch("batteryTypeAuto", batteryName)}
              onPatch={patch}
              onPhaseChange={setPhase}
            />
          </div>

          <QuoteEstimatePanel form={form} onPatch={patch} />
        </section>
      </TabsContent>

      <TabsContent
        value="bang-tinh-tien-dien"
        className="mt-0 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <EstimateCalcTables
          form={form}
          onPanelChange={(panelName) => patch("panelTypeAuto", panelName)}
        />
      </TabsContent>
    </Tabs>
  );
}

function QuoteEstimatePanel({
  form,
  onPatch,
}: {
  form: EstimateInputs;
  onPatch: <K extends keyof EstimateInputs>(key: K, value: EstimateInputs[K]) => void;
}) {
  const { rows: quoteRows, total: quoteTotal } = useMemo(() => buildEstimateQuote(form), [form]);

  return (
    <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-none border border-border bg-card xl:h-full">
      <div className="shrink-0 bg-brand-dark px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-foreground sm:px-4 sm:py-1.5">
        Dự toán báo giá
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2 sm:p-2.5">
        <section className="grid grid-cols-1 gap-2 rounded-none border border-border bg-secondary/25 p-2 sm:grid-cols-3 sm:gap-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-dark sm:col-span-3 sm:text-[10px]">
            <FileText className="h-3.5 w-3.5" />
            Thông tin khách hàng
          </div>
          <Field label="Tên khách hàng">
            <Input
              className="h-10 min-w-0 px-3 text-sm sm:h-8 sm:px-2 sm:text-xs"
              value={form.customer}
              onChange={(e) => onPatch("customer", e.target.value)}
              placeholder="Tên khách hàng"
            />
          </Field>
          <Field label="Địa chỉ">
            <Input
              className="h-10 min-w-0 px-3 text-sm sm:h-8 sm:px-2 sm:text-xs"
              value={form.address}
              onChange={(e) => onPatch("address", e.target.value)}
              placeholder="Địa chỉ"
            />
          </Field>
          <Field label="SĐT">
            <Input
              className="h-10 min-w-0 px-3 text-sm sm:h-8 sm:px-2 sm:text-xs"
              value={form.phone}
              onChange={(e) => onPatch("phone", e.target.value)}
              placeholder="Số điện thoại"
            />
          </Field>
        </section>

        <p className="text-right text-[10px] text-muted-foreground sm:hidden">
          Vuốt ngang để xem đủ cột
        </p>
        <div className="touch-pan-x overflow-x-auto overscroll-x-contain rounded-none border-2 border-brand-dark">
          <table className="w-full min-w-[620px] table-fixed border-collapse text-[10px] [&_tbody_td]:border-r [&_tbody_td]:border-border [&_tbody_td:last-child]:border-r-0 md:min-w-0 sm:text-[11px]">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[24%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="bg-amber-100 text-[10px] font-bold uppercase text-amber-950">
                <th className="border border-border px-1 py-1 text-center">STT</th>
                <th className="border border-border px-1 py-1 text-left">Sản phẩm</th>
                <th className="border border-border px-1 py-1 text-center">Ảnh</th>
                <th className="border border-border px-1 py-1 text-center">ĐVT</th>
                <th className="border border-border px-1 py-1 text-right">Đơn giá</th>
                <th className="border border-border px-1 py-1 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {quoteRows.map((row) => (
                <tr key={row.no} className="border-t border-border align-top">
                  <td className="px-1 py-1.5 text-center tabular-nums font-semibold">{row.no}</td>
                  <td className="px-1 py-1.5 font-medium leading-tight">{row.name}</td>
                  <td className="px-1 py-1.5">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-none border border-dashed border-border bg-secondary/30 text-[10px] text-muted-foreground">
                      <ImageOff className="h-3.5 w-3.5" />
                    </div>
                  </td>
                  <td className={cn("px-1 py-1.5 text-center", row.no === "6" && "!border-r")}>
                    {row.unit}
                  </td>
                  {row.priceRowSpan ? (
                    <>
                      <td
                        rowSpan={row.priceRowSpan}
                        className="px-1 py-1.5 text-right align-middle tabular-nums"
                      >
                        {formatVnd(row.unitPrice)}
                      </td>
                      <td
                        rowSpan={row.priceRowSpan}
                        className="px-1 py-1.5 text-right align-middle font-semibold tabular-nums"
                      >
                        {formatVnd(row.total)}
                      </td>
                    </>
                  ) : row.hidePrices ? null : (
                    <>
                      <td className="px-1 py-1.5 text-right tabular-nums">
                        {formatVnd(row.unitPrice)}
                      </td>
                      <td className="px-1 py-1.5 text-right font-semibold tabular-nums">
                        {formatVnd(row.total)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-brand-dark bg-amber-100 text-[11px] font-bold text-amber-950">
                <td colSpan={4} className="border-r border-border px-2 py-1.5 text-left uppercase">
                  Tổng tiền
                </td>
                <td
                  colSpan={2}
                  className="whitespace-nowrap px-1 py-1.5 text-right tabular-nums text-destructive"
                >
                  {formatVnd(quoteTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </aside>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid min-w-0 gap-0.5", className)}>
      <Label className="text-[10px] font-medium leading-none text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
