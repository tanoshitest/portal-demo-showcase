import { useEffect, useState } from "react";
import {
  AC_WIRES,
  CABINET_TYPES,
  ROOF_TYPES,
  autoAcWire,
  autoCabinetType,
  loadEstimateInputs,
  saveEstimateInputs,
  type EstimateInputs,
} from "@/data/estimate";
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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutoCalcGrid, EstimateCalcTables } from "@/components/estimate-calc-tables";

const MAX_BILL = 100_000_000;
const BILL_STEP = 50_000;
const ctrl = "h-8 min-w-0 text-xs";

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
    toast.success("Đã lưu dự toán");
  };

  const nightRate = Math.max(0, 100 - form.dayRate);

  return (
    <Tabs defaultValue="du-toan" className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border sm:h-9 sm:gap-3">
        <TabsList className="h-10 min-w-0 flex-1 justify-start rounded-none bg-transparent p-0 sm:h-9 sm:flex-none">
          <TabsTrigger
            value="du-toan"
            className="rounded-none border-b-2 border-transparent px-2.5 text-[13px] shadow-none data-[state=active]:border-brand-dark data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4 sm:text-sm"
          >
            Dự toán
          </TabsTrigger>
          <TabsTrigger
            value="bang-tinh-tien-dien"
            className="rounded-none border-b-2 border-transparent px-2.5 text-[13px] shadow-none data-[state=active]:border-brand-dark data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4 sm:text-sm"
          >
            Bảng tính tiền điện
          </TabsTrigger>
        </TabsList>
        <Button type="button" size="sm" className="h-8 shrink-0 rounded-none px-3" onClick={save}>
          Lưu
        </Button>
      </div>

      <TabsContent
        value="du-toan"
        className="mt-0 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-2 lg:overflow-hidden"
      >
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-none border border-border bg-card lg:h-full">
          <div className="shrink-0 bg-brand-dark px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-foreground sm:px-4 sm:py-2">
            Bảng tính AUTO
          </div>

          <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-stretch">
            <div className="grid min-h-0 min-w-0 grid-cols-2 content-start gap-x-2 gap-y-1.5 border-b border-border bg-secondary/20 p-2 lg:border-b-0 lg:overflow-y-auto">
              <div className="-mx-2 -mt-2 col-span-2 bg-secondary px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide">
                Thông tin
              </div>
              <Field label="Tên KH">
                <Input
                  className={ctrl}
                  value={form.customer}
                  onChange={(e) => patch("customer", e.target.value)}
                  placeholder="Tên khách hàng"
                />
              </Field>
              <Field label="SĐT">
                <Input
                  className={ctrl}
                  value={form.phone}
                  onChange={(e) => patch("phone", e.target.value)}
                  placeholder="Số điện thoại"
                />
              </Field>
              <Field label="Địa chỉ">
                <Input
                  className={ctrl}
                  value={form.address}
                  onChange={(e) => patch("address", e.target.value)}
                  placeholder="Địa chỉ lắp đặt"
                />
              </Field>
              <div className="flex flex-col justify-end gap-1">
                <Label className="text-[10px] font-medium leading-none text-muted-foreground">
                  Pha điện
                </Label>
                <div className="flex h-8 items-center gap-2.5">
                  {(["Điện 1 pha", "Điện 3 pha"] as const).map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-1 text-[11px]">
                      <Checkbox
                        checked={form.phase === option}
                        onCheckedChange={() => setPhase(option)}
                      />
                      {option.replace("Điện ", "")}
                    </label>
                  ))}
                </div>
              </div>
              <Field label="Tủ điện">
                <Select value={form.cabinetType} onValueChange={(v) => patch("cabinetType", v)}>
                  <SelectTrigger className={ctrl}>
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
              </Field>
              <Field label="Mái nhà">
                <Select
                  value={form.roof}
                  onValueChange={(v) => patch("roof", v as EstimateInputs["roof"])}
                >
                  <SelectTrigger className={ctrl}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOF_TYPES.map((roof) => (
                      <SelectItem key={roof} value={roof}>
                        {roof}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Dây AC" className="col-span-2">
                <Select value={form.acWire} onValueChange={(v) => patch("acWire", v)}>
                  <SelectTrigger className={ctrl}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AC_WIRES.map((wire) => (
                      <SelectItem key={wire} value={wire}>
                        {wire}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="DC (m)">
                <Input
                  className={ctrl}
                  type="number"
                  min={0}
                  value={form.dcWireM}
                  onChange={(e) => patch("dcWireM", Number(e.target.value) || 0)}
                />
              </Field>
              <Field label="Ống D20 (m)">
                <Input
                  className={ctrl}
                  type="number"
                  min={0}
                  value={form.pipeM}
                  onChange={(e) => patch("pipeM", Number(e.target.value) || 0)}
                />
              </Field>

              <div className="col-span-2">
                <MoneySlider
                  label="Tiền điện hè"
                  value={form.summerBillAuto}
                  onChange={(n) => patch("summerBillAuto", n)}
                />
              </div>
              <div className="col-span-2">
                <MoneySlider
                  label="Tiền điện đông"
                  value={form.winterBillAuto}
                  onChange={(n) => patch("winterBillAuto", n)}
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-end justify-between gap-2">
                  <Label className="text-[10px] font-medium leading-none text-muted-foreground">
                    Ngày / đêm
                  </Label>
                  <p className="text-[11px] tabular-nums text-muted-foreground">
                    {form.dayRate}% / {nightRate}%
                  </p>
                </div>
                <Slider
                  className="mt-1.5"
                  min={0}
                  max={100}
                  step={1}
                  value={[form.dayRate]}
                  onValueChange={([v]) => patch("dayRate", v ?? 0)}
                />
              </div>

              <Field label="Cẩu pin">
                <Select
                  value={String(form.crane)}
                  onValueChange={(v) => {
                    const crane = Number(v);
                    setForm((prev) => ({
                      ...prev,
                      crane,
                      craneShifts: crane ? Math.max(1, prev.craneShifts) : 0,
                    }));
                  }}
                >
                  <SelectTrigger className={ctrl}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Không</SelectItem>
                    <SelectItem value="1">Có</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Ca cẩu">
                <Input
                  className={ctrl}
                  type="number"
                  min={0}
                  disabled={!form.crane}
                  value={form.crane ? form.craneShifts : 0}
                  onChange={(e) => patch("craneShifts", Math.max(0, Number(e.target.value) || 0))}
                />
              </Field>
              <Field label="CT xa">
                <Select
                  value={String(form.remote)}
                  onValueChange={(v) => {
                    const remote = Number(v);
                    setForm((prev) => ({
                      ...prev,
                      remote,
                      remoteDays: remote ? Math.max(1, prev.remoteDays) : 0,
                    }));
                  }}
                >
                  <SelectTrigger className={ctrl}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Không</SelectItem>
                    <SelectItem value="1">Có</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Số công">
                <Input
                  className={ctrl}
                  type="number"
                  min={0}
                  disabled={!form.remote}
                  value={form.remote ? form.remoteDays : 0}
                  onChange={(e) => patch("remoteDays", Math.max(0, Number(e.target.value) || 0))}
                />
              </Field>
            </div>

            <AutoCalcGrid form={form} />
          </div>
        </section>
      </TabsContent>

      <TabsContent
        value="bang-tinh-tien-dien"
        className="mt-0 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-2"
      >
        <EstimateCalcTables form={form} />
      </TabsContent>
    </Tabs>
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
    <div className={cn("grid min-w-0 gap-1", className)}>
      <Label className="text-[10px] font-medium leading-none text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function MoneySlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        <Label className="text-[10px] font-medium leading-none text-muted-foreground">{label}</Label>
        <p className="text-[11px] font-semibold tabular-nums">{formatVnd(value)}</p>
      </div>
      <Slider
        className="mt-1.5"
        min={0}
        max={MAX_BILL}
        step={BILL_STEP}
        value={[Math.min(MAX_BILL, Math.max(0, value))]}
        onValueChange={([v]) => onChange(v ?? 0)}
      />
    </div>
  );
}
