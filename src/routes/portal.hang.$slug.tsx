import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Download, Eye, Plus, Search, ShieldAlert } from "lucide-react";
import { PortalGate } from "@/components/portal-gate";
import { AddDocumentSheet } from "@/components/add-document-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/context/store";
import { getBrand, type Brand, type PortalDoc } from "@/data/mock";
import { downloadDocument, loadAdminDocuments, viewDocument } from "@/data/documents-store";

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
      {
        property: "og:description",
        content: "Catalogue, datasheet và hướng dẫn kỹ thuật theo hãng.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BrandDocuments,
});

function BrandDocuments() {
  const { brand } = Route.useLoaderData() as { brand: Brand };
  const { user } = useStore();
  const [docs, setDocs] = useState<PortalDoc[]>([]);
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDocs(loadAdminDocuments());
  }, []);

  if (!user) return <PortalGate />;

  const isAdmin = user.role === "admin";
  const hasBrandAccess = user.brandSlugs === "all" || user.brandSlugs.includes(brand.slug);
  const brandDocs = docs.filter((d) => d.brandSlug === brand.slug);
  const visible = brandDocs.filter(
    (d) => d.roles.includes(user.role) && d.name.toLowerCase().includes(keyword.toLowerCase()),
  );

  return (
    <div className="box-border h-full w-full max-w-none overflow-y-auto px-6 py-6 lg:px-8">
      <nav className="text-xs text-muted-foreground">
        <Link to="/portal/tai-lieu" className="hover:text-brand">
          Tài liệu hãng
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">{brand.name}</span>
      </nav>

      <div className="mt-2 flex w-full flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-black sm:text-3xl">{brand.name}</h1>
        {isAdmin && hasBrandAccess ? (
          <Button onClick={() => setOpen(true)}>
            <Plus /> Thêm tài liệu
          </Button>
        ) : null}
      </div>

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
            <span className="ml-auto text-sm text-muted-foreground">{visible.length} tài liệu</span>
          </div>

          <section className="mt-4 w-full overflow-hidden rounded-xl border border-border bg-card shadow-card">
            {visible.length === 0 ? (
              <p className="p-10 text-center text-sm text-muted-foreground">
                Không có tài liệu phù hợp.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Phiên bản</TableHead>
                    <TableHead>Dung lượng</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead className="text-right"> </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="max-w-[280px] font-medium">
                        <span className="line-clamp-2">{d.name}</span>
                      </TableCell>
                      <TableCell>{d.type}</TableCell>
                      <TableCell>{d.version}</TableCell>
                      <TableCell className="whitespace-nowrap">{d.size}</TableCell>
                      <TableCell className="whitespace-nowrap">{d.updatedAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => viewDocument(d)}>
                            <Eye className="h-4 w-4" /> Xem
                          </Button>
                          <Button size="sm" onClick={() => downloadDocument(d)}>
                            <Download className="h-4 w-4" /> Tải về
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </>
      )}

      {isAdmin ? (
        <AddDocumentSheet
          open={open}
          onOpenChange={setOpen}
          onAdded={setDocs}
          defaultBrandSlug={brand.slug}
        />
      ) : null}
    </div>
  );
}
