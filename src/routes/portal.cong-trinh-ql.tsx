import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";
import { products, projects, solutions, type Project } from "@/data/mock";
import { loadAdminProjects, upsertAdminProject } from "@/data/projects-store";
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

export const Route = createFileRoute("/portal/cong-trinh-ql")({
  head: () => ({
    meta: [
      { title: "Quản lý công trình | Hoàng Vĩnh VKT" },
      { name: "description", content: "Danh sách công trình trên Portal dành cho Admin và Sale." },
      { property: "og:title", content: "Quản lý công trình | Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Danh sách công trình trên Portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalProjects,
});

type FormState = {
  id: string;
  image: string;
  gallery: string[];
  name: string;
  slug: string;
  type: string;
  location: string;
  scale: string;
  year: string;
  solutionSlug: string;
  problem: string;
  solutionDesc: string;
  result: string[];
  productSlugs: string[];
};

function solutionName(slug: string) {
  return solutions.find((s) => s.slug === slug)?.name ?? slug;
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
    id: newId("pr"),
    image: "",
    gallery: [""],
    name: "",
    slug: "",
    type: "",
    location: "",
    scale: "",
    year: "",
    solutionSlug: solutions[0]?.slug ?? "",
    problem: "",
    solutionDesc: "",
    result: [""],
    productSlugs: [],
  };
}

function fromProject(project: Project): FormState {
  return {
    id: project.id,
    image: project.image ?? "",
    gallery: project.gallery.length ? [...project.gallery] : [""],
    name: project.name,
    slug: project.slug,
    type: project.type,
    location: project.location,
    scale: project.scale,
    year: project.year,
    solutionSlug: project.solutionSlug || (solutions[0]?.slug ?? ""),
    problem: project.problem,
    solutionDesc: project.solutionDesc,
    result: project.result.length ? [...project.result] : [""],
    productSlugs: [...project.productSlugs],
  };
}

function toProject(form: FormState): Project | string {
  if (!form.name.trim()) return "Nhập tên công trình.";
  if (!form.slug.trim()) return "Nhập slug.";

  return {
    id: form.id,
    name: form.name.trim(),
    slug: form.slug.trim(),
    type: form.type.trim(),
    location: form.location.trim(),
    year: form.year.trim(),
    scale: form.scale.trim(),
    image: form.image.trim(),
    gallery: form.gallery.map((g) => g.trim()).filter(Boolean),
    solutionSlug: form.solutionSlug,
    problem: form.problem.trim(),
    solutionDesc: form.solutionDesc.trim(),
    result: form.result.map((r) => r.trim()).filter(Boolean),
    productSlugs: form.productSlugs,
  };
}

function PortalProjects() {
  const { user } = useStore();
  const [list, setList] = useState<Project[]>(() => projects);
  const [open, setOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [form, setForm] = useState<FormState>(() => blankForm());

  useEffect(() => {
    setList(loadAdminProjects());
  }, []);

  const openCreate = () => {
    setIsCreate(true);
    setForm(blankForm());
    setOpen(true);
  };

  const openEdit = (project: Project) => {
    setIsCreate(false);
    setForm(fromProject(project));
    setOpen(true);
  };

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (event?: FormEvent) => {
    event?.preventDefault();
    const result = toProject(form);
    if (typeof result === "string") {
      toast.error(result);
      return;
    }
    setList((prev) => upsertAdminProject(prev, result));
    toast.success(isCreate ? "Đã thêm công trình" : "Đã lưu công trình", {
      description: result.name,
    });
    setOpen(false);
  };

  if (!user) return <PortalGate />;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pt-6 lg:px-8">
      <div className="flex w-full shrink-0 flex-wrap items-start justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Quản lý công trình</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Danh sách công trình hiện có trên website. {list.length} công trình. Chỉnh sửa được lưu
            trên trình duyệt (demo).
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Thêm công trình
        </Button>
      </div>

      <section className="min-h-0 w-full flex-1 overflow-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="w-16 bg-card">Ảnh</TableHead>
              <TableHead className="bg-card">Tên</TableHead>
              <TableHead className="bg-card">Loại</TableHead>
              <TableHead className="bg-card">Địa điểm</TableHead>
              <TableHead className="bg-card">Quy mô</TableHead>
              <TableHead className="bg-card">Năm</TableHead>
              <TableHead className="bg-card">Giải pháp</TableHead>
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
                <TableCell className="whitespace-nowrap">{p.type || "—"}</TableCell>
                <TableCell className="max-w-[180px]">
                  <span className="line-clamp-2">{p.location || "—"}</span>
                </TableCell>
                <TableCell className="max-w-[180px]">
                  <span className="line-clamp-2">{p.scale || "—"}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap">{p.year || "—"}</TableCell>
                <TableCell className="max-w-[200px]">
                  <span className="line-clamp-2">{solutionName(p.solutionSlug)}</span>
                </TableCell>
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
            <SheetTitle>{isCreate ? "Thêm công trình" : "Sửa công trình"}</SheetTitle>
            <SheetDescription>
              Các trường giống trang công trình trên website. Lưu vào localStorage (demo, không có
              máy chủ).
            </SheetDescription>
          </SheetHeader>

          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSave}>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="project-image">Ảnh chính (URL)</Label>
                  <div className="flex gap-3">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt={form.name || "Ảnh công trình"}
                        className="h-20 w-20 shrink-0 rounded-md border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                        Ảnh
                      </div>
                    )}
                    <Input
                      id="project-image"
                      value={form.image}
                      onChange={(e) => patch("image", e.target.value)}
                      placeholder="https://… hoặc giữ ảnh hiện tại"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="project-name">Tên công trình</Label>
                  <Input
                    id="project-name"
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
                    placeholder="Nhà máy thực phẩm An Phát – Long An"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-slug">Slug</Label>
                  <Input
                    id="project-slug"
                    value={form.slug}
                    onChange={(e) => patch("slug", e.target.value)}
                    placeholder="nha-may-thuc-pham-long-an"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-type">Loại</Label>
                  <Input
                    id="project-type"
                    value={form.type}
                    onChange={(e) => patch("type", e.target.value)}
                    placeholder="Nhà máy sản xuất"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-location">Địa điểm</Label>
                  <Input
                    id="project-location"
                    value={form.location}
                    onChange={(e) => patch("location", e.target.value)}
                    placeholder="Bến Lức, Long An"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-scale">Quy mô</Label>
                  <Input
                    id="project-scale"
                    value={form.scale}
                    onChange={(e) => patch("scale", e.target.value)}
                    placeholder="6.000 m² – 800kVA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-year">Năm hoàn thành</Label>
                  <Input
                    id="project-year"
                    value={form.year}
                    onChange={(e) => patch("year", e.target.value)}
                    placeholder="2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Giải pháp</Label>
                  <Select
                    value={form.solutionSlug}
                    onValueChange={(v) => patch("solutionSlug", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giải pháp" />
                    </SelectTrigger>
                    <SelectContent>
                      {solutions.map((s) => (
                        <SelectItem key={s.id} value={s.slug}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="project-problem">Bài toán</Label>
                  <Textarea
                    id="project-problem"
                    rows={4}
                    value={form.problem}
                    onChange={(e) => patch("problem", e.target.value)}
                    className="min-h-[96px]"
                    placeholder="Mô tả bài toán của khách hàng…"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="project-solution-desc">Giải pháp triển khai</Label>
                  <Textarea
                    id="project-solution-desc"
                    rows={4}
                    value={form.solutionDesc}
                    onChange={(e) => patch("solutionDesc", e.target.value)}
                    className="min-h-[96px]"
                    placeholder="Mô tả giải pháp đã triển khai…"
                  />
                </div>
              </div>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Gallery</legend>
                {form.gallery.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    {item ? (
                      <img
                        src={item}
                        alt={`Gallery ${index + 1}`}
                        className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-dashed text-[10px] text-muted-foreground">
                        Ảnh
                      </div>
                    )}
                    <Input
                      value={item}
                      onChange={(e) => {
                        const next = [...form.gallery];
                        next[index] = e.target.value;
                        patch("gallery", next);
                      }}
                      placeholder="https://… URL ảnh"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch(
                          "gallery",
                          form.gallery.filter((_, i) => i !== index),
                        )
                      }
                      aria-label="Xóa ảnh gallery"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => patch("gallery", [...form.gallery, ""])}
                >
                  <Plus /> Thêm ảnh
                </Button>
              </fieldset>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Kết quả</legend>
                {form.result.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const next = [...form.result];
                        next[index] = e.target.value;
                        patch("result", next);
                      }}
                      placeholder="Không còn sự cố dừng máy do điện trong 12 tháng"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch(
                          "result",
                          form.result.filter((_, i) => i !== index),
                        )
                      }
                      aria-label="Xóa kết quả"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => patch("result", [...form.result, ""])}
                >
                  <Plus /> Thêm kết quả
                </Button>
              </fieldset>

              <fieldset className="mt-6 space-y-3">
                <legend className="text-sm font-semibold">Thiết bị đã dùng</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {products.map((p) => {
                    const checked = form.productSlugs.includes(p.slug);
                    return (
                      <label
                        key={p.id}
                        htmlFor={`project-product-${p.slug}`}
                        className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary/50"
                      >
                        <Checkbox
                          id={`project-product-${p.slug}`}
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
