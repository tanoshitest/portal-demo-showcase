import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Download, Eye, FileText, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/context/store";
import { documents, getBrand, type Brand } from "@/data/mock";
import { PortalGate } from "./portal.dashboard";

export const Route = createFileRoute("/portal/hang/$slug")({
  loader: ({ params }) => {
    const brand = getBrand(params.slug);
    if (!brand) throw notFound();
    return { brand };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Tài liệu ${loaderData.brand.name} | Portal Hoàng Vĩnh VKT`
          : "Không tìm thấy hãng | Portal",
      },
      {
        name: "description",
        content: "Danh sách tài liệu kỹ thuật của hãng dành cho tài khoản Portal được cấp quyền.",
      },
      { property: "og:title", content: "Tài liệu hãng – Portal Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Catalogue, datasheet và hướng dẫn kỹ thuật theo hãng." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BrandDocuments,
});

function BrandDocuments() {
  const { brand } = Route.useLoaderData() as { brand: Brand };
  const { user } = useStore();
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("all");

  if (!user) return <PortalGate />;

  const hasBrandAccess = user.brandSlugs === "all" || user.brandSlugs.includes(brand.slug);
  const brandDocs = documents.filter((d) => d.brandSlug === brand.slug);
  const visible = brandDocs.filter(
    (d) =>
      d.roles.includes(user.role) &&
      (type === "all" || d.type === type) &&
      d.name.toLowerCase().includes(keyword.toLowerCase()),
  );
  const restricted = brandDocs.length - brandDocs.filter((d) => d.roles.includes(user.role)).length;

  return (
    <div className="container-page py-6 lg:py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/portal/dashboard" className="hover:text-brand">
          Portal
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">{brand.name}</span>
      </nav>
      <h1 className="mt-2 text-2xl font-black sm:text-3xl">Tài liệu {brand.name}</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{brand.description}</p>

      {!hasBrandAccess ? (
        <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm">
          <ShieldAlert className="h-6 w-6 text-destructive" />
          <h2 className="mt-2 font-bold">Tài khoản của bạn chưa được cấp quyền cho hãng này</h2>
          <p className="mt-1 text-muted-foreground">
            Vui lòng liên hệ quản trị viên để được bổ sung quyền truy cập.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm tài liệu…"
                className="pl-9"
              />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="Catalogue">Catalogue</SelectItem>
                <SelectItem value="Datasheet">Datasheet</SelectItem>
                <SelectItem value="Hướng dẫn">Hướng dẫn</SelectItem>
                <SelectItem value="Phần mềm">Phần mềm</SelectItem>
                <SelectItem value="Chứng chỉ">Chứng chỉ</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-auto text-sm text-muted-foreground">{visible.length} tài liệu</span>
          </div>

          {restricted > 0 && (
            <p className="mt-3 rounded-lg border border-highlight/40 bg-accent px-3 py-2 text-xs text-accent-foreground">
              Có {restricted} tài liệu bị giới hạn với vai trò {user.roleLabel}.
            </p>
          )}

          {visible.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Không có tài liệu phù hợp.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {visible.map((d) => (
                <div key={d.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-snug">{d.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {d.version} · {d.size} · Cập nhật {d.updatedAt}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {d.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Đang mở bản xem trước (demo)", { description: d.name })}
                    >
                      <Eye className="h-4 w-4" /> Xem
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toast.success("Bắt đầu tải tài liệu (demo)", { description: d.name })}
                    >
                      <Download className="h-4 w-4" /> Tải về
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
