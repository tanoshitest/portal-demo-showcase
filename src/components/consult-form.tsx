import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { solutions } from "@/data/mock";
import { useStore } from "@/context/store";

type FormErrors = { name?: string; phone?: string; email?: string; need?: string };

export function ConsultForm({
  source = "Trang chủ",
  defaultSolution,
  compact = false,
}: {
  source?: string;
  defaultSolution?: string;
  compact?: boolean;
}) {
  const { addLead } = useStore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    need: defaultSolution ?? "",
    content: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FormErrors = {};
    if (form.name.trim().length < 2) next.name = "Vui lòng nhập họ tên.";
    if (!/^0\d{8,10}$/.test(form.phone.replace(/\s/g, "")))
      next.phone = "Số điện thoại không hợp lệ (VD: 0901234567).";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Email không hợp lệ.";
    if (!form.need) next.need = "Vui lòng chọn nhu cầu.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      addLead({ name: form.name, phone: form.phone, source });
      toast.success("Đã gửi yêu cầu tư vấn", {
        description: "Nhân viên kỹ thuật sẽ liên hệ trong 4 giờ làm việc.",
      });
    }, 900);
  };

  if (done) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h3 className="mt-3 text-lg font-bold">Gửi yêu cầu thành công</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Mã yêu cầu tư vấn của bạn đã được tạo. Bộ phận kỹ thuật sẽ gọi lại số {form.phone}.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => setDone(false)}>
          Gửi yêu cầu khác
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <div className="space-y-1.5">
          <Label htmlFor="cf-name">Họ và tên *</Label>
          <Input
            id="cf-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nguyễn Văn A"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-phone">Số điện thoại *</Label>
          <Input
            id="cf-phone"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0901234567"
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-email">Email</Label>
          <Input
            id="cf-email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@congty.vn"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Nhu cầu *</Label>
          <Select value={form.need} onValueChange={(v) => setForm({ ...form, need: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn nhu cầu tư vấn" />
            </SelectTrigger>
            <SelectContent>
              {solutions.map((s) => (
                <SelectItem key={s.slug} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
              <SelectItem value="Mua thiết bị">Mua thiết bị / báo giá</SelectItem>
              <SelectItem value="Khác">Nhu cầu khác</SelectItem>
            </SelectContent>
          </Select>
          {errors.need && <p className="text-xs text-destructive">{errors.need}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-content">Nội dung</Label>
        <Textarea
          id="cf-content"
          rows={3}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Mô tả ngắn về công trình, quy mô, thời gian dự kiến…"
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Đang gửi…" : "Đăng ký tư vấn"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Nguồn yêu cầu: {source}. Thông tin của bạn được bảo mật và chỉ dùng để liên hệ tư vấn.
      </p>
    </form>
  );
}
