import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store";
import { products } from "@/data/mock";
import { formatVnd } from "@/lib/format";

export const Route = createFileRoute("/gio-hang")({
  head: () => ({
    meta: [
      { title: "Giỏ hàng | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content: "Kiểm tra thiết bị đã chọn, cập nhật số lượng và tiến hành đặt hàng nhanh.",
      },
      { property: "og:title", content: "Giỏ hàng – Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Đặt hàng thiết bị điện chính hãng trực tuyến." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useStore();

  if (cart.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">Giỏ hàng đang trống</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hãy chọn thiết bị bạn cần, chúng tôi sẽ báo giá và giao hàng toàn quốc.
        </p>
        <Button asChild className="mt-6">
          <Link to="/san-pham" search={{ danh_muc: "", q: "" }}>
            Xem sản phẩm
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-6 lg:py-10">
      <h1 className="text-2xl font-black sm:text-3xl">Giỏ hàng</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          {cart.map((item) => {
            const product = products.find((p) => p.slug === item.productSlug);
            return (
              <div
                key={item.sku}
                className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-card"
              >
                <img
                  src={product?.image}
                  alt={product?.name ?? item.sku}
                  loading="lazy"
                  width={200}
                  height={200}
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/san-pham/$slug"
                    params={{ slug: item.productSlug }}
                    className="line-clamp-2 text-sm font-semibold hover:text-brand"
                  >
                    {product?.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Phiên bản: {item.variantName} · SKU {item.sku}
                  </p>
                  <p className="mt-1 text-sm font-bold text-brand">{formatVnd(item.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeFromCart(item.sku)}
                    >
                      <Trash2 className="h-4 w-4" /> Xóa
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="font-bold">Tóm tắt đơn hàng</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tạm tính</dt>
              <dd className="font-medium">{formatVnd(cartTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Phí vận chuyển</dt>
              <dd className="font-medium">Báo sau khi xác nhận</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-bold">Tổng cộng</dt>
              <dd className="font-black text-brand">{formatVnd(cartTotal)}</dd>
            </div>
          </dl>
          <Button asChild size="lg" className="mt-5 w-full">
            <Link to="/thanh-toan">Tiến hành đặt hàng</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/san-pham" search={{ danh_muc: "", q: "" }}>
              Tiếp tục mua hàng
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
