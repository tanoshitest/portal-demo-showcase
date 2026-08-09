import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, Loader2, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/context/store";
import { portalUsers } from "@/data/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Đăng nhập Portal tài liệu | Hoàng Vĩnh VKT" },
      {
        name: "description",
        content:
          "Đăng nhập Portal Hoàng Vĩnh VKT để xem và tải catalogue, datasheet, hướng dẫn kỹ thuật của các hãng được cấp quyền.",
      },
      { property: "og:title", content: "Portal tài liệu hãng – Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Khu vực tài liệu dành cho đại lý và kỹ thuật viên." },
    ],
  }),
  component: PortalLogin,
});

function PortalLogin() {
  const { login, user } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.ok) {
        setError(res.message ?? "Đăng nhập không thành công.");
        return;
      }
      toast.success("Đăng nhập thành công");
      navigate({ to: "/portal/dashboard" });
    }, 700);
  };

  const quickFill = (i: number) => {
    const u = portalUsers[i]!;
    setEmail(u.email);
    setPassword(u.password);
  };

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-2 lg:py-16">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold uppercase text-brand">
          <LockKeyhole className="h-3.5 w-3.5" /> Khu vực bảo mật
        </span>
        <h1 className="mt-4 text-3xl font-black leading-tight">Portal tài liệu hãng</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Dành cho đại lý, kỹ thuật viên và nhân viên được cấp quyền. Sau khi đăng nhập bạn có thể
          xem và tải catalogue, datasheet, hướng dẫn cài đặt và chứng chỉ của từng hãng.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <FileText className="h-4 w-4 shrink-0 text-brand" /> Tài liệu được phân quyền theo hãng
            và theo vai trò.
          </li>
          <li className="flex gap-2">
            <FileText className="h-4 w-4 shrink-0 text-brand" /> Luôn cập nhật phiên bản mới nhất từ
            hãng.
          </li>
        </ul>

        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Tài khoản demo (bấm để điền nhanh)
          </p>
          <div className="mt-3 grid gap-2">
            {portalUsers.map((u, i) => (
              <button
                key={u.email}
                type="button"
                onClick={() => quickFill(i)}
                className="rounded-lg border border-border px-3 py-2 text-left text-xs hover:border-brand hover:bg-brand-soft"
              >
                <b>{u.roleLabel}</b> — {u.email} / {u.password}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card lg:p-8">
        {user ? (
          <div className="text-center">
            <h2 className="text-lg font-bold">Bạn đã đăng nhập</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Đang đăng nhập với {user.email} ({user.roleLabel}).
            </p>
            <Button asChild className="mt-4 w-full">
              <Link to="/portal/dashboard">Vào Portal</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h2 className="text-lg font-bold">Đăng nhập</h2>
            {error && (
              <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@congty.vn"
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </Button>
            <Link
              to="/portal/quen-mat-khau"
              className="block text-center text-sm font-medium text-brand hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
