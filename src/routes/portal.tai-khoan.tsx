import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/context/store";
import { PortalGate } from "./portal.dashboard";

export const Route = createFileRoute("/portal/tai-khoan")({
  head: () => ({
    meta: [
      { title: "Tài khoản Portal | Hoàng Vĩnh VKT" },
      { name: "description", content: "Thông tin cá nhân, đổi mật khẩu và đăng xuất khỏi Portal." },
      { property: "og:title", content: "Tài khoản Portal – Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Quản lý thông tin tài khoản Portal tài liệu." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

function Account() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [pw, setPw] = useState({ old: "", next: "", confirm: "" });
  const [error, setError] = useState("");

  if (!user) return <PortalGate />;

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pw.old !== user.password) return setError("Mật khẩu hiện tại không đúng.");
    if (pw.next.length < 6) return setError("Mật khẩu mới cần tối thiểu 6 ký tự.");
    if (pw.next !== pw.confirm) return setError("Mật khẩu xác nhận không khớp.");
    setPw({ old: "", next: "", confirm: "" });
    toast.success("Đã đổi mật khẩu (demo)");
  };

  return (
    <div className="container-page py-6 lg:py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/portal/dashboard" className="hover:text-brand">
          Portal
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">Tài khoản</span>
      </nav>
      <h1 className="mt-2 text-2xl font-black sm:text-3xl">Tài khoản</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-bold">Thông tin cá nhân</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Họ và tên", user.name],
              ["Email", user.email],
              ["Số điện thoại", user.phone],
              ["Đơn vị", user.company],
              ["Vai trò", user.roleLabel],
              [
                "Hãng được cấp quyền",
                user.brandSlugs === "all" ? "Tất cả các hãng" : user.brandSlugs.join(", "),
              ],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-4 border-b border-border pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => {
              logout();
              toast.success("Đã đăng xuất");
              navigate({ to: "/portal" });
            }}
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </Button>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-bold">Đổi mật khẩu</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="old">Mật khẩu hiện tại</Label>
              <Input id="old" type="password" value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next">Mật khẩu mới</Label>
              <Input id="next" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Xác nhận mật khẩu mới</Label>
              <Input id="confirm" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </div>
            <Button type="submit">Cập nhật mật khẩu</Button>
          </form>
        </section>
      </div>
    </div>
  );
}
