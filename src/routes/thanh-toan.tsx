import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStore } from "@/context/store";
import { formatVnd } from "@/lib/format";
import { products } from "@/data/mock";

export const Route = createFileRoute("/thanh-toan")({
  head: () => ({
    meta: [
      { title: "Đặt hàng | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content: "Nhập thông tin giao hàng và phương thức thanh toán để hoàn tất đơn đặt thiết bị.",
      },
      { property: "og:title", content: "Đặt hàng – Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Hoàn tất đơn hàng thiết bị điện chính hãng." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { cart, cartTotal, clearCart } = useStore();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", note: "" });
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { name?: string; phone?: string; address?: string } = {};
    if (form.name.trim().length < 2) next.name = "Vui lòng nhập họ tên.";
    if (!/^0\d{8,10}$/.test(form.phone.replace(/\s/g, ""))) next.phone = "Số điện thoại không hợp lệ.";
    if (form.address.trim().length < 8) next.address = "Vui lòng nhập địa chỉ giao hàng.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOrderId(`HV${Date.now().toString().slice(-8)}`);
      clearCart();
    }, 1100);
  };

  if (orderId) {
    return (
      <div className="container-page py-16 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h1 className="mt-4 text-2xl font-black">Đặt hàng thành công</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mã đơn hàng: <b className="text-foreground">{orderId}</b>. Nhân viên bán hàng sẽ gọi xác
          nhận trong 2 giờ làm việc.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/san-pham" search={{ danh_muc: "", q: "" }}>
              Tiếp tục mua hàng
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-xl font-bold">Chưa có sản phẩm để đặt hàng</h1>
        <Button asChild className="mt-4">
          <Link to="/san-pham" search={{ danh_muc: "", q: "" }}>
            Xem sản phẩm
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-6 lg:py-10">
      <h1 className="text-2xl font-black sm:text-3xl">Thông tin đặt hàng</h1>
      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-bold">Thông tin khách hàng</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Họ và tên *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input id="phone" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea id="note" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-bold">Phương thức giao hàng</h2>
            <RadioGroup value={shipping} onValueChange={setShipping} className="mt-4 space-y-3">
              {[
                { id: "standard", label: "Giao tiêu chuẩn (1–3 ngày)", desc: "Phí báo sau khi xác nhận khối lượng" },
                { id: "express", label: "Giao nhanh nội thành TP.HCM", desc: "Trong ngày với đơn trước 14:00" },
                { id: "pickup", label: "Nhận tại kho", desc: "KCN Tân Bình, TP.HCM" },
              ].map((o) => (
                <label key={o.id} className="flex cursor-pointer gap-3 rounded-lg border border-border p-3">
                  <RadioGroupItem value={o.id} id={`s-${o.id}`} className="mt-0.5" />
                  <span>
                    <span className="block text-sm font-semibold">{o.label}</span>
                    <span className="block text-xs text-muted-foreground">{o.desc}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-bold">Phương thức thanh toán</h2>
            <RadioGroup value={payment} onValueChange={setPayment} className="mt-4 space-y-3">
              {[
                { id: "cod", label: "Thanh toán khi nhận hàng (COD)", desc: "Áp dụng cho đơn dưới 20 triệu" },
                { id: "transfer", label: "Chuyển khoản ngân hàng", desc: "Nhận hóa đơn VAT và hợp đồng" },
                { id: "credit", label: "Công nợ theo hợp đồng", desc: "Dành cho khách hàng doanh nghiệp" },
              ].map((o) => (
                <label key={o.id} className="flex cursor-pointer gap-3 rounded-lg border border-border p-3">
                  <RadioGroupItem value={o.id} id={`p-${o.id}`} className="mt-0.5" />
                  <span>
                    <span className="block text-sm font-semibold">{o.label}</span>
                    <span className="block text-xs text-muted-foreground">{o.desc}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="font-bold">Đơn hàng ({cart.length} thiết bị)</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {cart.map((item) => {
              const product = products.find((p) => p.slug === item.productSlug);
              return (
                <li key={item.sku} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    <span className="line-clamp-2 font-medium">{product?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.variantName} × {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold">{formatVnd(item.price * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-3">
            <span className="font-bold">Tổng cộng</span>
            <span className="font-black text-brand">{formatVnd(cartTotal)}</span>
          </div>
          <Button type="submit" size="lg" className="mt-5 w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Đang xử lý…" : "Xác nhận đặt hàng"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
