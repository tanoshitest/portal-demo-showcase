import { useEffect, useMemo, useState } from "react";
import { FileText, ImageOff } from "lucide-react";
import {
  AC_WIRES,
  autoAcWire,
  autoCabinetType,
  autoInverterType,
  loadEstimateInputs,
  saveEstimateInputs,
  type EstimateInputs,
} from "@/data/estimate";
import { buildEstimateQuote } from "@/data/estimate-quote";
import { getAvailablePanelTypes } from "@/data/panel-catalog";
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

export function EstimateToolsForm({ mode = "auto" }: { mode?: "auto" | "manual" }) {
  const [form, setForm] = useState<EstimateInputs>(() => loadEstimateInputs());
  const [panelOptions] = useState(getAvailablePanelTypes);

  useEffect(() => {
    saveEstimateInputs(form);
  }, [form]);

  useEffect(() => {
    const fallbackPanel = panelOptions[0];
    if (!fallbackPanel) return;
    const availableNames = new Set(panelOptions.map((panel) => panel.name));
    setForm((current) => {
      const panelTypeAuto = availableNames.has(current.panelTypeAuto)
        ? current.panelTypeAuto
        : fallbackPanel.name;
      const panelTypeManual = availableNames.has(current.panelTypeManual)
        ? current.panelTypeManual
        : fallbackPanel.name;
      if (panelTypeAuto === current.panelTypeAuto && panelTypeManual === current.panelTypeManual) {
        return current;
      }
      return { ...current, panelTypeAuto, panelTypeManual };
    });
  }, [panelOptions]);

  const patch = <K extends keyof EstimateInputs>(key: K, value: EstimateInputs[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setPhase = (phase: EstimateInputs["phase"]) => {
    setForm((prev) => ({
      ...prev,
      phase,
      acWire: autoAcWire(phase),
      cabinetType: autoCabinetType(phase),
      inverterTypeAuto: autoInverterType(phase, buildEstimateQuote(prev).calc.inverterKw),
      inverterTypeManual: "",
    }));
  };

  const save = () => {
    saveEstimateInputs(form);
    const total = buildEstimateQuote(form, mode).total;
    const quote = makeEstimateQuote({
      customer: form.customer,
      phone: form.phone,
      address: form.address,
      systemTitle: `${form.phase} · ${mode === "auto" ? form.panelTypeAuto : form.panelTypeManual} · ${form.roof}`,
      summary: `Dự toán ${mode === "auto" ? "Auto" : "thủ công"} · ${form.phase.toLowerCase()}`,
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
              {mode === "auto" ? "Bảng tính AUTO" : "Bảng tính thủ công"}
            </div>
            <AutoCalcGrid
              mode={mode}
              form={form}
              panelOptions={panelOptions}
              onPanelChange={(panelName) => patch(mode === "auto" ? "panelTypeAuto" : "panelTypeManual", panelName)}
              onInverterChange={(inverterId) => patch(mode === "auto" ? "inverterTypeAuto" : "inverterTypeManual", inverterId)}
              onBatteryChange={(batteryName) => patch(mode === "auto" ? "batteryTypeAuto" : "batteryTypeManual", batteryName)}
              onPatch={patch}
              onPhaseChange={setPhase}
            />
          </div>

          <QuoteEstimatePanel form={form} mode={mode} onPatch={patch} />
        </section>
      </TabsContent>

      <TabsContent
        value="bang-tinh-tien-dien"
        className="mt-0 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <EstimateCalcTables
          mode={mode}
          form={form}
          onPanelChange={(panelName) =>
            patch(mode === "auto" ? "panelTypeAuto" : "panelTypeManual", panelName)
          }
        />
      </TabsContent>
    </Tabs>
  );
}

function QuoteEstimatePanel({
  form,
  mode,
  onPatch,
}: {
  form: EstimateInputs;
  mode: "auto" | "manual";
  onPatch: <K extends keyof EstimateInputs>(key: K, value: EstimateInputs[K]) => void;
}) {
  const { rows: quoteRows, total: quoteTotal } = useMemo(
    () => buildEstimateQuote(form, mode),
    [form, mode],
  );

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

        <div className="overflow-x-hidden rounded-none border-2 border-brand-dark">
          <table className="w-full table-fixed border-collapse text-[6.5px] leading-tight [&_tbody_td]:border-r [&_tbody_td]:border-border [&_tbody_td:last-child]:border-r-0 sm:text-[11px] sm:leading-normal">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[27%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
              <col className="w-[9%]" />
              <col className="w-[18%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="bg-amber-100 text-[6.5px] font-bold uppercase leading-tight text-amber-950 sm:text-[10px]">
                <th className="border border-border px-0.5 py-1.5 text-center sm:px-1 sm:py-1">STT</th>
                <th className="border border-border px-0.5 py-1.5 text-left sm:px-1 sm:py-1">Sản phẩm</th>
                <th className="border border-border px-0.5 py-1.5 text-center sm:px-1 sm:py-1">Ảnh</th>
                <th className="border border-border px-0.5 py-1.5 text-center sm:px-1 sm:py-1">ĐVT</th>
                <th className="border border-border px-0.5 py-1.5 text-center sm:px-1 sm:py-1">SL</th>
                <th className="border border-border px-0.5 py-1.5 text-right sm:px-1 sm:py-1">Đơn giá</th>
                <th className="border border-border px-0.5 py-1.5 text-right sm:px-1 sm:py-1">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {quoteRows.map((row) => (
                <tr key={row.no} className="border-t border-border align-top">
                  <td className="px-0.5 py-1.5 text-center tabular-nums font-semibold sm:px-1">{row.no}</td>
                  <td className="break-words px-0.5 py-1.5 font-medium leading-tight sm:px-1">{row.name}</td>
                  <td className="px-0.5 py-1.5 sm:px-1">
                    <div className="mx-auto flex h-7 w-7 items-center justify-center border border-dashed border-border bg-secondary/30 text-muted-foreground sm:h-9 sm:w-9">
                      <ImageOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </div>
                  </td>
                  <td className={cn("px-1 py-1.5 text-center", row.no === "6" && "!border-r")}>
                    {row.unit}
                  </td>
                  <td className="px-1 py-1.5 text-center tabular-nums">{row.qty}</td>
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
                  ) : row.unitPriceLines ? (
                    <>
                      <td className="px-1 py-1.5 text-right tabular-nums">
                        <div className="space-y-0.5">
                          {row.unitPriceLines.map((line) => (
                            <div key={line} className="whitespace-pre-line">
                              {line}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-1 py-1.5 text-right font-semibold tabular-nums">
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
                  colSpan={3}
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
