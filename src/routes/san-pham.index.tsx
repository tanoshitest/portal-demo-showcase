import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, SlidersHorizontal, X, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import { brands, categories, products } from "@/data/mock";
import { formatStock, formatVnd, stockBadgeClass } from "@/lib/format";

export const Route = createFileRoute("/san-pham/")({
  validateSearch: (search: Record<string, unknown>) => ({
    danh_muc: typeof search["danh_muc"] === "string" ? (search["danh_muc"] as string) : "",
    q: typeof search["q"] === "string" ? (search["q"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Sản phẩm thiết bị điện – tự động hóa | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content:
          "Danh mục thiết bị đóng cắt, biến tần, PLC, đo lường, tủ điện và chiếu sáng công nghiệp chính hãng với giá cập nhật.",
      },
      { property: "og:title", content: "Sản phẩm thiết bị điện – Hoàng Vĩnh VKT" },
      {
        property: "og:description",
        content: "Thiết bị điện và tự động hóa chính hãng, đầy đủ CO/CQ, bảo hành dài hạn.",
      },
    ],
  }),
  component: ProductListing,
});

const priceRanges = [
  { id: "r1", label: "Dưới 2 triệu", min: 0, max: 2000000 },
  { id: "r2", label: "2 – 10 triệu", min: 2000000, max: 10000000 },
  { id: "r3", label: "10 – 25 triệu", min: 10000000, max: 25000000 },
  { id: "r4", label: "Trên 25 triệu", min: 25000000, max: Infinity },
];

const COMPARE_KEY = "hv_product_compare";

function ProductListing() {
  const { danh_muc, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [keyword, setKeyword] = useState(q);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRanges, setSelectedRanges] = useState<string[]>([]);
  const [sort, setSort] = useState("default");
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);

  const activeCategory = categories.find((c) => c.slug === danh_muc);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(COMPARE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        setCompareSlugs(
          parsed.filter((value): value is string => typeof value === "string").slice(0, 3),
        );
      }
    } catch {
      // Ignore malformed cache.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(COMPARE_KEY, JSON.stringify(compareSlugs));
  }, [compareSlugs]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (danh_muc && p.categorySlug !== danh_muc) return false;
      if (keyword && !p.name.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brandSlug)) return false;
      if (selectedRanges.length) {
        const price = p.salePrice ?? p.price;
        const match = priceRanges
          .filter((r) => selectedRanges.includes(r.id))
          .some((r) => price >= r.min && price < r.max);
        if (!match) return false;
      }
      return true;
    });
    if (sort === "price_asc")
      list = [...list].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    if (sort === "price_desc")
      list = [...list].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    if (sort === "newest") list = [...list].reverse();
    return list;
  }, [danh_muc, keyword, selectedBrands, selectedRanges, sort]);

  const compareProducts = useMemo(
    () => compareSlugs.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean),
    [compareSlugs],
  ) as typeof products;

  const activeCount = selectedBrands.length + selectedRanges.length + (danh_muc ? 1 : 0);

  const toggleCompare = (slug: string) => {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((item) => item !== slug);
      if (prev.length >= 3) return prev;
      return [...prev, slug];
    });
  };

  const clearCompare = () => setCompareSlugs([]);

  const reset = () => {
    setSelectedBrands([]);
    setSelectedRanges([]);
    setKeyword("");
    navigate({ search: { danh_muc: "", q: "" } });
  };

  const Filters = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">Danh mục</h3>
        <ul className="space-y-1.5 text-sm">
          <li>
            <Link
              to="/san-pham"
              search={{ danh_muc: "", q: keyword }}
              className={`block rounded-md px-2 py-1.5 hover:bg-secondary ${!danh_muc ? "bg-secondary font-semibold text-brand" : ""}`}
            >
              Tất cả sản phẩm
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                to="/san-pham"
                search={{ danh_muc: c.slug, q: keyword }}
                className={`block rounded-md px-2 py-1.5 hover:bg-secondary ${danh_muc === c.slug ? "bg-secondary font-semibold text-brand" : ""}`}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">Thương hiệu</h3>
        <div className="space-y-2">
          {brands.map((b) => (
            <div key={b.slug} className="flex items-center gap-2">
              <Checkbox
                id={`b-${b.slug}`}
                checked={selectedBrands.includes(b.slug)}
                onCheckedChange={(v) =>
                  setSelectedBrands((prev) =>
                    v ? [...prev, b.slug] : prev.filter((x) => x !== b.slug),
                  )
                }
              />
              <Label htmlFor={`b-${b.slug}`} className="text-sm font-normal">
                {b.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">Khoảng giá</h3>
        <div className="space-y-2">
          {priceRanges.map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <Checkbox
                id={`r-${r.id}`}
                checked={selectedRanges.includes(r.id)}
                onCheckedChange={(v) =>
                  setSelectedRanges((prev) =>
                    v ? [...prev, r.id] : prev.filter((x) => x !== r.id),
                  )
                }
              />
              <Label htmlFor={`r-${r.id}`} className="text-sm font-normal">
                {r.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {activeCount > 0 && (
        <Button variant="outline" className="w-full" onClick={reset}>
          <X className="h-4 w-4" /> Xóa bộ lọc
        </Button>
      )}
    </div>
  );

  return (
    <div className="container-page py-6 lg:py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand">
          Trang chủ
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">Sản phẩm</span>
        {activeCategory && (
          <>
            <span className="mx-1">/</span>
            <span className="text-foreground">{activeCategory.name}</span>
          </>
        )}
      </nav>

      <h1 className="mt-2 text-2xl font-black sm:text-3xl">
        {activeCategory ? activeCategory.name : "Tất cả sản phẩm"}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        {activeCategory
          ? activeCategory.description
          : "Thiết bị điện và tự động hóa chính hãng, giá cập nhật, đầy đủ CO/CQ và bảo hành."}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">{Filters}</div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm trong sản phẩm…"
              className="max-w-xs flex-1"
            />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Mặc định</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                <SelectItem value="price_desc">Giá giảm dần</SelectItem>
              </SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
                  {activeCount > 0 && (
                    <Badge className="ml-1 bg-highlight text-highlight-foreground">
                      {activeCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
                <SheetTitle className="text-left">Bộ lọc sản phẩm</SheetTitle>
                <div className="px-4 pb-8">{Filters}</div>
              </SheetContent>
            </Sheet>
            <span className="ml-auto text-sm text-muted-foreground">
              {filtered.length} sản phẩm
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
              <PackageSearch className="mx-auto h-10 w-10 text-muted-foreground" />
              <h2 className="mt-3 font-bold">Không tìm thấy sản phẩm phù hợp</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Hãy thử bỏ một vài bộ lọc hoặc tìm với từ khóa khác.
              </p>
              <Button variant="outline" className="mt-4" onClick={reset}>
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  compareChecked={compareSlugs.includes(p.slug)}
                  onCompareToggle={(product) => toggleCompare(product.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {compareProducts.length > 0 && (
        <section className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="container-page py-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand" />
                <h2 className="text-sm font-bold uppercase tracking-wide">
                  So sánh sản phẩm ({compareProducts.length}/3)
                </h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearCompare}>
                  Xóa tất cả
                </Button>
              </div>
            </div>

            {compareProducts.length < 2 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                Chọn thêm ít nhất 1 sản phẩm nữa để bắt đầu so sánh.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="grid gap-3 border-b border-border p-3 md:grid-cols-2 xl:grid-cols-3">
                  {compareProducts.map((product) => {
                    const brand = brands.find((b) => b.slug === product.brandSlug);
                    const price = product.salePrice ?? product.price;
                    return (
                      <div key={product.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-20 w-20 rounded-lg border border-border object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold uppercase tracking-wide text-brand">
                              {brand?.name}
                            </div>
                            <div className="mt-1 line-clamp-2 text-sm font-bold">{product.name}</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="outline" className={stockBadgeClass(product.stock)}>
                                {formatStock(product.stock)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {product.categorySlug}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-lg font-black text-brand">{formatVnd(price)}</span>
                          {product.salePrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatVnd(product.price)}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-8 px-2 text-xs"
                          onClick={() => toggleCompare(product.slug)}
                        >
                          Bỏ chọn
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[760px] w-full border-collapse text-sm">
                    <tbody>
                      <CompareRow label="SKU" values={compareProducts.map((p) => p.sku)} />
                      <CompareRow
                        label="Giá"
                        values={compareProducts.map((p) => formatVnd(p.salePrice ?? p.price))}
                      />
                      <CompareRow
                        label="Tồn kho"
                        values={compareProducts.map((p) => formatStock(p.stock))}
                      />
                      <CompareRow label="Bảo hành" values={compareProducts.map((p) => p.warranty)} />
                      <CompareRow
                        label="Đánh giá"
                        values={compareProducts.map((p) => `${p.rating}/5 · ${p.reviewCount} đánh giá`)}
                      />
                      <CompareRow
                        label="Thông số 1"
                        values={compareProducts.map((p) => p.specs[0]?.value ?? "-")}
                      />
                      <CompareRow
                        label="Thông số 2"
                        values={compareProducts.map((p) => p.specs[1]?.value ?? "-")}
                      />
                      <CompareRow
                        label="Thông số 3"
                        values={compareProducts.map((p) => p.specs[2]?.value ?? "-")}
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-t border-border first:border-t-0">
      <th className="w-40 bg-secondary/40 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </th>
      {values.map((value, index) => (
        <td key={`${label}-${index}`} className="border-l border-border px-3 py-2 align-top">
          {value || "-"}
        </td>
      ))}
    </tr>
  );
}
