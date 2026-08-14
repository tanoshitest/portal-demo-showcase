import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PortalGate } from "@/components/portal-gate";
import { AddDocumentSheet } from "@/components/add-document-sheet";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/context/store";
import { brands, type PortalDoc } from "@/data/mock";
import { loadAdminDocuments } from "@/data/documents-store";

export const Route = createFileRoute("/portal/tai-lieu")({
  head: () => ({
    meta: [
      { title: "Portal – Tài liệu hãng | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content: "Danh sách hãng và tài liệu kỹ thuật bạn được cấp quyền truy cập.",
      },
      { property: "og:title", content: "Portal – Tài liệu hãng | Hoàng Vĩnh VKT" },
      {
        property: "og:description",
        content: "Khu vực tài liệu hãng dành cho tài khoản được cấp quyền.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalDocuments,
});

function PortalDocuments() {
  const { user } = useStore();
  const [docs, setDocs] = useState<PortalDoc[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDocs(loadAdminDocuments());
  }, []);

  if (!user) return <PortalGate />;

  const allowedBrands = brands.filter(
    (b) => user.brandSlugs === "all" || user.brandSlugs.includes(b.slug),
  );
  const allowedDocs = docs.filter(
    (d) =>
      d.roles.includes(user.role) &&
      (user.brandSlugs === "all" || user.brandSlugs.includes(d.brandSlug)),
  );
  const isAdmin = user.role === "admin";

  return (
    <div className="box-border h-full w-full max-w-none overflow-y-auto px-6 py-6 lg:px-8">
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-black sm:text-3xl">Tài liệu hãng</h1>
        {isAdmin ? (
          <Button onClick={() => setOpen(true)}>
            <Plus /> Thêm tài liệu
          </Button>
        ) : null}
      </div>

      <section className="mt-6 w-full overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {allowedBrands.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Không có hãng được cấp quyền.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hãng</TableHead>
                <TableHead>Quốc gia</TableHead>
                <TableHead className="text-right">Số tài liệu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allowedBrands.map((b) => {
                const count = allowedDocs.filter((d) => d.brandSlug === b.slug).length;
                return (
                  <TableRow key={b.slug} className="relative">
                    <TableCell className="font-medium">
                      <Link
                        to="/portal/hang/$slug"
                        params={{ slug: b.slug }}
                        className="after:absolute after:inset-0 hover:text-brand"
                      >
                        {b.name}
                      </Link>
                    </TableCell>
                    <TableCell>{b.country}</TableCell>
                    <TableCell className="text-right tabular-nums">{count}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>

      {isAdmin ? <AddDocumentSheet open={open} onOpenChange={setOpen} onAdded={setDocs} /> : null}
    </div>
  );
}
