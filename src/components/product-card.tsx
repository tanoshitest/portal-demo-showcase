import { Link } from "@tanstack/react-router";
import { CheckSquare2, Square, ShoppingCart, Star } from "lucide-react";
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
    <article className="card-hover group flex min-w-0 flex-col overflow-hidden rounded-[10px] border border-brand/10 bg-card shadow-card">
      <Link
        to="/san-pham/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[1.08] overflow-hidden bg-white sm:aspect-square sm:bg-secondary"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={900}
          height={900}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
            className={`absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border p-0 text-xs font-semibold shadow-sm transition sm:right-2 sm:top-2 sm:h-auto sm:w-auto sm:px-2.5 sm:py-1 ${
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
            <span className="hidden sm:inline">So sánh</span>
          </button>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-2 sm:gap-1.5 sm:p-4">
        <span className="text-[8px] font-bold uppercase tracking-wide text-brand sm:text-xs">
          {brand?.name}
        </span>
        <Link
          to="/san-pham/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 min-h-[2.25rem] text-[10px] font-bold leading-snug text-foreground hover:text-brand sm:min-h-0 sm:text-base"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-highlight-foreground sm:text-[11px]">
            <Star className="h-2.5 w-2.5 fill-highlight text-highlight sm:h-3 sm:w-3" />
            {product.rating}
          </span>
          <Badge
            variant="outline"
            className={`${stockBadgeClass(product.stock)} h-4 px-1 text-[7px] sm:h-auto sm:text-xs`}
          >
            {formatStock(product.stock)}
          </Badge>
        </div>
        <div className="mt-auto">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[12px] font-black text-[#e60012] sm:text-lg">
              {formatVnd(price)}
            </span>
            {product.salePrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatVnd(product.price)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            aria-label={`Thêm ${product.name} vào giỏ`}
            className="ml-auto mt-1.5 h-7 w-7 rounded-full p-0 text-[8px] sm:ml-0 sm:mt-3 sm:h-9 sm:w-auto sm:rounded-md sm:px-3 sm:text-sm"
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
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{" "}
            <span className="hidden sm:inline">Thêm vào giỏ</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
