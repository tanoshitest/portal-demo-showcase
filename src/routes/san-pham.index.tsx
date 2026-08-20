import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BatteryCharging, Camera, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Cpu, Ellipsis, Search, ShieldCheck, SlidersHorizontal, SunMedium, Wifi, X, PackageSearch } from "lucide-react";
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
import { brands, categories, products, images } from "@/data/mock";
import { formatStock, formatVnd, stockBadgeClass } from "@/lib/format";
import { toast } from "sonner";

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
  const [showComparePanel, setShowComparePanel] = useState(true);

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
      if (prev.length >= 3) {
        toast.info("Chỉ so sánh tối đa 3 sản phẩm.");
        return prev;
      }
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

  if (!danh_muc && !q && !keyword && selectedBrands.length === 0 && selectedRanges.length === 0) {
    return <ProductLanding />;
  }

  return (
    <div className="min-w-0 overflow-x-hidden pb-10">
      <MobileProductCatalog
        activeCategory={activeCategory}
        danhMuc={danh_muc}
        keyword={keyword}
        setKeyword={setKeyword}
        sort={sort}
        setSort={setSort}
        filtered={filtered}
        activeCount={activeCount}
        toggleCompare={toggleCompare}
        compareSlugs={compareSlugs}
        filters={Filters}
      />
      <section className="relative hidden overflow-hidden bg-brand-dark text-white md:block">
        <img src={images.solution2} alt="Sản phẩm chính hãng Hoàng Vĩnh IOT" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05285f] via-[#063b86]/90 to-[#063b86]/30" />
        <div className="container-page relative py-8 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-widest text-highlight">Sản phẩm chính hãng</p>
          <h1 className="mt-2 max-w-xl text-3xl font-black sm:text-4xl">Đầy đủ thiết bị, giá tốt và bảo hành uy tín</h1>
          <p className="mt-2 max-w-xl text-sm text-white/80">Tư vấn đúng nhu cầu, hỗ trợ kỹ thuật trước và sau bán hàng.</p>
        </div>
      </section>
      <div className="container-page hidden pt-5 md:block lg:pt-8">
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

      <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
        <Link to="/san-pham" search={{ danh_muc: "", q: keyword }} className={`shrink-0 rounded-xl border px-4 py-3 text-xs font-bold ${!danh_muc ? "border-brand bg-brand text-white" : "bg-white"}`}>Tất cả</Link>
        {categories.map((category) => <Link key={category.slug} to="/san-pham" search={{ danh_muc: category.slug, q: keyword }} className={`shrink-0 rounded-xl border px-4 py-3 text-xs font-bold ${danh_muc === category.slug ? "border-brand bg-brand text-white" : "bg-white"}`}>{category.name}</Link>)}
      </div>

      <h2 className="mt-4 text-2xl font-black sm:text-3xl">
        {activeCategory ? activeCategory.name : "Tất cả sản phẩm"}
      </h2>
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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setShowComparePanel((prev) => !prev)}
                >
                  {showComparePanel ? (
                    <>
                      <ChevronDown className="h-4 w-4" /> Ẩn so sánh
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-4 w-4" /> Hiện so sánh
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={clearCompare}>
                  Xóa tất cả
                </Button>
              </div>
            </div>

            {showComparePanel ? (
              compareProducts.length < 2 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                  Chọn thêm ít nhất 1 sản phẩm nữa để bắt đầu so sánh.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="grid gap-0 border-b border-border md:grid-cols-[10rem_repeat(3,minmax(0,1fr))]">
                    <div className="hidden md:block" aria-hidden="true" />
                    {compareProducts.map((product) => {
                      const brand = brands.find((b) => b.slug === product.brandSlug);
                      const price = product.salePrice ?? product.price;
                      return (
                        <div
                          key={product.id}
                          className="min-w-0 border-border p-2 sm:p-3 md:border-l md:first:border-l-0"
                        >
                          <div className="rounded-lg border border-border p-2 sm:p-3">
                            <div className="flex min-w-0 items-start gap-2 sm:gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-16 w-16 flex-none rounded-lg border border-border object-cover sm:h-20 sm:w-20"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-brand sm:text-xs">
                                  {brand?.name}
                                </div>
                                <div className="mt-1 line-clamp-2 text-sm font-bold leading-snug">
                                  {product.name}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  <Badge variant="outline" className={stockBadgeClass(product.stock)}>
                                    {formatStock(product.stock)}
                                  </Badge>
                                  <Badge variant="secondary" className="text-[11px] sm:text-xs">
                                    {product.categorySlug}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-2 sm:mt-3">
                              <span className="text-base font-black text-brand sm:text-lg">
                                {formatVnd(price)}
                              </span>
                              {product.salePrice && (
                                <span className="text-[11px] text-muted-foreground line-through sm:text-xs">
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
                        </div>
                      );
                    })}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-xs sm:text-sm">
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
              )
            ) : (
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                Phần so sánh đang ẩn. Bấm <span className="font-semibold text-foreground">Hiện so sánh</span> để mở lại.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );

}

function MobileProductCatalog({
  activeCategory,
  danhMuc,
  keyword,
  setKeyword,
  sort,
  setSort,
  filtered,
  activeCount,
  toggleCompare,
  compareSlugs,
  filters,
}: {
  activeCategory: (typeof categories)[number] | undefined;
  danhMuc: string;
  keyword: string;
  setKeyword: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  filtered: typeof products;
  activeCount: number;
  toggleCompare: (slug: string) => void;
  compareSlugs: string[];
  filters: React.ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-x-hidden bg-[#f8fafc] pb-5 md:hidden">
      <div className="border-b bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/san-pham" search={{ danh_muc: "", q: "" }} className="text-lg font-bold text-[#071c4c]">
            {activeCategory?.name ?? "Sản phẩm"}
          </Link>
          <div className="flex items-center gap-3 text-[#071c4c]"><Search className="h-5 w-5" /><ShoppingCart className="h-5 w-5" /></div>
        </div>
      </div>

      <div className="bg-white px-3 pt-3">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-3">
          {categories.map((category, index) => {
            const Icon = landingIcons[index] ?? Cpu;
            const active = category.slug === danhMuc;
            return <Link key={category.slug} to="/san-pham" search={{ danh_muc: category.slug, q: "" }} className={`flex w-[62px] shrink-0 flex-col items-center border-b-2 pb-2 text-center ${active ? "border-[#0758c9] text-[#0758c9]" : "border-transparent text-[#53647f]"}`}><span className={`grid h-9 w-9 place-items-center rounded-full ${active ? "bg-[#eaf2ff]" : "bg-[#f4f6f9]"}`}><Icon className="h-4 w-4" /></span><span className="mt-1 line-clamp-2 text-[8px] font-semibold leading-tight">{landingCategoryCopy[index]?.[0] ?? category.name}</span></Link>;
          })}
        </div>
        <div className="relative overflow-hidden rounded-xl bg-[#0758c9] px-4 py-4 text-white">
          <img src={images.solution2} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0758c9] via-[#0758c9]/90 to-transparent" />
          <div className="relative max-w-[58%]"><h1 className="text-[13px] font-black">{activeCategory?.name ?? "Sản phẩm chính hãng"}</h1><p className="mt-1 text-[8px] leading-relaxed text-white/90">Giải pháp tốt, hàng chính hãng, bảo hành uy tín</p><div className="mt-2 flex gap-1 text-[7px]"><CheckCircle2 className="h-3 w-3" /> Tư vấn đúng nhu cầu</div></div>
        </div>
      </div>

      <div className="px-3 pt-3">
        <label className="flex h-10 items-center rounded-lg border bg-white px-3"><Search className="mr-2 h-4 w-4 text-[#60718b]" /><Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm trong sản phẩm..." className="h-auto border-0 p-0 text-xs shadow-none focus-visible:ring-0" /></label>
        <div className="mt-3 flex gap-2">
          <Select value={sort} onValueChange={setSort}><SelectTrigger className="h-9 flex-1 bg-white text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Sắp xếp: Mới nhất</SelectItem><SelectItem value="newest">Mới nhất</SelectItem><SelectItem value="price_asc">Giá tăng dần</SelectItem><SelectItem value="price_desc">Giá giảm dần</SelectItem></SelectContent></Select>
          <Sheet><SheetTrigger asChild><Button variant="outline" className="h-9 bg-white text-[10px]"><SlidersHorizontal className="h-3.5 w-3.5" /> Bộ lọc{activeCount ? ` (${activeCount})` : ""}</Button></SheetTrigger><SheetContent side="right" className="w-[88vw] overflow-y-auto"><SheetTitle>Bộ lọc sản phẩm</SheetTitle><div className="px-4 pb-8">{filters}</div></SheetContent></Sheet>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {filtered.map((product) => <ProductCard key={product.id} product={product} compareChecked={compareSlugs.includes(product.slug)} onCompareToggle={() => toggleCompare(product.slug)} />)}
        </div>
      </div>
    </div>
  );
}

const landingIcons = [SunMedium, Camera, BatteryCharging, Wifi, Cpu, Ellipsis];
const landingCategoryCopy = [
  ["Điện mặt trời", "Tấm pin, biến tần, phụ kiện", "128 sản phẩm"],
  ["Camera an ninh", "Camera, đầu ghi, ổ cứng, phụ kiện", "243 sản phẩm"],
  ["Pin lưu trữ", "Pin lithium, pin lưu trữ năng lượng", "36 sản phẩm"],
  ["Thiết bị mạng - Wi-Fi", "Router, access point, switch, phủ sóng", "67 sản phẩm"],
  ["Điện máy - Thiết bị điện", "Điều hòa, quạt, thiết bị điện dân dụng", "95 sản phẩm"],
  ["Khác", "Dây điện, tủ điện, phụ kiện, vật tư khác", "72 sản phẩm"],
] as const;

function ProductLanding() {
  return <div className="bg-white pb-8">
    <section className="relative isolate overflow-hidden bg-[#063b86] text-white">
      <img src={images.solution2} alt="Sản phẩm chính hãng" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-65" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#063b86] via-[#0758c9]/90 to-transparent" />
      <div className="mx-auto max-w-[1180px] px-[18px] py-7 sm:px-6 sm:py-14 lg:px-8">
        <p className="text-[10px] font-bold uppercase tracking-wide sm:text-sm">Sản phẩm chính hãng</p>
        <h1 className="mt-2 max-w-[300px] text-[23px] font-black uppercase leading-tight sm:max-w-xl sm:text-5xl">Đầy đủ - Giá tốt - Bảo hành uy tín</h1>
        <ul className="mt-3 space-y-1 text-[8px] font-semibold sm:text-xs">{["Sản phẩm chính hãng 100%","Bảo hành chính hãng toàn quốc","Hỗ trợ kỹ thuật nhanh chóng"].map(x=><li key={x} className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" />{x}</li>)}</ul>
      </div>
    </section>

    <div className="mx-auto max-w-[1180px] px-[18px] sm:px-6 lg:px-8">
      <label className="relative -mt-3 flex h-11 items-center gap-3 rounded-[9px] border border-[#e0e6ef] bg-white px-3.5 shadow-card sm:mx-auto sm:-mt-5 sm:max-w-2xl"><span className="text-[10px] text-[#8b98ac]">Bạn cần tìm sản phẩm nào?</span><Search className="ml-auto h-4 w-4 text-[#163a72]" /></label>

      <div className="mt-5 grid grid-cols-6 gap-1.5 sm:gap-3">{categories.map((category,index)=>{const Icon=landingIcons[index] ?? Cpu; return <Link key={category.slug} to="/san-pham" search={{danh_muc:category.slug,q:""}} className="flex min-w-0 flex-col items-center text-center"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f6fb] sm:h-14 sm:w-14"><Icon className={`h-5 w-5 ${index===0?"text-[#ff7a00]":"text-[#0b3b78]"}`} /></span><strong className="mt-1.5 line-clamp-2 text-[7px] leading-tight text-[#102650] sm:text-[10px]">{landingCategoryCopy[index]?.[0] ?? category.name}</strong></Link>})}</div>

      <section className="mt-7"><div className="flex items-center justify-between"><h2 className="text-[13px] font-black uppercase text-[#071c4c]">Danh mục sản phẩm</h2><span className="text-[9px] font-bold text-[#0758c9]">Xem tất cả <ChevronRight className="inline h-3 w-3" /></span></div><div className="mt-3 divide-y divide-[#edf0f4] rounded-xl border border-[#e5e9f0] bg-white px-3 shadow-[0_2px_10px_rgba(16,52,100,.05)]">{categories.map((category,index)=>{const Icon=landingIcons[index]??Cpu; const copy=landingCategoryCopy[index]; return <Link key={category.slug} to="/san-pham" search={{danh_muc:category.slug,q:""}} className="flex items-center gap-3 py-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f2f6fb]"><Icon className="h-5 w-5 text-[#153c77]" /></span><span className="min-w-0 flex-1"><strong className="block text-[10px] text-[#071c4c] sm:text-xs">{copy?.[0] ?? category.name}</strong><span className="mt-0.5 block truncate text-[7px] text-muted-foreground sm:text-[9px]">{copy?.[1] ?? category.description}</span><span className="text-[7px] font-semibold text-[#0758c9]">{copy?.[2] ?? "Sản phẩm"}</span></span><ChevronRight className="h-4 w-4 text-[#526789]" /></Link>})}</div></section>

      <section className="mt-7"><div className="flex items-center justify-between"><h2 className="text-[13px] font-black uppercase text-[#071c4c]">Sản phẩm nổi bật</h2><Link to="/san-pham" search={{danh_muc:categories[0]?.slug??"",q:""}} className="text-[9px] font-bold text-[#0758c9]">Xem tất cả <ChevronRight className="inline h-3 w-3" /></Link></div><div className="hide-scrollbar mt-3 flex items-stretch gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-4">{products.slice(0,4).map(product=><div key={product.id} className="w-[135px] shrink-0 sm:w-auto"><ProductCard product={product} /></div>)}</div></section>

      <section className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{[[ShieldCheck,"Sản phẩm chính hãng"],[SunMedium,"Giá tốt nhất"],[BatteryCharging,"Bảo hành uy tín"],[Wifi,"Giao hàng toàn quốc"]].map(([I,text])=>{const Icon=I as typeof ShieldCheck;return <div key={text as string} className="flex items-center gap-2 rounded-lg bg-[#f5f8fe] p-3"><Icon className="h-5 w-5 text-[#0758c9]"/><span className="text-[8px] font-bold text-[#102650] sm:text-[10px]">{text as string}</span></div>})}</section>

      <section className="mt-5 overflow-hidden rounded-[14px] bg-gradient-to-br from-[#063b86] via-[#0758c9] to-[#0875df] p-4 text-white shadow-[0_8px_22px_rgba(6,59,134,.2)]">
        <div>
          <h2 className="max-w-[290px] text-[14px] font-black uppercase leading-[1.25] tracking-[-0.01em]">
            Cần tư vấn chọn sản phẩm phù hợp?
          </h2>
          <p className="mt-1.5 text-[9px] leading-relaxed text-white/80">
            Đội ngũ Hoàng Vĩnh IOT luôn sẵn sàng hỗ trợ anh lựa chọn đúng sản phẩm.
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href="tel:19006868"
            className="flex h-10 items-center justify-center rounded-lg bg-[#ff7800] px-3 text-[11px] font-bold shadow-sm transition-colors active:bg-[#e96e00]"
          >
            Gọi ngay
          </a>
          <a
            href="https://zalo.me"
            className="flex h-10 items-center justify-center rounded-lg border border-white/25 bg-[#0786ed] px-3 text-[11px] font-bold shadow-sm transition-colors active:bg-[#0675d1]"
          >
            Chat Zalo
          </a>
        </div>
      </section>
    </div>
  </div>;
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-t border-border first:border-t-0">
      <th className="w-40 min-w-40 bg-secondary/40 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
