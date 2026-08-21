import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Heart, Minus, Plus, ShieldCheck, Share2, Truck, Phone, ShoppingCart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product-card";
import { brands, type Product } from "@/data/mock";
import { getAdminProduct, isUsableProductImage, loadAdminProducts, padProductGallery } from "@/data/products-store";
import { formatStock, formatVnd, stockBadgeClass } from "@/lib/format";
import { useStore } from "@/context/store";

export const Route = createFileRoute("/san-pham/$slug")({
  head: ({ params }) => {
    const p = typeof window === "undefined" ? undefined : getAdminProduct(params.slug);
    if (!p) {
      return {
        meta: [{ title: "Sản phẩm | Hoàng Vĩnh VKT" }, { name: "robots", content: "noindex" }],
      };
    }
    return {
      meta: [
        { title: `${p.name} | Hoàng Vĩnh VKT` },
        { name: "description", content: p.description.slice(0, 155) },
        { property: "og:title", content: p.name },
        { property: "og:description", content: p.description.slice(0, 155) },
      ],
    };
  },
  component: ProductDetailPage,
});

function fallbackVariant(product: Product): Product["variants"][number] {
  return (
    product.variants[0] ?? {
      id: `${product.id}-default`,
      name: "Mặc định",
      sku: product.sku,
      price: product.salePrice ?? product.price,
    }
  );
}

function ProductDetailPage() {
  const { slug } = useParams({ from: "/san-pham/$slug" });
  const [product, setProduct] = useState<Product | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProduct(getAdminProduct(slug) ?? null);
    setReady(true);
  }, [slug]);

  if (!ready) return <div className="container-page min-h-[40vh] py-10" />;

  if (!product) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-xl font-black">Không tìm thấy sản phẩm</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sản phẩm có thể đã bị xóa hoặc chưa được lưu.</p>
        <Button asChild className="mt-6">
          <Link to="/san-pham" search={{ danh_muc: "", q: "" }}>
            Về danh sách sản phẩm
          </Link>
        </Button>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}

function productThumbs(product: Product): string[] {
  const gallery = padProductGallery(product.gallery).map((src) => (isUsableProductImage(src) ? src : ""));
  if (gallery.some(Boolean)) return gallery;
  const main = isUsableProductImage(product.image) ? product.image : "";
  return padProductGallery(main ? [main] : []);
}

function ProductDetail({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const brand = brands.find((b) => b.slug === product.brandSlug);
  const [variant, setVariant] = useState(() => fallbackVariant(product));
  const [qty, setQty] = useState(1);
  const thumbs = productThumbs(product);
  const [hero, setHero] = useState(isUsableProductImage(product.image) ? product.image : thumbs.find(Boolean) || "");
  const related = loadAdminProducts().filter(
    (p) => p.categorySlug === product.categorySlug && p.slug !== product.slug,
  );
  const variants = product.variants.length > 0 ? product.variants : [variant];

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
    <div className="container-page min-w-0 overflow-x-hidden py-4 lg:py-10">
      <MobileProductDetail product={product} variant={variant} setVariant={setVariant} qty={qty} setQty={setQty} thumbs={thumbs} hero={hero} setHero={setHero} />
      <div className="hidden md:block">
      <nav className="hidden text-xs text-muted-foreground sm:block">
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

      <div className="mt-2 grid grid-cols-[43%_minmax(0,1fr)] gap-3 sm:mt-4 sm:gap-6 lg:grid-cols-2 lg:gap-10">
        <div>
          <div className="overflow-hidden rounded-2xl border border-brand/10 bg-card shadow-card">
            {hero ? (
              <img
                src={hero}
                alt={product.name}
                width={900}
                height={900}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="grid aspect-square w-full place-items-center bg-secondary/40 text-sm text-muted-foreground">
                Chưa có ảnh
              </div>
            )}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1 sm:mt-3 sm:gap-2">
            {thumbs.map((img, i) =>
              img ? (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setHero(img)}
                  className={`overflow-hidden rounded-lg border ${hero === img ? "border-brand" : "border-border"}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} góc ${i + 1}`}
                    loading="lazy"
                    width={200}
                    height={200}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ) : (
                <div key={`empty-${i}`} className="aspect-square rounded-lg border border-dashed border-border bg-secondary/30" />
              ),
            )}
          </div>
        </div>

        <div>
          <span className="text-[8px] font-bold uppercase tracking-wide text-brand sm:text-xs">
            {brand?.name}
          </span>
          <h1 className="mt-1 text-[15px] font-black leading-tight text-brand-dark sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[8px] text-muted-foreground sm:gap-3 sm:text-sm">
            <span>SKU: {variant.sku}</span>
            <Badge variant="outline" className={stockBadgeClass(product.stock)}>
              {formatStock(product.stock)}
            </Badge>
          </div>

          <div className="mt-3 rounded-lg border border-brand/10 bg-brand-soft/55 p-2 sm:mt-4 sm:rounded-xl sm:p-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-lg font-black text-[#e90000] sm:text-3xl">
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

          <div className="mt-3 sm:mt-5">
            <p className="text-sm font-semibold">Chọn phiên bản</p>
            <div className="mt-2 grid gap-1 sm:flex sm:flex-wrap sm:gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v)}
                  className={`rounded-lg border px-2 py-1.5 text-[8px] font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
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

          <div className="mt-3 flex items-center gap-2 sm:mt-5 sm:gap-3">
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

          <div className="mt-3 hidden gap-2 sm:mt-5 sm:grid sm:grid-cols-2">
            <Button size="lg" variant="outline" onClick={() => add()}>
              Thêm vào giỏ
            </Button>
            <Button size="lg" asChild onClick={() => add(true)}>
              <Link to="/gio-hang">Mua ngay</Link>
            </Button>
          </div>
          <Button variant="ghost" size="sm" asChild className="mt-2 hidden sm:inline-flex">
            <Link to="/lien-he">
              <Phone className="h-4 w-4" /> Cần tư vấn kỹ thuật? Liên hệ kỹ sư
            </Link>
          </Button>

          <ul className="mt-3 hidden space-y-2 text-sm sm:block">
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

      <Tabs defaultValue="desc" className="mt-10 rounded-2xl border border-brand/10 bg-white p-4 shadow-card sm:p-6">
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
      </div>

      {/* Sticky CTA mobile */}
      <div className="fixed bottom-14 left-0 right-0 z-40 grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 overflow-hidden border-t border-brand/10 bg-background/95 p-2 backdrop-blur-xl lg:hidden">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0 text-brand"><Link to="/lien-he" aria-label="Chat tư vấn"><MessageCircle className="h-4 w-4" /></Link></Button>
        <Button variant="outline" className="h-9 min-w-0 px-1 text-[11px]" onClick={() => add()}>
          <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ
        </Button>
        <Button asChild className="h-9 min-w-0 px-2 text-[11px]" onClick={() => add(true)}>
          <Link to="/gio-hang">Mua ngay</Link>
        </Button>
      </div>
    </div>
  );
}

function MobileProductDetail({ product, variant, setVariant, qty, setQty, thumbs, hero, setHero }: {
  product: Product;
  variant: Product["variants"][number];
  setVariant: (variant: Product["variants"][number]) => void;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  thumbs: string[];
  hero: string;
  setHero: (src: string) => void;
}) {
  const brand = brands.find((item) => item.slug === product.brandSlug);
  const heroIndex = Math.max(0, thumbs.findIndex((src) => src && src === hero));
  return (
    <div className="mobile-product-detail -mx-[18px] -mt-4 min-w-0 overflow-x-hidden bg-white pb-20 md:hidden">
      <header className="flex h-12 items-center justify-between border-b px-4 text-[#071c4c]">
        <Link to="/san-pham" search={{ danh_muc: product.categorySlug, q: "" }} aria-label="Quay lại"><ArrowLeft className="h-5 w-5" /></Link>
        <strong className="text-sm">Chi tiết sản phẩm</strong>
        <div className="flex gap-4"><Heart className="h-5 w-5" /><Share2 className="h-5 w-5" /></div>
      </header>

      <section className="grid grid-cols-[43%_1fr] gap-3 px-4 pt-3">
        <div>
          <div className="relative overflow-hidden rounded-xl bg-[#f6f7f9]">
            {hero ? <img src={hero} alt={product.name} className="aspect-square w-full object-cover" /> : <div className="grid aspect-square place-items-center text-[8px] text-muted-foreground">Chưa có ảnh</div>}
            <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[7px] text-white">{heroIndex + 1}/4</span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {thumbs.map((src, index) =>
              src ? (
                <button key={`${src}-${index}`} type="button" onClick={() => setHero(src)} className={`overflow-hidden rounded border ${hero === src ? "border-[#0758c9]" : "border-[#dfe5ed]"}`}>
                  <img src={src} alt="" className="aspect-square w-full object-cover" />
                </button>
              ) : (
                <div key={`empty-${index}`} className="aspect-square rounded border border-dashed border-[#dfe5ed] bg-[#f6f7f9]" />
              ),
            )}
          </div>
        </div>
        <div className="min-w-0">
          <span className="text-[9px] font-black uppercase text-[#ff7800]">{brand?.name}</span>
          <h1 className="mt-1 text-[14px] font-black leading-snug text-[#071c4c]">{product.name}</h1>
          <ul className="mt-2 space-y-1 text-[8px] leading-snug text-[#263b5e]">{product.highlights.slice(0,5).map(item=><li key={item} className="flex gap-1"><ShieldCheck className="h-3 w-3 shrink-0 text-[#0758c9]" />{item}</li>)}</ul>
          <div className="mt-2 rounded-lg bg-[#f3f7ff] p-2 text-[8px] font-semibold text-[#163a72]"><ShieldCheck className="mr-1 inline h-3 w-3" />Bảo hành {product.warranty}</div>
        </div>
      </section>

      <section className="mt-3 border-t px-4 pt-3"><div className="flex items-end justify-between"><div><strong className="text-xl font-black text-[#e60012]">{formatVnd(variant.price)}</strong>{product.salePrice&&<p className="text-[8px] text-muted-foreground line-through">{formatVnd(product.price)}</p>}</div><div className="flex items-center rounded border"><button className="h-7 w-7" onClick={()=>setQty(value=>Math.max(1,value-1))}>-</button><span className="w-7 text-center text-xs">{qty}</span><button className="h-7 w-7" onClick={()=>setQty(value=>value+1)}>+</button></div></div></section>

      <section className="mt-3 border-t px-4 pt-3"><h2 className="text-[11px] font-bold text-[#071c4c]">Chọn phiên bản</h2><div className="mt-2 grid grid-cols-3 gap-2">{(product.variants.length ? product.variants : [variant]).map(item=><button key={item.id} onClick={()=>setVariant(item)} className={`min-h-12 rounded-lg border px-1 py-2 text-[8px] font-semibold ${variant.id===item.id?"border-[#0758c9] bg-[#f2f7ff] text-[#0758c9]":"border-[#e2e7ee]"}`}><span className="block line-clamp-1">{item.name}</span><span className="mt-1 block">{formatVnd(item.price)}</span></button>)}</div></section>

      <section className="mt-4 border-t px-4 pt-3"><h2 className="text-[11px] font-bold text-[#071c4c]">Mô tả sản phẩm</h2><p className="mt-2 text-[9px] leading-relaxed text-[#40516c]">{product.description}</p><button className="mt-1 text-[8px] font-bold text-[#0758c9]">Xem thêm</button></section>
      <section className="mt-4 border-t px-4 pt-3"><div className="flex justify-between"><h2 className="text-[11px] font-bold text-[#071c4c]">Thông số kỹ thuật</h2><span className="text-[8px] font-bold text-[#0758c9]">Xem tất cả ›</span></div><div className="mt-2 grid grid-cols-3 overflow-hidden rounded-lg border">{product.specs.map(spec=><div key={spec.label} className="min-h-14 border-b border-r p-2"><span className="block text-[7px] text-[#66758c]">{spec.label}</span><strong className="mt-1 block text-[8px] leading-tight text-[#172d52]">{spec.value}</strong></div>)}</div></section>
    </div>
  );
}
