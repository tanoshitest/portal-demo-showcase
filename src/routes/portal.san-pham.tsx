import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FolderPlus, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";
import { brands, categories, products, type Category, type Product } from "@/data/mock";
import { loadAdminCategories, saveAdminCategories } from "@/data/categories-store";
import { loadAdminProducts, padProductGallery, upsertAdminProduct } from "@/data/products-store";
import { formatVnd } from "@/lib/format";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/portal/san-pham")({
  head: () => ({
    meta: [
      { title: "Quản lý sản phẩm | Hoàng Vĩnh VKT" },
      { name: "description", content: "Danh sách sản phẩm trên Portal dành cho Admin và Sale." },
      { property: "og:title", content: "Quản lý sản phẩm | Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Danh sách sản phẩm trên Portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalProducts,
});

type FormState = {
  id: string;
  image: string;
  gallery: string[];
  name: string;
  slug: string;
  sku: string;
  brandSlug: string;
  categorySlug: string;
  price: string;
  salePrice: string;
  stock: string;
  warranty: string;
  description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  variants: { id: string; name: string; sku: string; price: string }[];
};

function brandName(slug: string) {
  return brands.find((b) => b.slug === slug)?.name ?? slug;
}

function categoryName(slug: string) {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function blankForm(): FormState {
  return {
    id: newId("p"),
    image: "",
    gallery: padProductGallery(),
    name: "",
    slug: "",
    sku: "",
    brandSlug: brands[0]?.slug ?? "",
    categorySlug: categories[0]?.slug ?? "",
    price: "",
    salePrice: "",
    stock: "0",
    warranty: "12 tháng",
    description: "",
    highlights: [""],
    specs: [{ label: "", value: "" }],
    variants: [{ id: newId("v"), name: "", sku: "", price: "" }],
  };
}

function fromProduct(product: Product): FormState {
  return {
    id: product.id,
    image: product.image ?? "",
    gallery: padProductGallery(product.gallery),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brandSlug: product.brandSlug,
    categorySlug: product.categorySlug,
    price: String(product.price),
    salePrice: product.salePrice != null ? String(product.salePrice) : "",
    stock: String(product.stock),
    warranty: product.warranty,
    description: product.description,
    highlights: product.highlights.length ? [...product.highlights] : [""],
    specs: product.specs.length ? product.specs.map((s) => ({ ...s })) : [{ label: "", value: "" }],
    variants: product.variants.length
      ? product.variants.map((v) => ({ ...v, price: String(v.price) }))
      : [{ id: newId("v"), name: "", sku: "", price: "" }],
  };
}

function toProduct(form: FormState, original?: Product): Product | string {
  if (!form.name.trim()) return "Nhập tên sản phẩm.";
  if (!form.sku.trim()) return "Nhập SKU.";
  if (!form.slug.trim()) return "Nhập slug.";
  const price = Number(form.price);
  if (!Number.isFinite(price) || price < 0) return "Giá gốc không hợp lệ.";

  const saleRaw = form.salePrice.trim();
  let salePrice: number | undefined;
  if (saleRaw) {
    const n = Number(saleRaw);
    if (!Number.isFinite(n) || n < 0) return "Giá khuyến mãi không hợp lệ.";
    salePrice = n;
  }

  const stock = Number(form.stock);
  if (!Number.isFinite(stock) || stock < 0) return "Tồn kho không hợp lệ.";

  const next: Product = {
    id: form.id,
    name: form.name.trim(),
    slug: form.slug.trim(),
    sku: form.sku.trim(),
    brandSlug: form.brandSlug,
    categorySlug: form.categorySlug,
    price,
    stock: Math.round(stock),
    warranty: form.warranty.trim(),
    rating: original?.rating ?? 0,
    reviewCount: original?.reviewCount ?? 0,
    image: form.image.trim(),
    gallery: padProductGallery(form.gallery).map((src) => src.trim()),
    description: form.description.trim(),
    highlights: form.highlights.map((h) => h.trim()).filter(Boolean),
    specs: form.specs
      .filter((s) => s.label.trim() || s.value.trim())
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() })),
    variants: form.variants
      .filter((v) => v.name.trim() || v.sku.trim())
      .map((v) => ({
        id: v.id || newId("v"),
        name: v.name.trim() || "Mặc định",
        sku: v.sku.trim() || form.sku.trim(),
        price:
          Number.isFinite(Number(v.price)) && v.price !== ""
            ? Number(v.price)
            : (salePrice ?? price),
      })),
    reviews: original?.reviews ?? [],
  };

  if (salePrice != null) next.salePrice = salePrice;
  if (!next.variants.length) {
    next.variants = [
      { id: newId("v"), name: "Mặc định", sku: next.sku, price: salePrice ?? price },
    ];
  }
  return next;
}

function StockQtyInput({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (qty: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const n = Math.round(Number(draft));
    if (!Number.isFinite(n) || n < 0) {
      setDraft(String(value));
      return;
    }
    setDraft(String(n));
    if (n !== value) onCommit(n);
  };

  return (
    <Input
      type="number"
      min={0}
      step={1}
      className="h-8 w-20 font-mono text-sm"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      aria-label="Tồn kho"
    />
  );
}

function PortalProducts() {
  const { user } = useStore();
  const [list, setList] = useState<Product[]>(() => products.slice(0, 1));
  const [open, setOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState<FormState>(() => blankForm());
  const [categoryList, setCategoryList] = useState<Category[]>(categories.slice(0, 1));
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  useEffect(() => {
    setList(loadAdminProducts());
    setCategoryList(loadAdminCategories());
  }, []);

  const openCreate = () => {
    setIsCreate(true);
    setForm({ ...blankForm(), categorySlug: categoryList[0]?.slug ?? "" });
    setOpen(true);
  };

  const updateCategories = (next: Category[]) => {
    setCategoryList(next);
    saveAdminCategories(next);
  };

  const addCategory = () => {
    const name = window.prompt("Tên danh mục mới:")?.trim();
    if (!name) return;
    const slug = slugify(name);
    if (!slug || categoryList.some((item) => item.slug === slug)) {
      toast.error("Tên hoặc slug danh mục đã tồn tại");
      return;
    }
    const description = window.prompt("Mô tả ngắn cho danh mục:")?.trim() ?? "";
    updateCategories([...categoryList, { id: newId("category"), slug, name, description, icon: "Cpu" }]);
    toast.success("Đã thêm danh mục", { description: name });
  };

  const editCategory = (category: Category) => {
    const name = window.prompt("Tên danh mục:", category.name)?.trim();
    if (!name) return;
    const description = window.prompt("Mô tả ngắn:", category.description)?.trim() ?? "";
    updateCategories(categoryList.map((item) => item.id === category.id ? { ...item, name, description } : item));
  };

  const deleteCategory = (category: Category) => {
    if (list.some((product) => product.categorySlug === category.slug)) {
      toast.error("Không thể xóa danh mục đang có sản phẩm");
      return;
    }
    if (window.confirm(`Xóa danh mục ${category.name}?`)) updateCategories(categoryList.filter((item) => item.id !== category.id));
  };

  const openEdit = (product: Product) => {
    setIsCreate(false);
    setForm(fromProduct(product));
    setOpen(true);
  };

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (event?: FormEvent) => {
    event?.preventDefault();
    const original = list.find((p) => p.id === form.id);
    const result = toProduct(form, original);
    if (typeof result === "string") {
      toast.error(result);
      return;
    }
    setList((prev) => upsertAdminProduct(prev, result));
    toast.success(isCreate ? "Đã thêm sản phẩm" : "Đã lưu sản phẩm", {
      description: result.name,
    });
    setOpen(false);
  };

  if (!user) return <PortalGate />;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pt-6 lg:px-8">
      <div className="flex w-full shrink-0 flex-wrap items-start justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Quản lý sản phẩm</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Danh sách sản phẩm hiện có trên website. {list.length} sản phẩm. Chỉnh sửa được lưu trên
            trình duyệt (demo).
          </p>
        </div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => setShowCategoryManager((value) => !value)}><FolderPlus /> Danh mục</Button><Button onClick={openCreate}><Plus /> Thêm sản phẩm</Button></div>
      </div>

      {showCategoryManager ? <section className="mb-4 shrink-0 rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between"><div><h2 className="font-bold">Danh mục sản phẩm</h2><p className="text-xs text-muted-foreground">Website đang hiển thị {categoryList.length} danh mục.</p></div><Button size="sm" onClick={addCategory}><Plus /> Thêm danh mục</Button></div><div className="mt-3 flex flex-wrap gap-2">{categoryList.map((category) => <div key={category.id} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2"><div><p className="text-sm font-semibold">{category.name}</p><p className="max-w-52 truncate text-xs text-muted-foreground">{category.description}</p></div><Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => editCategory(category)}><Pencil className="h-3.5 w-3" /></Button><Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteCategory(category)}><Trash2 className="h-3.5 w-3" /></Button></div>)}</div></section> : null}

      <section className="min-h-0 w-full flex-1 overflow-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="w-16 bg-card">Ảnh</TableHead>
              <TableHead className="bg-card">Tên</TableHead>
              <TableHead className="bg-card">SKU</TableHead>
              <TableHead className="bg-card">Hãng</TableHead>
              <TableHead className="bg-card">Danh mục</TableHead>
              <TableHead className="bg-card text-right">Giá gốc</TableHead>
              <TableHead className="bg-card text-right">Giá KM</TableHead>
              <TableHead className="bg-card">Tồn kho</TableHead>
              <TableHead className="bg-card">Bảo hành</TableHead>
              <TableHead className="bg-card text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-md border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-dashed text-[10px] text-muted-foreground">
                      Ảnh
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-[220px] font-medium">
                  <span className="line-clamp-2">{p.name}</span>
                </TableCell>
                <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                <TableCell>{brandName(p.brandSlug)}</TableCell>
                <TableCell>{categoryList.find((category) => category.slug === p.categorySlug)?.name ?? p.categorySlug}</TableCell>
                <TableCell className="whitespace-nowrap text-right font-semibold">
                  {formatVnd(p.price)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {p.salePrice != null ? formatVnd(p.salePrice) : "—"}
                </TableCell>
                <TableCell>
                  <StockQtyInput
                    value={p.stock}
                    onCommit={(qty) =>
                      setList((prev) => upsertAdminProduct(prev, { ...p, stock: qty }))
                    }
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">{p.warranty}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    Sửa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </section>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl"
        >
          <SheetHeader className="space-y-1 border-b border-border px-6 py-4 pr-12 text-left">
            <SheetTitle>{isCreate ? "Thêm sản phẩm" : "Sửa sản phẩm"}</SheetTitle>
            <SheetDescription>
              Các trường giống trang sản phẩm trên website. Lưu vào localStorage (demo, không có máy
              chủ).
            </SheetDescription>
          </SheetHeader>

          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSave}>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-3">
                  <Label>Ảnh sản phẩm</Label>
                  <ProductImageSlot
                    id="product-image-main"
                    label="Ảnh lớn"
                    value={form.image}
                    size="lg"
                    onChange={(next) => patch("image", next)}
                  />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {form.gallery.map((src, index) => (
                      <ProductImageSlot
                        key={index}
                        id={`product-image-thumb-${index}`}
                        label={`Ảnh nhỏ ${index + 1}`}
                        value={src}
                        size="sm"
                        onChange={(next) =>
                          setForm((prev) => {
                            const gallery = padProductGallery(prev.gallery);
                            gallery[index] = next;
                            return { ...prev, gallery };
                          })
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">JPG, PNG hoặc WebP, mỗi ảnh tối đa 2 MB.</p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="product-name">Tên sản phẩm</Label>
                  <Input
                    id="product-name"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        name,
                        slug:
                          isCreate && (!prev.slug || prev.slug === slugify(prev.name))
                            ? slugify(name)
                            : prev.slug,
                      }));
                    }}
                    placeholder="MCCB 3P 250A Schneider…"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-slug">Slug</Label>
                  <Input
                    id="product-slug"
                    value={form.slug}
                    onChange={(e) => patch("slug", e.target.value)}
                    placeholder="mccb-3p-250a-schneider"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-sku">SKU</Label>
                  <Input
                    id="product-sku"
                    value={form.sku}
                    onChange={(e) => patch("sku", e.target.value)}
                    placeholder="SCH-CVS250-3P"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hãng</Label>
                  <Select value={form.brandSlug} onValueChange={(v) => patch("brandSlug", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hãng" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.slug}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select value={form.categorySlug} onValueChange={(v) => patch("categorySlug", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryList.map((c) => (
                        <SelectItem key={c.id} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-price">Giá gốc</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min={0}
                    step={1000}
                    value={form.price}
                    onChange={(e) => patch("price", e.target.value)}
                    placeholder="8450000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-sale">Giá khuyến mãi</Label>
                  <Input
                    id="product-sale"
                    type="number"
                    min={0}
                    step={1000}
                    value={form.salePrice}
                    onChange={(e) => patch("salePrice", e.target.value)}
                    placeholder="Để trống nếu không KM"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-stock">Tồn kho</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    min={0}
                    step={1}
                    value={form.stock}
                    onChange={(e) => patch("stock", e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-warranty">Bảo hành</Label>
                  <Input
                    id="product-warranty"
                    value={form.warranty}
                    onChange={(e) => patch("warranty", e.target.value)}
                    placeholder="12 tháng chính hãng"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="product-desc">Mô tả</Label>
                  <Textarea
                    id="product-desc"
                    rows={4}
                    value={form.description}
                    onChange={(e) => patch("description", e.target.value)}
                    className="min-h-[96px]"
                  />
                </div>
              </div>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Điểm nổi bật</legend>
                {form.highlights.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const next = [...form.highlights];
                        next[index] = e.target.value;
                        patch("highlights", next);
                      }}
                      placeholder="Dòng cắt 36kA"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch(
                          "highlights",
                          form.highlights.filter((_, i) => i !== index),
                        )
                      }
                      aria-label="Xóa điểm nổi bật"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => patch("highlights", [...form.highlights, ""])}
                >
                  <Plus /> Thêm điểm nổi bật
                </Button>
              </fieldset>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Thông số kỹ thuật</legend>
                {form.specs.map((spec, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input
                      value={spec.label}
                      onChange={(e) => {
                        const next = form.specs.map((s, i) =>
                          i === index ? { ...s, label: e.target.value } : s,
                        );
                        patch("specs", next);
                      }}
                      placeholder="Nhãn (Số cực)"
                    />
                    <Input
                      value={spec.value}
                      onChange={(e) => {
                        const next = form.specs.map((s, i) =>
                          i === index ? { ...s, value: e.target.value } : s,
                        );
                        patch("specs", next);
                      }}
                      placeholder="Giá trị (3P)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch(
                          "specs",
                          form.specs.filter((_, i) => i !== index),
                        )
                      }
                      aria-label="Xóa thông số"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => patch("specs", [...form.specs, { label: "", value: "" }])}
                >
                  <Plus /> Thêm thông số
                </Button>
              </fieldset>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Phiên bản</legend>
                {form.variants.map((variant, index) => (
                  <div key={variant.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                    <Input
                      value={variant.name}
                      onChange={(e) => {
                        const next = form.variants.map((v, i) =>
                          i === index ? { ...v, name: e.target.value } : v,
                        );
                        patch("variants", next);
                      }}
                      placeholder="Tên (250A)"
                    />
                    <Input
                      value={variant.sku}
                      onChange={(e) => {
                        const next = form.variants.map((v, i) =>
                          i === index ? { ...v, sku: e.target.value } : v,
                        );
                        patch("variants", next);
                      }}
                      placeholder="SKU"
                      className="font-mono text-xs"
                    />
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={variant.price}
                      onChange={(e) => {
                        const next = form.variants.map((v, i) =>
                          i === index ? { ...v, price: e.target.value } : v,
                        );
                        patch("variants", next);
                      }}
                      placeholder="Giá"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch(
                          "variants",
                          form.variants.filter((_, i) => i !== index),
                        )
                      }
                      aria-label="Xóa phiên bản"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    patch("variants", [
                      ...form.variants,
                      { id: newId("v"), name: "", sku: "", price: "" },
                    ])
                  }
                >
                  <Plus /> Thêm phiên bản
                </Button>
              </fieldset>
            </div>

            <SheetFooter className="border-t border-border px-6 py-4 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function compressProductImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("Canvas unavailable"));
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.82));
      };
      image.src = String(reader.result ?? "");
    };
    reader.readAsDataURL(file);
  });
}

function ProductImageSlot({
  id,
  label,
  value,
  size,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  size: "lg" | "sm";
  onChange: (next: string) => void;
}) {
  const pick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng tệp hình ảnh");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh không được lớn hơn 2 MB");
      return;
    }
    try {
      onChange(await compressProductImage(file));
    } catch {
      toast.error("Không thể xử lý ảnh đã chọn");
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div
        className={`grid place-items-center overflow-hidden rounded-md border border-dashed border-border bg-secondary/30 ${
          size === "lg" ? "h-40 w-full" : "aspect-square w-full"
        }`}
      >
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className={size === "lg" ? "h-8 w-8 text-muted-foreground" : "h-5 w-5 text-muted-foreground"} />
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button type="button" variant="outline" size="sm" asChild>
          <Label htmlFor={id} className="cursor-pointer">
            <ImagePlus className="h-3.5 w-3.5" /> Chọn
          </Label>
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => onChange("")}>
            <Trash2 className="h-3.5 w-3.5" /> Xóa
          </Button>
        ) : null}
        <Input id={id} type="file" accept="image/*" className="hidden" onChange={pick} />
      </div>
    </div>
  );
}
