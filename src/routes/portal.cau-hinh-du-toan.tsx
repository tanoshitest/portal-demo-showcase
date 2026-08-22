import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_ESTIMATE_CONFIG,
  loadEstimateConfig,
  saveEstimateConfig,
  type EstimateConfig,
} from "@/data/estimate-config";

export const Route = createFileRoute("/portal/cau-hinh-du-toan")({
  head: () => ({
    meta: [
      { title: "Cấu hình dự toán | Hoàng Vĩnh VKT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EstimateConfigPage,
});

function EstimateConfigPage() {
  const { user } = useStore();
  const [form, setForm] = useState<EstimateConfig>(() => loadEstimateConfig());

  useEffect(() => {
    setForm(loadEstimateConfig());
  }, []);

  if (!user) return <PortalGate />;

  const patch = <K extends keyof EstimateConfig>(key: K, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    if (form.pshSummer <= 0 || form.pshWinter <= 0) {
      toast.error("Hiệu suất tấm pin phải lớn hơn 0.");
      return;
    }
    if (form.dischargeEff <= 0 || form.dischargeEff > 100) {
      toast.error("Hiệu suất xả pin nằm trong khoảng 1–100%.");
      return;
    }
    saveEstimateConfig(form);
    toast.success("Đã lưu cấu hình dự toán");
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_ESTIMATE_CONFIG });
    saveEstimateConfig(DEFAULT_ESTIMATE_CONFIG);
    toast.success("Đã phục hồi giá trị mặc định");
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pt-6 lg:px-8">
      <div className="shrink-0 pb-6">
        <h1 className="text-2xl font-black sm:text-3xl">Cấu hình dự toán</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Các hệ số này dùng cho bảng tính số tấm pin và pin lưu trữ ở Dự toán Auto / thủ công.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="max-w-xl space-y-6 rounded-xl border border-border bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="psh-summer">Hiệu suất tấm pin mùa hè</Label>
            <Input
              id="psh-summer"
              type="number"
              min={0.1}
              step={0.1}
              value={form.pshSummer}
              onChange={(e) => patch("pshSummer", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Mặc định 4.6 giờ nắng đỉnh.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="psh-winter">Hiệu suất tấm pin mùa đông</Label>
            <Input
              id="psh-winter"
              type="number"
              min={0.1}
              step={0.1}
              value={form.pshWinter}
              onChange={(e) => patch("pshWinter", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Mặc định 2.3 giờ nắng đỉnh.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discharge-eff">Hiệu suất xả pin (%)</Label>
          <Input
            id="discharge-eff"
            type="number"
            min={1}
            max={100}
            step={1}
            value={form.dischargeEff}
            onChange={(e) => patch("dischargeEff", Number(e.target.value))}
            className="max-w-[160px]"
          />
          <p className="text-xs text-muted-foreground">
            Dùng khi tính dung lượng pin lưu trữ ban đêm. Mặc định 80%.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button type="submit">Lưu cấu hình</Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Phục hồi mặc định
          </Button>
        </div>
      </form>
    </div>
  );
}
