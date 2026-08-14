import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";
import { products, SOLUTION_GROUPS, solutions, type Solution } from "@/data/mock";
import { loadAdminSolutions, upsertAdminSolution } from "@/data/solutions-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export const Route = createFileRoute("/portal/giai-phap-ql")({
  head: () => ({
    meta: [
      { title: "Quản lý giải pháp | Hoàng Vĩnh VKT" },
      { name: "description", content: "Danh sách giải pháp trên Portal dành cho Admin và Sale." },
      { property: "og:title", content: "Quản lý giải pháp | Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Danh sách giải pháp trên Portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalSolutions,
});

type FormState = {
  id: string;
  image: string;
  name: string;
  slug: string;
  group: string;
  short: string;
  benefits: { title: string; desc: string }[];
  audience: string[];
  systems: string[];
  packages: { id: string; name: string; desc: string; price: string; items: string[] }[];
  productSlugs: string[];
  process: { step: string; desc: string }[];
  faq: { q: string; a: string }[];
};

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
    id: newId("s"),
    image: "",
    name: "",
    slug: "",
    group: SOLUTION_GROUPS[0],
    short: "",
    benefits: [{ title: "", desc: "" }],
    audience: [""],
    systems: [""],
    packages: [{ id: newId("pk"), name: "", desc: "", price: "", items: [""] }],
    productSlugs: [],
    process: [{ step: "", desc: "" }],
    faq: [{ q: "", a: "" }],
  };
}

function fromSolution(item: Solution): FormState {
  return {
    id: item.id,
    image: item.image ?? "",
    name: item.name,
    slug: item.slug,
    group: item.group,
    short: item.short,
    benefits: item.benefits.length ? item.benefits.map((b) => ({ ...b })) : [{ title: "", desc: "" }],
    audience: item.audience.length ? [...item.audience] : [""],
    systems: item.systems.length ? [...item.systems] : [""],
    packages: item.packages.length
      ? item.packages.map((pk) => ({ ...pk, items: pk.items.length ? [...pk.items] : [""] }))
      : [{ id: newId("pk"), name: "", desc: "", price: "", items: [""] }],
    productSlugs: [...item.productSlugs],
    process: item.process.length ? item.process.map((p) => ({ ...p })) : [{ step: "", desc: "" }],
    faq: item.faq.length ? item.faq.map((f) => ({ ...f })) : [{ q: "", a: "" }],
  };
}

function toSolution(form: FormState): Solution | string {
  if (!form.name.trim()) return "Nhập tên giải pháp.";
  if (!form.slug.trim()) return "Nhập slug.";
  if (!form.group.trim()) return "Chọn nhóm giải pháp.";

  return {
    id: form.id,
    name: form.name.trim(),
    slug: form.slug.trim(),
    group: form.group.trim(),
    short: form.short.trim(),
    image: form.image.trim(),
    benefits: form.benefits
      .filter((b) => b.title.trim() || b.desc.trim())
      .map((b) => ({ title: b.title.trim(), desc: b.desc.trim() })),
    audience: form.audience.map((a) => a.trim()).filter(Boolean),
    systems: form.systems.map((s) => s.trim()).filter(Boolean),
    packages: form.packages
      .filter((pk) => pk.name.trim() || pk.desc.trim() || pk.price.trim())
      .map((pk) => ({
        id: pk.id || newId("pk"),
        name: pk.name.trim(),
        desc: pk.desc.trim(),
        price: pk.price.trim(),
        items: pk.items.map((i) => i.trim()).filter(Boolean),
      })),
    productSlugs: form.productSlugs,
    process: form.process
      .filter((p) => p.step.trim() || p.desc.trim())
      .map((p) => ({ step: p.step.trim(), desc: p.desc.trim() })),
    faq: form.faq
      .filter((f) => f.q.trim() || f.a.trim())
      .map((f) => ({ q: f.q.trim(), a: f.a.trim() })),
  };
}

function PortalSolutions() {
  const { user } = useStore();
  const [list, setList] = useState<Solution[]>(() => solutions);
  const [open, setOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState<FormState>(() => blankForm());

  useEffect(() => {
    setList(loadAdminSolutions());
  }, []);

  const openCreate = () => {
    setIsCreate(true);
    setForm(blankForm());
    setOpen(true);
  };

  const openEdit = (item: Solution) => {
    setIsCreate(false);
    setForm(fromSolution(item));
    setOpen(true);
  };

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (event?: FormEvent) => {
    event?.preventDefault();
    const result = toSolution(form);
    if (typeof result === "string") {
      toast.error(result);
      return;
    }
    setList((prev) => upsertAdminSolution(prev, result));
    toast.success(isCreate ? "Đã thêm giải pháp" : "Đã lưu giải pháp", {
      description: result.name,
    });
    setOpen(false);
  };

  if (!user) return <PortalGate />;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pt-6 lg:px-8">
      <div className="flex w-full shrink-0 flex-wrap items-start justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Quản lý giải pháp</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Các trường giống trang Giải pháp trên website. {list.length} giải pháp. Chỉnh sửa được
            lưu trên trình duyệt (demo).
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Thêm giải pháp
        </Button>
      </div>

      <section className="min-h-0 w-full flex-1 overflow-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="w-16 bg-card">Ảnh</TableHead>
              <TableHead className="bg-card">Tên</TableHead>
              <TableHead className="bg-card">Nhóm</TableHead>
              <TableHead className="bg-card">Mô tả ngắn</TableHead>
              <TableHead className="bg-card">Lợi ích</TableHead>
              <TableHead className="bg-card">Gói</TableHead>
              <TableHead className="bg-card text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  {s.image ? (
                    <img
                      src={s.image}
                      alt={s.name}
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
                  <span className="line-clamp-2">{s.name}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">{s.group}</TableCell>
                <TableCell className="max-w-[280px] text-muted-foreground">
                  <span className="line-clamp-2">{s.short}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">{s.benefits.length}</TableCell>
                <TableCell className="whitespace-nowrap">{s.packages.length}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
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
            <SheetTitle>{isCreate ? "Thêm giải pháp" : "Sửa giải pháp"}</SheetTitle>
            <SheetDescription>
              Field lấy từ trang danh sách và trang chi tiết giải pháp trên website.
            </SheetDescription>
          </SheetHeader>

          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSave}>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="solution-image">Ảnh (URL)</Label>
                  <div className="flex gap-3">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt={form.name || "Ảnh giải pháp"}
                        className="h-20 w-20 shrink-0 rounded-md border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                        Ảnh
                      </div>
                    )}
                    <Input
                      id="solution-image"
                      value={form.image}
                      onChange={(e) => patch("image", e.target.value)}
                      placeholder="https://… hoặc giữ ảnh hiện tại"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="solution-name">Tên giải pháp</Label>
                  <Input
                    id="solution-name"
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
                    placeholder="Hệ thống điện nhà xưởng"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solution-slug">Slug</Label>
                  <Input
                    id="solution-slug"
                    value={form.slug}
                    onChange={(e) => patch("slug", e.target.value)}
                    placeholder="he-thong-dien-nha-xuong"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nhóm (tag lọc trên web)</Label>
                  <Select value={form.group} onValueChange={(v) => patch("group", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhóm" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOLUTION_GROUPS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="solution-short">Mô tả ngắn</Label>
                  <Textarea
                    id="solution-short"
                    rows={3}
                    value={form.short}
                    onChange={(e) => patch("short", e.target.value)}
                    className="min-h-[80px]"
                    placeholder="Tóm tắt hiển thị trên thẻ danh sách…"
                  />
                </div>
              </div>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Lợi ích (title + mô tả)</legend>
                {form.benefits.map((item, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input
                      value={item.title}
                      onChange={(e) => {
                        const next = form.benefits.map((b, i) =>
                          i === index ? { ...b, title: e.target.value } : b,
                        );
                        patch("benefits", next);
                      }}
                      placeholder="An toàn theo tiêu chuẩn"
                    />
                    <Input
                      value={item.desc}
                      onChange={(e) => {
                        const next = form.benefits.map((b, i) =>
                          i === index ? { ...b, desc: e.target.value } : b,
                        );
                        patch("benefits", next);
                      }}
                      placeholder="Mô tả chi tiết lợi ích"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch(
                          "benefits",
                          form.benefits.filter((_, i) => i !== index),
                        )
                      }
                      aria-label="Xóa lợi ích"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => patch("benefits", [...form.benefits, { title: "", desc: "" }])}
                >
                  <Plus /> Thêm lợi ích
                </Button>
              </fieldset>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Đối tượng phù hợp</legend>
                {form.audience.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const next = [...form.audience];
                        next[index] = e.target.value;
                        patch("audience", next);
                      }}
                      placeholder="Nhà máy sản xuất mới xây"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch(
                          "audience",
                          form.audience.filter((_, i) => i !== index),
                        )
                      }
                      aria-label="Xóa đối tượng"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => patch("audience", [...form.audience, ""])}
                >
                  <Plus /> Thêm đối tượng
                </Button>
              </fieldset>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Các loại hệ thống</legend>
                {form.systems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const next = [...form.systems];
                        next[index] = e.target.value;
                        patch("systems", next);
                      }}
                      placeholder="Trạm biến áp & tủ MSB"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch(
                          "systems",
                          form.systems.filter((_, i) => i !== index),
                        )
                      }
                      aria-label="Xóa hệ thống"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => patch("systems", [...form.systems, ""])}
                >
                  <Plus /> Thêm hệ thống
                </Button>
              </fieldset>

              <fieldset className="mt-6 space-y-4">
                <legend className="text-sm font-semibold">Gói giải pháp</legend>
                {form.packages.map((pk, index) => (
                  <div key={pk.id} className="space-y-2 rounded-lg border border-border p-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <Input
                        value={pk.name}
                        onChange={(e) => {
                          const next = form.packages.map((p, i) =>
                            i === index ? { ...p, name: e.target.value } : p,
                          );
                          patch("packages", next);
                        }}
                        placeholder="Gói Cơ bản"
                      />
                      <Input
                        value={pk.price}
                        onChange={(e) => {
                          const next = form.packages.map((p, i) =>
                            i === index ? { ...p, price: e.target.value } : p,
                          );
                          patch("packages", next);
                        }}
                        placeholder="Từ 180.000.000đ"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          patch(
                            "packages",
                            form.packages.filter((_, i) => i !== index),
                          )
                        }
                        aria-label="Xóa gói"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <Input
                      value={pk.desc}
                      onChange={(e) => {
                        const next = form.packages.map((p, i) =>
                          i === index ? { ...p, desc: e.target.value } : p,
                        );
                        patch("packages", next);
                      }}
                      placeholder="Cho xưởng dưới 1.000m²…"
                    />
                    {pk.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => {
                            const next = form.packages.map((p, i) => {
                              if (i !== index) return p;
                              const items = [...p.items];
                              items[itemIndex] = e.target.value;
                              return { ...p, items };
                            });
                            patch("packages", next);
                          }}
                          placeholder="Hạng mục trong gói"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const next = form.packages.map((p, i) =>
                              i === index
                                ? { ...p, items: p.items.filter((_, j) => j !== itemIndex) }
                                : p,
                            );
                            patch("packages", next);
                          }}
                          aria-label="Xóa hạng mục gói"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const next = form.packages.map((p, i) =>
                          i === index ? { ...p, items: [...p.items, ""] } : p,
                        );
                        patch("packages", next);
                      }}
                    >
                      <Plus /> Thêm hạng mục gói
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    patch("packages", [
                      ...form.packages,
                      { id: newId("pk"), name: "", desc: "", price: "", items: [""] },
                    ])
                  }
                >
                  <Plus /> Thêm gói
                </Button>
              </fieldset>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Quy trình triển khai</legend>
                {form.process.map((item, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input
                      value={item.step}
                      onChange={(e) => {
                        const next = form.process.map((p, i) =>
                          i === index ? { ...p, step: e.target.value } : p,
                        );
                        patch("process", next);
                      }}
                      placeholder="Khảo sát hiện trạng"
                    />
                    <Input
                      value={item.desc}
                      onChange={(e) => {
                        const next = form.process.map((p, i) =>
                          i === index ? { ...p, desc: e.target.value } : p,
                        );
                        patch("process", next);
                      }}
                      placeholder="Mô tả bước triển khai"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch(
                          "process",
                          form.process.filter((_, i) => i !== index),
                        )
                      }
                      aria-label="Xóa bước"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => patch("process", [...form.process, { step: "", desc: "" }])}
                >
                  <Plus /> Thêm bước
                </Button>
              </fieldset>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Câu hỏi thường gặp</legend>
                {form.faq.map((item, index) => (
                  <div key={index} className="space-y-2 rounded-lg border border-border p-3">
                    <div className="flex gap-2">
                      <Input
                        value={item.q}
                        onChange={(e) => {
                          const next = form.faq.map((f, i) =>
                            i === index ? { ...f, q: e.target.value } : f,
                          );
                          patch("faq", next);
                        }}
                        placeholder="Câu hỏi"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => patch("faq", form.faq.filter((_, i) => i !== index))}
                        aria-label="Xóa FAQ"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <Textarea
                      rows={2}
                      value={item.a}
                      onChange={(e) => {
                        const next = form.faq.map((f, i) =>
                          i === index ? { ...f, a: e.target.value } : f,
                        );
                        patch("faq", next);
                      }}
                      placeholder="Câu trả lời"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => patch("faq", [...form.faq, { q: "", a: "" }])}
                >
                  <Plus /> Thêm FAQ
                </Button>
              </fieldset>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Thiết bị cấu thành</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {products.map((p) => {
                    const checked = form.productSlugs.includes(p.slug);
                    return (
                      <label
                        key={p.id}
                        htmlFor={`solution-product-${p.slug}`}
                        className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary/50"
                      >
                        <Checkbox
                          id={`solution-product-${p.slug}`}
                          checked={checked}
                          onCheckedChange={(value) => {
                            const on = value === true;
                            patch(
                              "productSlugs",
                              on
                                ? [...form.productSlugs, p.slug]
                                : form.productSlugs.filter((s) => s !== p.slug),
                            );
                          }}
                          className="mt-0.5"
                        />
                        <span className="leading-snug">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
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
