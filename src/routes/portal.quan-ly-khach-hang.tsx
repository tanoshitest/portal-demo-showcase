import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createCustomerId,
  deleteEstimateCustomer,
  loadEstimateCustomers,
  upsertEstimateCustomer,
  type EstimateCustomer,
} from "@/data/customers-store";

export const Route = createFileRoute("/portal/quan-ly-khach-hang")({
  head: () => ({
    meta: [
      { title: "Quản lý khách hàng | Hoàng Vĩnh VKT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomerManagementPage,
});

type FormState = {
  name: string;
  phone: string;
  address: string;
  email: string;
  note: string;
};

function blankForm(): FormState {
  return { name: "", phone: "", address: "", email: "", note: "" };
}

function fromCustomer(item: EstimateCustomer): FormState {
  return {
    name: item.name,
    phone: item.phone,
    address: item.address,
    email: item.email,
    note: item.note,
  };
}

function CustomerManagementPage() {
  const { user } = useStore();
  const [list, setList] = useState<EstimateCustomer[]>([]);
  const [open, setOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => blankForm());

  useEffect(() => {
    setList(loadEstimateCustomers());
  }, []);

  if (!user) return <PortalGate />;

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreate = () => {
    setIsCreate(true);
    setEditingId(null);
    setForm(blankForm());
    setOpen(true);
  };

  const openEdit = (item: EstimateCustomer) => {
    setIsCreate(false);
    setEditingId(item.id);
    setForm(fromCustomer(item));
    setOpen(true);
  };

  const handleSave = (event?: FormEvent) => {
    event?.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Nhập tên khách hàng.");
      return;
    }
    const next: EstimateCustomer = {
      id: editingId ?? createCustomerId(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      email: form.email.trim(),
      note: form.note.trim(),
      createdAt: list.find((item) => item.id === editingId)?.createdAt ?? new Date().toISOString(),
    };
    setList((prev) => upsertEstimateCustomer(prev, next));
    toast.success(isCreate ? "Đã tạo khách hàng" : "Đã lưu khách hàng");
    setOpen(false);
  };

  const handleDelete = (item: EstimateCustomer) => {
    if (!window.confirm(`Xóa khách hàng ${item.name}?`)) return;
    setList((prev) => deleteEstimateCustomer(prev, item.id));
    toast.success(`Đã xóa ${item.name}`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pt-6 lg:px-8">
      <div className="flex w-full shrink-0 flex-wrap items-start justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Quản lý khách hàng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Danh mục khách dùng khi lập dự toán và báo giá. {list.length} khách hàng.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Tạo khách hàng mới
        </Button>
      </div>

      <section className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card">
        {list.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Chưa có khách hàng. Bấm tạo khách hàng mới để bắt đầu.
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Điện thoại</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="block font-medium">{item.name}</span>
                    {item.email ? (
                      <span className="text-xs text-muted-foreground">{item.email}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{item.phone || "—"}</TableCell>
                  <TableCell className="max-w-[280px] truncate text-muted-foreground">
                    {item.address || "—"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {item.note || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                        Sửa
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Xóa ${item.name}`}
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
          <SheetHeader className="space-y-1 border-b border-border px-6 py-4 pr-12 text-left">
            <SheetTitle>{isCreate ? "Tạo khách hàng mới" : "Sửa khách hàng"}</SheetTitle>
            <SheetDescription>
              Khách này sẽ xuất hiện trong dropdown khi lập dự toán Auto và thủ công.
            </SheetDescription>
          </SheetHeader>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSave}>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Tên khách hàng</Label>
                <Input
                  id="customer-name"
                  value={form.name}
                  onChange={(e) => patch("name", e.target.value)}
                  placeholder="Phạm Văn Phước"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Số điện thoại</Label>
                <Input
                  id="customer-phone"
                  value={form.phone}
                  onChange={(e) => patch("phone", e.target.value)}
                  placeholder="0903 418 276"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => patch("email", e.target.value)}
                  placeholder="khach@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-address">Địa chỉ</Label>
                <Input
                  id="customer-address"
                  value={form.address}
                  onChange={(e) => patch("address", e.target.value)}
                  placeholder="Địa chỉ lắp đặt"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-note">Ghi chú</Label>
                <Textarea
                  id="customer-note"
                  value={form.note}
                  onChange={(e) => patch("note", e.target.value)}
                  placeholder="Nhu cầu, loại mái, ghi chú khảo sát…"
                  rows={3}
                />
              </div>
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
