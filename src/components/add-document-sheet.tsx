import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useStore } from "@/context/store";
import { brands, type PortalDoc } from "@/data/mock";
import {
  addAdminDocument,
  DOC_TYPES,
  fileToStoredUrl,
  formatDocDate,
  formatFileSize,
} from "@/data/documents-store";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (list: PortalDoc[]) => void;
  defaultBrandSlug?: string;
};

function newDocId() {
  return `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AddDocumentSheet({ open, onOpenChange, onAdded, defaultBrandSlug }: Props) {
  const { user } = useStore();
  const isAdmin = user?.role === "admin";
  const [brandSlug, setBrandSlug] = useState(defaultBrandSlug || brands[0]?.slug || "");
  const [name, setName] = useState("");
  const [type, setType] = useState<PortalDoc["type"]>("Catalogue");
  const [file, setFile] = useState<File | null>(null);
  const [fileNonce, setFileNonce] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBrandSlug(defaultBrandSlug || brands[0]?.slug || "");
    setName("");
    setType("Catalogue");
    setFile(null);
    setFileNonce((n) => n + 1);
    setSaving(false);
  }, [open, defaultBrandSlug]);

  const handleSave = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!isAdmin) {
      toast.error("Chỉ Admin được thêm tài liệu.");
      onOpenChange(false);
      return;
    }
    if (!brandSlug) {
      toast.error("Chọn hãng.");
      return;
    }
    if (!name.trim()) {
      toast.error("Nhập tên tài liệu.");
      return;
    }
    if (!file) {
      toast.error("Chọn tệp tải lên.");
      return;
    }

    setSaving(true);
    try {
      const stored = await fileToStoredUrl(file);
      const doc: PortalDoc = {
        id: newDocId(),
        brandSlug,
        name: name.trim(),
        type,
        version: "v1.0",
        size: formatFileSize(file.size),
        updatedAt: formatDocDate(),
        roles: ["admin", "sale"],
        fileName: file.name,
      };
      if (stored.fileUrl) doc.fileUrl = stored.fileUrl;

      const list = addAdminDocument(doc);
      onAdded(list);
      toast.success("Đã thêm tài liệu", {
        description: stored.placeholder
          ? `${doc.name} — tệp lớn, đã lưu metadata (bản xem trước thu nhỏ).`
          : doc.name,
      });
      onOpenChange(false);
    } catch {
      toast.error("Không lưu được tài liệu. Thử tệp nhỏ hơn.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <SheetHeader className="space-y-1 border-b border-border px-6 py-4 pr-12 text-left">
          <SheetTitle>Thêm tài liệu</SheetTitle>
          <SheetDescription>
            Chọn hãng, đặt tên và tải tệp lên. Sale vẫn xem và tải được tài liệu mới.
          </SheetDescription>
        </SheetHeader>

        {!isAdmin ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">
            Chỉ tài khoản Admin được thêm tài liệu.
          </p>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSave}>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="doc-brand">Chọn hãng</Label>
                <Select value={brandSlug} onValueChange={setBrandSlug}>
                  <SelectTrigger id="doc-brand">
                    <SelectValue placeholder="Chọn hãng" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.slug} value={b.slug}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-name">Tên tài liệu</Label>
                <Input
                  id="doc-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Catalogue EasyPact CVS 2026"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-type">Loại</Label>
                <Select value={type} onValueChange={(v) => setType(v as PortalDoc["type"])}>
                  <SelectTrigger id="doc-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-file">Tệp</Label>
                <Input
                  key={fileNonce}
                  id="doc-file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <p className="text-xs text-muted-foreground">
                    {file.name} · {formatFileSize(file.size)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Tệp dưới ~1.5MB lưu được nội dung trên trình duyệt. Tệp lớn hơn vẫn lưu tên và
                    dung lượng.
                  </p>
                )}
              </div>
            </div>

            <SheetFooter className="border-t border-border px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu…" : "Lưu"}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
