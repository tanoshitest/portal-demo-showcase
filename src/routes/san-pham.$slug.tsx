import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Minus, Plus, ShieldCheck, Truck, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product-card";
import { brands, getProduct, products, type Product } from "@/data/mock";
import { formatStock, formatVnd, stockBadgeClass } from "@/lib/format";
import { useStore } from "@/context/store";

export const Route = createFileRoute("/san-pham/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [{ title: "Không tìm thấy sản phẩm | Hoàng Vĩnh VKT" }, { name: "robots", content: "noindex" }],
      };
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} | Hoàng Vĩnh VKT` },
        { name: "description", content: p.description.slice(0, 155) },
        { property: "og:title", content: p.name },
        { property: "og:description", content: p.description.slice(0, 155) },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData() as { product: Product };
  const { addToCart } = useStore();
  const brand = brands.find((b) => b.slug === product.brandSlug);
  const [variant, setVariant] = useState(product.variants[0]!);
  const [qty, setQty] = useState(1);
  const related = products.filter(
    (p) => p.categorySlug === product.categorySlug && p.slug !== product.slug,
  );

  const add = (buyNow = false) => {
    addToCart({
      productSlug: product.slug,
      variantName: variant.name,
      sku: variant.sku,
      price: variant.price,
      quantity: qty,
    });
    toast.success(buyNow ? "Đã thêm, chuyển tới giỏ hàng" : "Đã thêm vào giỏ hàng", {
      description: `${product.name} – ${variant.name} x${qty}`,
    });
  };

  return (
    <div className="container-page py-6 lg:py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand">
          Trang chủ
        </Link>
        <span className="mx-1">/</span>
        <Link to="/san-pham" search={{ danh_muc: product.categorySlug, q: "" }} className="hover:text-brand">
          Sản phẩm
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <img
              src={product.image}
              alt={product.name}
              width={900}
              height={900}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[product.image, product.image, product.image, product.image].map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${product.name} góc ${i + 1}`}
                loading="lazy"
                width={200}
                height={200}
                className="aspect-square w-full rounded-lg border border-border object-cover"
              />
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-brand">
            {brand?.name}
          </span>
          <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>SKU: {variant.sku}</span>
            <Badge variant="outline" className={stockBadgeClass(product.stock)}>
              {formatStock(product.stock)}
            </Badge>
          </div>

          <div className="mt-4 rounded-xl bg-secondary p-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-black text-brand sm:text-3xl">
                {formatVnd(variant.price)}
              </span>
              {product.salePrice && variant.sku === product.sku && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatVnd(product.price)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Giá đã bao gồm VAT · Bảo hành {product.warranty}
            </p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold">Chọn phiên bản</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    variant.id === v.id
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border hover:border-brand/50"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <p className="text-sm font-semibold">Số lượng</p>
            <div className="flex items-center rounded-lg border border-border">
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button size="lg" variant="outline" onClick={() => add()}>
              Thêm vào giỏ
            </Button>
            <Button size="lg" asChild onClick={() => add(true)}>
              <Link to="/gio-hang">Mua ngay</Link>
            </Button>
          </div>
          <Button variant="ghost" size="sm" asChild className="mt-2">
            <Link to="/lien-he">
              <Phone className="h-4 w-4" /> Cần tư vấn kỹ thuật? Liên hệ kỹ sư
            </Link>
          </Button>

          <ul className="mt-5 space-y-2 text-sm">
            {product.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-success" /> {h}
              </li>
            ))}
            <li className="flex gap-2">
              <Truck className="h-4 w-4 shrink-0 text-brand" /> Giao hàng toàn quốc 1–3 ngày
            </li>
          </ul>
        </div>
      </div>

      <Tabs defaultValue="desc" className="mt-10">
        <TabsList>
          <TabsTrigger value="desc">Mô tả</TabsTrigger>
          <TabsTrigger value="specs">Thông số</TabsTrigger>
        </TabsList>
        <TabsContent value="desc" className="prose-sm max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </TabsContent>
        <TabsContent value="specs">
          <div className="max-w-2xl overflow-hidden rounded-xl border border-border">
            {product.specs.map((s, i) => (
              <div
                key={s.label}
                className={`grid grid-cols-2 gap-4 px-4 py-3 text-sm ${i % 2 ? "bg-secondary/50" : ""}`}
              >
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-black sm:text-2xl">Sản phẩm liên quan</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky CTA mobile */}
      <div className="fixed bottom-14 left-0 right-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{variant.name}</p>
          <p className="text-sm font-bold text-brand">{formatVnd(variant.price)}</p>
        </div>
        <Button variant="outline" onClick={() => add()}>
          Thêm giỏ
        </Button>
        <Button asChild onClick={() => add(true)}>
          <Link to="/gio-hang">Mua ngay</Link>
        </Button>
      </div>
    </div>
  );
}
