import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PortalGate } from "@/components/portal-gate";
import { useStore } from "@/context/store";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type PortalUser } from "@/data/mock";
import {
  deleteCloudPortalUser,
  deletePortalUser,
  loadCloudPortalUsers,
  loadPortalUsers,
  upsertCloudPortalUser,
  upsertPortalUser,
  USER_ROLES,
} from "@/data/users-store";

export const Route = createFileRoute("/portal/nguoi-dung")({
  head: () => ({
    meta: [
      { title: "Quản lý người dùng | Hoàng Vĩnh VKT" },
      { name: "description", content: "Tạo tài khoản Admin và Sale trên Portal." },
      { property: "og:title", content: "Quản lý người dùng | Hoàng Vĩnh VKT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalUsersPage,
});

type FormState = {
  email: string;
  name: string;
  phone: string;
  company: string;
  role: PortalUser["role"];
  password: string;
};

function blankForm(): FormState {
  return {
    email: "",
    name: "",
    phone: "",
    company: "Hoàng Vĩnh VKT",
    role: "sale",
    password: "",
  };
}

function fromUser(user: PortalUser): FormState {
  return {
    email: user.email,
    name: user.name,
    phone: user.phone,
    company: user.company,
    role: user.role,
    password: "",
  };
}

function PortalUsersPage() {
  const { user } = useStore();
  const [list, setList] = useState<PortalUser[]>([]);
  const [open, setOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => blankForm());

  useEffect(() => {
    void loadCloudPortalUsers().then((cloudUsers) => {
      setList(cloudUsers ?? loadPortalUsers());
    });
  }, []);

  if (!user) return <PortalGate />;
  if (user.role !== "admin") {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold">Không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chỉ tài khoản Admin được quản lý người dùng.
        </p>
      </div>
    );
  }

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreate = () => {
    setIsCreate(true);
    setEditingEmail(null);
    setForm(blankForm());
    setOpen(true);
  };

  const openEdit = (item: PortalUser) => {
    setIsCreate(false);
    setEditingEmail(item.email);
    setForm(fromUser(item));
    setOpen(true);
  };

  const handleSave = async (event?: FormEvent) => {
    event?.preventDefault();
    if (form.name.trim().length < 2) return toast.error("Nhập họ tên.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return toast.error("Email không hợp lệ.");
    if ((isCreate || form.password) && form.password.trim().length < 6) {
      return toast.error("Mật khẩu tối thiểu 6 ký tự.");
    }
    const email = form.email.trim();
    const taken = list.some(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.email.toLowerCase() !== editingEmail?.toLowerCase(),
    );
    if (taken) return toast.error("Email đã được dùng.");

    const next: PortalUser = {
      email,
      password: form.password,
      name: form.name.trim(),
      role: form.role,
      roleLabel: form.role === "admin" ? "Admin" : "Sale",
      company: form.company.trim() || "Hoàng Vĩnh VKT",
      phone: form.phone.trim(),
      brandSlugs: "all",
    };
    const cloudResult = await upsertCloudPortalUser(editingEmail ?? email, next);
    if (typeof cloudResult === "string") {
      toast.error(cloudResult);
      return;
    }
    if (cloudResult) setList(cloudResult);
    else setList((prev) => upsertPortalUser(prev, next));
    toast.success(isCreate ? "Đã tạo tài khoản" : "Đã lưu tài khoản", { description: next.email });
    setOpen(false);
  };

  const handleDelete = async (item: PortalUser) => {
    if (item.email.toLowerCase() === user.email.toLowerCase()) {
      toast.error("Không thể xóa tài khoản đang đăng nhập.");
      return;
    }
    if (!window.confirm(`Xóa tài khoản ${item.email}?`)) return;
    const cloudResult = await deleteCloudPortalUser(item.email);
    const result = cloudResult ?? deletePortalUser(list, item.email);
    if (typeof result === "string") {
      toast.error(result);
      return;
    }
    setList(result);
    toast.success(`Đã xóa ${item.email}`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pt-6 lg:px-8">
      <div className="flex w-full shrink-0 flex-wrap items-start justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo tài khoản Admin hoặc Sale. {list.length} người dùng. Dữ liệu lưu trên Cloudflare D1.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Thêm người dùng
        </Button>
      </div>

      <section className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className="text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((item) => (
              <TableRow key={item.email}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-mono text-xs">{item.email}</TableCell>
                <TableCell className="text-muted-foreground">{item.phone || "—"}</TableCell>
                <TableCell>
                  <Badge variant={item.role === "admin" ? "default" : "secondary"}>
                    {item.roleLabel}
                  </Badge>
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
                      aria-label={`Xóa ${item.email}`}
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
      </section>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
          <SheetHeader className="space-y-1 border-b border-border px-6 py-4 pr-12 text-left">
            <SheetTitle>{isCreate ? "Thêm người dùng" : "Sửa người dùng"}</SheetTitle>
            <SheetDescription>
              Chọn vai trò Admin hoặc Sale. Tài khoản dùng để đăng nhập Portal.
            </SheetDescription>
          </SheetHeader>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSave}>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="user-name">Họ và tên</Label>
                <Input
                  id="user-name"
                  value={form.name}
                  onChange={(e) => patch("name", e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => patch("email", e.target.value)}
                  placeholder="sale@hoangvinhvkt.vn"
                  disabled={!isCreate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-phone">Số điện thoại</Label>
                <Input
                  id="user-phone"
                  value={form.phone}
                  onChange={(e) => patch("phone", e.target.value)}
                  placeholder="0901 234 567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-company">Đơn vị</Label>
                <Input
                  id="user-company"
                  value={form.company}
                  onChange={(e) => patch("company", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => patch("role", v as PortalUser["role"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">
                  {isCreate ? "Mật khẩu" : "Mật khẩu mới (không bắt buộc)"}
                </Label>
                <Input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => patch("password", e.target.value)}
                  placeholder={isCreate ? "Tối thiểu 6 ký tự" : "Để trống nếu không đổi"}
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
