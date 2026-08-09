import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/portal/quen-mat-khau")({
  head: () => ({
    meta: [
      { title: "Quên mật khẩu Portal | Hoàng Vĩnh VKT" },
      { name: "description", content: "Nhập email để nhận liên kết đặt lại mật khẩu Portal." },
      { property: "og:title", content: "Quên mật khẩu Portal – Hoàng Vĩnh VKT" },
      { property: "og:description", content: "Khôi phục quyền truy cập Portal tài liệu." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="container-page flex justify-center py-12 lg:py-20">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card lg:p-8">
        {sent ? (
          <div className="text-center">
            <MailCheck className="mx-auto h-10 w-10 text-success" />
            <h1 className="mt-3 text-lg font-bold">Đã gửi hướng dẫn</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Nếu {email} tồn tại trong hệ thống, bạn sẽ nhận được email đặt lại mật khẩu trong vài
              phút.
            </p>
            <Button asChild className="mt-5 w-full">
              <Link to="/portal">Về trang đăng nhập</Link>
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4"
          >
            <h1 className="text-lg font-bold">Quên mật khẩu</h1>
            <p className="text-sm text-muted-foreground">
              Nhập email tài khoản Portal, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@congty.vn"
              />
            </div>
            <Button type="submit" className="w-full">
              Gửi hướng dẫn
            </Button>
            <Link to="/portal" className="block text-center text-sm font-medium text-brand hover:underline">
              Quay lại đăng nhập
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
