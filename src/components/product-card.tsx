import { Link } from "@tanstack/react-router";
import { CheckSquare2, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brands, type Product } from "@/data/mock";
import { formatStock, formatVnd, stockBadgeClass } from "@/lib/format";
import { useStore } from "@/context/store";
import { toast } from "sonner";

export function ProductCard({
  product,
  compareChecked,
  onCompareToggle,
}: {
  product: Product;
  compareChecked?: boolean;
  onCompareToggle?: (product: Product) => void;
}) {
  const { addToCart } = useStore();
  const brand = brands.find((b) => b.slug === product.brandSlug);
  const price = product.salePrice ?? product.price;
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <article className="card-hover group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <Link
        to="/san-pham/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-secondary"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={900}
          height={900}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-highlight px-2 py-1 text-xs font-bold text-highlight-foreground">
            -{discount}%
          </span>
        )}
        {onCompareToggle && (
          <button
            type="button"
            aria-pressed={compareChecked}
            aria-label={compareChecked ? "Bỏ chọn so sánh" : "Chọn để so sánh"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompareToggle(product);
            }}
            className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition ${
              compareChecked
                ? "border-brand bg-brand text-white"
                : "border-border bg-background/95 text-foreground hover:border-brand"
            }`}
          >
            {compareChecked ? (
              <CheckSquare2 className="h-3.5 w-3.5" />
            ) : (
              <Square className="h-3.5 w-3.5" />
            )}
            <span>So sánh</span>
          </button>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">
          {brand?.name}
        </span>
        <Link
          to="/san-pham/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-brand sm:text-base"
        >
          {product.name}
        </Link>
        <div className="flex items-center">
          <Badge variant="outline" className={stockBadgeClass(product.stock)}>
            {formatStock(product.stock)}
          </Badge>
        </div>
        <div className="mt-auto">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-base font-bold text-brand sm:text-lg">{formatVnd(price)}</span>
            {product.salePrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatVnd(product.price)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="mt-3 w-full"
            onClick={() => {
              addToCart({
                productSlug: product.slug,
                variantName: product.variants[0]?.name ?? "Mặc định",
                sku: product.variants[0]?.sku ?? product.sku,
                price,
                quantity: 1,
              });
              toast.success("Đã thêm vào giỏ hàng", { description: product.name });
            }}
          >
            Thêm vào giỏ
          </Button>
        </div>
      </div>
    </article>
  );
}
